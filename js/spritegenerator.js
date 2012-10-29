define(function() {

    var SpriteGenerator = function() {

        var that = this,
            images = [],

            filesElement,
            canvas,
            canvasContext,
            stylesElement,
            spriteOutputElement;

        that.start = function() {

            filesElement = document.getElementById('files');
            canvas = document.getElementById('sprite');
            canvasContext = canvas.getContext('2d');
            stylesElement = document.getElementById('styles');
            spriteOutputElement = document.getElementById('spriteOutput');

            filesElement.addEventListener('change', that.handleFileSelect, false);
        };

        that.handleFileSelect = function(evt) {
            var fileList = evt.target.files; // FileList object

            for (var i = 0, l = fileList.length; i < l; i++) {

                var file = fileList[i],
                    fileReader = new FileReader();

                if (!file.type.match('image.*')) {
                    // TODO: Gracefully tell the user the sprite inputs must be images
                    continue;
                }

                // Use anonymous immediate function to retain correct file scope
                fileReader.onload = (function(file) {
                    return function(loadEvent) {
                        that.handleImageData(loadEvent.target.result, file);
                    };
                })(file);

                fileReader.readAsDataURL(file);
            }
            setTimeout(that.updateSprite, 5000);
        };

        that.handleImageData = function(imageData, file) {
            var image = new Image();
            image.src = imageData;
            image.onload = function() {
                images.push({file: file, el: image, width: image.width, height: image.height});
            }
        };

        that.updateSprite = function() {
            that.drawCanvas();
            that.generateCSS();
            that.exportCanvas();
        };

        that.drawCanvas = function() {

            var canvasHeight = 0,
                canvasWidth = 0,
                yOffset = 0;

            for(var i = 0, l = images.length; i < l; i++) {
                var imageElement = images[i].el;
                if(imageElement.width > canvasWidth) {
                    canvasWidth = imageElement.width;
                }
                canvasHeight = canvasHeight + imageElement.height;
            }

            canvas.height = canvasHeight;
            canvas.width = canvasWidth;

            for(var i = 0, l = images.length; i < l; i++) {
                var imageElement = images[i].el;
                canvasContext.drawImage(imageElement, 0, yOffset);
                images[i].yOffset = yOffset;
                yOffset = yOffset + imageElement.height;
            }
        };

        that.exportCanvas = function() {

            var dataUrl = canvas.toDataURL();
            spriteOutputElement.src = dataUrl;

        };

        that.generateCSS = function() {

            /*var generatedStyles = '';

            for(var i = 0, l = images.length; i < l; i++) {
                var file = images[i].file;

                var css = '';

                canvasContext.drawImage(imageElement, 0, yOffset);
                yOffset = yOffset + imageElement.height;
            } */

        };

    };

    return SpriteGenerator;
});