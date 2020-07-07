var data = {lines:[
{"lineNum":"    1","line":"#!/usr/bin/env bash"},
{"lineNum":"    2","line":"SDIR=$(dirname -- \"$(readlink -ne -- \"$0\")\")  #Full SDIR","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    3","line":"source \"$SDIR/lib/functions/all.sh\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    4","line":""},
{"lineNum":"    5","line":"declare email smtp","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    6","line":"declare -r confile=\"$ETCDIR/smtp/conf.init\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    7","line":"mkdir -pv \"${confile%/*}\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    8","line":"test -e \"$confile\" || :> \"$confile\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    9","line":"source \"$confile\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   10","line":""},
{"lineNum":"   11","line":"save2conf(){"},
{"lineNum":"   12","line":"  [[ ${email+isset} == isset ]] && {","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   13","line":"    sed -i /TO=.*/d \"$confile\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   14","line":"    echo \"TO=$email\" >> \"$confile\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   15","line":"  }"},
{"lineNum":"   16","line":"  [[ ${smtp+isset} == isset ]] && {","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   17","line":"    sed -i /SMTP=.*/d \"$confile\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   18","line":"    echo \"SMTP=$smtp\" >> \"$confile\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   19","line":"  }"},
{"lineNum":"   20","line":"  exit 0;","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   21","line":"}"},
{"lineNum":"   22","line":""},
{"lineNum":"   23","line":"until test -n \"$email\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   24","line":"do"},
{"lineNum":"   25","line":"  read -p \"Mail destination address:${TO+[Currently is $TO]}\" mail","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   26","line":"  email=\"${mail:-$TO}\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   27","line":"done"},
{"lineNum":"   28","line":""},
{"lineNum":"   29","line":"exists mail && echo \"Just checking\" | mail -s \"Bkit check if a MTA is installed\" \"$email\" \\","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   30","line":"  && echo \"A mail was sent to $email. Please check it\" \\"},
{"lineNum":"   31","line":"  && save2conf"},
{"lineNum":"   32","line":""},
{"lineNum":"   33","line":"declare -ir dport=25","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   34","line":""},
{"lineNum":"   35","line":"while IFS=: read -p \"SMTP server:port ${SMTP+[$SMTP]${PORT+:$PORT}}\" smtp port","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   36","line":"do"},
{"lineNum":"   37","line":"    port=${port:-$dport}","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   38","line":"\tsmtp=\"${smtp:-$SMTP}\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   39","line":"    echo \"Test connection to $smtp:$port\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   40","line":"    exists nc && {","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   41","line":"      nc -z $smtp $port 2>&1 \\","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   42","line":"        && echo \"Good! Port $port is open at server $smtp\" \\"},
{"lineNum":"   43","line":"        && break \\"},
{"lineNum":"   44","line":"        || warn \"Server $smtp at port $port not found\""},
{"lineNum":"   45","line":"    }"},
{"lineNum":"   46","line":"done"},
{"lineNum":"   47","line":"save2conf","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   48","line":""},
]};
var percent_low = 25;var percent_high = 75;
var header = { "command" : "shellspec spec", "date" : "2020-07-07 12:21:07", "instrumented" : 26, "covered" : 0,};
var merged_data = [];