angular.module('kalmetApp.services')
.factory('analyzer', ['extension', function(extension) {
  'use strict';
  /* globals MetricalAnalyzer */

  var txt = {
    'error': 'Virhe',
    'warning': 'Varoitus',
    'ok': 'OK',
    'short_rising': 'Lyhyt alkutavu runojalan nousussa.',
    'long_falling': 'Pitkä alkutavu runojalan laskussa.',
    'long_vowel': 'Pitkä vokaali viimeisessä tavussa.',
    'monosyllable': 'Yksitavuinen sana säkeen lopussa.',
    'caesura': 'Nelitavuinen sana tasasäkeen keskellä (kesuura puuttuu).',
    'too_long': 'Yli kymmenen tavua.',
    'too_short': 'Alle kahdeksan tavua.',
    'alliteration': 'Mahdollisesti liioitteleva alkusointu.',
    'nine': '(Huom: yhdeksäntavuinen.)',
    'ten': '(Huom: kymmentavuinen.)',
    'syllabification': '(Tavutus epävarma.)'
  };

  var buttonStyle = {};
  buttonStyle[MetricalAnalyzer.ERROR_LEVEL_NONE] = 'label-success';
  buttonStyle[MetricalAnalyzer.ERROR_LEVEL_WARNING] = 'label-warning';
  buttonStyle[MetricalAnalyzer.ERROR_LEVEL_ERROR] = 'label-danger';
  buttonStyle[MetricalAnalyzer.ERROR_LEVEL_SHORT] = 'label-default';
  var buttonStyleDefault = 'label-default';

  var messageStyle = {};
  messageStyle[MetricalAnalyzer.ERROR_LEVEL_NONE] = 'alert-success';
  messageStyle[MetricalAnalyzer.ERROR_LEVEL_WARNING] = 'alert-warning';
  messageStyle[MetricalAnalyzer.ERROR_LEVEL_ERROR] = 'alert-danger';
  messageStyle[MetricalAnalyzer.ERROR_LEVEL_SHORT] = 'alert-danger';
  var messageStyleDefault = 'alert-info';

  var iconStyle = {};
  iconStyle[MetricalAnalyzer.ERROR_LEVEL_NONE] = 'glyphicon-ok';
  iconStyle[MetricalAnalyzer.ERROR_LEVEL_WARNING] = 'glyphicon-remove';
  iconStyle[MetricalAnalyzer.ERROR_LEVEL_ERROR] = 'glyphicon-remove';
  iconStyle[MetricalAnalyzer.ERROR_LEVEL_SHORT] = 'glyphicon-minus';
  var iconStyleDefault = 'glyphicon-remove';

  var textStyle = {};
  textStyle[MetricalAnalyzer.ERROR_LEVEL_NONE] = 'text-ok';
  textStyle[MetricalAnalyzer.ERROR_LEVEL_WARNING] = 'text-warning';
  textStyle[MetricalAnalyzer.ERROR_LEVEL_ERROR] = 'text-error';
  var textStyleDefault = 'text-ok';

  function valueOrDefault(dictionary, key, defaultValue) {
    return dictionary.hasOwnProperty(key) ? dictionary[key] : defaultValue;
  }

  /**
   * @classdesc A wrapper around an AnalyzedLine. Adds properties to Annotation (text, style, 
   * iconStyle), AnnotationCollection (textStyle) and AnnotationSummary (style, iconStyle) by 
   * modifying the original objects. 
   */
  function PresentationalLine(analyzedLine) {
    this.words = analyzedLine.words;
    this.feet = analyzedLine.feet;
    this.annotations = analyzedLine.annotations;
    this.summary = analyzedLine.summary;
    this.isEmpty = analyzedLine.isEmpty;
    this.toString = analyzedLine.toString;

    this.summary.annotations().forEach(function(annotation) {
      this.extendAnnotation(annotation);
    }, this);
    this.summary.collections().forEach(function(collection) {
      this.extendAnnotationCollection(collection);
    }, this);
    this.extendAnnotationSummary();
  }

  PresentationalLine.prototype.extendAnnotationSummary = function() {
    var level = this.summary.errorLevel;
    this.summary.style = valueOrDefault(buttonStyle, level, buttonStyleDefault);
    this.summary.iconStyle = valueOrDefault(iconStyle, level, iconStyleDefault);
  };

  PresentationalLine.prototype.extendAnnotationCollection = function(collection) {
    var level = collection.errorLevel();
    collection.textStyle = valueOrDefault(textStyle, level, textStyleDefault);
  };

  PresentationalLine.prototype.extendAnnotation = function(annotation) {
    var level = annotation.level;
    var id = annotation.id;
    annotation.text = valueOrDefault(txt, id, '');
    annotation.style = valueOrDefault(messageStyle, level, messageStyleDefault);
    annotation.iconStyle = valueOrDefault(iconStyle, level, iconStyleDefault);
  };
  
  var resultCache = {
    values: {},

    get: function(lineText) {
      if (this.values.hasOwnProperty(lineText)) {
        return this.values[lineText];
      }
      return null;
    },

    set: function(lineText, result) {
      this.values[lineText] = result;
    },

    clear: function() {
      this.values = {};
    },

    fill: function(keys, values) {
      for (var i = 0; i < Math.min(keys.length, values.length); i++) {
        this.set(keys[i], values[i]);
      }
    }
  };

  var rawTextLines = [];

  var service = {

    /**
     * Array of PresentationalLines corresponding to lines in input.
     */
    presentationalLines: [],

    /**
     * A Document containing the raw input text and a header.
     */
    document: null,

    updateAll: function() {
      if (this.document === null) {
        return;
      }

      resultCache.clear();
      resultCache.fill(rawTextLines, this.presentationalLines);

      rawTextLines = this.document.text.split('\n');
      this.presentationalLines = [];
      var numUpdated = 0;
      for (var i = 0; i < rawTextLines.length; i++) {
        var presentationalLine = resultCache.get(rawTextLines[i]);

        if (presentationalLine === null) {
          var analyzedLine = MetricalAnalyzer.analyze(rawTextLines[i]).lines[0];
          presentationalLine = new PresentationalLine(analyzedLine);
          numUpdated++;
          console.log('new: "' + rawTextLines[i] + '"'); 
    	  }

        this.presentationalLines[i] = presentationalLine;
      }
      console.log('updated ' + numUpdated + ' lines');
    },

    toHtml: function(unescaped) {
      if (typeof unescaped === 'string') {
        return unescaped.replace(/ /g, '\xa0');
      } else {
        return '';
      }
    }
  };

  MetricalAnalyzer.initialize(extension);
  extension.extendUi(txt, buttonStyle, messageStyle, iconStyle, textStyle);

  service.updateAll();
  return service;
}]);
