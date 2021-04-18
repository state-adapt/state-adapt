git checkout main;
git branch -d $1;
git checkout -b $1;
node remove-dependencies.js;
node make-app-alone-in-angular-json.js $1;
node remove-other-apps.js $1;
node make-lib-imports-relative.js $1;

# git checkout main;
# echo "didn't think this would run too, did you? $1"
