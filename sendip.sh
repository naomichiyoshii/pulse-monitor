res=`ifconfig`
res=`echo ${res} | sed -e "s/[ ]\+/%20/g"`
d1="curl -X POST -H 'Content-type: application/json' --data '{\"text\":\""
d2="\"}' https://hooks.slack.com/services/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"
cmd=$d1$res$d2
$cmd
