#!/usr/bin/env bash
declare -p _fa5db1cec69d83e1bb3898143fd1002c >/dev/null 2>&1 && echo module dirs apparentely already sourced && return

_fa5db1cec69d83e1bb3898143fd1002c(){
	local user="$(id -nu)"
	local homedir="$( getent passwd "$user" | cut -d: -f6 )"
	VARDIR="$homedir/.bkit/var"
	ETCDIR="$homedir/.bkit/etc"
}

_fa5db1cec69d83e1bb3898143fd1002c

mkdir -pv "$VARDIR"
mkdir -pv "$ETCDIR" 
