#!/bin/bash
PATH=/bin:/sbin:/usr/bin:/usr/sbin:$PATH
SDIR="$(dirname "$(readlink -f "$0")")"       #Full DIR

exists() { type "$1" >/dev/null 2>&1;}
die() { echo -e "$@" >&2; exit 1;}
warn() { echo -e "$@" >&2;}

RSYNCOPTIONS=()

while [[ $1 =~ ^- ]]
do
	KEY="$1" && shift
	case "$KEY" in
		-- )
			while [[ $1 =~ ^- ]]
			do
				RSYNCOPTIONS+=("$1")
				shift
			done
		;;
		*)
			die Unknown	option $KEY
		;;
	esac
done

RESTOREDIR=("$@")

ORIGINALDIR=( "${RESTOREDIR[@]}" )

OLDIFS=$IFS
IFS="
"
exists cygpath && RESTOREDIR=( $(cygpath -u "${ORIGINALDIR[@]}") ) && ORIGINALDIR=( $(cygpath -w "${RESTOREDIR[@]}") )

RESTOREDIR=( $(readlink -m "${RESTOREDIR[@]}") )

IFS=$OLDIFS

CONF=$SDIR/conf/conf.init
[[ -f $CONF ]] || die Cannot found configuration file at $CONF
. "$CONF"                                                                     #get configuration parameters

export RSYNC_PASSWORD="$(cat "$SDIR/conf/pass.txt")"

FMT='--out-format=%o|%i|%b|%l|%f|%M|%t'
PERM=(--acls --owner --group --super --numeric-ids)
BACKUP=".bkit-before-restore-on"
OPTIONS=(
	--backup
	--backup-dir="$BACKUP-$(date +"%c")"
	--archive
	--exclude="$BACKUP-*"
	--hard-links
	--compress
	--human-readable
	--relative
	--partial
	--partial-dir=".bkit.rsync-partial"
	--delay-updates
	--delete-delay 
)

for I in ${!RESTOREDIR[@]}
do
	DIR="${RESTOREDIR[$I]}"
	until [[ -d $DIR ]]
	do
		DIR=$(dirname "$DIR")
	done
	BASE="$DIR"
	ENTRY=${RESTOREDIR[$I]#$DIR}
	IFS='|' read -r VOLUMENAME VOLUMESERIALNUMBER FILESYSTEM DRIVETYPE <<<$("$SDIR/drive.sh" "$BASE" 2>/dev/null)

	exists cygpath && DRIVE=$(cygpath -w "$BASE")
	DRIVE=${DRIVE%%:*}
	RVID="${DRIVE:-_}.${VOLUMESERIALNUMBER:-_}.${VOLUMENAME:-_}.${DRIVETYPE:-_}.${FILESYSTEM:-_}"
	BASE=${BASE%%/}		#remove trailing slash if present
	ENTRY=${ENTRY#/}	#remove leading slash if present
	SRC="$BACKUPURL/$RVID/@current/data$BASE/./$ENTRY"
	rsync "${RSYNCOPTIONS[@]}" "${PERM[@]}" "$FMT" "${OPTIONS[@]}" "$SRC" "$BASE/" || warn "Problemas ao recuperar $BASE/$ENTRY"
done
