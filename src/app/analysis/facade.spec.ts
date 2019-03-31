import { AnalyzerFacade } from './facade';
import { analysisConstants } from './analysis-defs';

describe('Facade module', () => {

  const ERROR = analysisConstants.ERROR_LEVEL_ERROR;
  let a: AnalyzerFacade;

  beforeEach(() => {
    a = new AnalyzerFacade();
  });

  it('should detect "too short" errors', () => {
    const result = a.analyze('vanha vanha Väinö');

    expect(result.result.getLineErrorLevel()).toBe(analysisConstants.ERROR_LEVEL_SHORT);
    expect(result.result.getLineAnnotations()[0].id).toBe('too_short');
  });

  it('should detect "too long" errors', () => {
    const result = a.analyze('olipa kerran vanha vanha Väinö');

    expect(result.result.getLineErrorLevel()).toBe(ERROR);
    expect(result.result.getLineAnnotations()[0].id).toBe('too_long');
  });

  it('should detect "short rising" errors', () => {
    const result = a.analyze('vaka vaka Väinämöinen');

    expect(result.result.getErrorLevelBySyllable(2)).toBe(ERROR);
  });

  it('should detect "long falling" errors', () => {
    const result = a.analyze('laulaja iän aikainen');

    expect(result.result.getErrorLevelBySyllable(5)).toBe(ERROR);
  });

  it('should accept monosyllables at rising position', () => {
    const result = a.analyze('itse lausui ja pakisi');
    const expectedLevel = analysisConstants.ERROR_LEVEL_NONE;

    expect(result.result.getErrorLevelBySyllable(4)).toBe(expectedLevel);
  });

  it('should accept monosyllables at falling position', () => {
    const result = a.analyze('sorea on suonten vaimo');
    const expectedLevel = analysisConstants.ERROR_LEVEL_NONE;

    expect(result.result.getErrorLevelBySyllable(3)).toBe(expectedLevel);
  });

  it('should detect "long vowel" errors', () => {
    const result = a.analyze('itse suonia sitelee');

    expect(result.result.getLineErrorLevel()).toBe(ERROR);
    expect(result.result.getAnnotationsBySyllable(7)[0].id).toBe('long_vowel');
  });
  
  it('should detect "monosyllable" errors', () => {
    const result = a.analyze('itse suonia sitoi hän');

    expect(result.result.getLineErrorLevel()).toBe(ERROR);
    expect(result.result.getAnnotationsBySyllable(7)[0].id).toBe('monosyllable');
  });

  it('should detect "caesura" errors', () => {
    const result = a.analyze('lieto Lemminkäinen laati');

    expect(result.result.getLineErrorLevel()).toBe(ERROR);
    expect(result.result.getLineAnnotations()[0].id).toBe('caesura');
  });

});