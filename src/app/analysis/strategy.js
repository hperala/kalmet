import { Line } from "./result";
import { analysisConstants } from "./analysis-defs";

/**
 * A strategy for finding the most likely syllabification among alternatives and checking it for 
 * metrical errors.
 */
export class AnalyzerStrategy {
  constructor() {
    /**
     * An object that contains a doCheck method for performing the actual analysis. This property 
     * need to be set after creating a new AnalyzerStrategy.
     */
    this.analysis = null;
  }

  /**
   * Check a line for metrical errors and choose the correct syllabification.
   * 
   * @param {Syllabifications} syllabifications 
   * @returns {AnalysisReturnType} a Line and a LineResult
   */
  check(syllabifications) {
    if (syllabifications === undefined
      || syllabifications === null
      || syllabifications.alternatives.length === 0) {
      throw new Error('Invalid parameter');
    }

    // The alternatives are ordered by penalty, with the most likely syllabification first. We pick 
    // the first item that is 1) of normal length and 2) error free. If no such item is found, we 
    // pick the first one.

    let selectedInput = null;
    let selectedResult = null;
    for (let i = 0; i < syllabifications.alternatives.length; i++) {
      const wordsAndSyllables = syllabifications.alternatives[i].text;
      const result = this.analysis.doCheck(wordsAndSyllables);

      if (i === 0) {
        selectedInput = wordsAndSyllables;
        selectedResult = result;
      } else if (this.isPreferredType(wordsAndSyllables, result)) {
        selectedInput = wordsAndSyllables;
        selectedResult = result;
        break;
      }
    }

    return {
      line: new Line(selectedInput),
      result: selectedResult
    };
  }

  isPreferredType(text, result) {
    const isNormalLength = 
      text.numSyllables() === analysisConstants.MIN_LINE_LENGTH;
    const isErrorFree =
      result.getLineErrorLevel() < analysisConstants.ERROR_LEVEL_ERROR;

    return isNormalLength && isErrorFree;
  }
}