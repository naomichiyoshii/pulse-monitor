#!/bin/sh

res=`/sbin/ifconfig -a | grep inet[^6] | sed 's/.*inet[^6][^0-9]*\([0-9.]*\)[^0-9]*.*/\1/' | grep -v '^127\.'`

curl -X POST \
--data-urlencode 'payload={"text":"Raspberry pi booted on"}' \
https://hooks.slack.com/services/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
