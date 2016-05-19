# Releasing

## Initial

The following has already been done, and should only be done this one time

* Set version in package.json to 0.0.0, so that we are ready for the first version-bump in `npm version major|minor|patch` in the procedure below
* The first time I ran `npm publish` in the procedure below, it failed with “You need a paid account to perform this action”, because it thinks I want restricted access. You ought to be able to tell it to be public access as part of the `npm publish` command, but I cannot make that work. But the entry was actually created as a private entry at https://www.npmjs.com/~tlt, so I just made it public afterward
  * `npm access public`
  * Then run `npm publish` again
* Register at Bower like this: `bower register tlt.infinite-gallery git://github.com/TeletronicsDotAe/infinite-gallery.git`
* The first time I ran `meteor publish` in the procedure below, I ran it with a `--create` parameter like this: `meteor publish --create`

## Release procedure

You can only (and should only try to) follow this procedure, if you are part of [teletronics.ae](https://www.teletronics.ae/join-us/) (tlt) and know the passwords for registry.npmjs.org and atmospherejs.com registries. If you are working on a fork for another organization, you need to have your own accounts at those registries and essentially change any occurrence of "tlt" throughout the code-base with your own acronym/account-name. Instead of making your own releases of forks, we definitely prefer that you make a pull-request and have your improvements included in the next tlt-release.

* Consider updating demo dependencies to the release you are about to make (pretending you are currently on version 1.2.3, if you are going to run `npm version major` below, the next release will be 2.0.0, if you are going to run `npm version minor` below, the next release will be 1.3.0, if you are going to run `npm version patch` below, the next release will be 1.2.4). Currently it is a matter of changing the following files
  * Bower: [../demo/bower.json](../demo/bower.json)
  * NPM: [../demo/package.json](../demo/package.json)
* Install the npm modules needed for releasing: `npm install`
* Log into registry.npmjs.org: `npm login` (log in as user "tlt")
* Bump to the new version, build, tag and push: `npm version major|minor|patch`
* Publish the new release to registry.npmjs.org registry: `npm publish`
* Build the package.js for meteor publish: `node prepare_meteor_package_js.js`
* Publish the new release to atmospherejs.com (meteor) registry: `meteor publish`. You will be told about some additional steps to perform to finish the meteor publish
  * Essentially run `meteor publish-for-arch tlt:infinite-gallery@<x>.<y>.<z>` each of the remote machines accessed by
    * `meteor admin get-machine os.osx.x86_64`
    * `meteor admin get-machine os.linux.x86_64`
    * `meteor admin get-machine os.linux.x86_32`
    * `meteor admin get-machine os.windows.x86_32`
  * Meteor might very well change that procedure over time, so just make sure to follow the directions
  * I faithfully run the command on each of the machines, even though it only succeeds on the first one. The rest fail with "Cannot override existing build". Im am not 100% sure why, but my guess is that meteor detects that there are nothing platform specific in the code and therefore reuses the build across architectures. I do not know if it is actually necessary to run the command on all machines, when it seems to fail on all but the first one, but I have done it every time.
* Clean up a few temporary files: `rm package.js .versions`
