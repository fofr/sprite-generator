define(function() {

    var SpriteGenerator = function() {

        var that = this,
            images = [],
            canvasElement;

        that.start = function() {
            var filesElement = document.getElementById('files');
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
                        that.handleSelectedImageData(loadEvent.target.result, file);
                    };
                })(file);

                fileReader.readAsDataURL(file);
            }
            setTimeout(that.updateSprite, 500);
        };

        that.handleSelectedImageData = function(imageData, file) {
            var image = new Image();
            image.src = imageData;
            image.onload = (function(file, image) {
                return function() {
                    images.push({file: file, el: image});
                };
            })(file, image);
        };

        that.updateSprite = function() {
            that.generateSprite();
            that.generateCSS();
            that.validateCSS();
        };

        that.generateSprite = function() {

            var canvasHeight = 0,
                canvasWidth = 0,
                yOffset = 0;

            canvasElement = document.createElement('canvas');

            // Determine sprite dimensions
            for(var i = 0, l = images.length; i < l; i++) {
                var imageElement = images[i].el;
                if(imageElement.width > canvasWidth) {
                    canvasWidth = imageElement.width;
                }
                canvasHeight = canvasHeight + imageElement.height;
            }

            canvasElement.height = canvasHeight;
            canvasElement.width = canvasWidth;

            // Insert images into canvas
            for(var i = 0, l = images.length; i < l; i++) {
                var imageElement = images[i].el,
                    canvasContext = canvasElement.getContext('2d');

                canvasContext.drawImage(imageElement, 0, yOffset);
                images[i].yOffset = yOffset;
                yOffset = yOffset + imageElement.height;
            }

            // Export canvas to image element for saving
            that.exportCanvas(canvasElement);
        };

        that.exportCanvas = function(canvasElement) {
            var spriteOutputElement = new Image(),
                h2 = createHeading('Generated Sprite');
            spriteOutputElement.src = that.getDataUrl();

            document.body.appendChild(h2);
            document.body.appendChild(spriteOutputElement);
        };

        that.getDataUrl = function() {
            return canvasElement.toDataURL();
        };

        that.generateCSS = function() {

            var css = '',
                h2 = createHeading('Generated CSS');
                styleElement = document.createElement('style');

            css += '.sprite {\n';
            css += '\tbackground-image: url(\'' + that.getDataUrl() + '\');\n';
            css += '}\n\n';

            for(var i = 0, l = images.length; i < l; i++) {
                var file = images[i].file,
                    element = images[i].el;

                css += '.sprite--' + getClassnameFromFilename(file.name) + ' {\n';
                css += '\twidth: ' + element.width + 'px;\n';
                css += '\theight: ' + element.height + 'px;\n';
                css += '\tbackground-position: 0 -' + images[i].yOffset + 'px;\n';
                css += '}\n\n';
            }

            styleElement.setAttribute('class', 'generated-css');
            styleElement.innerHTML = css;

            document.body.appendChild(h2);
            document.body.appendChild(styleElement);
        };

        that.validateCSS = function() {

            var validation = document.createElement('div');
            validation.setAttribute('class', 'validation');
            validation.appendChild(createHeading('CSS validation'));

            for(var i = 0, l = images.length; i < l; i++) {
                var file = images[i].file,
                    classname = getClassnameFromFilename(file.name),
                    div = document.createElement('div'),
                    h3 = createHeading(classname, 'h3');

                div.setAttribute('class', 'sprite sprite--' + classname);

                validation.appendChild(h3);
                validation.appendChild(div);
            }

            document.body.appendChild(validation);

        };

        function createHeading(text, level) {
            var level = level || 'h2',
                heading = document.createElement(level);

            heading.innerText = text;
            return heading;
        }

        function getClassnameFromFilename(filename) {
            return filename.substr(0, filename.lastIndexOf('.')).replace(/[\._]/g,'-').toLowerCase();
        }

    };

    return SpriteGenerator;
});