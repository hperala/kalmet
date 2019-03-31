import { analysisConstants } from "./analysis-defs";

/**
 * A line that is divided into feet and syllables as well as words and syllables.
 */
export class Line {

  /**
   * Create a new object from a WordsAndSyllables. This constructor creates a reference to the 
   * original words-and-syllables structure in the input instead of creating a copy.
   * 
   * @param {WordsAndSyllables} wordsAndSyllables - the source
   */
  constructor(wordsAndSyllables) {
    if (typeof wordsAndSyllables !== 'object'
      || wordsAndSyllables === null
      || wordsAndSyllables.words === undefined
      || wordsAndSyllables.followingText === undefined) {
      throw new Error('Invalid parameter');
    }

    /**
     * The words of the line and any characters preceding each word.
     * @member {WordType[]}
     */
    this.words = wordsAndSyllables.words;

    /**
     * The characters following the last word in [words]{@linkcode Line#words}. Can be an empty 
     * string.
     * @member {string}
     */
    this.followingText = wordsAndSyllables.followingText;

    /**
     * The feet of the line. This structure contains all characters of the line, including 
     * [followingText]{@linkcode Line#followingText}.
     * @member {Foot[]}
     */
    this.feet = this._generateFeet(wordsAndSyllables);
  }

  toStringByFeet(syllableSeparator, footSeparator) {
    let output = '';
    for (const foot of this.feet) {
      for (const syllable of foot.syllables) {
        output += syllable.precedingText;
        output += syllable.text;
        output += syllable.followingText;
        switch (syllable.followingPunctuation) {
          case analysisConstants.SEPARATOR_SYLLABLE:
            output += syllableSeparator;
            break;
          case analysisConstants.SEPARATOR_FOOT:
            output += footSeparator;
            break;
          case analysisConstants.SEPARATOR_FOOT_WITH_SPACES:
            output += ' ' + footSeparator;
            break;
        }
      }
    }
    return output;
  }

  _generateFeet(wordsAndSyllables) {
    const flattened = this._flatten(wordsAndSyllables.words, wordsAndSyllables.followingText);
    const feet = new Array(analysisConstants.NUM_FEET);
    let index = flattened.length;

    for (let footIndex = analysisConstants.NUM_FEET - 1; footIndex >= 0; footIndex--) {
      const leftIndex = footIndex === 0 ? 0 : index - analysisConstants.NORMAL_FOOT_LENGTH;
      const syllables = flattened.slice(leftIndex, index);
      this._addFoot(feet, footIndex, syllables)
      index = leftIndex;
    }

    return feet;
  }

  _flatten(words, lineFollowingText) {
    const flattened = [];
    for (var i = 0; i < words.length; i++) {
      const word = words[i];
      for (var j = 0; j < word.syllables.length; j++) {
        const precedingText = j === 0 ? word.precedingText : '';
        const followingText = '';
        const wordFinal = j === word.syllables.length - 1;
        const followingPunctuation = wordFinal 
          ? analysisConstants.SEPARATOR_NONE 
          : analysisConstants.SEPARATOR_SYLLABLE;
        const syllable = new SyllableInFoot(
          precedingText, 
          word.syllables[j],
          followingText,
          followingPunctuation,
          wordFinal);
        flattened.push(syllable);
      }
    }
    if (flattened.length > 0) {
      flattened[flattened.length - 1].followingText = lineFollowingText;
    }
    return flattened;
  }

  _addFoot(feet, footIndex, syllables) {
    const insertFootSeparator = footIndex < analysisConstants.NUM_FEET - 1;
    feet[footIndex] = new Foot(syllables, insertFootSeparator);
  }
}

/**
 * A collection of annotations for one line.
 */
export class LineResult {

  /**
   * Create a new result for a specific WordsAndSyllables object.
   * 
   * @param {WordsAndSyllables} wordsAndSyllables - the line that is being analyzed. The word and 
   * syllable counts of this parameter are stored by this result object and should not be changed 
   * afterwards.
   */
  constructor(wordsAndSyllables) {
    if (typeof wordsAndSyllables !== 'object'
      || wordsAndSyllables === null
      || wordsAndSyllables.words === undefined
      || wordsAndSyllables.followingText === undefined) {
      throw new Error('Invalid parameter');
    }

    this._cumulativeWordLength = [];
    let sum = 0;
    for (const word of wordsAndSyllables.words) {
      sum += word.syllables.length;
      this._cumulativeWordLength.push(sum);
    }

    this._syllableAnnotations = [];

    this._lineAnnotations = [];
  }

  getAnnotationsBySyllable(syllableInLineIndex) {
    if (syllableInLineIndex in this._syllableAnnotations) {
      return this._syllableAnnotations[syllableInLineIndex];
    }
    return [];
  }

  getAnnotationsByWordAndSyllable(wordIndex, syllableIndex) {
    const index = this._toSyllableIndex(wordIndex, syllableIndex);
    return this.getAnnotationsBySyllable(index);
  }

  addAnnotationBySyllable(syllableInLineIndex, annotation) {
    if (annotation === undefined || annotation === null) {
      throw new Error('Invalid parameter');
    }

    if (syllableInLineIndex in this._syllableAnnotations) {
      this._syllableAnnotations[syllableInLineIndex].push(annotation);
    } else {
      this._syllableAnnotations[syllableInLineIndex] = [annotation];
    }
  }

  addAnnotationByWordAndSyllable(wordIndex, syllableIndex, annotation) {
    const index = this._toSyllableIndex(wordIndex, syllableIndex);
    this.addAnnotationBySyllable(index, annotation);
  }

  getLineAnnotations() {
    return this._lineAnnotations;
  }

  addLineAnnotation(annotation) {
    if (annotation === undefined || annotation === null) {
      throw new Error('Invalid parameter');
    }

    this._lineAnnotations.push(annotation);
  }

  getAnnotationsGrouped() {
    const allAnnotations = this._getAllAnnotations();
    const groups = this._getGroups(allAnnotations);
    groups.sort(this._compareGroupsByErrorLevelDesc);
    return groups;
  }

  getErrorLevelBySyllable(syllableInLineIndex) {
    return this._maxErrorLevel(this.getAnnotationsBySyllable(syllableInLineIndex));
  }

  getErrorLevelByWordAndSyllable(wordIndex, syllableIndex) {
    const annotations = this.getAnnotationsByWordAndSyllable(wordIndex, syllableIndex);
    return this._maxErrorLevel(annotations);
  }

  getLineErrorLevel() {
    return this._maxErrorLevel(this._getAllAnnotations());
  }

  _toSyllableIndex(wordIndex, syllableIndex) {
    let baseIndex = 0;
    const prevWordIndex = wordIndex - 1;
    if (prevWordIndex >= 0 && prevWordIndex < this._cumulativeWordLength.length) {
      baseIndex = this._cumulativeWordLength[prevWordIndex];
    }
    return baseIndex + syllableIndex;
  }

  _getAllAnnotations() {
    const syllArray = this._toDenseArray(this._syllableAnnotations);
    const combinedArray = syllArray.concat(this._lineAnnotations);
    return this._toFlatArray(combinedArray);
  }

  _getGroups(allAnnotations) {
    const groups = {};
    for (const annotation of allAnnotations) {
      if (groups.hasOwnProperty(annotation.id)) {
        groups[annotation.id].count++;
      } else {
        groups[annotation.id] = { annotation: annotation, count: 1 };
      }
    }
    return this._toDenseArray(groups);
  }

  _compareGroupsByErrorLevelDesc(a, b) {
    const errorLevelDiff = b.annotation.errorLevel - a.annotation.errorLevel;
    if (errorLevelDiff === 0) {
      return b.annotation.sortKey - a.annotation.sortKey;
    }
    return errorLevelDiff;
  }

  _maxErrorLevel(arrayOfAnnotations) {
    return arrayOfAnnotations
      .map(a => a.errorLevel)
      .reduce((a, b) => Math.max(a, b), analysisConstants.ERROR_LEVEL_NONE);
  }

  _toDenseArray(sourceObject) {
    return Object.keys(sourceObject).map(key => sourceObject[key]);
  }

  _toFlatArray(arrayOfArrays) {
    return arrayOfArrays.reduce((result, current) => result.concat(current), []);
  }
}

/**
 * A foot within a line.
 */
class Foot {
  constructor(syllables, insertFootSeparator) {
    if (typeof syllables !== 'object'
      || syllables === null
      || typeof insertFootSeparator !== 'boolean') {
      throw new Error('Invalid parameter');
    }

    /**
     * @member {SyllableInFoot[]}
     */
    this.syllables = syllables;

    if (syllables.length === 0 || !insertFootSeparator) {
      return;
    }

    const lastSyll = syllables[syllables.length - 1];
    if (lastSyll.wordFinal) {
      lastSyll.followingPunctuation = analysisConstants.SEPARATOR_FOOT_WITH_SPACES;
    } else {
      lastSyll.followingPunctuation = analysisConstants.SEPARATOR_FOOT;
    }
  }
}

/**
 * A syllable within a foot.
 */
class SyllableInFoot {
  constructor(precedingText, text, followingText, followingPunctuation, wordFinal) {
    if (typeof precedingText !== 'string'
      || typeof text !== 'string'
      || typeof followingText !== 'string'
      || typeof followingPunctuation !== 'symbol'
      || typeof wordFinal !== 'boolean') {
      throw new Error('Invalid parameter');
    }

    /**
     * @member {string}
     */
    this.precedingText = precedingText;

    /**
     * @member {string}
     */
    this.text = text;

    /**
     * @member {string}
     */
    this.followingText = followingText;

    /**
     * @member {symbol}
     */
    this.followingPunctuation = followingPunctuation;

    /**
     * @member {boolean}
     */
    this.wordFinal = wordFinal;
  }
}
