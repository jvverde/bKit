#!/bin/bash
PATH=/bin:/sbin:/usr/bin:/usr/sbin:$PATH
SDIR="$(dirname "$(readlink -f "$0")")"       #Full DIR

die() { echo -e "$@" >&2; exit 1; }
exists() { type "$1" >/dev/null 2>&1;}

function get_json(){
	grep -Po '(?<="'$1'":")(?:|.*?[^\\])(?=")'
}

RESOURCE=$1
BACKUP=$(get_json backup < $RESOURCE)
DISK=$(get_json drive < $RESOURCE)
COMPUTER=$(get_json computer < $RESOURCE)
DIR=$(get_json path < $RESOURCE )
ENTRY=$(get_json entry < $RESOURCE)

IFS='.' read -r DRIVE VOLUME NAME DESCRIPTION FS <<< "$DISK"
DEV=$($SDIR/findDrive.sh $VOLUME) || die Cannot found the volume $VOLUME on this computer
[[ -b $DEV ]] && {
  echo i need to mount this
} || DST=$DEV

exists cygpath && DST=$(cygpath $DST)

. computer.sh                                                               #get $DOMAIN, $NAME and $UUID
THIS=$DOMAIN.$NAME.$UUID

[[ $THIS != $COMPUTER ]] && [[ -n $FORCE ]] && die This is not the same computer; 

CONF="$SDIR/conf/conf.init"
[[ -f $CONF ]] || die Cannot found configuration file at $CONF
. $CONF                                                                     #get configuration parameters

SRC=$(echo $BACKUPURL/$DISK/.snapshots/$BACKUP/data/./$DIR/$ENTRY|sed s#/././#/./#)       #for cases where DIR=.

FMT='--out-format="%p|%t|%o|%i|%b|%l|%f"'
PASS="--password-file=$SDIR/conf/pass.txt"
PERM="--acls --owner --group --super --numeric-ids"
OPTIONS="--delete-delay --delay-updates --force --stats --fuzzy"

EXEC="rsync -rlitzvvhR $PERM $OPTIONS $FMT $PASS $SRC $DST/"
#$EXEC
echo $EXEC
