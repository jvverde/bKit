var data = {lines:[
{"lineNum":"    1","line":"#!/usr/bin/env bash"},
{"lineNum":"    2","line":"sdir=\"$(dirname \"$(readlink -f \"$0\")\")\"\t\t\t\t#Full DIR","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    3","line":""},
{"lineNum":"    4","line":"source \"$sdir/functions/all.sh\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    5","line":""},
{"lineNum":"    6","line":"[[ ${1+isset} == isset ]] || die \"Usage:\\n\\t$0 uuid\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    7","line":""},
{"lineNum":"    8","line":"uuid=\"$1\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"    9","line":""},
{"lineNum":"   10","line":"exists wmic && {","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   11","line":"\techo -n \"$(WMIC logicaldisk WHERE \"VolumeSerialNumber like \'$uuid\' and DriveType!=64\" GET Name /format:textvaluelist | sed -nr \'s/Name=(.+)/\\1/p\' | perl -lape \'s/(?:\\r|\\n)+$//g\'|head -n1)\" && exit","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   12","line":"}"},
{"lineNum":"   13","line":""},
{"lineNum":"   14","line":"exists fsutil && {","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   15","line":"\tdrive=($(FSUTIL FSINFO DRIVES|sed \'s/\\r//g;/^$/d\'|tr \'\\0\' \' \'|grep -io \'[a-z]:\\\\\'|xargs -d\'\\n\' -rI{} sh -c \'","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   16","line":"\t\tFSUTIL FSINFO VOLUMEINFO \"$1\"|grep -iq \"\\bVolume Serial Number\\s*:\\s*0x$2\\b\" && echo $1 && exit","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   17","line":"\t\' -- {} \"$uuid\"))","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   18","line":"\t[[ -e $drive ]] || die \"Drive with id $uuid is not installed\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   19","line":"\techo -n \"$drive\" && exit","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   20","line":"}"},
{"lineNum":"   21","line":""},
{"lineNum":"   22","line":"exists findmnt && {","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   23","line":"\t#readlink -ne \"$(findmnt -S uuid=$uuid -nro SOURCE)\" && exit"},
{"lineNum":"   24","line":"\treadlink -ne \"$(findmnt -S UUID=$uuid -nro TARGET)\" && exit","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   25","line":"}"},
{"lineNum":"   26","line":""},
{"lineNum":"   27","line":"exists lsblk && {","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   28","line":"\tname=\"$(lsblk -lno KNAME,UUID,MOUNTPOINT|awk \'$3 ~ /^\\// {print $0}\'|grep -i \"\\b$uuid\\b\"|head -n 1|cut -d\' \' -f1)\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   29","line":"\t[[ -n $name ]] && {","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   30","line":"\t\tDEV=${name:+/dev/$name}","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   31","line":"\t\t[[ -b $DEV ]] && echo -n \"$DEV\" && exit","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   32","line":"\t}"},
{"lineNum":"   33","line":"}"},
{"lineNum":"   34","line":""},
{"lineNum":"   35","line":"[[ -e /dev/disk/by-uuid ]] && {","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   36","line":"\treadlink -ne \"/dev/disk/by-uuid/$uuid\" && exit","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   37","line":"}"},
{"lineNum":"   38","line":""},
{"lineNum":"   39","line":"exists blkid && {","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   40","line":"\treadlink -ne \"$(blkid -U \"$uuid\")\" && exit","class":"lineNoCov","hits":"0","possible_hits":"0",},
{"lineNum":"   41","line":"}"},
{"lineNum":"   42","line":""},
{"lineNum":"   43","line":"die \"Device with id $uuid is not installed\"","class":"lineNoCov","hits":"0","possible_hits":"0",},
]};
var percent_low = 25;var percent_high = 75;
var header = { "command" : "shellspec spec", "date" : "2020-07-07 12:21:07", "instrumented" : 24, "covered" : 0,};
var merged_data = [];