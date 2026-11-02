#!/bin/bash
# Full verification chain for the home redesign
cd /home/claude/work/br
for m in pc tall wide; do timeout 1800 node homeverify.js $m > audit/hv_$m.txt 2>&1; echo "homeverify $m: $(tail -1 audit/hv_$m.txt)"; grep "^FAIL\|^SKIP\|CRASH" audit/hv_$m.txt | head -20; done
for m in pc tall wide; do SHOTS=1 timeout 2400 node ovf.js $m u9 > audit/ovf9_$m.txt 2>&1; echo "ovf $m: $(tail -1 audit/ovf9_$m.txt)"; grep -v "^### .* (0)$" audit/ovf9_$m.txt | grep -v "done no page errors" | head -30; done
cd /home/claude/work && bash runsuites.sh 2>&1 | tail -22
echo CHAINDONE
