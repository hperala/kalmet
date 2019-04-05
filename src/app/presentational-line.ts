import { Line, LineResult } from './analysis/result'
import { analysisConstants } from './analysis/analysis-defs'

export class PresentationalLine {
  private line: Line;
  private result: LineResult;
  private _v;
  private _id;

  constructor(line: Line, result: LineResult, values, id) {
    this.line = line;
    this.result = result;
    this._v = values;
    this._id = id;
  }

  isEmpty() {
    return this.line.followingText.length === 0 && this.line.words.length === 0;
  }

  get words() {
    return this.line.words;
  }

  get feet() {
    return this.line.feet;
  }

  get id() {
    return this._id;
  }

  get annotationsGrouped() {
    return this.result.getAnnotationsGrouped();
  }

  get buttonStyle() {
    const errorLevel = this.result.getLineErrorLevel();
    return valueOrDefault(this._v.buttonStyle, errorLevel, this._v.buttonStyleDefault);
  }

  get iconStyle() {
    let errorLevel = 'empty';
    if (!this.isEmpty()) {
      errorLevel = this.result.getLineErrorLevel();
    }
    return valueOrDefault(this._v.iconStyle, errorLevel, this._v.iconStyleDefault);
  }

  ok() {
    return this.result.getLineErrorLevel() <= analysisConstants.ERROR_LEVEL_COMMENT;
  }

  punctuation(symbol) {
    return valueOrDefault(this._v.punctuation, symbol, this._v.punctuationDefault);
  }

  textStyleByWordAndSyllable(wordIndex, syllableIndex) {
    const errorLevel = this.result.getErrorLevelByWordAndSyllable(wordIndex, syllableIndex);
    return valueOrDefault(this._v.textStyle, errorLevel, this._v.textStyleDefault);
  }

  textStyleByFoot(footIndex, syllableIndex) {
    const syllInLineIndex = this._toSyllableIndex(footIndex, syllableIndex);
    const errorLevel = this.result.getErrorLevelBySyllable(syllInLineIndex);
    return valueOrDefault(this._v.textStyle, errorLevel, this._v.textStyleDefault);
  }

  annotationGroupText(groupIndex) {
    const annotation = this.result.getAnnotationsGrouped()[groupIndex].annotation;
    const errorID = annotation.id;
    return valueOrDefault(this._v.txt, errorID, '');
  }

  annotationGroupRuleName(groupIndex) {
    const annotation = this.result.getAnnotationsGrouped()[groupIndex].annotation;
    const ruleID = annotation.ruleID;
    return valueOrDefault(this._v.txt, ruleID, null);
  }

  annotationGroupRuleHtml(groupIndex) {
    const annotation = this.result.getAnnotationsGrouped()[groupIndex].annotation;
    const ruleID = annotation.ruleID;
    return valueOrDefault(this._v.html, ruleID, null);
  }

  annotationGroupMessageStyle(groupIndex) {
    const annotation = this.result.getAnnotationsGrouped()[groupIndex].annotation;
    const errorLevel = annotation.errorLevel;
    return valueOrDefault(this._v.messageStyle, errorLevel, this._v.messageStyleDefault);
  }

  annotationGroupIconStyle(groupIndex) {
    const annotation = this.result.getAnnotationsGrouped()[groupIndex].annotation;
    const errorLevel = annotation.errorLevel;
    return valueOrDefault(this._v.iconStyle, errorLevel, this._v.iconStyleDefault);
  }

  _toSyllableIndex(footIndex, syllableIndex) {
    let sum = 0;
    for (let f = 0; f < footIndex; f++) {
      sum += this.line.feet[f].syllables.length;
    }
    return sum + syllableIndex;
  }
}

export function createDefaultPresentation() {
  return {
    txt: txt,
    html: html,
    buttonStyle: buttonStyle,
    buttonStyleDefault: buttonStyleDefault,
    messageStyle: messageStyle,
    messageStyleDefault: messageStyleDefault,
    iconStyle: iconStyle,
    iconStyleDefault: iconStyleDefault,
    textStyle: textStyle,
    textStyleDefault: textStyleDefault,
    punctuation: punctuation,
    punctuationDefault: punctuationDefault
  };
}

function valueOrDefault(dictionary, key, defaultValue) {
  return dictionary.hasOwnProperty(key) ? dictionary[key] : defaultValue;
}

var txt = {};
txt['error'] = 'Virhe';
txt['warning'] = 'Varoitus';
txt['ok'] = 'OK';
txt['short_rising'] = 'Lyhyt alkutavu runojalan nousussa.';
txt['long_falling'] = 'Pitkä alkutavu runojalan laskussa.';
txt['long_vowel'] = 'Pitkä vokaali viimeisessä tavussa.';
txt['monosyllable'] = 'Yksitavuinen sana säkeen lopussa.';
txt['caesura'] = 'Nelitavuinen sana tasasäkeen keskellä (kesuura puuttuu).';
txt['too_long'] = 'Yli kymmenen tavua.';
txt['too_short'] = 'Alle kahdeksan tavua.';
txt['nine'] = 'Yhdeksäntavuinen.';
txt['ten'] = 'Kymmentavuinen.';
txt[analysisConstants.RULE_MAIN] = 'Pääsääntö';
txt[analysisConstants.RULE_ADDITIONAL_1] = 'Lisäsääntö 1';
txt[analysisConstants.RULE_ADDITIONAL_2] = 'Lisäsääntö 2';
txt[analysisConstants.RULE_ADDITIONAL_3] = 'Lisäsääntö 3';
txt[analysisConstants.RULE_ADDITIONAL_4] = 'Lisäsääntö 4';

var html = {};

const buttonStyle = {};
buttonStyle[analysisConstants.ERROR_LEVEL_NONE] = 'btn-success';
buttonStyle[analysisConstants.ERROR_LEVEL_COMMENT] = 'btn-success';
buttonStyle[analysisConstants.ERROR_LEVEL_WARNING] = 'btn-warning';
buttonStyle[analysisConstants.ERROR_LEVEL_ERROR] = 'btn-danger';
buttonStyle[analysisConstants.ERROR_LEVEL_SHORT] = 'btn-outline-secondary';
const buttonStyleDefault = 'btn-outline-dark';

const messageStyle = {};
messageStyle[analysisConstants.ERROR_LEVEL_NONE] = 'list-group-item-success';
messageStyle[analysisConstants.ERROR_LEVEL_COMMENT] = 'list-group-item-info';
messageStyle[analysisConstants.ERROR_LEVEL_WARNING] = 'list-group-item-warning';
messageStyle[analysisConstants.ERROR_LEVEL_ERROR] = 'list-group-item-danger';
messageStyle[analysisConstants.ERROR_LEVEL_SHORT] = 'list-group-item-danger';
const messageStyleDefault = 'list-group-item-info';

const iconStyle = {};
iconStyle[analysisConstants.ERROR_LEVEL_NONE] = 'fa-check';
iconStyle[analysisConstants.ERROR_LEVEL_COMMENT] = 'fa-info-circle';
iconStyle[analysisConstants.ERROR_LEVEL_WARNING] = 'fa-exclamation-triangle';
iconStyle[analysisConstants.ERROR_LEVEL_ERROR] = 'fa-times';
iconStyle[analysisConstants.ERROR_LEVEL_SHORT] = 'fa-minus';
iconStyle['empty'] = '';
const iconStyleDefault = 'fa-question';

const textStyle = {};
textStyle[analysisConstants.ERROR_LEVEL_NONE] = 'text-ok';
textStyle[analysisConstants.ERROR_LEVEL_WARNING] = 'text-warning';
textStyle[analysisConstants.ERROR_LEVEL_ERROR] = 'text-error';
const textStyleDefault = 'text-ok';

const punctuation = {};
punctuation[analysisConstants.SEPARATOR_SYLLABLE] = '-';
punctuation[analysisConstants.SEPARATOR_FOOT] = '/';
punctuation[analysisConstants.SEPARATOR_FOOT_WITH_SPACES] = ' /';
const punctuationDefault = '';
