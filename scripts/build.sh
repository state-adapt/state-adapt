#!/bin/bash

grep -Rn "$old_sa_version.*$" dist/libs/
echo "dist/libs/ Old version printed"

if grep -Rn "$new_sa_version.*$" dist/libs/; then
  echo "⚠️  New version $new_sa_version found in existing dist/libs/"
else
  echo "✅ New version $new_sa_version not found in existing dist/libs/"
fi

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
npm run ng build angular-router --prod
sleep 2
npm run copy-files
sleep 1
node scripts/aggregate-cheat-sheets.js

echo "Build complete"

sleep 1

# Check Build Output
if grep -Rn "$old_sa_version.*$" dist/libs/; then
  echo "❌ dist/libs/ Previous version $old_sa_version found"
else
  echo "✅ dist/libs/ Previous version $old_sa_version not found"
fi

grep -Rn "$new_sa_version.*$"  dist/libs/;
echo "dist/libs/ New version printed"

if grep -Rn "\.\./dist" dist/libs/; then
  echo "❌ ../dist found in dist/libs/"
else
  echo "✅ ../dist not found in dist/libs/";
fi
