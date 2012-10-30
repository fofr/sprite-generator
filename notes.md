# Implementation notes

## Canvas resizing
* Resizing using canvas is inefficient and should be avoided
* http://blog.netvlies.nl/design-interactie/retina-revolution/ highlights a single low filesize high quality method for retina images

## Browser support
* Modern browsers only, deemed acceptable as a local tool
* Lacks feature detection

## Testing
* Jasmine test framework setup, no tests written
* Self validates image and CSS

## Personal code review
* Many methods are public when they don't need to be
* Better separation of concerns needed
** Form handling, file handling, sprite handling, for instance
* Retina handling may be confusing

### drawCanvas
* Pushing yOffset onto images array is bad, it's a hidden dependency and should be refactored