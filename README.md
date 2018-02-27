# Kalmet - metrical analyzer for Kalevala-meter poetry

Kalmet checks whether its input follows the basic metrical rules of the [Kalevala meter](https://en.wikipedia.org/wiki/Kalevala_meter). Another version of the application is available at the website of [Kalevalaisen Runokielen Seura](http://karuse.info/) as *KaRuSen Trokeemankeli*.

## Build & development

Tools for building Kalmet:
- node (developed with version 4.4.4)
- npm (developed with version 3.8.1)
- bower (developed with version 1.7.7)
- grunt-cli (developed with version 1.1.13). 
  
After getting the source code, run `npm install` and `bower install` to install other dependencies.

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.
