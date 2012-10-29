define(function() {

    require(['js/spritegenerator'], function(SpriteGenerator) {

        var wrapper = document.createElement('div'),
            spriteGenerator;

        document.body.appendChild(wrapper);

        beforeEach(function() {
            wrapper.innerHTML = '<input type="file" id="files" multiple /><canvas id="sprite"></canvas><style id="styles"></style><img src="" id="spriteOutput" alt="Sprite output file" />';

            spriteGenerator = new SpriteGenerator();
            spriteGenerator.start();

        });

        afterEach(function() {
            wrapper.innerHTML = '';
        });

        describe("a sprite generator", function() {

            it('should respond to new file inputs', function() {
                spyOn(spriteGenerator, 'handleFileSelect');
                $('#files').trigger('change');
                expect(spriteGenerator.handleFileSelect).toHaveBeenCalled();
            });

        });
    });

});