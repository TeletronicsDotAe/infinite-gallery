"use strict";

var packageName = "tlt:infinite-gallery";

var packageJson = JSON.parse(Npm.require("fs").readFileSync('package.json'));

Package.describe({
    name: packageName,
    version: packageJson.version,
    summary: packageJson.description,
    git: packageJson.repository.url
});

Package.onUse(function(api) {
    api.versionsFrom("1.2.0.2");
    api.use("jquery");
    api.export("TLTInfiniteGallery");
    api.addFiles([
        "dist/infinite.gallery.js",
        "meteor/export.js"], "client");
});
