#!/bin/bash
cd /home/claude/work/br
for m in pc tall wide; do timeout 1800 node homeverify.js $m > audit/hv3_$m.txt 2>&1; echo "homeverify $m: $(tail -1 audit/hv3_$m.txt)"; grep "^FAIL\|^SKIP\|CRASH" audit/hv3_$m.txt | head; done
for m in pc tall wide; do SHOTS=1 timeout 2400 node ovf.js $m u10 > audit/ovf10_$m.txt 2>&1; echo "ovf $m: $(tail -1 audit/ovf10_$m.txt)"; grep -v "^### .* (0)$" audit/ovf10_$m.txt | grep -v "done no page errors" | head -30; done
cd /home/claude/work && bash runsuites.sh 2>&1 | tail -22
echo CHAINDONE
