/**
 * Identifiers used in hyphenation.
 * @var
 */
export const hyphenationConstants = {
  /** Between vowels */
  BREAK_HIATUS: Symbol('BREAK_HIATUS'),

  /** Before a CV sequence */
  BREAK_CV: Symbol('BREAK_CV'),

  /** Between vowels that could form a diphthong (normal case) */
  BREAK_DIPH: Symbol('BREAK_DIPH'),
  
  /** Between vowels that could form a diphthong ("special" diphthong in a non-initial syllable) */
  BREAK_SPECIAL_DIPH: Symbol('BREAK_SPECIAL_DIPH')
};

/**
 * A dictionary of break types referenced by actual syllable break objects.
 * @var
 */
export const breakTypes = {};

/**
 * Definition of a syllable break type. This class is intended to be immutable.
 */
export class SyllableBreakType {
  constructor(id, penaltyApplied, penaltyNotApplied) {
    /** 
     * Identifier for this type. 
     */
    this.id = id;

    /**
     * Penalty for breaking the word at this point. A higher value means that the break is less 
     * likely.
     */
    this.penaltyApplied = penaltyApplied;

    /**
     * Penalty for not breaking the word at this point. A higher value means that the break is more 
     * likely.
     */
    this.penaltyNotApplied = penaltyNotApplied;
  }
}

function addBreakType(id, penaltyApplied, penaltyNotApplied) {
  breakTypes[id] = new SyllableBreakType(id, penaltyApplied, penaltyNotApplied);
}

addBreakType(hyphenationConstants.BREAK_HIATUS, 0, 10);
addBreakType(hyphenationConstants.BREAK_CV, 0, 1000);
addBreakType(hyphenationConstants.BREAK_DIPH, 7, 0);
addBreakType(hyphenationConstants.BREAK_SPECIAL_DIPH, 0, 5);
