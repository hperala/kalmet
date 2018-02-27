// Comments are not parseable by JSDoc

var MetricalAnalyzer = {};

(function(exports) {
  'use strict';
  /* globals Hyphenation */

  /**
   * @param {MetricalAnalysis.StructuredText} structuredText - a structure to use as a basis for 
   * the new object
   * @classdesc A hierachical structure similar to StructuredText but containing also analysis 
   * results. An example object without methods:
   * <pre>
   * {
   *   annotations: {AnnotationCollection},
   *   summary: {AnnotationSummary},
   *   words: [{
   *     precedingText: '', 
   *     syllables: [{
   *       text: 'ta',
   *       annotations: {AnnotationCollection}
   *     }, ...]
   *   }, ...],
   *   followingText: '',
   *   feet: [{
   *     syllables: [{
   *       text: 'ta',
   *       precedingText: '',
   *       followingText: '',
   *       followingPunctuation: '',
   *       wordFinal: false,
   *       annotations: {AnnotationCollection}
   *     }, ...]
   *   }, ...]
   * }
   * </pre>
   *
   * Create a new AnalyzedLine from an existing StructuredText, add annotations and call
   * <tt>completeConstruction</tt>.
   *
   * The <tt>words</tt> and <tt>feet</tt> structures share the AnnotationCollection objects. The 
   * <tt>followingText</tt> property is only used with the <tt>words</tt> structure.
   *
   * Error, warning and comment names:
   * <ul>
   * <li>long_falling</li>
   * <li>short_rising</li>
   * <li>too_long</li>
   * <li>too_short</li>
   * <li>monosyllable</li>
   * <li>caesura</li>
   * <li>long_vowel</li>
   * <li>heavy_beginning_w</li>
   * <li>heavy_beginning_e</li>
   * </ul>
   */
  function AnalyzedLine(structuredText) {

    this.annotations = new AnnotationCollection();

    this.words = [];
    this.feet = [];

    for (var w = 0; w < structuredText.words.length; w++) {
      var oldWord = structuredText.words[w];
      var newWord = {
        precedingText: oldWord.precedingText,
        syllables: []
      };
      for (var s = 0; s < oldWord.syllables.length; s++) {
        newWord.syllables.push({
          text: oldWord.syllables[s],
          annotations: new AnnotationCollection()
        });
      }
      this.words.push(newWord);
    }

    this.followingText = structuredText.followingText;
  }

  AnalyzedLine.prototype.byGlobalIndex = function(globalIndex) {
    var i = 0;
    var found = null;
    this.words.forEach(function(word) {
      word.syllables.forEach(function(syllable) {
        if (i === globalIndex) {
          found = syllable;
        }
        i++;
      });
    });
    return found;
  };

  /**
   * Generates the <tt>feet</tt> and <tt>summary</tt> properties. Must be called once after all 
   * other data has been set.
   */
  AnalyzedLine.prototype.completeConstruction = function() {
    this.generateSummary();
    this.generateFeet();
  };

  AnalyzedLine.prototype.generateSummary = function() {
    var syllables = this.words.reduce(function(previous, current) {
      return previous.concat(current.syllables);
    }, []);
    var annotations = syllables.map(function(syllable) {
      return syllable.annotations;
    });
    this.summary = new AnnotationSummary(annotations, this.annotations);
  };

  function flatten(words, followingText) {
    var flattened = [];
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      for (var j = 0; j < word.syllables.length; j++) {
        var syllable = new SyllableInFoot(word.syllables[j]);
        if (j === 0) {
          syllable.precedingText = word.precedingText;
        } else {
          syllable.precedingText = '';
        }
        syllable.followingText = '';
        syllable.wordFinal = j === word.syllables.length - 1;
        syllable.followingPunctuation = syllable.wordFinal ? '' : '-';
        flattened.push(syllable);
      }
    }
    if (flattened.length > 0) {
      flattened[flattened.length - 1].followingText = followingText;
    }
    return flattened;
  }
  
  function SyllableInFoot(syllableInWord) {
    this.text = syllableInWord.text;
    this.annotations = syllableInWord.annotations;
  }

  function Foot() {
    this.syllables = [];
  }

  Foot.prototype.unshiftSyllable = function(syllable) {
    this.syllables.unshift(syllable);
  };

  Foot.prototype.insertFootSeparator = function() {
    var lastSyll = this.syllables[this.syllables.length - 1];
    if (lastSyll.wordFinal) {
      lastSyll.followingPunctuation = ' / ';
    } else {
      lastSyll.followingPunctuation = '/';
    }
  };
  
  AnalyzedLine.prototype.generateFeet = function() {
    
    var flattened = flatten(this.words, this.followingText);

    var index = flattened.length - 1;
    for (var footIndex = 0; footIndex < exports.NUM_NORMAL_FEET && index >= 0; footIndex++) {
      var foot = new Foot();
      for (var syllIndex = 0; 
           syllIndex < exports.NORMAL_FOOT_LENGTH && index >= 0; 
           syllIndex++) {
        foot.unshiftSyllable(flattened[index]);
        index--;
      }
      if (footIndex > 0) {
        foot.insertFootSeparator();
      }
      this.feet.unshift(foot);
    }
    if (index >= 0) {
      var firstFoot = new Foot();
      for (; index >= 0; index--) {
        firstFoot.unshiftSyllable(flattened[index]);
      }
      firstFoot.insertFootSeparator();
      this.feet.unshift(firstFoot);
    }
  };

  /**
   * Converts this object into a string.
   * @param {string} syllableSeparator - a string to insert between syllables, can be empty
   * @returns {string} a string representation
   */
  AnalyzedLine.prototype.toString = function(syllableSeparator) {
    if (syllableSeparator === undefined) {
      syllableSeparator = '-';
    }

    var items = [];
    this.words.forEach(function(word) {
      items.push(word.precedingText);
      var syllables = word.syllables.map(function(syll) {
        return syll.text;
      });
      items.push(syllables.join(syllableSeparator));
    });
    items.push(this.followingText);
    return items.join('');
  };

  AnalyzedLine.prototype.numSyllables = function() {
    return this.words.reduce(function(prev, current) {
      return prev + current.syllables.length;
    }, 0);
  };

  AnalyzedLine.prototype.isEmpty = function() {
    return this.toString('').length === 0;
  };

  /**
   * @classdesc Default results aggregator.
   */
  function TotalResult() {

    /**
     * @member {MetricalAnalyzer.AnalyzedLine[]}
     */
    this.lines = [];

    /**
     * Called after a line has been processed.
     * @param {MetricalAnalyzer.AnalyzedLine} line - text and results
     */
    this.lineProcessed = function(line) {
      this.lines.push(line);
    };
  }

  /**
   * @classdesc A strategy used by the Analysis class. Tries different syllabifications to find the 
   * most probable one. The analysis property must be set before using an AnalysisStrategy.
   */
  function AnalysisStategy() {

    this.analysis = null;

    this.check = function(syllabifications) {
      return this.analysis.doCheck(syllabifications.alternatives[0].text);
    };
  }

  /**
   * @classdesc Rules of the Kalevala meter.
   */
  function Analysis(language, strategy) {

    this.language = language;
    this.strategy = strategy;
    strategy.analysis = this;

    function isLong(syllable) {
      return language.containsLongVowel(syllable) ||
          language.containsDiphthong(syllable) ||
          language.endsInConsonant(syllable);
    }

    function wordToSyllableTextArray(word) {
      return word.syllables.map(function(value) {
        return value.text;
      });
    }

    function hasMainStress(word, syllIndexInWord) {
      var syllables = wordToSyllableTextArray(word);
      return language.stressType(syllables, syllIndexInWord) === language.STRESS_MAIN;
    }

    function Length() {
      this.accept = function(line) {
        var numSyllables = line.numSyllables();
        return numSyllables >= exports.MIN_LINE_LENGTH && numSyllables <= exports.MAX_LINE_LENGTH;
      };
      this.error = function(line) {
        var numSyllables = line.numSyllables();
        if (numSyllables < exports.MIN_LINE_LENGTH) {
          line.annotations.addOther('too_short', exports.ERROR_LEVEL_SHORT);
        } else if (numSyllables > exports.MAX_LINE_LENGTH) {
          line.annotations.addError('too_long');
        }
      };
    }
    
    function MatchRise() {
      this.accept = function(syllable, word, line, syllIndexInWord, language) {
        /* jshint unused:vars */
        if (hasMainStress(word, syllIndexInWord)) {
          return isLong(syllable.text);
        }
        else {
          return true;
        }
      };
      this.error = function(line, syllIndexInLine) {
        var syllable = line.byGlobalIndex(syllIndexInLine);
        syllable.annotations.addError('short_rising');
      };
    }

    function MatchFall() {
      this.accept = function(syllable, word, line, syllIndexInWord, language) {
        /* jshint unused:vars */
        if (hasMainStress(word, syllIndexInWord)) {
          return !isLong(syllable.text);
        }
        else {
          return true;
        }
      };
      this.error = function(line, syllIndexInLine) {
        var syllable = line.byGlobalIndex(syllIndexInLine);
        syllable.annotations.addError('long_falling');
      };
    }

    function MatchLastSyllableNoLongVowel() {
      this.accept = function(syllable, word, line, syllIndexInWord, language) {
        /* jshint unused:vars */
        //return not hyphenation.hasLongVowel(syllable)
      };
      this.error = function(line, syllIndexInLine) {
        /* jshint unused:vars */
        //result.generalErrors['long_vowel'] = 1
      };
    }

    function MatchLastSyllableNoMonosyllable() {
      this.accept = function(syllable, word, line, syllIndexInWord, language) {
        /* jshint unused:vars */
        //return len(word.syllables) > 1
      };
      this.error = function(line, syllIndexInLine) {
        /* jshint unused:vars */
        //result.generalErrors['monosyllable'] = 1
      };
    }
    
    function Caesura() {
      this.accept = function(line) {
        /* jshint unused:vars */
        //if len(line.content.words) < 2:
        //    return True
        
        //last = line.content.words[-1]
        //secondToLast = line.content.words[-2]
        //if len(last.syllables) == 2 and len(secondToLast.syllables) == 4:
        //    return False
        
        //return True
      };  
      this.error = function(self, result) {
        /* jshint unused:vars */
        //result.generalErrors['caesura'] = 1    
      };
    }
    
    this.initialConstraints = [new Length()];

    this.constraints = [];
    this.constraints[0] = [];
    this.constraints[1] = [];
    this.constraints[2] = [];
    this.constraints[3] = [];
    this.constraints[4] = [new MatchRise()];
    this.constraints[5] = [new MatchFall()];
    this.constraints[6] = [new MatchRise()];
    this.constraints[7] = [new MatchFall()];
    this.constraints[8] = [new MatchRise()];
    this.constraints[9] = [new MatchLastSyllableNoLongVowel(), 
      new MatchLastSyllableNoMonosyllable()];

    this.otherConstraints = [new Caesura()];

    this.initialize = function(extension) {
      extension.extendConstraints(this.initialConstraints, 
        this.constraints, 
        this.otherConstraints);
    };
    
    this.check = function(syllabifications, observers) {
      var line = this.strategy.check(syllabifications);
      line.completeConstruction();
      observers.forEach(function(observer) {
        observer.lineProcessed(line);
      });
    };

    this.doCheck = function(syllabification) {
      var text = new exports.AnalyzedLine(syllabification);

      for (var icIndex = 0; icIndex < this.initialConstraints.length; icIndex++) {
        var iConstraint = this.initialConstraints[icIndex];
        if (!iConstraint.accept(text)) {
          iConstraint.error(text);
          return text;
        }
      }

      var globalStartIndex = exports.MAX_LINE_LENGTH - text.numSyllables();
      var globalIndex = globalStartIndex;
      
      for (var wordIndex = 0; wordIndex < text.words.length; wordIndex++) {
        var word = text.words[wordIndex];
        for (var syllIndex = 0; syllIndex < word.syllables.length; syllIndex++) {
          var syll = word.syllables[syllIndex];
          for (var constrIndex = 0; constrIndex < this.constraints[globalIndex].length; 
            constrIndex++) {
            var constraint = this.constraints[globalIndex][constrIndex];
            if (!constraint.accept(syll, word, text, syllIndex, this.language)) {
              constraint.error(text, globalIndex - globalStartIndex);
            }
          }
          globalIndex++;
        }
      }
      return text;
    };
  }

  function Annotation(id, level) {
    this.id = id;
    this.level = level;
  }

  function AnnotationCollection() {
    
    this.warnings = [];
    this.errors = [];
    this.other = [];
  }

  AnnotationCollection.prototype.addWarning = function(id) {
    this.warnings.push(new Annotation(id, exports.ERROR_LEVEL_WARNING));
  };

  AnnotationCollection.prototype.addError = function(id) {
    this.errors.push(new Annotation(id, exports.ERROR_LEVEL_ERROR));
  };

  AnnotationCollection.prototype.addOther = function(id, level) {
    this.other.push(new Annotation(id, level));
  };

  AnnotationCollection.prototype.all = function() {
    return this.warnings.concat(this.errors).concat(this.other);
  };

  AnnotationCollection.prototype.errorLevel = function() {
    var errorLevels = this.all().map(function(annotation) {
      return annotation.level;
    });
    return Math.max.apply(null, errorLevels.concat(0));
  };

  AnnotationCollection.prototype.getById = function(id) {
    return this.all().find(function(annotation) { 
      return annotation.id === id;
    });
  };

  /**
   * Creates a summary of all annotations for one line.
   * @param {AnnotationCollection[]} annotationCollections - combined list of annotations for 
   * individual syllables
   * @param {AnnotationCollection} lineAnnColl - annotations for the whole line
   */
  function AnnotationSummary(annotationCollections, lineAnnColl) {

    this.allCollections = [lineAnnColl].concat(annotationCollections);
    var errorLevels = this.allCollections.map(function(coll) {
      return coll.errorLevel();
    });
    this.errorLevel = Math.max.apply(null, errorLevels.concat(0));

    this.allAnnotations = this.allCollections.reduce(function(previous, current) {
      return previous.concat(current.all());
    }, []);

    var groups = {};
    this.allAnnotations.forEach(function (annotation) {
      if (groups.hasOwnProperty(annotation.id)) {
        groups[annotation.id].num++;
      } else {
        groups[annotation.id] = { annotation: annotation, num: 1 };
      }
    });
    this.allAnnotationsGrouped = Object.keys(groups).map(function (key) {
      return groups[key];
    });

    var byErrorLevelDescending = function(a, b) {
      return b.level - a.level;
    };
    this.allAnnotations.sort(byErrorLevelDescending);
    var groupByErrorLevelDescending = function(a, b) {
      return b.annotation.level - a.annotation.level;
    };
    this.allAnnotationsGrouped.sort(groupByErrorLevelDescending);
  }

  AnnotationSummary.prototype.annotations = function() {
    return this.allAnnotations;
  };

  AnnotationSummary.prototype.annotationsGrouped = function() {
    return this.allAnnotationsGrouped;
  };

  AnnotationSummary.prototype.collections = function() {
    return this.allCollections;
  };

  var lang = new Hyphenation.Language();
  var hyph = new Hyphenation.Hyphenation(lang);
  var strategy = new AnalysisStategy();
  var analysis = new Analysis(lang, strategy);

  /**
   * Initializes the default Analyzer. Should be called once before using other functions.
   * @param extension an object with a method extendConstraints(
   * {array of constraints}, 
   * {array of arrays of constraints}, 
   * {array of constraints}).
   */
  function initialize(extension) {
    analysis.initialize(extension);
  }
  
  /**
   * Analyzes the input using a default Analyzer and returns the results.
   * @param {string} input - one or more lines of input
   * @returns {TotalResult} 
   */
  function analyze(input) {
    var lines = input.split('\n');
    var output = new exports.TotalResult();
    for (var i = 0; i < lines.length; i++) {
      var preStructured = hyph.syllabify(lines[i]).preStructured;
      var syllabifications = hyph.createAlternatives(lines[i], preStructured);
      analysis.check(syllabifications, [output]);
    }
    return output;
  }

  exports.ERROR_LEVEL_NONE = 0;
  exports.ERROR_LEVEL_WARNING = 1;
  exports.ERROR_LEVEL_ERROR = 2;
  exports.ERROR_LEVEL_SHORT = 3;

  exports.NUM_NORMAL_FEET = 3;
  exports.NORMAL_FOOT_LENGTH = 2;
  exports.MIN_LINE_LENGTH = 8;
  exports.MAX_LINE_LENGTH = 10;

  exports.AnalyzedLine = AnalyzedLine;
  exports.TotalResult = TotalResult;
  exports.AnalysisStategy = AnalysisStategy;
  exports.Analysis = Analysis;
  exports.Annotation = Annotation;
  exports.AnnotationCollection = AnnotationCollection;
  exports.AnnotationSummary = AnnotationSummary;
  exports.initialize = initialize;
  exports.analyze = analyze;

})(MetricalAnalyzer);