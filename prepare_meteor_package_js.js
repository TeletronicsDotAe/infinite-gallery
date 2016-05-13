var fs = require('fs')

var packageJson = JSON.parse(fs.readFileSync('package.json'));

fs.readFile('meteor/package.js', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/getFromPackageJson\(.*\)/g, function (match){return '"' + eval("packageJson." + match.substring("getFromPackageJson(".length, match.length - 1)) + '"';});

  fs.writeFile('package.js', result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
});