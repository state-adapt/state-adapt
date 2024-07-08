#!/bin/bash

if [ -z "$1" ]; then
  echo "You must specify a version increment type (patch, minor, major)"
  exit 1
fi

previous_sa_version=$(jq -r '.version' package.json)
npm run bump-version:$1
current_sa_version=$(jq -r '.version' package.json)
node scripts/sync-versions.js $current_sa_version
grep -Rn "$previous_sa_version.*$" libs/
grep -Rn "$current_sa_version.*$" libs/
