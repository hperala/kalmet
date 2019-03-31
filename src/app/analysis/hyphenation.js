import { hyphenationConstants, breakTypes } from './hyphenation-defs';
import { SyllableBreak, WordsAndPotentialBreaks } from './hyphenation-data';

/**
 * An algorithm for dividing Finnish words into syllables without using a wordlist.
 */
export class Hyphenation {
  constructor(language) {
    this._language = language;
  }

  /**
   * Finds word boundaries and possible syllable breaks in a string.
   * 
   * @param {string} text - a text containing zero or more words. Line breaks are treated the 
   * same as other whitespace characters. The text can contain characters that this object does 
   * not recognize. They will count neither as vowels, consonants nor whitespace.
   * @returns {WordsAndPotentialBreaks} a structured representation of the input
   */
  syllabify(text) {
    this._handler = stateWhitespace;
    const input = {
      fullText: text,
      position: -1,
      currentChar: '',
      previousChar: '',
      beforeLastChar: '',
      vowelPair: null
    };
    const output = {
      // index of first character of the current text segment (a word or the space between words)
      segmentBeginningPos: 0,

      currentWord: {
        beginningPos: 0,
        syllBoundaries: []
      },
      words: [],
      followingText: ''
    };

    let i;
    for (i = 0; i < text.length; i++) {
      this._updatePosition(input, i);
      this._handler.handleCharacter(this, input, output, this._language);
    }
    input.position = i;
    this._handler.handleEndOfInput(this, input, output, this._language);

    return new WordsAndPotentialBreaks(output.words, output.followingText);
  }

  changeState(input, newState) {
    this._handler = newState;
  }

  _updatePosition(input, newPos) {
    input.position = newPos;
    input.currentChar = input.fullText[newPos];
    input.previousChar = newPos === 0 ? '' : input.fullText[newPos - 1];
    input.beforeLastChar = newPos < 2 ? '' : input.fullText[newPos - 2];

    const atVowelPair = input.previousChar !== '' 
      && this._language.isVowel(input.previousChar)
      && this._language.isVowel(input.currentChar);

    if (atVowelPair) {
      input.vowelPair = input.previousChar + input.currentChar;
    } else {
      input.vowelPair = null;
    }
  }
}

const stateWhitespace = {
  handleCharacter: function(context, input, output, language) {
    if (language.isWordCharacter(input.currentChar)) {
      startWord(input, output);
      if (language.isVowel(input.currentChar)) {
        context.changeState(input, stateAfterFirstVowel);
      } else {
        context.changeState(input, stateBeforeFirstVowel);
      }
    }
  },

  handleEndOfInput: function(context, input, output) {
    output.followingText = currentSegment(input, output);
  }
};

const stateBeforeFirstVowel = {
  handleCharacter: function(context, input, output, language) {
    if (tryApplyUserWordBreak(context, input, output, language)) {
      return;
    }

    if (language.isVowel(input.currentChar)) {
      context.changeState(input, stateAfterFirstVowel);
    } else if (language.isWhitespace(input.currentChar)) {
      endWord(input, output);
      context.changeState(input, stateWhitespace);
    }
  },

  handleEndOfInput: function(context, input, output) {
    endWord(input, output);
  }
};

const stateAfterFirstVowel = {
  handleCharacter: function(context, input, output, language) {
    if (tryApplyUserWordBreak(context, input, output, language)) {
      return;
    }

    const type = currentPositionType(input, language);
    switch (type) {
      case TYPE_HIATUS:
        applyHiatusBreak(input, output);
        break;
      case TYPE_DIPH:
      case TYPE_SPECIAL_DIPH:
        applyDiphthongBreak(input, output);
        break;
    }

    switch (type) {
      case TYPE_WHITESPACE:
        endWord(input, output);
        context.changeState(input, stateWhitespace);
        break;
      case TYPE_LONG_VOWEL:
      case TYPE_DIPH:
      case TYPE_SPECIAL_DIPH:
        context.changeState(input, stateAfterLongVowelOrDiphthong);
        break;
      default:
        context.changeState(input, stateRestOfWord);
        break;
    }
  },

  handleEndOfInput: function(context, input, output) {
    endWord(input, output);
  }
};

const stateAfterLongVowelOrDiphthong = {
  handleCharacter: function(context, input, output, language) {
    if (tryApplyUserWordBreak(context, input, output, language)) {
      return;
    }

    const type = currentPositionType(input, language);
    switch (type) {
      case TYPE_CV:
        applyCVBreak(input, output);
        break;
      case TYPE_HIATUS:  
      case TYPE_LONG_VOWEL:
      case TYPE_DIPH:
      case TYPE_SPECIAL_DIPH:
        applyHiatusBreak(input, output);
        break;
    }

    switch (type) {
      case TYPE_WHITESPACE:
        endWord(input, output);
        context.changeState(input, stateWhitespace);
        break;
      default:
        context.changeState(input, stateRestOfWord);
        break;
    }
  },

  handleEndOfInput: function(context, input, output) {
    endWord(input, output);
  }
};

const stateRestOfWord = {
  handleCharacter: function(context, input, output, language) {
    if (tryApplyUserWordBreak(context, input, output, language)) {
      return;
    }

    const type = currentPositionType(input, language);
    switch (type) {
      case TYPE_CV:
        applyCVBreak(input, output);
        break;
      case TYPE_DIPH:
        applyDiphthongBreak(input, output);
        break;
      case TYPE_HIATUS:
        applyHiatusBreak(input, output);
        break;
      case TYPE_SPECIAL_DIPH:
        applySpecialDiphthongAsHiatusBreak(input, output);
        break;
    }

    switch (type) {
      case TYPE_WHITESPACE:
        endWord(input, output);
        context.changeState(input, stateWhitespace);
        break;
      case TYPE_LONG_VOWEL:
      case TYPE_DIPH:
        context.changeState(input, stateAfterLongVowelOrDiphthong);
        break;
      default:
        context.changeState(input, stateRestOfWord);
        break;
    }
  },

  handleEndOfInput: function(context, input, output) {
    endWord(input, output);
  }
};

const TYPE_CV = Symbol('TYPE_CV');
const TYPE_HIATUS = Symbol('TYPE_HIATUS');
const TYPE_DIPH = Symbol('TYPE_DIPH');
const TYPE_SPECIAL_DIPH = Symbol('TYPE_SPECIAL_DIPH');
const TYPE_LONG_VOWEL = Symbol('TYPE_LONG_VOWEL');
const TYPE_WHITESPACE = Symbol('TYPE_WHITESPACE');
const TYPE_OTHER = Symbol('TYPE_OTHER');

function currentPositionType(input, language) {
  if (input.vowelPair !== null) {
    if (input.previousChar === input.currentChar) {
      return TYPE_LONG_VOWEL;
    }
    if (language.isNormalDiphthong(input.vowelPair)) {
      return TYPE_DIPH;
    } 
    if (language.isSpecialDiphthong(input.vowelPair)) {
      return TYPE_SPECIAL_DIPH;
    }
    return TYPE_HIATUS;
  }
  if (language.isConsonant(input.previousChar) && language.isVowel(input.currentChar)) {
    return TYPE_CV;
  }
  if (language.isWhitespace(input.currentChar)) {
    return TYPE_WHITESPACE;
  }

  return TYPE_OTHER;
}

function tryApplyUserWordBreak(context, input, output, language) {
  const separator = language.getWordSeparator(input.previousChar);
  if (separator !== undefined &&
      language.isWordCharacter(input.beforeLastChar) &&
      language.isWordCharacter(input.currentChar)) {
    endWord(input, output);
    startWord(input, output);
    if (language.isVowel(input.currentChar)) {
      context.changeState(input, stateAfterFirstVowel);
    } else {
      context.changeState(input, stateBeforeFirstVowel);
    }
    return true;
  }
  return false;
}

function applyCVBreak(input, output) {
  addBreak(output, 
    input.position - 1, 
    hyphenationConstants.BREAK_CV);
}

function applyHiatusBreak(input, output) {
  addBreak(output, 
    input.position, 
    hyphenationConstants.BREAK_HIATUS);
}

function applyDiphthongBreak(input, output) {
  addBreak(output, 
    input.position, 
    hyphenationConstants.BREAK_DIPH);
}

function applySpecialDiphthongAsHiatusBreak(input, output) {
  addBreak(output, 
    input.position, 
    hyphenationConstants.BREAK_SPECIAL_DIPH);
}

function currentSegment(input, output) {
  return input.fullText.slice(output.segmentBeginningPos, input.position);
}

function addBreak(output, position, type) {
  const syllableBreak = new SyllableBreak(
    position - output.currentWord.beginningPos,
    breakTypes[type]
  );
  output.currentWord.syllBoundaries.push(syllableBreak);
}

function startWord(input, output) {
  output.currentWord.precedingText = currentSegment(input, output);
  output.currentWord.beginningPos = input.position;
  output.segmentBeginningPos = input.position;
}

function endWord(input, output) {
  output.currentWord.text = currentSegment(input, output);
  
  var word = {
    precedingText: output.currentWord.precedingText,
    text: output.currentWord.text,
    syllBoundaries: output.currentWord.syllBoundaries.slice()
  };
  output.words.push(word);

  output.segmentBeginningPos = input.position;
  output.currentWord.syllBoundaries = [];
}
