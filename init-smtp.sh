#!/usr/bin/env bash
SDIR=$(dirname -- "$(readlink -ne -- "$0")")  #Full SDIR
source "$SDIR/lib/functions/all.sh"

declare email smtp
declare -r confile="$ETCDIR/smtp/conf.init"
mkdir -pv "${confile%/*}"
test -e "$confile" || :> "$confile"
source "$confile"

save2conf(){
  [[ ${email+isset} == isset ]] && {
    sed -i /TO=.*/d "$confile"
    echo "TO=$email" >> "$confile"
  }
  [[ ${smtp+isset} == isset ]] && {
    sed -i /SMTP=.*/d "$confile"
    echo "SMTP=$smtp" >> "$confile"
  }
  exit 0;
}

until test -n "$email"
do 
  read -p "Mail destination address:${TO+[Currently is $TO]}" mail
  email="${mail:-$TO}"
done

exists mail && echo "Just checking" | mail -s "Bkit check if a MTA is installed" "$email" \
  && echo "A mail was sent to $email. Please check it" \
  && save2conf

declare -ir dport=25

while IFS=: read -p "SMTP server:port ${SMTP+[$SMTP]${PORT+:$PORT}}" smtp port
do
    port=${port:-$dport}
	smtp="${smtp:-$SMTP}"
    echo "Test connection to $smtp:$port"
    exists nc && {
      nc -z $smtp $port 2>&1 \
        && echo "Good! Port $port is open at server $smtp" \
        && break \
        || warn "Server $smtp at port $port not found"
    }
done
save2conf

