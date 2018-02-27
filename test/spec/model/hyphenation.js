'use strict';
/* globals Hyphenation */

describe('Hyphenation module', function() {

  var l = new Hyphenation.Language();
  var LIMIT = Hyphenation.CONFIDENCE_HIATUS - 1;
  var SEP = '-';

  var input = 'talo';
  var breaks = [new Hyphenation.SyllableBreak(2, '', Hyphenation.CONFIDENCE_CV)];
  var markedText = new Hyphenation.MarkedText('talo');
  markedText.syllBoundaries = breaks;

  var h = new Hyphenation.Hyphenation(l);

  describe('MarkedText class toString method', function() {

    it('should add a hyphen to the given position', function() {
      expect(markedText.toString(LIMIT, SEP)).toBe('ta-lo');
    });

  });

  describe('Language class', function() {
  
    describe('containsDiphthong method', function() {

      it('should work with a string with no extra characters', function() {
        expect(l.containsDiphthong('tai')).toBe(true);
      });

    });

    describe('containsLongVowel method', function() {
    
      it('should work with a string with no extra characters', function() {
        expect(l.containsLongVowel('taa')).toBe(true);
      });

    });

    describe('endsInConsonant method', function() {
      
      it('should work with a string with no extra characters', function() {
        expect(l.endsInConsonant('at')).toBe(true);
      });

    });
  });

  describe('Hyphenation class', function() {

    describe('syllabify method', function() {

      it('should break before CV', function() {
        expect(h.syllabify('iso').marked.toString(LIMIT, SEP)).toBe('i-so');
      });

      it('should work with uppercase input', function() {
        expect(h.syllabify('ISO').marked.toString(LIMIT, SEP)).toBe('I-SO');
      });

      it('should recognize some non-ASCII characters', function() {
        expect(h.syllabify('älä').marked.toString(LIMIT, SEP)).toBe('ä-lä');
      });

      it('should recognize some non-ASCII characters in uppercase', function() {
        expect(h.syllabify('ÄLÄ').marked.toString(LIMIT, SEP)).toBe('Ä-LÄ');
      });

      it('should keep incomplete words at end of input', function() {
        expect(h.syllabify('talo t').marked.toString(LIMIT, SEP)).toBe('ta-lo t');
      });

      it('should not break before initial CV', function() {
        expect(h.syllabify('talo').marked.toString(LIMIT, SEP)).toBe('ta-lo');
      });

      it('should not break before CV inside first syllable', function() {
        expect(h.syllabify('krapu').marked.toString(LIMIT, SEP)).toBe('kra-pu');
      });

      it('should break between vowels in hiatus', function() {
        expect(h.syllabify('koe').marked.toString(LIMIT, SEP)).toBe('ko-e');
      });

      it('should indicate the type of syllable break', function() {
        var result = h.syllabify('taloa').marked;
        expect(result.syllBoundaries[0].type).toBe(Hyphenation.BREAK_CV);
        expect(result.syllBoundaries[1].type).toBe(Hyphenation.BREAK_HIATUS);
      });

      it('should mark diphthongs as potential breaks', function() {
        var result = h.syllabify('ai').marked;
        expect(result.syllBoundaries[0].position).toBe(1);
        expect(result.syllBoundaries[0].type).toBe(Hyphenation.BREAK_DIPH);
      });

      it('should not give breaks inside diphthongs high confidence', function() {
        expect(h.syllabify('ai').marked.toString(LIMIT, SEP)).toBe('ai');
      });

      it('should treat some sequences as diphthongs only in the initial syllable', function() {
        expect(h.syllabify('sienien').marked.toString(LIMIT, SEP)).toBe('sie-ni-en');
      });

      it('should treat initial syllables correctly in every word of input', function() {
        expect(h.syllabify('krapu krapu').marked.toString(LIMIT, SEP)).toBe('kra-pu kra-pu');
      });

      it('should not break long vowels', function() {
        expect(h.syllabify('aa').marked.toString(LIMIT, SEP)).toBe('aa');
      });

      it('should break between a long vowel and a short vowel', function() {
        expect(h.syllabify('aao').marked.toString(LIMIT, SEP)).toBe('aa-o');
      });

      it('should break between a diphthong and a short vowel', function() {
        expect(h.syllabify('ouoksi').marked.toString(LIMIT, SEP)).toBe('ou-ok-si');
      });

      it('should break between two long vowels', function() {
        expect(h.syllabify('aaee').marked.toString(LIMIT, SEP)).toBe('aa-ee');
      });

      it('should break between two identical long vowels', function() {
        expect(h.syllabify('eeee').marked.toString(LIMIT, SEP)).toBe('ee-ee');
      });

    });

    describe('syllabify method (PreStructuredText output)', function() {

      it('should save the same syllable breaks in a PreStructuredText and a MarkedText', function() {
        var result = h.syllabify('talo').preStructured;
        expect(result.words[0].syllBoundaries[0].position).toBe(2);
        expect(result.words[0].syllBoundaries[0].type).toBe(Hyphenation.BREAK_CV);
      });

      it('should extract words', function() {
        var result = h.syllabify('talo').preStructured;
        expect(result.words.length).toBe(1);
        expect(result.words[0].text).toBe('talo');
      });

      it('should store characters outside words', function() {
        var result = h.syllabify(' talo ').preStructured;
        expect(result.words[0].precedingText).toBe(' ');
        expect(result.followingText).toBe(' ');
      });

      it('should accept input with multiple words', function() {
        var result = h.syllabify(' iso talo ').preStructured;
        expect(result.toString(LIMIT, SEP)).toBe(' i-so ta-lo ');
      });

      it('should keep incomplete words at end of input', function() {
        expect(h.syllabify('talo t').preStructured.toString(LIMIT, SEP)).toBe('ta-lo t');
      });

      it('should not include initial or final non-alphabetic characters in words', function() {
        var pre = h.syllabify(' *123! talo *123! ').preStructured;
        expect(pre.toString(LIMIT, SEP)).toBe(' *123! ta-lo *123! ');
        expect(pre.words.length).toBe(1);
      });

      it('should consider syllable-final non-alphabetic characters a part of the syllable', function() {
        var pre = h.syllabify('*ta*lo*').preStructured;
        expect(pre.toString(LIMIT, SEP)).toBe('*ta*-lo*');
        expect(pre.words[0].precedingText).toBe('*');
        expect(pre.followingText).toBe('');
      });

      it('should recognize hyphens in the input as separators', function() {
        var result = h.syllabify('koto-oloista').preStructured;
        expect(result.words.length).toBe(2);
        expect(result.toString(LIMIT, '|')).toBe('ko|to-o|lois|ta');
      });

      it('should ignore separators at the end of words', function() {
        expect(h.syllabify('koto- oloista').preStructured.toString(LIMIT, '|')).toBe('ko|to- o|lois|ta');
      });

      it('should ignore separators at the end of input', function() {
        expect(h.syllabify('koto-').preStructured.toString(LIMIT, '|')).toBe('ko|to-');
      });

      it('should ignore separators at the beginning of words', function() {
        expect(h.syllabify('koto -oloista').preStructured.toString(LIMIT, '|')).toBe('ko|to -o|lois|ta');
      });

      it('should ignore separators at the beginning of input', function() {
        expect(h.syllabify('-koto').preStructured.toString(LIMIT, '|')).toBe('-ko|to');
      });

    });

    describe('createAlternatives method', function() {

      var pre = new Hyphenation.PreStructuredText();
      pre.words = [{
        precedingText: '', 
        altPrecedingText: '', 
        text: input,
        alt: input,
        syllBoundaries: breaks
      }];
      pre.followingText = '';
      pre.altFollowingText = '';

      it('should offer the most obvious syllabification as the first alternative', function() {
        var actual = h.createAlternatives(input, pre);
        expect(actual.alternatives[0].penalty).toBe(0);
        expect(actual.alternatives[0].text.toString('-')).toBe('ta-lo');
      });

    });

  });

  describe('StructuredText class', function() {


  });

});