define(function() {

    var SpriteGenerator = function() {

        var that = this,
            images = [],

            filesElement = document.getElementById('files'),
            canvas = document.getElementById('viewport'),
            canvasContext = canvas.getContext('2d');

        that.start = function() {
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
            setTimeout(that.drawCanvas, 5000);
        };

        that.handleImageData = function(imageData, file) {
            var image = new Image();
            image.src = imageData;
            image.onload = function(){
                images.push({file: file, el: image});
            }
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
                yOffset = yOffset + imageElement.height;
            }
        }

        that.renderCss = function() {

        };

    };

    return new SpriteGenerator();
});