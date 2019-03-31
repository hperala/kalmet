import { Language } from './language';
import { hyphenationConstants } from './hyphenation-defs';
import { Hyphenation } from './hyphenation';

describe('Hyphenation module', () => {

  describe('Hyphenation class', () => {

    const SEP = '-';
    let lang: Language;
    let h: Hyphenation;

    beforeEach(() => {
      lang = new Language();
      h = new Hyphenation(lang);
    });

    it('should return a zero-word result for an empty input', () => {
      const result = h.syllabify('');

      expect(result.toString(SEP)).toBe('');
      expect(result.words.length).toBe(0);
      expect(result.followingText).toBe('');
    });

    it('should return a zero-word result for a whitespace input', () => {
      const result = h.syllabify(' ');

      expect(result.toString(SEP)).toBe(' ');
      expect(result.words.length).toBe(0);
      expect(result.followingText).toBe(' ');
    });

    it('should accept words with consonants only', () => {
      const result = h.syllabify('k');

      expect(result.toString(SEP)).toBe('k');
      expect(result.words.length).toBe(1);
      expect(result.words[0].text).toBe('k');
    });

    it('should accept words with vowels only', () => {
      const result = h.syllabify('a');

      expect(result.toString(SEP)).toBe('a');
      expect(result.words.length).toBe(1);
      expect(result.words[0].text).toBe('a');
    });

    it('should break before CV', () => {
      expect(h.syllabify('iso').toString(SEP)).toBe('i-so');
    });

    it('should work with uppercase input', () => {
      expect(h.syllabify('ISO').toString(SEP)).toBe('I-SO');
    });

    it('should recognize some non-ASCII characters', () => {
      expect(h.syllabify('älä').toString(SEP)).toBe('ä-lä');
    });

    it('should recognize some non-ASCII characters in uppercase', () => {
      expect(h.syllabify('ÄLÄ').toString(SEP)).toBe('Ä-LÄ');
    });

    it('should keep incomplete words at end of input', () => {
      expect(h.syllabify('talo t').toString(SEP)).toBe('ta-lo t');
    });

    it('should not break before initial CV', () => {
      expect(h.syllabify('talo').toString(SEP)).toBe('ta-lo');
    });

    it('should not break before CV inside first syllable', () => {
      expect(h.syllabify('krapu').toString(SEP)).toBe('kra-pu');
    });

    it('should break between vowels in hiatus', () => {
      expect(h.syllabify('koe').toString(SEP)).toBe('ko-e');
    });

    it('should indicate the type of syllable break', () => {
      const result = h.syllabify('taloa');

      expect(result.words[0].syllBoundaries[0].type).toBe(hyphenationConstants.BREAK_CV);
      expect(result.words[0].syllBoundaries[1].type).toBe(hyphenationConstants.BREAK_HIATUS);
    });

    it('should mark diphthongs as potential breaks', () => {
      const result = h.syllabify('ai');

      expect(result.words[0].syllBoundaries[0].position).toBe(1);
      expect(result.words[0].syllBoundaries[0].type).toBe(hyphenationConstants.BREAK_DIPH);
    });

    it('should not give breaks inside diphthongs high confidence', () => {
      expect(h.syllabify('ai').toString(SEP)).toBe('ai');
    });

    it('should treat some sequences as diphthongs only in the initial syllable', () => {
      expect(h.syllabify('sienien').toString(SEP)).toBe('sie-ni-en');
    });

    it('should distinguish between potential diphthongs and a normal hiatus', () => {
      const result = h.syllabify('sienien');
      const lastBreak = result.words[0].syllBoundaries[2];
      
      expect(lastBreak.position).toBe(5);
      expect(lastBreak.type).toBe(hyphenationConstants.BREAK_SPECIAL_DIPH);
    });

    it('should treat initial syllables correctly in every word of input', () => {
      expect(h.syllabify('krapu krapu').toString(SEP)).toBe('kra-pu kra-pu');
    });

    it('should not break long vowels', () => {
      expect(h.syllabify('aa').toString(SEP)).toBe('aa');
    });

    it('should break between a long vowel and a short vowel', () => {
      expect(h.syllabify('aao').toString(SEP)).toBe('aa-o');
    });

    it('should break between a diphthong and a short vowel', () => {
      expect(h.syllabify('ouoksi').toString(SEP)).toBe('ou-ok-si');
    });

    it('should break between two long vowels', () => {
      expect(h.syllabify('aaee').toString(SEP)).toBe('aa-ee');
    });

    it('should break between two identical long vowels', () => {
      expect(h.syllabify('eeee').toString(SEP)).toBe('ee-ee');
    });

    it('should break between several diphthongs in a sequence', () => {
      expect(h.syllabify('aiaiai').toString(SEP)).toBe('ai-ai-ai');
    });

    it('should break detect diphthongs and long vowels from left to right', () => {
      expect(h.syllabify('uooii').toString(SEP)).toBe('uo-oi-i');
    });

    it('should extract words', () => {
      const result = h.syllabify('talo');
      expect(result.words.length).toBe(1);
      expect(result.words[0].text).toBe('talo');
    });

    it('should store characters outside words', () => {
      const result = h.syllabify(' talo ');
      expect(result.words[0].precedingText).toBe(' ');
      expect(result.followingText).toBe(' ');
    });

    it('should accept input with multiple words', () => {
      const result = h.syllabify(' iso talo ');
      expect(result.toString(SEP)).toBe(' i-so ta-lo ');
    });

    it('should keep incomplete words at end of input', () => {
      expect(h.syllabify('talo t').toString(SEP)).toBe('ta-lo t');
    });

    it('should not include initial or final non-alphabetic characters in words', () => {
      const result = h.syllabify(' *123! talo *123! ');
      expect(result.toString(SEP)).toBe(' *123! ta-lo *123! ');
      expect(result.words.length).toBe(1);
    });

    it('should consider syllable-final non-alphabetic characters a part of the syllable', () => {
      const result = h.syllabify('*ta*lo*');
      expect(result.toString(SEP)).toBe('*ta*-lo*');
      expect(result.words[0].precedingText).toBe('*');
      expect(result.followingText).toBe('');
    });

    it('should recognize hyphen as a word separator', () => {
      const result = h.syllabify('koto-oloista');
      expect(result.words.length).toBe(2);
      expect(result.toString('|')).toBe('ko|to-o|lois|ta');
    });

    it('should recognize plus as a word separator', () => {
      const result = h.syllabify('koto+oloista');
      expect(result.words.length).toBe(2);
      expect(result.toString('|')).toBe('ko|to+o|lois|ta');
      expect(result.words[0].text).toBe('koto+');
      expect(result.words[1].text).toBe('oloista');
    });

    it('should ignore separators at the end of words', () => {
      expect(h.syllabify('koto- oloista').toString('|')).toBe('ko|to- o|lois|ta');
    });

    it('should ignore separators at the end of input', () => {
      expect(h.syllabify('koto-').toString('|')).toBe('ko|to-');
    });

    it('should ignore separators at the beginning of words', () => {
      expect(h.syllabify('koto -oloista').toString('|')).toBe('ko|to -o|lois|ta');
    });

    it('should ignore separators at the beginning of input', () => {
      expect(h.syllabify('-koto').toString('|')).toBe('-ko|to');
    });

  });

});
