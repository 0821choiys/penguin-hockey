#!/bin/bash
for m in tall wide pc; do timeout 300 node -e "
process.argv[2]='$m';process.argv[3]='d2';
" ; done
