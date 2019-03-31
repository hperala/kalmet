/**
 * Constants used in analysis.
 */
export const analysisConstants = {
  ERROR_LEVEL_NONE: 0,
  ERROR_LEVEL_WARNING: 1,
  ERROR_LEVEL_ERROR: 2,
  ERROR_LEVEL_SHORT: 3,

  NUM_FEET: 4,
  NUM_NORMAL_FEET: 3,
  NORMAL_FOOT_LENGTH: 2,
  MIN_LINE_LENGTH: 8,
  MAX_LINE_LENGTH: 10,

  MAX_PENALTY: 10,

  RULE_MAIN: Symbol('RULE_MAIN'),
  RULE_ADDITIONAL_1: Symbol('RULE_ADDITIONAL_1'),
  RULE_ADDITIONAL_2: Symbol('RULE_ADDITIONAL_2'),
  RULE_ADDITIONAL_3: Symbol('RULE_ADDITIONAL_3'),
  RULE_ADDITIONAL_4: Symbol('RULE_ADDITIONAL_4'),

  SEPARATOR_NONE: Symbol('SEPARATOR_NONE'),
  SEPARATOR_SYLLABLE: Symbol('SEPARATOR_SYLLABLE'),
  SEPARATOR_FOOT: Symbol('SEPARATOR_FOOT'),
  SEPARATOR_FOOT_WITH_SPACES: Symbol('SEPARATOR_FOOT_WITH_SPACES')
};

/**
 * An annotation (e.g. an error) for a single syllable or a whole line. This class in intended to 
 * be immutable.
 */
export class Annotation {

  /**
   * Create a new object with the given values.
   * 
   * @param {string} id - identifier of the annotation
   * @param {symbol} ruleID - identifier of the related rule, or null
   * @param {number} errorLevel - severity of the error using one of the values in analysisConstants
   * @param {number} sortKey - key for ordering annotations with same error level. Larger value is 
   * displayed first.
   */
  constructor(id, ruleID, errorLevel, sortKey) {
    if (typeof id !== 'string'
      || (ruleID !== null && typeof ruleID !== 'symbol')
      || typeof errorLevel !== 'number'
      || typeof sortKey !== 'number') {
      throw new Error('Invalid parameter');
    }

    this._id = id;
    this._ruleID = ruleID;
    this._errorLevel = errorLevel;
    this._sortKey = sortKey;
  }

  get id() {
    return this._id;
  }

  get ruleID() {
    return this._ruleID;
  }

  get errorLevel() {
    return this._errorLevel;
  }

  get sortKey() {
    return this._sortKey;
  }
}

/**
 * A dictionary of annotations referenced by result objects.
 */
export const annotations = {};

addAnnotation('too_short', 
  null, 
  analysisConstants.ERROR_LEVEL_SHORT, 
  10);
addAnnotation('too_long', 
  null, 
  analysisConstants.ERROR_LEVEL_ERROR, 
  10);
addAnnotation('short_rising', 
  analysisConstants.RULE_MAIN, 
  analysisConstants.ERROR_LEVEL_ERROR, 
  9);
addAnnotation('long_falling', 
  analysisConstants.RULE_MAIN, 
  analysisConstants.ERROR_LEVEL_ERROR, 
  8);
addAnnotation('monosyllable', 
  analysisConstants.RULE_ADDITIONAL_2, 
  analysisConstants.ERROR_LEVEL_ERROR, 
  7);
addAnnotation('caesura', 
  analysisConstants.RULE_ADDITIONAL_3, 
  analysisConstants.ERROR_LEVEL_ERROR, 
  6);
addAnnotation('long_vowel', 
  analysisConstants.RULE_ADDITIONAL_4, 
  analysisConstants.ERROR_LEVEL_ERROR, 
  5);

function addAnnotation(id, ruleID, errorLevel, sortKey) {
  annotations[id] = new Annotation(id, ruleID, errorLevel, sortKey);
}