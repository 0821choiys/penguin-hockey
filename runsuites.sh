#!/bin/bash
cd "$(dirname "$0")"
for t in tests regress rankedtest leaguetest migtest3 migtest4 tuttest sqstyletest devtest v10test v10fun v10ev v10carry v10mig v10ach v10reset v10polish v11scout v12peng v13rink v17test v18test v19test v21test v22test v24test v25test v26test v27test v28test v29test v31test v32test v33test v34test v35test; do
  [ -f $t.js ] || continue
  r=$(timeout 900 node $t.js 2>&1); c=$?
  echo "== $t exit=$c :: $(echo "$r" | grep -E 'TOTAL|passed|failed' | tail -1)"
  echo "$r" | grep -E '^FAIL|Error' | head -5
done
echo ALLDONE
