import { Language } from './language';

describe('Language module', () => {

  describe('Language class', () => {

    let l: Language;

    beforeEach(() => {
      l = new Language();
    });
  
    describe('isWhitespace method', () => {

      it('should accept a space', () => {
        expect(l.isWhitespace(' ')).toBe(true);
      });

      it('should accept a tab', () => {
        expect(l.isWhitespace('\t')).toBe(true);
      });

    });

    describe('isWordCharacter method', () => {

      it('should accept a vowel', () => {
        expect(l.isWordCharacter('i')).toBe(true);
      });

      it('should accept a consonant', () => {
        expect(l.isWordCharacter('t')).toBe(true);
      });

      it('should reject a space', () => {
        expect(l.isWordCharacter(' ')).toBe(false);
      });

      it('should accept uppercase', () => {
        expect(l.isWordCharacter('T')).toBe(true);
      });

      it('should accept a non-ASCII uppercase letter', () => {
        expect(l.isWordCharacter('Ä')).toBe(true);
      });

    });

    describe('containsDiphthong method', () => {

      it('should accept a syllable with a diphthong and no extra characters', () => {
        expect(l.containsDiphthong('tai')).toBe(true);
      });

      it('should accept a syllable with a diphthong and extra characters', () => {
        expect(l.containsDiphthong('"t+ai!!"')).toBe(true);
      });

      it('should reject a split diphthong', () => {
        expect(l.containsDiphthong('"ta+i!!"')).toBe(false);
      });

    });

    describe('containsLongVowel method', () => {
    
      it('should work with a string with no extra characters', () => {
        expect(l.containsLongVowel('taa')).toBe(true);
      });

    });

    describe('endsInConsonant method', () => {
      
      it('should accept a syllable with final consonant and no extra characters', () => {
        expect(l.endsInConsonant('at')).toBe(true);
      });

      it('should accept a syllable with final consonant and extra characters', () => {
        expect(l.endsInConsonant('-- at?')).toBe(true);
      });

      it('should accept uppercase', () => {
        expect(l.endsInConsonant('AT')).toBe(true);
      });

      it('should reject a syllable with no consonant', () => {
        expect(l.endsInConsonant('a')).toBe(false);
      });

      it('should reject a syllable with no consonant and extra characters', () => {
        expect(l.endsInConsonant('#a!?')).toBe(false);
      });

    });
    
  });

});