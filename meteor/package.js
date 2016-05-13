"use strict";

var description = getFromPackageJson(description);
if (description.length > 100) description = description.substring(0, 100);

Package.describe({
    name: "tlt:infinite-gallery",
    version: getFromPackageJson(version),
    summary: description,
    git: getFromPackageJson(repository.url)
});

Package.onUse(function(api) {
    api.versionsFrom("1.2.0.2");
    api.use("jquery");
    api.export("TLTInfiniteGallery");
    api.addFiles([
        "dist/infinite.gallery.js",
        "meteor/export.js"], "client");
});
