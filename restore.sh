#!/bin/bash
PATH=/bin:/sbin:/usr/bin:/usr/sbin:$PATH
SDIR="$(dirname "$(readlink -f "$0")")"       #Full DIR
OS=$(uname -o |tr '[:upper:]' '[:lower:]')

set -o pipefail

source "$SDIR/functions/all.sh"

export RSYNC_PASSWORD="$(cat "$SDIR/conf/pass.txt")"

FMT='--out-format="%o|%i|%f|%M|%b|%l|%t"'
PERM=(--perms --acls --super --numeric-ids)
BACKUP=".bkit-before-restore-on"
BACKUPDIR="$BACKUP-$(date +"%Y-%m-%dT%H-%M-%S")"
while [[ -e $BACKUPDIR ]]
do
  BACKUPDIR="${BACKUPDIR}_"
done

OPTIONS=(
  --backup
  --backup-dir="$BACKUPDIR"
  --archive
  --exclude="${BACKUP}*"
  --hard-links
  --compress
  --human-readable
  --relative
  --partial
  --partial-dir=".bkit.rsync-partial"
  --delay-updates
  --groupmap=4294967295:$(id -u)
  --usermap=4294967295:$(id -g)
  --numeric-ids
)

#Don't try to chown or chgrp if not root or Administrator

[[ $OS == cygwin ]] && {
    $(id -G|grep -qE '\b544\b') || OPTIONS+=( "--no-group" "--no-owner" )
}
[[ $OS != cygwin && $UID -ne 0 ]] && OPTIONS+=( "--no-group" "--no-owner" )

RSYNCOPTIONS=()

dorsync() {
  local BACKUP="${@: -1}$BACKUPDIR"
  mkdir -p "$BACKUP"
  rsync "${RSYNCOPTIONS[@]}" "${PERM[@]}" "$FMT" "${OPTIONS[@]}" "$@"
  RET=$?
  find "$BACKUP" -maxdepth 0 -empty -delete 2>/dev/null
  [[ -e "$BACKUP" ]] && {
    exists cygpath && BACKUP=$(cygpath -w "$BACKUP")
    echo Old files saved on "$BACKUP"
  }
  return $RET
}

destination() {
  DST="$1"
  exists cygpath && DST=$(cygpath -u "$DST")
  DST=$(readlink -ne "$DST") || die "'$1' should be a directory"
  [[ ${DST: -1} == / ]] || DST="$DST/"
}

usage() {
  local NAME=${1:-"$(basename -s .sh "$0")"}
  echo -e "Usage:\n\t $NAME [--dry-run] [--permissions] [--delete] [--dst=directory] [--snap=snap] [--local-copy] dir1/file1 [[dir2/file2 [...]]"
  exit 1
}

SRCS=()
declare -A LINKTO
LOCALACTION="--link-dest" #rsync option
while [[ $1 =~ ^- ]]
do
  KEY="$1" && shift
  case "$KEY" in
    -l|-log|--log)
      exec 1>"$1"
      shift
    ;;
    -l=*|-log=*|--log=*)
      exec 1>"${KEY#*=}"
    ;;
    -s=*|--snap=*|--snapshot=*)
        SNAP="${KEY#*=}"
    ;;
    -s|--snap|--snapshot)
        SNAP=$1 && shift
    ;;
    -d|--dst)
      destination "$1" && shift
    ;;
    -d=*|--dst=*)
      destination "${KEY#*=}"
    ;;
    --permissions)
      ACLS=1
    ;;
    --dry-run)
      RSYNCOPTIONS+=('--dry-run')
    ;;
    --delete)
      OPTIONS+=( '--delete-delay' )
    ;;
    --local-copy)
      LOCALACTION="--copy-dest"
    ;;
    --link-dest=*)
      LINKTO["--link-dest=${KEY#*=}"]=1
    ;;
    --copy-dest=*)
      LINKTO["--copy-dest=${KEY#*=}"]=1
    ;;
    --stats)
      STATS=1
    ;;
    --sendlogs)
      FULLREPORT=1
      NOTIFY=1
      STATS=1
    ;;
    --notify)
      NOTIFY=1
      STATS=1
    ;;
    --email=*)
      EMAIL="${KEY#*=}"
      NOTIFY=1
      STATS=1
    ;;
    -h|--help)
        usage
    ;;
    -h=*|--help=*)
        usage "${KEY#*=}"
    ;;
    -- )
      while [[ $1 =~ ^- ]]
      do
        RSYNCOPTIONS+=("$1") && shift
      done
    ;;
    *)
      warn Unknown option $KEY && usage
    ;;
  esac
done
LINKS=( "${!LINKTO[@]}" )                 #get different link-dest/copy-dest
LINKS=( "${LINKS[@]:0:20}" )              #a rsync limitation

RESOURCES=("$@")

CONF=$SDIR/conf/conf.init
[[ -f $CONF ]] || die Cannot found configuration file at $CONF
. "$CONF"                                                                     #get configuration parameters

RESULT="$SDIR/run/restore-$$/"
mkdir -p "$RESULT"

LOGFILE="$RESULT/logfile.tmp"
STATSFILE="$RESULT/stats.tmp"

trap "rm -rf '$RESULT'" EXIT


aclparents(){
  local DST=$(readlink -e "$DST")
  local FILE=$(readlink -e "$DST/$FILE")
  until [[ $FILE == $DST ]]
  do
    FILE=$(readlink -e "$FILE") || break
    FILE=${FILE%/*} #parent
    PARENT="+FILE $(cygpath -w "$FILE")"
    ACLSOF["$PARENT"]=$(readlink -e "$CACHEDST/${FILE#$DST}/.bkit-dir-acl")
  done
}

NTFS_acls(){
  local SRC=$1
  local CACHEDST=$(readlink -mn "$2")
  local DST=$(readlink -e "$3")
  echo "Restore ACLs"
  [[ -d $CACHEDST ]] || mkdir -pv "$CACHEDST"
  rsync "${RSYNCOPTIONS[@]}" -aizR --inplace "${PERM[@]}" "${PERM[@]}" "$FMT" "$SRC" "$CACHEDST" ||
    warn "Problemas ao recuperar $CACHEDST"
  {
    declare -A ACLSOF

    while read -r FILE
    do
      aclparents
      local TARGET=$(cygpath -w "$(readlink -e "$DST/$FILE")")
      ACLSOF["+FILE $TARGET"]=$(readlink -e "$CACHEDST/$FILE")
    done < <(grep -Pi 'recv\|[ch>.][^d].{9}\|' "$RESULT/index" | cut -d'|' -f3)

    while read -r FILE
    do
      aclparents
      local TARGET=$(cygpath -w "$(readlink -e "$DST/$FILE")")
      ACLSOF["+FILE $TARGET"]=$(readlink -e "$CACHEDST/$FILE/.bkit-dir-acl")
    done < <(grep -Pi 'recv\|.d.{9}\|' "$RESULT/index" | cut -d'|' -f3)

    for P in "${!ACLSOF[@]}"
    do
      echo -e "\n"
      echo $P
      cat "${ACLSOF["$P"]}"
    done
  } | iconv -f UTF-8 -t UTF-16LE > "$RESULT/acls"
  SUBINACL=$(find "$SDIR/3rd-party" -type f -name "subinacl.exe" -print -quit)
  [[ -f $SUBINACL ]] || die SUBINACL.exe not found
  "$SUBINACL" /noverbose /nostatistic /playfile "$(cygpath -w "$RESULT/acls")"
  #"$SUBINACL" /nostatistic /playfile "$(cygpath -w "$RESULT/acls")"
}

makestats(){
  local DELTATIME=$1
  local ROOT=$2
  [[ -n $STATS && -e $LOGFILE && -e "$SDIR/tools/recv-stats.pl" ]] && exists perl && {
    echo "------------Stats------------"
    echo "Total time spent: $DELTATIME"
    exists cygpath && ROOT=$(cygpath -w "$ROOT")
    ROOT="${ROOT//\\/\\\\}\\\\"
    echo root=$ROOT
    cat -v "$LOGFILE" | grep -Pio '^".+"$' | awk -vA="$ROOT" 'BEGIN {FS = OFS = "|"} {print $1,$2,A $3,$4,$5,$6,$7}' | perl "$SDIR/tools/recv-stats.pl"
    echo "------------End of Stats------------"
  } | tee "$STATSFILE"
}

for RESOURCE in "${RESOURCES[@]}"
do
  if [[ $RESOURCE =~ ^rsync://[^@]+@ ]]
  then
    [[ -z $DST ]] && DST=${RESOURCES[${#RESOURCES[@]}-1]} && unset RESOURCES[${#RESOURCES[@]}-1] #get last argument
    [[ -d $DST ]] || die "You should specify a (existing) destination directory in last argument or using --dst option"
    SRCS+=( "$RESOURCE" )
    #dorsync "$RESOURCE" "$DST"
  else
    exists cygpath && RESOURCE="$(cygpath -u "$RESOURCE")"
    RESOURCE=$(readlink -m "${RESOURCE}")
    DIR=$RESOURCE
    until [[ -d $DIR ]]       #find a existing parent
    do
      DIR=$(dirname "$DIR")
    done

    ROOT=$(stat -c%m "$DIR")

    BASE="${DIR#${ROOT%%/}}"

    ENTRY=${RESOURCE#$DIR}    #Is empty when resource is a existing directory (DIR==RESOURCE)

    IFS='|' read -r VOLUMENAME VOLUMESERIALNUMBER FILESYSTEM DRIVETYPE <<<$("$SDIR/drive.sh" "$ROOT" 2>/dev/null)

    exists cygpath && DRIVE=$(cygpath -w "$ROOT")
    DRIVE=${DRIVE%%:*}
    RVID="${DRIVE:-_}.${VOLUMESERIALNUMBER:-_}.${VOLUMENAME:-_}.${DRIVETYPE:-_}.${FILESYSTEM:-_}"
    BASE=${BASE%%/}   #remove trailing slash if present
    ENTRY=${ENTRY#/}  #remove leading slash if present

    [[ -n $SNAP ]] && { # if we want an older version
      SRC="$BACKUPURL/$RVID/.snapshots/$SNAP/data$BASE/./$ENTRY"
      METASRC="$BACKUPURL/$RVID/.snapshots/$SNAP/metadata$BASE/./$ENTRY"
    } || {              #or last version
      SRC="$BACKUPURL/$RVID/@current/data$BASE/./$ENTRY"
      METASRC="$BACKUPURL/$RVID/@current/metadata$BASE/./$ENTRY"
    }

    INIT=$(date -R)
    {
      if [[ -n $DST ]]
      then
        dorsync "${LINKS[@]}" "$SRC" "$LOCALACTION=$DIR/" "$DST/" | tee "$RESULT/index" || warn "Problems restoring to $DST"
      else
        dorsync "${LINKS[@]}" "$SRC" "$DIR/" | tee "$RESULT/index" || warn "Problems restoring the $BASE/$ENTRY"
      fi
      [[ -n $ACLS && $OS == 'cygwin' && $FILESYSTEM == 'NTFS' ]] && (id -G|grep -qE '\b544\b') && (
        NTFS_acls "$METASRC" "$SDIR/cache/metadata/by-volume/${VOLUMESERIALNUMBER:-_}$BASE/" "${DST:-$DIR}"
      )
    } | tee "$LOGFILE"
    STOP=$(date -R)
    deltatime "$STOP" "$INIT"
    makestats "$DELTATIME" "${DST:-$DIR}"
  fi
done

[[ -n $DST && ${#SRCS[@]} -gt 0 ]] && {
  dorsync "${LINKS[@]}" "${SRCS[@]}" "$DST" || die "Problems restoring to $DST"
  exists cygpath && DST=$(cygpath -w "$DST")
  echo "Files restored to $DST"
  exit 0
}

exit $ERROR
