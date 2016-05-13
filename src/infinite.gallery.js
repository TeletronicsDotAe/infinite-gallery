export default function() {
    "use strict";

    const NO_IMAGE_FETCH_AT_THE_TIME = 10;

    function TLTInfiniteGallery(outercontainer, imageProvider, fetchAhead, columnWidth, minImageWidthHeightToDisplayIt) {
        this.outercontainer = outercontainer;
        this.imageProvider = imageProvider;
        this.fetchAhead = fetchAhead;
        this.columnWidth = columnWidth;
        this.minImageWidthHeightToDisplayIt = minImageWidthHeightToDisplayIt;
        this.state = new State(this);

        this.container = $("<div/>", {
            style: "overflow: scroll; position: fixed"
        })
        this.setContainerDims();
        this.container.appendTo(outercontainer);

        // TBD we need to set scroll top to 0 in Firefox, becuase if you reload the page it seems to remember how far you scrolled
        // the last time, and try to scroll there again - not working very well
        // console.log("scrolling to 0 - seems not to work"); this.container.scrollTop(0);
        this.reset();

        $(window).resize(function(gallery) { return function() { gallery.resized.call(gallery) }}(this));
        this.container.scroll(function(gallery) { return function() { gallery.scrolled.call(gallery) }}(this));

        imageProvider.setResultsChangedObserver(this);
    };

    var pt = TLTInfiniteGallery.prototype;

    pt.reset = function() {
        if (this.initialized) {
            for (var column = 0; column < this.noColumns; column++) {
                this.state.prevOTBDTopIndex[column] = this.state.OTBDTopIndex[column];
                this.state.prevOTBDBottomIndex[column] = this.state.OTBDBottomIndex[column];
                this.state.OTBDTopIndex[column] = -1;
                this.state.OTBDBottomIndex[column] = -2;
            }
            this.displayOnlyThoseThatOughtToBeDisplayed();
        }

        var containerWidthAndNoColumns = this.calculateContainerWidthAndNoColumns();
        this.containerWidth = containerWidthAndNoColumns.containerWidth;
        this.noColumns = containerWidthAndNoColumns.noColumns;
        this.state.reset();
        this.initialized = true;

        this.state.updateOughtToBeDisplayedTopBottomIndices();
        this.addItemsToBottomIfNecessary();
    }

    pt.calculateContainerWidthAndNoColumns = function() {
        var result = {
            containerWidth: this.container.width(),
            noColumns: Math.floor(this.container.width() / this.columnWidth)
        }
        if (result.noColumns == 0) result.noColumns = 1;
        return result;
    }

    pt.changed = function() {
        this.reset();
    }

    pt.setContainerDims = function() {
        this.container.css("left", "" + this.outercontainer.offset().left + "px");
        this.container.css("top", "" + this.outercontainer.offset().top + "px");
        this.container.css("width", "" + this.outercontainer.width() + "px");
        this.container.css("height", "" + this.outercontainer.height() + "px");
    }

    pt.resized = function() {
        this.setContainerDims();

        var containerWidthAndNoColumns = this.calculateContainerWidthAndNoColumns();
        if (containerWidthAndNoColumns.noColumns != this.noColumns) {
            console.log("Resetting due to number of columns possible changed from " + this.noColumns + " to " + containerWidthAndNoColumns.noColumns);
            this.reset();
        }
    }

    pt.scrolled = function() {
        this.state.updateOughtToBeDisplayedTopBottomIndices();
        this.displayOnlyThoseThatOughtToBeDisplayed();
        this.addItemsToBottomIfNecessary();
    }

    pt.displayOnlyThoseThatOughtToBeDisplayed = function() {
        var item;
        for (var column = 0; column < this.noColumns; column++) {
            for (var prevOTBDIndex = this.state.prevOTBDTopIndex[column]; prevOTBDIndex <= this.state.prevOTBDBottomIndex[column]; prevOTBDIndex++) {
                if (prevOTBDIndex < this.state.columnItems[column].length) {
                    if (prevOTBDIndex < this.state.OTBDTopIndex[column] || prevOTBDIndex > this.state.OTBDBottomIndex[column]) {
                        item = this.state.columnItems[column][prevOTBDIndex];
                        item.undisplay();
                    }
                }
            }
            for (var OTBDIndex = this.state.OTBDTopIndex[column]; OTBDIndex <= this.state.OTBDBottomIndex[column]; OTBDIndex++) {
                if (OTBDIndex < this.state.columnItems[column].length) {
                    item = this.state.columnItems[column][OTBDIndex];
                    if (!item.displayed()) {
                        var img = new Image();
                        img.src = this.imageProvider.url(item.ppIndex);
                        this.setImageDims(img, item);
                        item.display(img);
                    }
                }
            }
        }
    }

    pt.addItemsToBottomIfNecessary = function() {
        var gallery = this;
        this.container.queue(function (next) { gallery._addItemsToBottomIfNecessary(); next(); });
    }

    pt._addItemsToBottomIfNecessary = function() {
        //debugger;
        var gallery = this;
        if (this.state.missingItemsInBottom()) {
            var nextUnaddedPPIndex = this.state.nextUnaddedPPIndex;
            var toDisplay = Math.min(NO_IMAGE_FETCH_AT_THE_TIME, this.imageProvider.size() - nextUnaddedPPIndex);
            var endPPIndex = nextUnaddedPPIndex + toDisplay;
            for (var ppIndex = nextUnaddedPPIndex; ppIndex < endPPIndex; ppIndex++) {
                var triggerMoreAdding = (ppIndex == (endPPIndex - 1));
                var img = new Image();
                img.onload = function(ppIndex, triggerMoreAdding) { return function() {
                    gallery.container.queue(
                        function(img) { return function(next) {
                            if (img.width >= gallery.minImageWidthHeightToDisplayIt || img.height >= gallery.minImageWidthHeightToDisplayIt) {
                                var lowestColumn = gallery.state.getLowestColumn();
                                var containerTop = gallery.state.containerTopForNextAddedItem(lowestColumn);
                                //console.log("loaded image " + img.width + " " + img.height);
                                var item = new Item(gallery, lowestColumn, ppIndex, containerTop, img.width, img.height);
                                gallery.setImageDims(img, item);
                                if (gallery.state.addItemToBottom(lowestColumn, item)) {
                                    item.display(img);
                                }
                            }
                            gallery.state.removeLoadingImage(img);
                            next();
                            if (triggerMoreAdding) gallery.addItemsToBottomIfNecessary();
                        }}(this)
                    );
                }}(ppIndex, triggerMoreAdding);
                img.onerror = img.onabort = function() {
                    gallery.state.removeLoadingImage(this);
                    if (triggerMoreAdding) gallery.addItemsToBottomIfNecessary();
                }
                var url = this.imageProvider.url(ppIndex);
                img.src = url;
                this.state.addLoadingImage(img);
            }
            this.state.nextUnaddedPPIndex += toDisplay;
        }
    }

    pt.setImageDims = function(img, item) {
        img.style.width = "" + this.columnWidth + "px";
        img.style.height = "" + item.containerHeight() + "px";
        img.style.position = "absolute";
        img.style.left = "" + (item.column * this.columnWidth) + "px";
        img.style.top = "" + (item.containerTop) + "px";
    }

    function Item(owner, column, ppIndex, containerTop, realWidth, realHeight) {
        this.owner = owner;
        this.column = column;
        this.ppIndex = ppIndex;
        this.containerTop = containerTop;
        this.realWidth = realWidth;
        this.realHeight = realHeight;
        this.containerBottom = this.containerTop + this.containerHeight();
        this.img = null;
    }

    var ipt = Item.prototype;

    ipt.containerHeight = function() {
        return Math.ceil((this.realHeight * this.owner.columnWidth) / this.realWidth);
    }

    ipt.displayed = function() {
        return this.img != null;
    }

    //var noDisplayed = 0;
    ipt.display = function(img) {
        if (!this.displayed()) {
            this.img = img;
            this.owner.container.append(img);
            //console.log("no displayed " + ++noDisplayed);
        }
    }

    ipt.undisplay = function() {
        if (this.displayed()) {
            this.img.remove();
            this.img = null;
            //console.log("no displayed " + --noDisplayed);
        }
    }

    pt.Item = Item;

    function State(owner, test) {
        this.owner = owner;
        this.test = (typeof test === 'boolean')?test:false;
    }

    var spt = State.prototype;

    spt.reset = function() {
        this.nextUnaddedPPIndex = 0;
        this.columnItems = [];
        // OTBD is short for Ought-To-Be-Displayed
        this.OTBDTopIndex = [];
        this.OTBDBottomIndex = [];
        this.prevOTBDTopIndex = [];
        this.prevOTBDBottomIndex = [];
        for (var i = 0; i < this.owner.noColumns; i++) {
            this.columnItems.push([]);
            this.OTBDTopIndex.push(-1);
            this.OTBDBottomIndex.push(-2);
            this.prevOTBDTopIndex.push(-1);
            this.prevOTBDBottomIndex.push(-2);
        }
        // Prevents garbage-collection of images before they have loaded and the onload has been called
        this.loadingImages = [];
    }

    spt.addLoadingImage = function(img) {
        this.loadingImages.push(img);
    }

    spt.removeLoadingImage = function(img) {
        var index = this.loadingImages.indexOf(img);
        if (index >= 0) this.loadingImages.splice(index, 1);
    }

    spt.updateOughtToBeDisplayedTopBottomIndices = function() {
        for (var column = 0; column < this.owner.noColumns; column++) {
            this.updateOughtToBeDisplayedTopBottomIndicesColumn(column);
        }
    }

    spt.updateOughtToBeDisplayedTopBottomIndicesColumn = function(column) {
        this.prevOTBDTopIndex[column] = this.OTBDTopIndex[column];
        this.prevOTBDBottomIndex[column] = this.OTBDBottomIndex[column];

        var columnItems = this.columnItems[column];
        if (columnItems.length == 0) {
            this.OTBDTopIndex[column] = -1;
            this.OTBDBottomIndex[column] = -2;
            return;
        }

        var OTBDPixelTop = this.oughtToBeDisplayedPixelTop();
        if (OTBDPixelTop >= 0 && columnItems[columnItems.length - 1].containerBottom <= OTBDPixelTop) {
            this.OTBDTopIndex[column] = columnItems.length;
            this.OTBDBottomIndex[column] = columnItems.length;
            return;
        }
        var startNextStep;
        var startItemIndex;
        if (this.OTBDTopIndex[column] == -1) {
            startNextStep = 0; // Indicate we have to do binary search over the entire interval
            startItemIndex = Math.floor((columnItems.length - 1) / 2);
        } else {
            startNextStep = 5; // Lets start close to where we were last time
            startItemIndex = Math.min(this.OTBDTopIndex[column], columnItems.length - 1);
        }
        this.OTBDTopIndex[column] = this.findOughtToBeDisplayedBorderIndexColumn(columnItems, OTBDPixelTop, startItemIndex, startNextStep, 0);

        var OTBDPixelBottom = this.oughtToBeDisplayedPixelBottom();
        if (OTBDPixelBottom >= 0 && columnItems[columnItems.length - 1].containerBottom <= OTBDPixelBottom) {
            this.OTBDBottomIndex[column] = columnItems.length;
            return;
        }
        startNextStep = 5; // Lets start close
        startItemIndex = Math.min(Math.ceil(this.OTBDTopIndex[column] + ((OTBDPixelBottom - OTBDPixelTop) / (columnItems[columnItems.length - 1].containerBottom / columnItems.length))), columnItems.length - 1);
        this.OTBDBottomIndex[column] = this.findOughtToBeDisplayedBorderIndexColumn(columnItems, OTBDPixelBottom, startItemIndex, startNextStep, this.OTBDTopIndex[column]);
    }

    spt.findOughtToBeDisplayedBorderIndexColumn = function(columnItems, pixelBorder, startItemIndex, startNextStep, startCandidateTopIndex) {
        var newItemBorderIndex = startItemIndex;
        var nextStep = startNextStep;
        if (pixelBorder >= 0) {
            var candidateTopIndex = startCandidateTopIndex;
            var candidateBottomIndex = columnItems.length - 1;

            // while this one should be displayed and the one before should not be displayed (this one top is at the top to be shown or above)
            var newItemBottomBelowBorder;
            var newItemTopAboveBorder;
            var loopCount = 0;
            do {
                if (this.test) {
                    //console.log("newItemBorderIndex " + newItemBorderIndex);
                    if (loopCount++ > 100) throw Error("Too many loops");
                }

                if (candidateTopIndex == candidateBottomIndex) {
                    newItemBorderIndex = candidateTopIndex;
                    break;
                }

                newItemBottomBelowBorder = columnItems[newItemBorderIndex].containerBottom > pixelBorder;
                newItemTopAboveBorder = columnItems[newItemBorderIndex].containerTop <= pixelBorder;
                if (!newItemBottomBelowBorder) {
                    candidateTopIndex = newItemBorderIndex + 1;
                    if (candidateTopIndex == candidateBottomIndex) {
                        newItemBorderIndex = candidateTopIndex;
                        break;
                    }
                    var nextStepForCandidateMiddle = Math.ceil((candidateBottomIndex - candidateTopIndex) / 2);
                    if (nextStep > 0 && nextStep < nextStepForCandidateMiddle) {
                        newItemBorderIndex += nextStep;
                        nextStep = nextStep * 2;
                    } else {
                        newItemBorderIndex += nextStepForCandidateMiddle;
                        nextStep = 0;
                    }
                } else if (!newItemTopAboveBorder) {
                    candidateBottomIndex = newItemBorderIndex - 1;
                    if (candidateTopIndex == candidateBottomIndex) {
                        newItemBorderIndex = candidateTopIndex;
                        break;
                    }
                    var nextStepForCandidateMiddle = Math.ceil((candidateBottomIndex - candidateTopIndex) / 2);
                    if (nextStep > 0 && nextStep < nextStepForCandidateMiddle) {
                        newItemBorderIndex -= nextStep;
                        nextStep = nextStep * 2;
                    } else {
                        newItemBorderIndex -= nextStepForCandidateMiddle;
                        nextStep = 0;
                    }
                }
            } while (!newItemBottomBelowBorder || !newItemTopAboveBorder);
        }
        return newItemBorderIndex;
    }

    spt.oughtToBeDisplayedPixelTop = function() {
        return this.owner.container.scrollTop() - this.owner.fetchAhead;
    }

    spt.oughtToBeDisplayedPixelBottom = function() {
        return this.owner.container.scrollTop() + this.owner.container.height() + this.owner.fetchAhead;
    }

    spt.missingItemsInBottom = function() {
        for (var column = 0; column < this.owner.noColumns; column++) {
            var columnItems = this.columnItems[column];
            var bottomIndex = this.OTBDBottomIndex[column];
            if (bottomIndex < 0 || bottomIndex >= columnItems.length) return true;
        }
        return false;
    }

    spt.getLowestColumn = function() {
        var lowestColumn = 0;
        for (var column = 1; column < this.owner.noColumns; column++) {
            if (this.containerTopForNextAddedItem(column) < this.containerTopForNextAddedItem(lowestColumn)) lowestColumn = column;
        }
        return lowestColumn;
    }

    spt.containerTopForNextAddedItem = function(column) {
        return (this.columnItems[column].length == 0) ? 0 : this.columnItems[column][this.columnItems[column].length - 1].containerBottom;
    }

    spt.addItemToBottom = function(column, newItem) {
        var columnItems = this.columnItems[column];
        columnItems.push(newItem);
        var OTBDPixelBottom = this.oughtToBeDisplayedPixelBottom();
        var itemTopAboveDisplayBottom = newItem.containerTop <= OTBDPixelBottom;
        if (itemTopAboveDisplayBottom) {
            var itemBottomBelowDisplayBottom = newItem.containerBottom > OTBDPixelBottom;
            this.OTBDBottomIndex[column] = columnItems.length - ((itemBottomBelowDisplayBottom) ? 1 : 0);
        }
        if (columnItems.length == 1) {
            this.OTBDTopIndex[column] = 0;
        }
        return itemTopAboveDisplayBottom;
    };

    pt.State = State;

    return TLTInfiniteGallery;

}()
