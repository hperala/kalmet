// Comments are not parseable by JSDoc

var Hyphenation = {};

(function(exports) {
  'use strict';

  exports.BREAK_HIATUS = 'break_hiatus';
  exports.BREAK_DIPH = 'break_diph';
  exports.BREAK_CV = 'break_cv';
  exports.BREAK_USER = 'break_user';
  exports.CONFIDENCE_HIATUS = 75;
  exports.CONFIDENCE_DIPH = 25;
  exports.CONFIDENCE_CV = 100;
  exports.CONFIDENCE_USER = 100;

  /**
   * @classdesc A set of rules for dividing Finnish words into syllables.
   */
  exports.Hyphenation = function(language) {

    this.lang = language;

    /**
     * Finds word boundaries and possible syllable breaks in a string. Results are returned in two
     * different formats.
     * @param {string} input - a text containing zero or more words. Line breaks are treated the 
     * same as other whitespace characters. The text can contain characters that this object does 
     * not recognize. They will count neither as vowels, consonants nor whitespace.
     * @returns an object with two properties: 
     * {
     *   marked: {Hyphenation.MarkedText}, 
     *   preStructured: {Hyphenation.PreStructuredText}
     * }
     */
    this.syllabify = function(input) {
      var state = {
        input: input,
        position: -1,
        currentChar: '',
        previousChar: '',
        beforeLastChar: '',
        vowelPair: null,
        handler: stateWhitespace,
        currentWord: {
          beginningPos: 0,
          syllBoundaries: []
        },
        // index of first character in current text segment
        segmentBeginningPos: 0,
        markedText: new exports.MarkedText(input),
        preStructuredText: new exports.PreStructuredText()
      };

      for (var i = 0; i < input.length; i++) {
        state.position = i;
        state.currentChar = input[i];
        state.previousChar = i === 0 ? '' : input[i - 1];
        state.beforeLastChar = i < 2 ? '' : input[i - 2];
        if (state.previousChar !== '' &&
            this.lang.isVowel(state.previousChar) &&
            this.lang.isVowel(state.currentChar)) {
          state.vowelPair = state.previousChar + state.currentChar;
        } else {
          state.vowelPair = null;
        }

        state.handler.character(state, this.lang);
      }
      state.position = i;
      state.handler.end(state, this.lang);

      return {marked: state.markedText, preStructured: state.preStructuredText};
    };

    /**
     * Takes a structure with potential syllable boundaries marked and creates a list of actual 
     * syllabifications.
     * @param {string} original - the original text
     * @param {Hyphenation.PreStructuredText} preStructuredText - a representation produced by 
     * the syllabify method
     * @returns {Hyphenation.Syllabifications} the alternatives
     */
    this.createAlternatives = function(original, preStructuredText) {
      var limit = exports.CONFIDENCE_HIATUS - 1;
      var alternatives = [];
      var struct = new exports.StructuredText();

      preStructuredText.words.forEach(function(oldWord) {
        var newWord = {
          precedingText: oldWord.precedingText,
          syllables: []
        };
        var start = 0;
        oldWord.syllBoundaries.forEach(function(syllBreak) {
          if (syllBreak.confidence >= limit) {
            newWord.syllables.push(oldWord.text.substring(start, syllBreak.position));
            start = syllBreak.position;
          }
        });
        newWord.syllables.push(oldWord.text.substring(start));
        struct.words.push(newWord);
      });
      struct.followingText = preStructuredText.followingText;

      alternatives.push({
        penalty: 0,
        text: struct
      });
      return new exports.Syllabifications(alternatives);
    };

    var stateWhitespace = null;
    var stateBeforeFirstVowel = null;
    var stateAfterFirstVowel = null;
    var stateAfterLongVowelOrDiphthong = null;
    var stateRestOfWord = null;

    stateWhitespace = {
      character: function(state, language) {
        /* jshint unused:vars */
        if (language.isWordCharacter(state.currentChar)) {
          startWord(state);
          if (language.isVowel(state.currentChar)) {
            state.handler = stateAfterFirstVowel;
          } else {
            state.handler = stateBeforeFirstVowel;
          }
        }
      },
      end: function(state, language) {
        /* jshint unused:vars */
        state.preStructuredText.followingText = currentSegment(state);
      }
    };

    stateBeforeFirstVowel = {
      character: function(state, language) {
        /* jshint unused:vars */
        if (!checkUserWordBreak(state, language)) {
          if (language.isVowel(state.currentChar)) {
            state.handler = stateAfterFirstVowel;
          } else if (language.isWhitespace(state.currentChar)) {
            endWord(state);
            state.handler = stateWhitespace;
          }
        }
      },
      end: function(state, language) {
        /* jshint unused:vars */
        endWord(state);
      }
    };

    stateAfterFirstVowel = {
      character: function(state, language) {
        /* jshint unused:vars */
        if (!checkUserWordBreak(state, language)) {
          if (state.vowelPair !== null && state.previousChar !== state.currentChar) {
            var done = checkNormalHiatus(state, language);
            if (!done) {
              done = checkDiphthong(state, language);
            }
            if (!done) {
              done = checkSpecialAsDiphthong(state, language);
            }
          }

          if (language.isWhitespace(state.currentChar)) {
            endWord(state);
            state.handler = stateWhitespace;
          } else if (state.vowelPair !== null &&
            (state.previousChar === state.currentChar ||
            language.isNormalDiphthong(state.vowelPair) ||
            language.isSpecialDiphthong(state.vowelPair))) {
            state.handler = stateAfterLongVowelOrDiphthong;
          } else {
            state.handler = stateRestOfWord;
          }
        }
      },
      end: function(state, language) {
        /* jshint unused:vars */
        endWord(state);
      }
    };

    stateAfterLongVowelOrDiphthong = {
      character: function(state, language) {
        /* jshint unused:vars */
        if (!checkUserWordBreak(state, language)) {
          var done = checkCv(state, language);
          if (!done && state.vowelPair !== null) {
            addBreak(state, 
              state.position, 
              exports.BREAK_HIATUS, 
              exports.CONFIDENCE_HIATUS);
            done = true;
          }

          if (language.isWhitespace(state.currentChar)) {
            endWord(state);
            state.handler = stateWhitespace;
          } else {
            state.handler = stateRestOfWord;
          }
        }
      },
      end: function(state, language) {
        /* jshint unused:vars */
        endWord(state);
      }
    };

    stateRestOfWord = {
      character: function(state, language) {
        /* jshint unused:vars */
        if (!checkUserWordBreak(state, language)) {
          var done = checkCv(state, language);
          if (state.vowelPair !== null && state.previousChar !== state.currentChar) {
            if (!done) {
              done = checkNormalHiatus(state, language);
            }
            if (!done) {
              done = checkDiphthong(state, language);
            }
            if (!done) {
              done = checkSpecialAsHiatus(state, language);
            }
          }

          if (language.isWhitespace(state.currentChar)) {
            endWord(state);
            state.handler = stateWhitespace;
          } else if (state.vowelPair !== null &&
            (state.previousChar === state.currentChar ||
            language.isNormalDiphthong(state.vowelPair))) {
            state.handler = stateAfterLongVowelOrDiphthong;
          }
        }
      },
      end: function(state, language) {
        /* jshint unused:vars */
        endWord(state);
      }
    };

    function currentSegment(state) {
      return state.input.slice(state.segmentBeginningPos, state.position);
    }

    function addBreak(state, position, type, confidence) {
      var absolute = new exports.SyllableBreak(
        position,
        type, 
        confidence);
      var relative = new exports.SyllableBreak(
        position - state.currentWord.beginningPos,
        type, 
        confidence);

      state.markedText.syllBoundaries.push(absolute);
      state.currentWord.syllBoundaries.push(relative);
    }

    function startWord(state) {
      state.currentWord.precedingText = currentSegment(state);
      state.currentWord.beginningPos = state.position;
      state.segmentBeginningPos = state.position;
    }

    function endWord(state) {
      state.currentWord.text = currentSegment(state);
      state.currentWord.alt = state.currentWord.text;
      
      var word = {
        precedingText: state.currentWord.precedingText,
        text: state.currentWord.text,
        alt: state.currentWord.alt,
        syllBoundaries: state.currentWord.syllBoundaries.slice()
      };
      state.preStructuredText.words.push(word);

      state.segmentBeginningPos = state.position;
      state.currentWord.syllBoundaries = [];
    }

    function checkCv(state, language) {
      if (language.isConsonant(state.previousChar) && language.isVowel(state.currentChar)) {
        addBreak(state, 
          state.position - 1, 
          exports.BREAK_CV, 
          exports.CONFIDENCE_CV);
        return true;
      }
      return false;
    }

    function checkNormalHiatus(state, language) {
      if (!language.isNormalDiphthong(state.vowelPair) &&
          !language.isSpecialDiphthong(state.vowelPair)) {
        addBreak(state, 
          state.position, 
          exports.BREAK_HIATUS, 
          exports.CONFIDENCE_HIATUS);
        return true;
      }
      return false;
    }

    function checkDiphthong(state, language) {
      if (language.isNormalDiphthong(state.vowelPair)) {
        addBreak(state, 
          state.position, 
          exports.BREAK_DIPH, 
          exports.CONFIDENCE_DIPH);
        return true;
      }
      return false;
    }

    function checkSpecialAsDiphthong(state, language) {
      if (language.isSpecialDiphthong(state.vowelPair)) {
        addBreak(state, 
          state.position, 
          exports.BREAK_DIPH, 
          exports.CONFIDENCE_DIPH);
        return true;
      }
      return false;
    }

    function checkSpecialAsHiatus(state, language) {
      if (language.isSpecialDiphthong(state.vowelPair)) {
        addBreak(state, 
          state.position, 
          exports.BREAK_HIATUS, 
          exports.CONFIDENCE_HIATUS);
        return true;
      }
      return false;
    }

    function checkUserWordBreak(state, language) {
      var separator = language.getWordSeparator(state.previousChar);
      if (separator !== undefined &&
          language.isWordCharacter(state.beforeLastChar) &&
          language.isWordCharacter(state.currentChar)) {
        endWord(state);
        startWord(state);
        if (language.isVowel(state.currentChar)) {
          state.handler = stateAfterFirstVowel;
        } else {
          state.handler = stateBeforeFirstVowel;
        }
        return true;
      }
      return false;
    }
  };

  /**
   * @classdesc A potential syllable break in a text.
   */
  exports.SyllableBreak = function(position, type, confidence) {

    /** 
     * Index of the character following the syllable break. The index is relative to either to a 
     * word or the whole text.
     * @member {number}
     */
    this.position = position;

    /** 
     * One of the following constants (see Hyphenation): BREAK_HIATUS (between vowels), BREAK_DIPH 
     * (between vowels that could form a diphthong), BREAK_CV (before a CV sequence).
     * @member {string}
     */
    this.type = type;

    /** 
     * A value between 0 (lowest confidence that this break is correct) and 100 (highest 
     * confidence). This value does not indicate how appropriate is would be to hyphenate a word at 
     * this point when typesetting a text.
     * @member {number}
     */
    this.confidence = confidence;
  };
  
  /**
   * @classdesc A text with possible syllable breaks indicated. This format might be more 
   * convenient than PreStructuredText for some purposes.
   */
  exports.MarkedText = function(original) {

    /** 
     * Original input string.
     * @member {string}
     */
    this.text = original;

    /** 
     * @member {SyllableBreak[]}
     */
    this.syllBoundaries = [];
  };

  /**
   * Converts this object into a string with separators at syllable breaks.
   * @param {number} limit - only breaks with confidence >= this limit are accepted
   * @param {string} separator - the separator to insert
   * @returns {string} the original string with separators
   */
  exports.MarkedText.prototype.toString = function(limit, separator) {
    limit = typeof limit !== 'undefined' ? limit : exports.CONFIDENCE_HIATUS;
    separator = typeof separator !== 'undefined' ? separator : '-';

    var hyphenated = '';
    var start = 0;
    this.syllBoundaries.forEach(function(syllBreak) {
      if (syllBreak.confidence >= limit) {
        hyphenated += this.text.substring(start, syllBreak.position) + separator;
        start = syllBreak.position;
      }
    }, this);
    hyphenated += this.text.substring(start);
    return hyphenated;
  };

  /**
   * @classdesc A structure with words and all potential syllable breaks for each word.
   * <pre>
   * {
   *   words: [{
   *     precedingText: '',
   *     text: '',
   *     alt: '',
   *     syllBoundaries: [{SyllableBreak}, ...]
   *   }, ...], 
   *   followingText: ''
   * }
   * </pre>
   */
  exports.PreStructuredText = function() {

    this.words = [];

    this.followingText = '';
  };

  /**
   * Converts this object into a string with separators at syllable breaks.
   * @param {number} limit - only breaks with confidence >= this limit are accepted
   * @param {string} separator - the separator to insert
   * @returns {string} a string with separators
   */
  exports.PreStructuredText.prototype.toString = function(limit, separator) {
    limit = typeof limit !== 'undefined' ? limit : exports.CONFIDENCE_HIATUS;
    separator = typeof separator !== 'undefined' ? separator : '-';
    
    var hyphenated = '';
    this.words.forEach(function(word) {
      var start = 0;
      hyphenated += word.precedingText;
      word.syllBoundaries.forEach(function(syllBreak) {
        if (syllBreak.confidence >= limit) {
          hyphenated += word.text.substring(start, syllBreak.position) + separator;
          start = syllBreak.position;
        }
      });
      hyphenated += word.text.substring(start);
    });
    hyphenated += this.followingText;
    return hyphenated;
  };

  /**
   * @classdesc A hierachical structure of words and syllables, representing only one 
   * syllabification among all possibilities.
   * <pre>
   * {
   *   words: [{
   *     precedingText: '',
   *     syllables: ['ta', 'lo']
   *   }, ...], 
   *   followingText: ''
   * }
   * </pre>
   */
  exports.StructuredText = function() {

    this.words = [];

    this.followingText = '';
  };

  /**
   * Converts this object into a string.
   * @param {string} syllableSeparator - a string to insert between syllables, can be empty
   * @returns {string} a string representation
   */
  exports.StructuredText.prototype.toString = function(syllableSeparator) {
    syllableSeparator = typeof syllableSeparator !== 'undefined' ? syllableSeparator : '-';

    var items = [];
    this.words.forEach(function(word) {
      items.push(word.precedingText);
      items.push(word.syllables.join(syllableSeparator));
    });
    items.push(this.followingText);
    return items.join('');
  };

  /**
   * @classdesc A list of alternative syllabifications. 
   */
  exports.Syllabifications = function(alternatives) {

    /** 
     * Alternatives sorted by penalty, best (lowest penalty) first. For example:
     * <pre>
     * [{penalty: 10, text: {StructuredText}}, ...]
     * </pre>
     */
    this.alternatives = alternatives;
  };

  /**
   * @classdesc A description of a language (by default Finnish).
   */
  exports.Language = function() {
    
    this.STRESS_UNSTRESSED = 0;
    this.STRESS_MONOSYLLABIC = 1;
    this.STRESS_MAIN = 2;

    this.vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ö'];

    this.consonants = ['\'', 'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 
      's', 't', 'v', 'w', 'x', 'z'];

    this.normalDiphthongs = ['ai', 'ei', 'oi', 'ui', 'yi', 'äi', 'öi', 'uo', 'yö'];

    this.specialDiphthongs = ['ie', 'au', 'eu', 'iu', 'ou', 'ey', 'iy', 'äy', 'öy'];

    /**
     * Special meta characters. When an "input" character is encountered, a word boundary is 
     * inserted after it. It may also be replaced by the "display" character in some output 
     * formats (not currently supported).
     */
    this.wordSeparators = [{ input: '+', display: '-' }, { input: '-', display: '-' }];

    this.isWhitespace = function(ch) {
      return /\s/.test(ch);
    };

    this.isConsonant = function(ch) {
      return this.consonants.indexOf(ch.toLowerCase()) !== -1;
    };

    this.isVowel = function(ch) {
      return this.vowels.indexOf(ch.toLowerCase()) !== -1;
    };

    this.isWordCharacter = function(ch) {
      return this.isConsonant(ch) || this.isVowel(ch);
    };

    this.isNormalDiphthong = function(pair) {
      return this.normalDiphthongs.indexOf(pair.toLowerCase()) !== -1;
    };

    this.isSpecialDiphthong = function(pair) {
      return this.specialDiphthongs.indexOf(pair.toLowerCase()) !== -1;
    };

    this.containsDiphthong = function(syllable) {
      var syllableLower = syllable.toLowerCase();
      var diphthongs = this.normalDiphthongs.concat(this.specialDiphthongs);
      return diphthongs.some(function(element) {
        return syllableLower.indexOf(element) !== -1;
      });
    };

    this.containsLongVowel = function(syllable) {
      var syllableLower = syllable.toLowerCase();
      var longVowels = this.vowels.map(function(elem) {
        return elem + elem;
      });
      return longVowels.some(function(element) {
        return syllableLower.indexOf(element) !== -1;
      });
    };

    this.endsInConsonant = function(syllable) {
      var syllableLower = syllable.toLowerCase();
      for (var i = syllableLower.length - 1; i >= 0; i--) {
        if (this.isConsonant(syllableLower[i])) {
          return true;
        }
        if (this.isVowel(syllableLower[i])) {
          return false;
        }
      }
      return false;
    };

    /**
     * Checks whether a character corresponds to a word separator. Returns the found separator 
     * object or undefined.
     */
    this.getWordSeparator = function(inputChar) {
      return this.wordSeparators.find(function (element) {
        return element.input === inputChar;
      });
    };

    /**
     * Determines the type of stress a syllable in a word has.
     * @param {string[]} syllables - syllables of a word
     * @param {number} syllIndex - 0-based index of the syllable
     * @returns {number} a constant such as Language.STRESS_MAIN
     */
    this.stressType = function(syllables, syllIndex) {
      if (syllables.length === 0) {
        throw new Error('Empty array not allowed');
      }
      if (syllables.length === 1) {
        return this.STRESS_MONOSYLLABIC;
      }
      if (syllIndex === 0) {
        return this.STRESS_MAIN;
      }
      return this.STRESS_UNSTRESSED;
    };
  };

})(Hyphenation);