#!/usr/bin/env bash
#RSYNC Common Code
SDIR="$(dirname -- "$(readlink -ne -- "$0")")"
source "$SDIR/functions/all.sh"

RSYNCOPTIONS=()

[[ ${BKIT_CONFIG+isset} == isset ]] || {
	USER="$(id -nu)"
	BKIT_CONFIGDIR="$(readlink -ne -- "$SDIR/conf/$USER/default" || find "$SDIR/conf/$USER" -type d -exec test -e "{}/conf.init" ';' -print -quit)"
	BKIT_CONFIG="$BKIT_CONFIGDIR/conf.init"
}

[[ -e $BKIT_CONFIG ]] && source "$BKIT_CONFIG" || die "Can't source $BKIT_CONFIG"

[[ -e $PASSFILE ]] && export RSYNC_PASSWORD="$(<${PASSFILE})" || die "Pass file not found on location '$PASSFILE'"
[[ -n $SSH ]] && export RSYNC_CONNECT_PROG="$SSH"
