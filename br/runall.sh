#!/bin/bash
export SAVE='{"v":9,"points":700,"types":["basic","fast","strong"],"type":"fast","squad":["strong","basic",null],"lv":{"fast":6,"strong":3,"basic":2},"stats":{"played":9},"tut":{"done":true,"asked":true}}'
for s in "$@"; do timeout 300 node v10.js $s; done
