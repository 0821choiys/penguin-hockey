#!/bin/bash
cd /home/claude/work/br
timeout 1800 node homeverify.js tall > audit/hv_tall.txt 2>&1; echo "homeverify tall: $(tail -1 audit/hv_tall.txt)"; grep "^FAIL\|CRASH" audit/hv_tall.txt | head
for m in pc tall wide; do SHOTS=1 timeout 2400 node ovf.js $m u9 > audit/ovf9_$m.txt 2>&1; echo "ovf $m: $(tail -1 audit/ovf9_$m.txt)"; grep -v "^### .* (0)$" audit/ovf9_$m.txt | grep -v "done no page errors" | head -30; done
cd /home/claude/work && bash runsuites.sh 2>&1 | tail -22
echo CHAINDONE
