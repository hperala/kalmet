/**
 * A list of possible syllabifications, generated from a WordsAndPotentialBreaks object.
 */
export class Syllabifications {

  /**
   * Create an object containing all alternatives with acceptable penalty values.
   * 
   * @param {WordsAndPotentialBreaks} wordsAndPotentialBreaks - the input text
   * @param {CombinationGenerator} generator - the generator to use for listing possible 
   * combinations
   * @param {number} limit - maximum penalty value for accepted syllabifications
   */
  constructor(wordsAndPotentialBreaks, generator, limit) {
    this._generator = generator;
    this._limit = limit;

    /** 
     * Alternatives sorted by penalty, lowest value first. For example:
     * <pre>
     * [{penalty: 10, text: {WordsAndSyllables}}, ...]
     * </pre>
     * @member
     */
    this.alternatives = this._createAlternatives(wordsAndPotentialBreaks);
  }

  _createAlternatives(wordsAndPotentialBreaks) {
    const numBreaks = wordsAndPotentialBreaks.numBreaks();
    const breaks = this._generator.get(numBreaks);

    const alternatives = this._syllabificationsWithinLimit(
      wordsAndPotentialBreaks,
      breaks,
      this._limit
    );
    alternatives.sort((a, b) => a.penalty - b.penalty);
    return alternatives;
  }

  _syllabificationsWithinLimit(
    wordsAndPotentialBreaks,
    alternatives,
    limit
  ) {
    
    if (alternatives.length === 0) {
      const syllabification = {
        penalty: 0,
        text: this._toWordsAndSyllables(wordsAndPotentialBreaks, [])
      };
      return [syllabification];
    }

    const result = [];
    for (const alternative of alternatives) {
      const { withinLimit, penalty } = this._penalty(wordsAndPotentialBreaks, alternative, limit);
      if (withinLimit) {
        const item = this._toWordsAndSyllables(wordsAndPotentialBreaks, alternative);
        result.push({
          penalty: penalty,
          text: item
        });
      }
    }
    return result;
  }

  _penalty(wordsAndPotentialBreaks, breaksToApply, limit) {
    let breakIndex = 0;
    let penalty = 0;

    for (const word of wordsAndPotentialBreaks.words) {
      for (const syllBreak of word.syllBoundaries) {
        if (breaksToApply[breakIndex]) {
          penalty += syllBreak.penaltyApplied;
        } else {
          penalty += syllBreak.penaltyNotApplied;
        }
        if (penalty > limit) {
          return { withinLimit: false, penalty: -1 };
        }
        breakIndex++;
      }
    }
    return { withinLimit: true, penalty: penalty };
  }

  _toWordsAndSyllables(wordsAndPotentialBreaks, breaksToApply) {
    const words = [];
    let breakIndex = 0;

    for (const oldWord of wordsAndPotentialBreaks.words) {
      var newWord = {
        precedingText: oldWord.precedingText,
        syllables: []
      };
      var start = 0;
      for (const syllBreak of oldWord.syllBoundaries) {
        if (breaksToApply[breakIndex]) {
          newWord.syllables.push(oldWord.text.substring(start, syllBreak.position));
          start = syllBreak.position;
        }

        breakIndex++;
      }
      newWord.syllables.push(oldWord.text.substring(start));
      words.push(newWord);
    }
    const followingText = wordsAndPotentialBreaks.followingText;

    return new WordsAndSyllables(words, followingText);
  }
}

/**
 * A text divided into words and syllables.
 */
export class WordsAndSyllables {
  constructor(words, followingText) {
    if (typeof words !== 'object' 
      || words === null
      || typeof followingText !== 'string') {
      throw new Error('Invalid parameter');
    }

    /**
     * @typedef WordType
     * @type {object}
     * @property {string} precedingText 
     * @property {string[]} syllables
     */

    /**
     * The words and any characters preceding each word.
     * @member {WordType[]}
     */
    this.words = words;

    /**
     * The characters following the last word. Can be an empty string.
     * @member {string}
     */
    this.followingText = followingText;
  }

  numSyllables() {
    return this.words.reduce((sum, word) => sum + word.syllables.length, 0);
  }

  toString(separator = '-') {
    let output = '';
    for (const word of this.words) {
      output += word.precedingText + word.syllables.join(separator);
    }
    output += this.followingText;
    return output;
  }
}

/**
 * A text divided into words, with all potential syllable breaks for each word indicated.
 */
export class WordsAndPotentialBreaks {
  constructor(words, followingText) {
    if (typeof words !== 'object' 
      || words === null
      || typeof followingText !== 'string') {
      throw new Error('Invalid parameter');
    }

    /**
     * An array of word objects of the following form:
     * <pre>
     * {
     *   precedingText: {string},
     *   text: {string},
     *   syllBoundaries: [{SyllableBreak}, ...]
     * }
     * </pre>
     * @member
     */
    this.words = words;

    /**
     * The characters following the last word. Can be an empty string.
     * @member {string}
     */
    this.followingText = followingText;
  }

  numBreaks() {
    return this.words.reduce((sum, current) => sum += current.syllBoundaries.length, 0);
  }

  /**
   * Converts this object into a string with separators at syllable breaks.
   * 
   * @param {string} separator - the separator to insert
   * @returns {string} a string with separators
   */
  toString(separator = '-') {
    let hyphenated = '';
    for (let word of this.words) {
      hyphenated += word.precedingText;
      
      const syllables = [];
      let start = 0;
      for (let syllBreak of word.syllBoundaries) {
        if (syllBreak.penaltyApplied === 0) {
          syllables.push(word.text.substring(start, syllBreak.position));
          start = syllBreak.position;
        }
      }
      syllables.push(word.text.substring(start));
      hyphenated += syllables.join(separator);
    }

    hyphenated += this.followingText;
    return hyphenated;
  }
}

/**
 * A potential syllable break in a text.
 */
export class SyllableBreak {
  constructor(position, type) {
    this._position = position;
    this._type = type;
  }

  /** 
   * Index of the character following the syllable break, counting from the beginning of the 
   * word.
   * 
   * @returns {number}
   */
  get position() {
    return this._position;
  }
  
  /** 
   * Type of the break (see hyphenationConstants).
   */
  get type() {
    return this._type.id;
  }

  /** 
   * Penalty for applying this break.
   * 
   * @returns {number}
   */
  get penaltyApplied() {
    return this._type.penaltyApplied;
  }

  /** 
   * Penalty for not applying this break.
   * 
   * @returns {number}
   */
  get penaltyNotApplied() {
    return this._type.penaltyNotApplied;
  }
}

/**
 * Generator for sequences of N symbols drawn from a given set. Generated lists of sequences are 
 * cached.
 */
export class CombinationGenerator {

  /**
   * Create a generator that uses the given symbols.
   * 
   * @param symbols - a array of values
   */
  constructor(symbols) {
    this._symbols = symbols;
  }

  /**
   * Get all combinations.
   * 
   * @param {number} sequenceLength - length of the sequences to generate
   * @returns an array where every item a an array of values
   */
  get(sequenceLength) {
    if (sequenceLength in this) {
      return this[sequenceLength];
    }
    const newArray = [];
    if (sequenceLength > 0) {
      const temp = Array(sequenceLength);
      this._generate(newArray, this._symbols, temp, sequenceLength);
    }
    this[sequenceLength] = newArray;
    return newArray;
  }

  _generate(sequences, symbols, currentSequence, sequenceLength) {
    if (sequenceLength === 0) {
      sequences.push(currentSequence.slice());
      return;
    }
  
    for (let i = 0; i < symbols.length; i++) {
      currentSequence[sequenceLength - 1] = symbols[i];
      this._generate(sequences, symbols, currentSequence, sequenceLength - 1);
    }
  }
}
