import { LineResult } from "./result";
import { analysisConstants, annotations } from "./analysis-defs";

/**
 * An analyzer that applies rules to its input to produce a LineResult. It also chooses the final 
 * syllabification from a list of alternatives.
 */
export class Analyzer {

  /**
   * Create a new object that uses the given rules and strategy.
   * 
   * @param {Language} language - the language specification
   * @param {Strategy} strategy - the strategy for finding the result
   * @param rules - rules that check parts of the line and store annotations in a LineResult
   */
  constructor(language, strategy, rules) {
    if (rules.constraints.length !== analysisConstants.MAX_LINE_LENGTH) {
      throw new Error('Invalid parameter: rules');
    }

    this._language = language;
    this._strategy = strategy;
    strategy.analysis = this;
    this._initialConstraints = rules.initialConstraints;
    this._constraints = rules.constraints;
    this._otherConstraints = rules.otherConstraints;
  }

  /**
   * 
   * @typedef AnalysisReturnType
   * @type {object}
   * @property {Line} line 
   * @property {LineResult} result
   */

  /**
   * Check a line for metrical errors and choose the correct syllabification.
   * 
   * @param {Syllabifications} syllabifications 
   * @returns {AnalysisReturnType} a Line and a LineResult
   */
  analyze(syllabifications) {
    return this._strategy.check(syllabifications);
  }

  /**
   * Check one syllabification. Used by a Strategy during analysis.
   * 
   * @param {WordsAndSyllables} wordsAndSyllables 
   * @returns {LineResult}
   */
  doCheck(wordsAndSyllables) {
    const result = new LineResult(wordsAndSyllables);

    if (!this._applyInitialConstraints(wordsAndSyllables, result)) {
      return result;
    }

    this._applyPerSyllableConstraints(wordsAndSyllables, result);

    this._applyOtherConstraints(wordsAndSyllables, result);

    return result;
  }

  _applyInitialConstraints(wordsAndSyllables, result) {
    for (let constraint of this._initialConstraints) {
      if (!constraint.accept(this._language, wordsAndSyllables)) {
        constraint.error(wordsAndSyllables, result);
        return false;
      }
    }
    return true;
  }
  
  _applyPerSyllableConstraints(wordsAndSyllables, result) {
    const lineLength = wordsAndSyllables.numSyllables();
    const constraintOffset = analysisConstants.MAX_LINE_LENGTH - lineLength;
    let syllInLineIndex = 0;
    
    for (var wordIndex = 0; wordIndex < wordsAndSyllables.words.length; wordIndex++) {
      const word = wordsAndSyllables.words[wordIndex];
      for (var syllIndex = 0; syllIndex < word.syllables.length; syllIndex++) {
        const syll = word.syllables[syllIndex];
        const constraintIndex = syllInLineIndex + constraintOffset;
        for (let constraint of this._constraints[constraintIndex]) {
          if (!constraint.accept(this._language, syll, word.syllables, syllIndex)) {
            constraint.error(result, syllInLineIndex);
          }
        }
        syllInLineIndex++;
      }
    }
  }

  _applyOtherConstraints(wordsAndSyllables, result) {
    for (let constraint of this._otherConstraints) {
      if (!constraint.accept(this._language, wordsAndSyllables)) {
        constraint.error(wordsAndSyllables, result);
      }
    }
  }
}

/**
 * Create default rules that can be passed to an Analyzer constructor.
 */
export function createDefaultRules() {
  return {
    initialConstraints: [new LengthRule()],

    constraints: [
      [],
      [],
      [],
      [],
      [new RiseRule()],
      [new FallRule()],
      [new RiseRule()],
      [new FallRule()],
      [new RiseRule()],
      [new NoLongVowelRule(), new NoMonosyllableRule()]
    ],

    otherConstraints: [new CaesuraRule()]
  };
}

export class LengthRule {
  accept(language, wordsAndSyllables) {
    const count = wordsAndSyllables.numSyllables();
    return count >= analysisConstants.MIN_LINE_LENGTH 
      && count <= analysisConstants.MAX_LINE_LENGTH;
  }

  error(wordsAndSyllables, result) {
    const count = wordsAndSyllables.numSyllables();
    if (count < analysisConstants.MIN_LINE_LENGTH) {
      result.addLineAnnotation(annotations['too_short']);
    } else if (count > analysisConstants.MAX_LINE_LENGTH) {
      result.addLineAnnotation(annotations['too_long']);
    }
  }
}

export class RiseRule {
  accept(language, syll, syllablesInWord, syllInWordIndex) {
    if (language.hasMainStress(syllablesInWord, syllInWordIndex)) {
      return isLong(language, syll);
    } else {
      return true;
    }
  }

  error(result, syllInLineIndex) {
    result.addAnnotationBySyllable(syllInLineIndex, annotations['short_rising']);
  }
}

export class FallRule {
  accept(language, syll, syllablesInWord, syllInWordIndex) {
    if (language.hasMainStress(syllablesInWord, syllInWordIndex)) {
      return !isLong(language, syll);
    } else {
      return true;
    }
  }

  error(result, syllInLineIndex) {
    result.addAnnotationBySyllable(syllInLineIndex, annotations['long_falling']);
  }
}

export class NoLongVowelRule {
  accept(language, syll, syllablesInWord, syllInWordIndex) {
    return !language.containsLongVowel(syll);
  }

  error(result, syllInLineIndex) {
    result.addAnnotationBySyllable(syllInLineIndex, annotations['long_vowel']);
  }
}

export class NoMonosyllableRule {
  accept(language, syll, syllablesInWord, syllInWordIndex) {
    return syllablesInWord.length > 1;
  }

  error(result, syllInLineIndex) {
    result.addAnnotationBySyllable(syllInLineIndex, annotations['monosyllable']);
  }
}

export class CaesuraRule {
  accept(language, wordsAndSyllables) {
    const numWords = wordsAndSyllables.words.length;
    if (numWords < 2) {
      return true;
    }

    const lastWord = wordsAndSyllables.words[numWords - 1];
    const secondToLastWord = wordsAndSyllables.words[numWords - 2];
    return secondToLastWord.syllables.length !== 4
      || lastWord.syllables.length !== 2;
  }

  error(wordsAndSyllables, result) {
    result.addLineAnnotation(annotations['caesura']);
  }
}

export function isLong(language, syllable) {
  return language.containsLongVowel(syllable)
    || language.containsDiphthong(syllable) 
    || language.endsInConsonant(syllable);
}
