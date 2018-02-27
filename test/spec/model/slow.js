'use strict';
/* globals Hyphenation, MetricalAnalyzer */

describe('Hyphenation module', function() {
  var l = new Hyphenation.Language();
  var tempH = new Hyphenation.Hyphenation(l);
  var LIMIT = tempH.CONFIDENCE_HIATUS - 1;

  describe('Hyphenation class', function() {
    var h = new Hyphenation.Hyphenation(l);

    describe('syllabify method (PreStructuredText output)', function() {

      it('should have roughly the same performance if a large input is processed in pieces', function() {
        var input = '';
        var line = 'Vaka vanha Väinämöinen ';
        var numLines = 22000;
        for (var i = 0; i < numLines; i++) {
          input += line;
        }

        var begin1 = Date.now();
        h.syllabify(input).marked.toString(LIMIT, '-');
        var end1 = Date.now();
        var seconds1 = (end1 - begin1) / 1000;
        console.log('Processing ' + numLines + ' lines took ' + seconds1 + ' seconds');

        var begin2 = Date.now();
        for (i = 0; i < numLines; i++) {
          h.syllabify(line).marked.toString(LIMIT, '-');
        }
        var end2 = Date.now();
        var seconds2 = (end2 - begin2) / 1000;
        console.log('Processing ' + numLines + ' lines separately took ' + seconds2 + ' seconds');

        var ratio = seconds1 / seconds2;
        expect(ratio < 2).toBe(true);
        expect(ratio > .5).toBe(true);
      });
    });
  });
});

describe('MetricalAnalyzer module', function() {
  describe('analyze method', function() {
    var longInput = '';
    var line = 'Vaka vanha Väinämöinen ';
    var numLines = 22000;
    for (var i = 0; i < numLines; i++) {
      longInput += line + '\n';
    }

    it('should have roughly the same performance if a large input is processed in pieces', function() {
      var begin1 = Date.now();
      MetricalAnalyzer.analyze(longInput);
      var end1 = Date.now();
      var seconds1 = (end1 - begin1) / 1000;
      console.log('Analyzing ' + numLines + ' lines took ' + seconds1 + ' seconds');

      var begin2 = Date.now();
      for (var i = 0; i < numLines; i++) {
        MetricalAnalyzer.analyze(line);
      }
      var end2 = Date.now();
      var seconds2 = (end2 - begin2) / 1000;
      console.log('Analyzing ' + numLines + ' lines separately took ' + seconds2 + ' seconds');

      var ratio = seconds1 / seconds2;
      expect(ratio < 2).toBe(true);
      expect(ratio > .5).toBe(true);
    });

    it('should have linear time complexity', function() {
      var num1 = 100;
      var num2 = 10000;
      var input1 = '';
      var input2 = '';
      for (var i = 0; i < num1; i++) {
        input1 += line + '\n';
      }
      for (i = 0; i < num2; i++) {
        input2 += line + '\n';
      }

      var begin1 = Date.now();
      MetricalAnalyzer.analyze(input1);
      var end1 = Date.now();
      var seconds1 = (end1 - begin1) / 1000;
      console.log('Analyzing ' + num1 + ' lines separately took ' + seconds1 + ' seconds');

      var begin2 = Date.now();
      MetricalAnalyzer.analyze(input2);
      var end2 = Date.now();
      var seconds2 = (end2 - begin2) / 1000;
      console.log('Analyzing ' + num2 + ' lines separately took ' + seconds2 + ' seconds');

      var ratio = seconds2 / seconds1;
      expect(ratio < 200).toBe(true);
      expect(ratio > 50).toBe(true);
    });
  });
});

