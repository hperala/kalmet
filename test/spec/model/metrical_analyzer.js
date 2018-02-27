'use strict';
/* globals Hyphenation, MetricalAnalyzer */

describe('MetricalAnalyzer module', function() {

  var dummyExtension = {
    extendConstraints: function(initialConstraints, constraints, otherConstraints) {}
  };
  MetricalAnalyzer.initialize(dummyExtension);

  describe('analyze method', function() {

    it('should return something', function() {
      var actual = MetricalAnalyzer.analyze('talo');
      expect(actual).not.toBeNull();
    });

    it('should syllabify input', function() {
      expect(MetricalAnalyzer.analyze('talo').lines[0].toString('-')).toBe('ta-lo');
    });

    it('should detect errors of the type short_rising', function() {
      var result = MetricalAnalyzer.analyze('iso talo pitkä pitkä');
      expect(result.lines[0].words[1].syllables[0].annotations.getById('short_rising')).not.toBeUndefined();
    });

  });

  describe('AnalyzedLine class', function() {

    var st = null;
    var at = null;

    beforeEach(function() {
      st = new Hyphenation.StructuredText();
      st.words.push({
        precedingText: '', 
        syllables: ['ta', 'lo']
      });
      st.words.push({
        precedingText: ' ', 
        syllables: ['o', 'li', 'kin']
      });
      st.words.push({
        precedingText: ' ', 
        syllables: ['i', 'soh', 'ko']
      });
      at = new MetricalAnalyzer.AnalyzedLine(st);
      at.completeConstruction();
    });

    describe('constructor', function() {

      it('should copy data from a StructuredText', function() {
        expect(at.words[0].syllables[0].text).toBe('ta');
        expect(at.words[1].syllables[1].text).toBe('li');
      });

      it('should create empty lists of notes', function() {
        expect(at.words[0].syllables[0].annotations.all().length).toBe(0);
      });

    });

    describe('generateFeet method', function() {

      it('should divide the text into feet beginning from the end', function() {
        expect(at.feet[0].syllables[0].text).toBe('ta');
        expect(at.feet[0].syllables[1].text).toBe('lo');
        expect(at.feet[1].syllables[0].text).toBe('o');
        expect(at.feet[1].syllables[1].text).toBe('li');
        expect(at.feet[2].syllables[0].text).toBe('kin');
        expect(at.feet[2].syllables[1].text).toBe('i');
        expect(at.feet[3].syllables[0].text).toBe('soh');
        expect(at.feet[3].syllables[1].text).toBe('ko');
      });

      it('should store strings outside words in syllables', function() {
        expect(at.feet[1].syllables[0].precedingText).toBe(' ');
      });

      it('should create only the required number of feet', function() {
        var stShort = new Hyphenation.StructuredText();
        stShort.words.push({
          precedingText: '', 
          syllables: ['ta', 'lo']
        });
        stShort.words.push({
          precedingText: ' ', 
          syllables: ['o', 'li', 'kin']
        });
        var atShort = new MetricalAnalyzer.AnalyzedLine(stShort);
        atShort.generateFeet();

        expect(atShort.feet.length).toBe(3);
        expect(atShort.feet[0].syllables[0].text).toBe('ta');
        expect(atShort.feet[2].syllables[1].text).toBe('kin');
      });

    });

  });

  describe('Analysis class', function() {

    var lang = new Hyphenation.Language();
    var hyph = new Hyphenation.Hyphenation(lang);
    var strategy = new MetricalAnalyzer.AnalysisStategy();
    var a = new MetricalAnalyzer.Analysis(lang, strategy);
    var st = new Hyphenation.StructuredText();
    st.words.push({
      precedingText: '', 
      syllables: ['ta', 'lo']
    });
    var alternatives = [{
      penalty: 0,
      text: st
    }];
    var s = new Hyphenation.Syllabifications(alternatives);

    describe('check method', function() {
    
      it('should call observers', function() {
        var resultMock = {
          line: null,
          lineProcessed: function(line) {
            this.line = line;
          }
        };
        a.check(s, [resultMock]);
        expect(resultMock.line).not.toBeNull();
      });

    });

  });

  describe('AnnotationCollection class', function() {

    var ac = null;
    var id = 'TEST';

    beforeEach(function() {
      ac = new MetricalAnalyzer.AnnotationCollection();
    });

    it('should add warnings', function() {
      ac.addWarning('heavy_beginning_w');
      expect(ac.warnings.length).toBe(1);
      expect(ac.warnings[0].id).toBe('heavy_beginning_w');
      expect(ac.warnings[0].level).toBe(MetricalAnalyzer.ERROR_LEVEL_WARNING);
    });

    it('should add other annotations', function() {
      ac.addOther('too_short', MetricalAnalyzer.ERROR_LEVEL_SHORT);
      expect(ac.other.length).toBe(1);
      expect(ac.other[0].id).toBe('too_short');
      expect(ac.other[0].level).toBe(MetricalAnalyzer.ERROR_LEVEL_SHORT);
    });

    it('should provide a list of all annotations', function() {
      ac.addError('long_falling');
      ac.addOther('too_short', MetricalAnalyzer.ERROR_LEVEL_SHORT);
      expect(ac.all().length).toBe(2);
    });

    it('should raise error level', function() {
      expect(ac.errorLevel()).toBe(MetricalAnalyzer.ERROR_LEVEL_NONE);
      ac.addWarning(id);
      expect(ac.errorLevel()).toBe(MetricalAnalyzer.ERROR_LEVEL_WARNING);
      ac.addError(id);
      expect(ac.errorLevel()).toBe(MetricalAnalyzer.ERROR_LEVEL_ERROR);
    });
  });

  describe('AnnotationSummary class', function() {

    var summary = null;

    beforeEach(function() {
      var ac1 = new MetricalAnalyzer.AnnotationCollection();
      ac1.addWarning('heavy_beginning_w');
      var ac2 = new MetricalAnalyzer.AnnotationCollection();
      ac2.addError('short_rising');
      var ac3 = new MetricalAnalyzer.AnnotationCollection();
      summary = new MetricalAnalyzer.AnnotationSummary([ac1, ac2], ac3);
    });

    it('should report highest error level', function() {
      expect(summary.errorLevel).toBe(MetricalAnalyzer.ERROR_LEVEL_ERROR);
    });

    it('should sort items by error level', function() {
      expect(summary.annotations()[0].level).toBe(MetricalAnalyzer.ERROR_LEVEL_ERROR);
      expect(summary.annotations()[1].level).toBe(MetricalAnalyzer.ERROR_LEVEL_WARNING);
    });
  });
});