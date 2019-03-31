import { Language } from './language';
import { Hyphenation } from './hyphenation';
import { Syllabifications, CombinationGenerator } from './hyphenation-data';
import { AnalyzerStrategy } from './strategy';
import { analysisConstants } from './analysis-defs';
import { Analyzer, createDefaultRules } from './analysis';
import { AnalyzerBuilder } from './extensions';

/**
 * A convenience interface for using default analysis classes.
 */
export class AnalyzerFacade {
  constructor() {
    let builder;
    if (AnalyzerBuilder !== null) {
      builder = new AnalyzerBuilder();
    } else {
      builder = new DefaultAnalyzerBuilder();
    }
    this._analyzer = builder.createAnalyzer();
    this._hyphenation = builder.createHyphenation();
  }

  /**
   * Check a line for metrical errors.
   * 
   * @param {string} rawTextLine - one line of text
   * @returns {AnalysisReturnType} a Line and a LineResult
   */
  analyze(rawTextLine) {
    const wapb = this._hyphenation.syllabify(rawTextLine);
    const syllabifications = new Syllabifications(
      wapb, 
      new CombinationGenerator([false, true]),
      analysisConstants.MAX_PENALTY
    );
    return this._analyzer.analyze(syllabifications);
  }
}

class DefaultAnalyzerBuilder {
  constructor() {
    this._language = new Language();
    this._strategy = new AnalyzerStrategy();
  }

  createHyphenation() {
    return new Hyphenation(this._language);
  }

  createAnalyzer() {
    return new Analyzer(this._language, this._strategy, createDefaultRules());
  }
}
