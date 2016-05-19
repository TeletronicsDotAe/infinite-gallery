# infinite-gallery

Infinite gallery component. You set an image-provider, the component makes you scroll smoothly through all the images it provides.

## Usage

To use the component, essentially do a `new TLTInfiniteGallery` and give it the following parameters
* A div (from the DOM) to contain the gallery. The gallery will not make the div grow (or shrink for that matter). Therefore it is very important to you force it to have the size and position you want it to have.
* A javascript "class" known as the ImageProvider, implemented something a-la this
```
function MyImageProvider() {}
MyImageProvider.prototype.size = function() {
    // Return the number of images in the gallery
    // If the size is unknown (very very big) you can just return a very very big number. It does not have to be exact, if you know the user will never scroll to the end anyway
}
MyImageProvider.prototype.url = function(index) {
    // Return the full URL of image number #index (parameter)
}
MyImageProvider.prototype.setResultsChangedObserver = function(observer) {
    // Used by the componenet to hand over an observer. You have to call function "changed" (no parameters) on the observer, if the images in the gallery changes
    // Useful if you use the compoenent to show images found by a search done by the user. When the user makes a new search, call "changed" on the observer
    // and start responding from the other functions on this ImageProvider adhering to the images found in the new search
}
```
* The number of pixels to "fetch ahead". The componenet will try to fetch images for that many pixels ahead of the current scroll position. Higher values will make the container use more memory in the browser and make the DOM bigger. But higher values will also give a more smooth scrolling experience, especially if the server providing the images is slow (or the images are very big). Find a good balance. Try starting out with e.g. 2000.
* The width in pixels of each column in the gallery. The componenet will create as many columns with this width as it can within the width of the div.
* The minimum width and height in pixels of an image for it to be displayed. Sometimes you might get small irrelevant images in your set of images. Of course your ImageProvider can filter them, but you can also have the componenet ignore them if you want to. The component will only display images where the width and the height (in pixels) is at least the value provided here. To disable this feature just use 0.

See [demo](demo) for demonstrations of using the componenet

This component also comes [wrapped in a Angular directive](https://github.com/TeletronicsDotAe/infinite-gallery-angular)

Bower
* Dependency: tlt.infinite-gallery
* Use `bower info tlt.infinite-gallery` to list available versions

NPM
* Dependency: @tlt/infinite-gallery
* Use `npm view @tlt/infinite-gallery` to list available versions

Meteor
* [meteor add tlt:infinite-gallery](https://atmospherejs.com/tlt/infinite-gallery)

## Additional doc

See [doc](doc)
