res=`/sbin/ifconfig -a | grep inet[^6] | sed 's/.*inet[^6][^0-9]*\([0-9.]*\)[^0-9]*.*/\1/'`
d1="curl -X POST -H 'Content-type: application/json' --data '{\"text\":\""
d2="\"}' https://hooks.slack.com/services/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"
cmd=$d1$res$d2
$cmd
