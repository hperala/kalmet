import { Language } from './language';
import { hyphenationConstants, breakTypes } from './hyphenation-defs';
import { CombinationGenerator, SyllableBreak, WordsAndPotentialBreaks, 
         Syllabifications } from './hyphenation-data';
import { Hyphenation } from './hyphenation';
import { analysisConstants } from './analysis-defs';

describe('HyphenationData module', () => {

  describe('WordsAndPotentialBreaks class', () => {
    
    const words1 = [{
      precedingText: '',
      text: 'Vaka',
      syllBoundaries: [
        new SyllableBreak(2, breakTypes[hyphenationConstants.BREAK_CV])
      ]
    }];
    const followingText1 = '';

    const words2 = [
      {
        precedingText: '"',
        text: 'Vanha',
        syllBoundaries: [
          new SyllableBreak(3, breakTypes[hyphenationConstants.BREAK_CV])
        ]
      },
      {
        precedingText: ' ',
        text: 'Väinämö',
        syllBoundaries: [
          new SyllableBreak(3, breakTypes[hyphenationConstants.BREAK_CV]),
          new SyllableBreak(5, breakTypes[hyphenationConstants.BREAK_CV])
        ]
      }];
    const followingText2 = '" ';
    
    const words3 = [{
      precedingText: '',
      text: 'On',
      syllBoundaries: []
    }];
    const followingText3 = '';

    describe('toString method', () => {

      it('should return a string with separators', () => {
        const wapb = new WordsAndPotentialBreaks(words1, followingText1);

        expect(wapb.toString()).toBe('Va-ka');
      });

      it('should include characters outside words', () => {
        const wapb = new WordsAndPotentialBreaks(words2, followingText2);

        expect(wapb.toString()).toBe('"Van-ha Väi-nä-mö" ');
      });

      it('should not use separators with monosyllables', () => {
        const wapb = new WordsAndPotentialBreaks(words3, followingText3);

        expect(wapb.toString()).toBe('On');
      });

    });

  });
  
  describe('Syllabifications class', () => {

    it('should...', () => {
      const lang = new Language();
      const h = new Hyphenation(lang);
      const wapb = h.syllabify('Tavua, oi');
      const syllabifications = new Syllabifications(
        wapb,
        new CombinationGenerator([false, true]),
        analysisConstants.MAX_PENALTY
      );
      const was = syllabifications.alternatives[0].text;

      expect(was.words.length).toBe(2);
      expect(was.words[0].syllables.length).toBe(3);
      expect(was.words[1].syllables.length).toBe(1);
    });

  });

  describe('CombinationGenerator class', () => {

    let g;

    beforeEach(() => {
      g = new CombinationGenerator([0, 1]);
    });

    it('should return an empty array for parameter value 0', () => {
      const result = g.get(0);

      expect(result.length).toBe(0);
    });

    it('should generate all combinations of length 1', () => {
      const expected = '0; 1';
      const result = g.get(1);

      expect(arrayToString2D(result)).toBe(expected);
    });

    it('should generate all combinations', () => {
      const expected = '0 0; 1 0; 0 1; 1 1';
      const result = g.get(2);

      expect(arrayToString2D(result)).toBe(expected);
    });

  });

});

function arrayToString2D(array) {
  return array.map(x => x.join(' ')).join('; ');
}