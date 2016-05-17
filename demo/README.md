# Teletronics.ae infinite gallery demo

## Common

* Checkout this repository
* Open a terminal and cd into <checkout-folder>/demo

## Bower

Fetch the bower dependencies
```
bower install
```
*Note* your are not using the local source, but a release from the bower repository

Open file <checkout-folder>/demo/src/index_bower.html in your favorite brower (at leat Firefox and Chrome seems to work)

## NPM

CURRENTLY this does not work, because it seems the publish to npm does not inclue the correct set of files
Fetch the npm dependencies
```
npm install
```
*Note* your are not using the local source, but a release from the npm repository

Open file <checkout-folder>/demo/src/index_npm.html in your favorite brower (at leat Firefox and Chrome seems to work)

## Checked out code

Go to the actual module-folder and fetch the npm dependencies
```
cd ..
npm install
npm run build
```

Open file <checkout-folder>/demo/src/index_localcode.html in your favorite brower (at leat Firefox and Chrome seems to work).