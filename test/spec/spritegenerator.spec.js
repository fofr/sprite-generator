define(function() {

    require(['js/spritegenerator'], function(SpriteGenerator) {

        var wrapper = document.createElement('div'),
            imageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC",
            moreImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
            fakeImages = [
                {filename: 'fileone.png', image: imageData},
                {filename: 'filetwo.png', image: moreImageData}
            ],
            spriteGenerator;

        beforeEach(function() {
            wrapper.innerHTML = '<input type="file" id="files" multiple /><canvas id="sprite"></canvas><form id="generate"></form>';

            document.body.appendChild(wrapper);
            spriteGenerator = new SpriteGenerator();
        });

        afterEach(function() {
            document.body.removeChild(wrapper);
        });

        describe("a sprite generator", function() {

            it('should respond to new file inputs', function() {

                var files = document.getElementById('files'),
                    evt = createHTMLEvent('change');

                spyOn(spriteGenerator, 'handleFileSelect');
                spriteGenerator.start();
                files.dispatchEvent(evt);

                expect(spriteGenerator.handleFileSelect).toHaveBeenCalled();
            });

            it('should fire an alert when the form is submitted without files', function() {

                var form = document.getElementById('generate'),
                    evt = createHTMLEvent('submit');

                spyOn(window, 'alert');
                spriteGenerator.start();
                form.dispatchEvent(evt);

                expect(window.alert).toHaveBeenCalled();
            });

            describe("when checking local files", function() {

                it('should generate an image element and push it to an images array', function() {

                    var images = [];

                    spriteGenerator.start();
                    spriteGenerator.handleSelectedImageData(images, imageData, 'filename');

                    expect(images.length).toBe(1);
                    expect(images[0].filename).toBe('filename');
                    expect(images[0].el.src).toBe(imageData);

                });

            });

            describe("when generating a sprite", function() {

                var images, canvas;

                beforeEach(function() {
                    images = [];
                    canvas = document.createElement('canvas');
                    spriteGenerator.start();
                    spriteGenerator.handleSelectedImageData(images, imageData, 'firstfilename.png');
                    spriteGenerator.handleSelectedImageData(images, moreImageData, 'secondfilename.png');

                    images[0].el.height = 16;
                    images[0].el.width = 16;
                    images[1].el.height = 5;
                    images[1].el.width = 5;
                });

                describe('when prepairing a canvas', function() {

                    it('should create a canvas the size of the combined images', function() {
                        spriteGenerator.setCanvasDimensions(images, canvas, false);
                        expect(canvas.height).toBe(21);
                        expect(canvas.width).toBe(16);
                    });

                    it('should create a canvas half the size of the combined images when downscaling', function() {
                        spriteGenerator.setCanvasDimensions(images, canvas, true);
                        expect(canvas.height).toBe(11);
                        expect(canvas.width).toBe(8);
                    });

                });

                describe('when drawing to a canvas', function() {

                    it('should append each images\'s vertical position in the canvas to the images array', function() {
                        spriteGenerator.setCanvasDimensions(images, canvas);
                        spriteGenerator.drawCanvas(images, canvas, false);

                        expect(images[0].yOffset).toBe(0);
                        expect(images[1].yOffset).toBe(16);
                    });

                    it('should append smaller vertical offsets when downscaling', function() {
                        spriteGenerator.setCanvasDimensions(images, canvas, true);
                        spriteGenerator.drawCanvas(images, canvas, true);
                        expect(images[1].yOffset).toBe(8);
                    });

                    it('should draw the images onto the canvas', function() {

                        var context = canvas.getContext('2d');
                        spyOn(context, 'drawImage');
                        spyOn(canvas, 'getContext').andCallFake(function() {
                            return context;
                        });

                        spriteGenerator.setCanvasDimensions(images, canvas);
                        spriteGenerator.drawCanvas(images, canvas, false);

                        expect(context.drawImage.callCount).toBe(2);
                        expect(context.drawImage.mostRecentCall.args[1]).toBe(0);
                        expect(context.drawImage.mostRecentCall.args[2]).toBe(images[1].yOffset);
                        expect(context.drawImage.mostRecentCall.args[3]).toBe(5);
                        expect(context.drawImage.mostRecentCall.args[4]).toBe(5);
                    });

                    it('should draw smaller images onto the canvas when downscaling', function() {

                        var context = canvas.getContext('2d');
                        spyOn(context, 'drawImage');
                        spyOn(canvas, 'getContext').andCallFake(function() {
                            return context;
                        });

                        spriteGenerator.setCanvasDimensions(images, canvas, true);
                        spriteGenerator.drawCanvas(images, canvas, true);

                        expect(context.drawImage.callCount).toBe(2);
                        expect(context.drawImage.mostRecentCall.args[1]).toBe(0);
                        expect(context.drawImage.mostRecentCall.args[2]).toBe(images[1].yOffset);
                        expect(context.drawImage.mostRecentCall.args[3]).toBe(3);
                        expect(context.drawImage.mostRecentCall.args[4]).toBe(3);
                    });

                });

                describe('when exporting the canvas to an image', function() {

                    it('should append an image element to the body', function() {
                        spriteGenerator.setCanvasDimensions(images, canvas);
                        spriteGenerator.drawCanvas(images, canvas);

                        spyOn(canvas, 'toDataURL').andCallThrough();
                        spyOn(document.body, 'appendChild');

                        spriteGenerator.exportCanvasToImage(canvas);

                        expect(canvas.toDataURL).toHaveBeenCalled();
                        expect(document.body.appendChild).toHaveBeenCalled();
                    });

                });

                describe('when generating CSS', function() {

                    it('should append a heading and two style elements', function() {
                        spriteGenerator.setCanvasDimensions(images, canvas);
                        spriteGenerator.drawCanvas(images, canvas);

                        spyOn(document.body, 'appendChild');
                        spriteGenerator.generateCSS(images, canvas);

                        expect(document.body.appendChild.argsForCall[0][0].tagName).toBe('H2');
                        expect(document.body.appendChild.argsForCall[1][0].tagName).toBe('STYLE');
                        expect(document.body.appendChild.argsForCall[2][0].tagName).toBe('STYLE');
                    });

                    it('should generate validation CSS with the sprite background-image defined for testing in page', function() {
                        spriteGenerator.setCanvasDimensions(images, canvas);
                        spriteGenerator.drawCanvas(images, canvas);

                        spyOn(document.body, 'appendChild');
                        spriteGenerator.generateCSS(images, canvas);

                        var validationCSS = document.body.appendChild.argsForCall[1][0].innerHTML;

                        expect(/data:image\/png;base64/.test(validationCSS)).toBe(true);
                        expect(/retina/.test(validationCSS)).toBe(false);
                    });

                    it('should include retina styles when downscaling', function() {
                        spriteGenerator.setCanvasDimensions(images, canvas, true);
                        spriteGenerator.drawCanvas(images, canvas, true);

                        spyOn(document.body, 'appendChild');
                        spriteGenerator.generateCSS(images, canvas, true, canvas);

                        var validationCSS = document.body.appendChild.argsForCall[1][0].innerHTML;

                        expect(validationCSS.match(/data:image\/png;base64/g).length).toBe(3);
                        expect(/sprite--retina/.test(validationCSS)).toBe(true);
                        expect(/min-device-pixel/.test(validationCSS)).toBe(true);
                    });

                    it('should generate the correct sprite CSS in a selectable style element', function() {
                        spriteGenerator.setCanvasDimensions(images, canvas);
                        spriteGenerator.drawCanvas(images, canvas);

                        spyOn(document.body, 'appendChild');
                        spriteGenerator.generateCSS(images, canvas);

                        var spriteCSS = document.body.appendChild.argsForCall[2][0].innerHTML;

                        expect(document.body.appendChild.argsForCall[2][0].getAttribute('contenteditable')).toBe('true');

                        expect(spriteCSS.match(/width:/g).length).toBe(images.length);
                        expect(spriteCSS.match(/width: 5px/g).length).toBe(1);
                        expect(spriteCSS.match(/width: 16px/g).length).toBe(1);

                        expect(spriteCSS.match(/height:/g).length).toBe(images.length);
                        expect(spriteCSS.match(/height: 5px/g).length).toBe(1);
                        expect(spriteCSS.match(/height: 16px/g).length).toBe(1);

                        expect(spriteCSS.match(/background\-position:/g).length).toBe(images.length);
                        expect(spriteCSS.match(/background\-position: 0 \-0/g).length).toBe(1);
                        expect(spriteCSS.match(/background\-position: 0 \-16px/g).length).toBe(1);
                    });

                });

            });

        });
    });

    function createHTMLEvent(eventName) {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventName, true, false);

        return evt;
    }

});