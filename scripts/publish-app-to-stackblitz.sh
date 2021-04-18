# Run from this folder: sh publish-app-to-stackblitz.sh ngxs-demo
git checkout main;
git branch -d $1;
git checkout -b $1;
# Prepare for Stackblitz
node remove-dependencies.js;
node make-app-alone-in-angular-json.js $1;
node remove-other-apps.js $1;
node make-lib-imports-relative.js $1;
# / Prepare for Stackblitz
cd ../;
git add . -A;
git commit -m "Publish for StackBlitz";
git push origin $1 -f;
git checkout main;
