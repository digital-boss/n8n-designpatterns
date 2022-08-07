#!/usr/bin/env bash
versions=(
  "step1...step2"
  "step2...step3-1"
  "step3-1...step3-2"
  "step3-2...step4-1"
  "step4-1...step4-2"
  "step4-2...step4-3-1"
  "step4-3-1...step4-3-2"
  "step4-3-2...step4-3-3"
  "step4-3-3...step4-3-4"
  "step4-3-4...step4-4"
  "step4-4...step5"
)

for ver in ${versions[@]}; do
  echo $ver
  file=${ver/.../__}
  gh api -X GET "https://api.github.com/repos/digital-boss/n8n-nodes-designpatterns-tutorial/compare/$ver" > ../generated/json/$file.json
done