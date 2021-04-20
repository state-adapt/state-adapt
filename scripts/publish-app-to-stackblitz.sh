# Run from this folder: sh publish-app-to-stackblitz.sh ng-sa-counter
git checkout main;
git branch -D stackblitz-$1;
git checkout -b stackblitz-$1;
# Prepare for Stackblitz
npm run ng build $1;
node copy-built-styles-into-app.js $1;
node set-dependencies.js $1;
node make-app-alone-in-angular-json.js $1;
node remove-other-apps.js $1;
node make-lib-imports-relative.js $1;
node prepare-react.js $1;
# / Prepare for Stackblitz
cd ../;
git add . -A;
git commit -m "Publish for StackBlitz";
git push origin stackblitz-$1 -f;
git checkout main;
