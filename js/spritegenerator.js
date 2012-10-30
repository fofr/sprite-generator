define(function() {

    var SpriteGenerator = function() {

        var that = this,
            images = [];

        that.start = function() {
            var filesElement = document.getElementById('files');
            filesElement.addEventListener('change', that.handleFileSelect, false);

            var generateForm = document.getElementById('generate');
            generateForm.addEventListener('submit', that.generateSprite, false);
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
                fileReader.onload = (function(file) {
                    return function(loadEvent) {
                        that.handleSelectedImageData(loadEvent.target.result, file);
                    };
                })(file);

                // Parse image file information
                fileReader.readAsDataURL(file);
            }
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

        that.generateSprite = function(evt) {
            evt.preventDefault();

            if(images.length === 0) {
                alert('Please select some images before continuing');
                return;
            }

            evt.target.hidden = true;

            var originalCanvas = document.createElement('canvas'),
                downsampledCanvas,
                downsample = document.getElementById('resample').checked,
                h2 = createHeading(downsample ? 'Generated Sprites' : 'Generated Sprite');

            document.body.appendChild(h2);

            that.setCanvasDimensions(originalCanvas);
            that.drawCanvas(originalCanvas);
            that.exportCanvas(originalCanvas);

            if(downsample) {
                downsampledCanvas = document.createElement('canvas');
                that.setCanvasDimensions(downsampledCanvas, downsample);
                that.drawCanvas(downsampledCanvas, downsample);
                that.exportCanvas(downsampledCanvas);
                that.generateCSS(downsampledCanvas, downsample, originalCanvas);
            } else {
                that.generateCSS(originalCanvas);
            }

            that.validateCSS(downsample);
        };

        that.setCanvasDimensions = function(canvas, downsample) {

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

        that.drawCanvas = function(canvas, downsample) {

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

        that.exportCanvas = function(canvas) {
            var spriteOutputElement = new Image();
            spriteOutputElement.src = canvas.toDataURL();
            document.body.appendChild(spriteOutputElement);
        };

        that.generateCSS = function(canvas, includeRetina, retinaCanvas) {

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
                css += '@media only screen and ((min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (-webkit-min-device-pixel-ratio: 1.5), (min-device-pixel-ratio: 1.5), (min-resolution: 1.5dppx)) {\n';
                css += '\t.sprite {\n';
                css += '\t\t background-image: url(\''+ retinaCanvas.toDataURL() +'\');\n';

                // Set background size of large retina sprite to the smaller sprite dimensions
                // See: http://miekd.com/articles/using-css-sprites-to-optimize-your-website-for-retina-displays/
                css += '\t\t background-size: '+canvas.width+'px '+canvas.height+'px;\n';
                css += '\t}\n';
                css += '}\n';

                css += '\n/* For retina validation only, do not copy */\n';
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
                var file = images[i].file,
                    element = images[i].el,
                    width = downsample ? downsampleProperty(element.width) : element.width,
                    height = downsample ? downsampleProperty(element.height) : element.height;

                css += '.sprite--' + getClassnameFromFilename(file.name) + ' {\n';
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

        that.validateCSS = function(includeRetina) {

            var validation = document.createElement('div');
            validation.setAttribute('class', 'validation');
            validation.appendChild(createHeading('Sprite and CSS Validation'));

            for(var i = 0, l = images.length; i < l; i++) {
                var file = images[i].file,
                    classname = getClassnameFromFilename(file.name),
                    div = document.createElement('div'),
                    retinaDiv,
                    h3 = createHeading(classname, 'h3');

                div.setAttribute('class', 'sprite sprite--' + classname);

                validation.appendChild(h3);
                validation.appendChild(div);

                if(includeRetina) {
                    retinaDiv = document.createElement('div');
                    retinaDiv.setAttribute('class', 'sprite sprite--retina sprite--' + classname);
                    validation.appendChild(retinaDiv);
                }
            }

            document.body.appendChild(validation);

        };

        function createHeading(text, level) {
            var level = level || 'h2',
                heading = document.createElement(level);

            heading.innerText = text;
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