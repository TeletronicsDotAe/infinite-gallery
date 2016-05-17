function MyImageProvider() {}
MyImageProvider.prototype.size = function() {
    return 100000;
}
MyImageProvider.prototype.url = function(index) {
    var url = "https://unsplash.it/" + (100 + ((index % 2) * 50) + ((index % 10) * 10)) + "/" + (150 + (((index+1) % 2) * 20) + ((index % 5) * 10)) + "?image=" + (index % 500);
    console.log(url);
    return url;
}
MyImageProvider.prototype.setResultsChangedObserver = function(observer) {
    this.observer = observer;
}
