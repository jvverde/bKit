#!/usr/bin/env bash
set -uE
sdir="$(dirname -- "$(readlink -ne -- "$0")")"				#Full DIR
source "$sdir/lib/functions/all.sh"

usage() {
	local name=$(basename -s .sh "$0")
	echo Backup one or more directories or files
	echo -e "Usage:\n\t $name [-a|--all] [-c|--compile] [--ignore-filters] [--stats] dir1/file1 [[dir2/file2 [...]]"
	exit 1
}

declare -a filters=()

excludes(){
	excdir=$sdir/cache/$USER/excludes
	[[ -d $excdir ]] || mkdir -p $excdir

	exclist=$excdir/exclude.lst

	[[ -e "$exclist" ]] || {
		echo Compile exclude list
		bash "$sdir/tools/excludes.sh" "$sdir/excludes" >  "$exclist"
	}
	[[ -n $(find "$exclist" -mtime +30) || ${compile+isset} == isset ]] && {
		echo Recompile exclude list
		bash "$sdir/tools/excludes.sh" "$sdir/excludes" >  "$exclist"
	}

	filters+=( --filter=". $exclist" )
}

declare -a options=() rsyncoptions=()

while [[ ${1:-} =~ ^- ]]
do
	key="$1" && shift
	case "$key" in
		-- )
			while [[ $1 =~ ^- ]]
			do
				rsyncoptions+=( "$1" )
				shift
			done
		;;
		-a|--all)
			all=1
		;;
		-c|--compile)
			compile=1
		;;
		--ignore-filters)
			nofilters=1
		;;
		-h|--help)
			usage
		;;
		--stats|--sendlogs|--notify)
			options+=( "$key")
		;;
		*=*)
			options+=( "$key")
		;;
		*)
			options+=( "$key" "$1" ) && shift
		;;
	esac
done

#(( $# == 0 )) && usage

[[ ${all+isset} == isset ]] || excludes

[[ ${nofilters+isset} == isset ]] || filters+=( --filter=": .rsync-filter" )

echo "bkit: Start backup"
let cnt=16
let sec=60
while (( cnt-- > 0 ))
do
	bash -m "$sdir/backup.sh" ${options+"${options[@]}"} -- ${filters+"${filters[@]}"} ${rsyncoptions+"${rsyncoptions[@]}"} "${@:-.}" && break
	let delay=(1 + RANDOM % $sec)
	echo "bkit:Wait $delay seconds before try again"
	sleep $delay 
	let sec=2*sec
done
echo "bKit: Done"
