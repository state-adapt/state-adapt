#!/bin/bash

grep -Rn "$previous_sa_version.*$" dist/libs/
echo "dist/libs/ Previous version checked"

grep -Rn "$current_sa_version.*$" dist/libs/
echo "dist/libs/ Current version checked"

npm run nx reset

# The sleeps are required, otherwise it uses cache for some reason
sleep 2
npm run ng build core --prod
sleep 2
npm run ng build rxjs --prod
sleep 2
npm run ng build react --prod
sleep 2
npm run ng build angular --prod
sleep 2
npm run ng build ngrx --prod
sleep 2
npm run ng build ngxs --prod
sleep 2
npm run ng build angular-router --prod
sleep 2
npm run copy-files
sleep 1
node scripts/aggregate-cheat-sheets.js

echo "Build complete"

sleep 1

# Check Build Output
grep -Rn "$previous_sa_version.*$" dist/libs/
echo "dist/libs/ Previous version checked"

grep -Rn "$current_sa_version.*$" dist/libs/
echo "dist/libs/ Current version checked"

echo "Versions checked"

grep -Rn "../dist" dist/libs/

echo "Checked for ../dist"

