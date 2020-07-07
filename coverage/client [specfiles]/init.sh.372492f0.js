var data = {lines:[
{"lineNum":"    1","line":"#!/usr/bin/env bash"},
{"lineNum":"    2","line":"declare -r sdir=$(dirname -- \"$(readlink -ne -- \"$0\")\")\t#Full sdir","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    3","line":"source \"$sdir/lib/functions/all.sh\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    4","line":""},
{"lineNum":"    5","line":"declare SECTION=bkit","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    6","line":"declare -r PORT=8760","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    7","line":"declare -r BPORT=8761","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    8","line":"declare -r RPORT=8762","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    9","line":"declare -r UPORT=8763","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   10","line":""},
{"lineNum":"   11","line":"declare -r server=\"${1:-\"$($sdir/server.sh)\"}\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   12","line":""},
{"lineNum":"   13","line":"usage() {"},
{"lineNum":"   14","line":"    declare -r name=$(basename -s .sh \"$0\")","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   15","line":"    echo Restore from backup one or more directories of files","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   16","line":"    echo -e \"Usage:\\n\\t $name Server-address\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   17","line":"    exit 1","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   18","line":"}"},
{"lineNum":"   19","line":""},
{"lineNum":"   20","line":"[[ -n $server ]] || usage","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   21","line":"echo Contacting the server ... please wait!","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   22","line":"exists nc && { nc -z $server $PORT 2>&1 || die Server $server not found;}","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   23","line":""},
{"lineNum":"   24","line":"declare -r confdir=\"$ETCDIR/server/$server\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   25","line":""},
{"lineNum":"   26","line":"bash \"$sdir\"/lib/keygen.sh -n \"$server\" \"$confdir\"\t\t|| die \"Can\'t generate a key\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   27","line":""},
{"lineNum":"   28","line":"declare -r conffile=\"$confdir/conf.init\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   29","line":""},
{"lineNum":"   30","line":"export RSYNC_PASSWORD=\"4dm1n\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   31","line":""},
{"lineNum":"   32","line":"declare -r FMT=\'--out-format=\"%o|%i|%f|%c|%b|%l|%t\"\'","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   33","line":""},
{"lineNum":"   34","line":"IFS=\'|\' read -r DOMAIN NAME UUID <<<$(\"$sdir/lib/computer.sh\")","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   35","line":""},
{"lineNum":"   36","line":"declare syncd=\"$confdir/pub\"\t\t\t\t\t#public keys location","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   37","line":"exists cygpath && syncd=\"$(cygpath -u \"$syncd\")\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   38","line":""},
{"lineNum":"   39","line":"#generate a random string to challenge the server"},
{"lineNum":"   40","line":"declare -r challenge=\"$(head -c 1000 </dev/urandom | tr -cd \"[:alnum:]\" | head -c 32)\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   41","line":"echo -n $challenge > \"$syncd/challenge\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   42","line":""},
{"lineNum":"   43","line":"declare -r url=\"rsync://admin@${server}:${PORT}/${SECTION}/${DOMAIN}/${NAME}/${UUID}/user/${BKITUSER}\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   44","line":"#Send public keys and challenge to the server"},
{"lineNum":"   45","line":"rsync -rltvhR $FMT \"$syncd/./\" \"$url/\" || die \"Exit value of rsync is non null: $?\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   46","line":""},
{"lineNum":"   47","line":"#Read (back) public keys from server including (meanwhile) generated server public keys as well the encripted challenge"},
{"lineNum":"   48","line":"rsync -rlthgpR --no-owner $FMT \"$url/./\" \"$syncd/\" || die \"Exit value of rsync is non null: $?\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   49","line":""},
{"lineNum":"   50","line":"#Now generate a password/secret by using a Diffie-Hellman algorithm"},
{"lineNum":"   51","line":"\"$sdir/lib/genpass.sh\" \"$confdir\"\t\t|| die \"Can\'t generate the pass\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   52","line":""},
{"lineNum":"   53","line":"#And check if challenged was well encripted"},
{"lineNum":"   54","line":"declare -r verify=\"$(openssl enc -aes256 -md SHA256 -base64 -pass file:\"$confdir/.priv/secret\" -d -in \"$confdir/pub/verification\")\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   55","line":"[[ $verify == $challenge ]] || die \"Something was wrong with the produced key\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   56","line":"#rsync --dry-run -ai -e \"ssh -i conf/id_rsa bkit@10.1.1.3 localhost 8730\" admin@10.1.1.3::bkit tmp/"},
{"lineNum":"   57","line":""},
{"lineNum":"   58","line":"KH=\"$confdir/.priv/known_hosts\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   59","line":"touch \"$KH\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   60","line":"ssh-keygen -R \"$server\" -f \"$KH\" && ssh-keyscan -H -t ecdsa \"$server\" >> \"$KH\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   61","line":""},
{"lineNum":"   62","line":"echo Writing configuration to $conffile","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   63","line":"(","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   64","line":"\tread SECTION <\"$confdir/pub/section\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   65","line":"\tread COMMAND <\"$confdir/pub/command\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   66","line":"\t#echo \"BACKUPURL=rsync://user@$server:$BPORT/$SECTION\""},
{"lineNum":"   67","line":"\techo \"SSH=\'ssh -i \\\"$confdir/.priv/ssh.key\\\" -o UserKnownHostsFile=\\\"$KH\\\" rsyncd@$server $COMMAND\'\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   68","line":"\techo \"RSYNCURL=\'rsync://user@$server:$BPORT/$SECTION\'\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   69","line":"\techo \"SSHURL=\'user@$server::$SECTION\'\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   70","line":"\techo \"BACKUPURL=\'user@$server::$SECTION\'\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   71","line":"\techo \"PASSFILE=\'$confdir/.priv/secret\'\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   72","line":"\tOS=$(uname -o|tr \'[:upper:]\' \'[:lower:]\')","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   73","line":"\tARCH=$(uname -m|tr \'[:upper:]\' \'[:lower:]\')","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   74","line":"\t[[ $ARCH == x86_64 ]] && ARCH=x64 || ARCH=ia32","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   75","line":"\t[[ $OS == cygwin ]] && OS=win32 || OS=linux","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   76","line":"\techo \"UPDATERSRC=rsync://admin@$server:$UPORT/bkit-update/bKit-$OS-$ARCH/./\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   77","line":"\t[[ -d $sdir/conf ]] && find \"$sdir/conf\" -maxdepth 1 -type f -iname \'rsync*.conf\' -exec cat \"{}\" \';\'","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   78","line":")> \"$conffile\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   79","line":""},
{"lineNum":"   80","line":"declare -r default=\"$(dirname -- \"$confdir\")/default\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   81","line":""},
{"lineNum":"   82","line":"[[ -d $default ]] || ln -svrfT \"$confdir\" \"$default\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   83","line":""},
{"lineNum":"   84","line":"echo This is the content of init file in $conffile","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   85","line":"echo \'##########################\'","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   86","line":"cat \"$conffile\" | sed \'s/^/\\t/\'","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   87","line":"echo \'##########################\'","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   88","line":"echo \"Backup server $server setup successfully!\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
]};
var percent_low = 25;var percent_high = 75;
var header = { "command" : "shellspec spec", "date" : "2020-07-07 12:21:07", "instrumented" : 57, "covered" : 0,};
var merged_data = [];