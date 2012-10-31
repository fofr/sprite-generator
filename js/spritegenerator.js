/**
 * Sprite Generator
 * Takes a set of images, arranges them in a canvas, saves out the
 * canvas to an image element and generates the corresponding CSS.
 *
 * When the retina option is enabled, the image set is downscaled
 * by 50% using canvas. Extra CSS is also output.
 */
define(function() {

    var SpriteGenerator = function() {

        var that = this,
            imageStore = [];

        that.start = function() {
            var filesElement = document.getElementById('files');
            filesElement.addEventListener('change', that.handleFileSelect, false);

            var generateForm = document.getElementById('generate');
            generateForm.addEventListener('submit', that.handleFormSubmit, false);
        };

        that.handleFileSelect = function(evt) {

            var fileList = evt.target.files; // FileList object

            for (var i = 0, l = fileList.length; i < l; i++) {
                var file = fileList[i],
                    fileReader = new FileReader();

                // TODO: Gracefully tell the user the sprite inputs must be images
                if (!file.type.match('image.*')) {
                    continue;
                }

                // Use anonymous immediate function to retain correct file scope
                fileReader.onload = (function(filename) {
                    return function(loadEvent) {
                        that.handleSelectedImageData(imageStore, loadEvent.target.result, filename);
                    };
                })(file.name);

                // Parse image file information
                fileReader.readAsDataURL(file);
            }
        };

        that.handleSelectedImageData = function(images, imageData, filename) {
            var image = new Image();
            image.src = imageData;
            images.push({filename: filename, el: image});
        };

        that.handleFormSubmit = function(evt) {
            evt.preventDefault();

            if(imageStore.length === 0) {
                alert('Please select some images before continuing');
                return;
            }

            // Hide the form now we've used it
            evt.target.hidden = true;

            var downsample = document.getElementById('resample').checked;

            that.generateSprite(imageStore, downsample);
        };

        that.generateSprite = function(images, downsample) {

            var originalCanvas = document.createElement('canvas'),
                downsampledCanvas,
                h2 = createHeading(downsample ? 'Generated Sprites' : 'Generated Sprite');

            document.body.appendChild(h2);

            that.setCanvasDimensions(images, originalCanvas);
            that.drawCanvas(images, originalCanvas);
            that.exportCanvasToImage(originalCanvas);

            if(downsample) {
                downsampledCanvas = document.createElement('canvas');
                that.setCanvasDimensions(images, downsampledCanvas, downsample);
                that.drawCanvas(images, downsampledCanvas, downsample);
                that.exportCanvasToImage(downsampledCanvas);
                that.generateCSS(images, downsampledCanvas, downsample, originalCanvas);
            } else {
                that.generateCSS(images, originalCanvas);
            }

            that.validateCSS(images, downsample);
        };

        that.setCanvasDimensions = function(images, canvas, downsample) {

            var canvasHeight = 0,
                canvasWidth = 0;

            // Determine sprite dimensions
            for(var i = 0, l = images.length; i < l; i++) {
                var imageElement = images[i].el,
                    width = downsample ? downsampleProperty(imageElement.width) : imageElement.width,
                    height = downsample ? downsampleProperty(imageElement.height) : imageElement.height;

                if(width > canvasWidth) {
                    canvasWidth = width;
                }
                canvasHeight = canvasHeight + height;
            }

            canvas.height = canvasHeight;
            canvas.width = canvasWidth;
        };

        that.drawCanvas = function(images, canvas, downsample) {

            var yOffset = 0;

            // Insert images into canvas
            for(var i = 0, l = images.length; i < l; i++) {
                var imageElement = images[i].el,
                    width = downsample ? downsampleProperty(imageElement.width) : imageElement.width,
                    height = downsample ? downsampleProperty(imageElement.height) : imageElement.height,
                    canvasContext = canvas.getContext('2d');

                canvasContext.drawImage(imageElement, 0, yOffset, width, height);
                images[i].yOffset = yOffset;
                yOffset = yOffset + height;
            }
        };

        that.exportCanvasToImage = function(canvas) {
            var spriteOutputElement = new Image();
            spriteOutputElement.src = canvas.toDataURL();
            document.body.appendChild(spriteOutputElement);
        };

        that.generateCSS = function(images, canvas, includeRetina, retinaCanvas) {

            var css = '',
                downsample = !!(includeRetina),
                h2 = createHeading('Generated CSS'),
                spriteSourceStyleElement = document.createElement('style'),
                styleElement = document.createElement('style');

            css += '/* For validation sprite uses generated data URIs - be sure to use the saved image resources instead */\n';
            css += '.sprite {\n';
            css += '\tbackground-image: url(\'' + canvas.toDataURL() + '\');\n';
            css += '}\n\n';

            if(includeRetina) {

                // Bulletproof retina media query (Firefox, Opera, Webkit and defaults)
                // From: https://gist.github.com/2997187
                css += '@media (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (-webkit-min-device-pixel-ratio: 1.5), (min-device-pixel-ratio: 1.5), (min-resolution: 1.5dppx) {\n';
                css += '\t.sprite {\n';
                css += '\t\t background-image: url(\''+ retinaCanvas.toDataURL() +'\');\n';

                // Set background size of large retina sprite to the smaller sprite dimensions
                // See: http://miekd.com/articles/using-css-sprites-to-optimize-your-website-for-retina-displays/
                css += '\t\t background-size: '+canvas.width+'px '+canvas.height+'px;\n';
                css += '\t}\n';
                css += '}\n';

                css += '\n/* For retina validationElement only, do not copy */\n';
                css += '.sprite--retina {\n';
                css += '\t background-image: url(\''+ retinaCanvas.toDataURL() +'\');\n';
                css += '\t background-size: '+canvas.width+'px '+canvas.height+'px;\n';
                css += '}\n';
            }

            spriteSourceStyleElement.innerHTML = css;
            spriteSourceStyleElement.setAttribute('class', 'generated-css');

            css = '';
            css += '\n/* Copy me */\n';

            for(var i = 0, l = images.length; i < l; i++) {
                var filename = images[i].filename,
                    element = images[i].el,
                    width = downsample ? downsampleProperty(element.width) : element.width,
                    height = downsample ? downsampleProperty(element.height) : element.height;

                css += '.sprite--' + getClassnameFromFilename(filename) + ' {\n';
                css += '\twidth: ' + width + 'px;\n';
                css += '\theight: ' + height + 'px;\n';
                css += '\tbackground-position: 0 -' + images[i].yOffset + 'px;\n';
                css += '}\n\n';
            }

            styleElement.setAttribute('contenteditable', true);
            styleElement.setAttribute('class', 'generated-css');
            styleElement.innerHTML = css;

            document.body.appendChild(h2);

            // Style element containing the data URIs that we probably don't want to copy
            document.body.appendChild(spriteSourceStyleElement);

            // Visible style element containing the CSS we want to copy
            document.body.appendChild(styleElement);
        };

        that.validateCSS = function(images, includeRetina) {

            var validationElement = document.createElement('div');
            validationElement.setAttribute('class', 'validationElement');
            validationElement.appendChild(createHeading('Sprite and CSS validationElement'));

            for(var i = 0, l = images.length; i < l; i++) {
                var filename = images[i].filename,
                    classname = getClassnameFromFilename(filename),
                    div = document.createElement('div'),
                    retinaDiv,
                    h3 = createHeading(classname, 'h3');

                div.setAttribute('class', 'sprite sprite--' + classname);

                validationElement.appendChild(h3);
                validationElement.appendChild(div);

                if(includeRetina) {
                    retinaDiv = document.createElement('div');
                    retinaDiv.setAttribute('class', 'sprite sprite--retina sprite--' + classname);
                    validationElement.appendChild(retinaDiv);
                }
            }

            document.body.appendChild(validationElement);

        };

        function createHeading(text, level) {
            var level = level || 'h2',
                heading = document.createElement(level);

            heading.innerHTML = text;
            return heading;
        }

        function downsampleProperty(property) {
            return Math.ceil(property / 2);
        }

        function getClassnameFromFilename(filename) {
            return filename.substr(0, filename.lastIndexOf('.')).replace(/[\._]/g,'-').toLowerCase();
        }

    };

    return SpriteGenerator;
});