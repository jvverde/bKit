#!/bin/bash
PATH=/bin:/sbin:/usr/bin:/usr/sbin:$PATH
SDIR="$(dirname "$(readlink -f "$0")")"				#Full DIR
exists() { type "$1" >/dev/null 2>&1;}
die() { echo -e "$@">&2; exit 1; }
usage() {
	NAME=$(basename -s .sh "$0")
	echo Backup one or more directories or files
	echo -e "Usage:\n\t $NAME [-a|--all] dir1/file1 [[dir2/file2 [...]]"
	exit 1
}

FILTERS=()

RMFILES=()
trap 'rm -f "${RMFILES[@]}"' EXIT

excludes(){
	RUNDIR=$SDIR/run
	[[ -d $RUNDIR ]] || mkdir -p $RUNDIR

	EXCL=$RUNDIR/exclude-$$.lst

	echo Compile exclude list
	bash "$SDIR/tools/excludes.sh" "$SDIR/excludes" >  "$EXCL"
	FILTERS+=( --filter=". $EXCL" )
	RMFILES+=( "$EXCL" )
}

OPTIONS=()
RSYNCOPTIONS=()
while [[ $1 =~ ^- ]]
do
	KEY="$1" && shift
	case "$KEY" in
		-- )
			while [[ $1 =~ ^- ]]
			do
				RSYNCOPTIONS+=( "$1" )
				shift
			done
		;;
		-a|--all)
			ALL=1
		;;
		-h|--help)
			usage
		;;
		*=*)
			OPTIONS+=( "$KEY")
		;;
		*)
			OPTIONS+=( "$KEY" "$1" ) && shift
		;;
	esac
done

[[ $# -eq 0 ]] && usage

[[ -n $ALL ]] || excludes

FILTERS+=( --filter=": .rsync-filter" )

echo Start backup
bash "$SDIR/backup.sh" "${OPTIONS[@]}" -- "${FILTERS[@]}" "${RSYNCOPTIONS[@]}" "$@"
