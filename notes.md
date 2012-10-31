# Implementation notes

## Canvas resizing
* Resizing using canvas is inefficient and should be avoided
* http://blog.netvlies.nl/design-interactie/retina-revolution/ highlights a single low filesize high quality method for retina images

## Browser support
* Tested in latest Chrome, Safari, Firefox and Opera
* Lacks feature detection

## Personal code review
* Many methods are public when they don't need to be
* Better separation of concerns needed
** Form handling, file handling, sprite handling, for instance
* Retina handling may be confusing