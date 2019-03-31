import { Line, LineResult } from './result';
import { analysisConstants, Annotation, annotations } from "./analysis-defs";

describe('Result module', () => {

  describe('Line class', () => {

    const input1 = {
      words: [
        { 
          syllables: ['Mie', 'le', 'ni'], 
          precedingText: ''
        },
        { 
          syllables: ['mi', 'nun'],
          precedingText: ' '
        },
        { 
          syllables: ['te', 'ke', 'vi'],
          precedingText: ' '
        }
      ],
      followingText: ''
    };
    const input2 = {
      words: [
        {
          syllables: ['Tuop\''], 
          precedingText: ''
        },
        {
          syllables: ['on'], 
          precedingText: ' '
        },
        {
          syllables: ['van', 'ha'],
          precedingText: ' '
        },
        {
          syllables: ['Väi', 'nä', 'möi', 'nen'],
          precedingText: ' '
        }
      ],
      followingText: '!'
    };
    let l: Line;

    beforeEach(() => {
      l = new Line(input1);
    });
    
    it('should break the line into feet', () => {
      expect(l.toStringByFeet('-', '/')).toBe('Mie-le/ni mi/nun te/ke-vi');
    });
    
    it('should keep spaces between words when breaking the line into feet', () => {
      const line = new Line(input2);
      expect(line.toStringByFeet('-', '/')).toBe('Tuop\' on / van-ha / Väi-nä/möi-nen!');
    });

    it('should allow extra syllables in the first foot', () => {
      const longInput = {
        words: [
          { syllables: ['"Mi'], precedingText: '' },
          { syllables: ['si', 'nä'], precedingText: ' ' },
          { syllables: ['o', 'let'], precedingText: ' ' },
          { syllables: ['mie', 'hi', 'ä', 'si'], precedingText: ' ' },
        ],
        followingText: ','
      };
      const line = new Line(longInput);
      expect(line.toStringByFeet('-', '/')).toBe('"Mi si-nä / o-let / mie-hi/ä-si,');
    });

  });

  describe('LineResult class', () => {

    const input = {
      words: [{ syllables: [1, 1, 1], precedingText: '' }],
      followingText: ''
    };
    const complexInput = {
      words: [
        { syllables: [1, 1], precedingText: '' },
        { syllables: [1, 1], precedingText: '' },
        { syllables: [1, 1, 1], precedingText: '' },
        { syllables: [1], precedingText: '' }
      ],
      followingText: ''
    };
    let r: LineResult;

    beforeEach(() => {
      r = new LineResult(input);
    });
    
    it('should retrieve a stored annotation', () => {
      r.addAnnotationBySyllable(1, 'a');
      const annotations = r.getAnnotationsBySyllable(1);
      
      expect(annotations[0]).toBe('a');
    });

    it('should get annotations by syllable', () => {
      r.addAnnotationByWordAndSyllable(0, 1, 'a');
      const annotations = r.getAnnotationsBySyllable(1);
      
      expect(annotations.length).toBe(1);
      expect(annotations[0]).toBe('a');
    });

    it('should get annotations by word and syllable', () => {
      r.addAnnotationByWordAndSyllable(0, 1, 'a');
      const annotations = r.getAnnotationsByWordAndSyllable(0, 1);
      
      expect(annotations.length).toBe(1);
      expect(annotations[0]).toBe('a');
    });

    it('should store multiple annotations per syllable', () => {
      r.addAnnotationByWordAndSyllable(0, 1, 'a');
      r.addAnnotationByWordAndSyllable(0, 1, 'b');
      const annotations = r.getAnnotationsByWordAndSyllable(0, 1);
      
      expect(annotations.length).toBe(2);
      expect(annotations[0]).toBe('a');
      expect(annotations[1]).toBe('b');
    });

    it('should support lines with multiple words', () => {
      const lineResult = new LineResult(complexInput);
      lineResult.addAnnotationBySyllable(6, 'a');
      lineResult.addAnnotationBySyllable(7, 'b');

      let annotations = lineResult.getAnnotationsByWordAndSyllable(2, 2);
      expect(annotations[0]).toBe('a');
      annotations = lineResult.getAnnotationsByWordAndSyllable(3, 0);
      expect(annotations[0]).toBe('b');
    });

    it('should get annotations for the whole line', () => {
      r.addLineAnnotation('a');
      const annotations = r.getLineAnnotations();
      
      expect(annotations.length).toBe(1);
      expect(annotations[0]).toBe('a');
    });

    it('should return an empty list of groups when there are no annotations', () => {
      expect(r.getAnnotationsGrouped().length).toBe(0);
    });

    it('should include syllable annotations in groups', () => {
      r.addAnnotationByWordAndSyllable(0, 1, annotations['long_falling']);
      const groups = r.getAnnotationsGrouped();

      expect(groups.length).toBe(1);
      expect(groups[0].annotation).toBe(annotations['long_falling']);
      expect(groups[0].count).toBe(1);
    });

    it('should include line annotations in groups', () => {
      r.addLineAnnotation(annotations['too_short']);
      const groups = r.getAnnotationsGrouped();

      expect(groups.length).toBe(1);
      expect(groups[0].annotation).toBe(annotations['too_short']);
      expect(groups[0].count).toBe(1);
    });

    it('should count annotations in groups', () => {
      r.addAnnotationByWordAndSyllable(0, 0, annotations['long_falling']);
      r.addAnnotationByWordAndSyllable(0, 1, annotations['long_falling']);
      r.addAnnotationByWordAndSyllable(0, 2, annotations['short_rising']);
      const groups = r.getAnnotationsGrouped();

      expect(groups.length).toBe(2);
      expect(groups[0].annotation).toBe(annotations['short_rising']);
      expect(groups[0].count).toBe(1);
      expect(groups[1].annotation).toBe(annotations['long_falling']);
      expect(groups[1].count).toBe(2);
    });

    it('should sort groups by error level, then by sort key', () => {
      r.addAnnotationByWordAndSyllable(0, 0, annotations['long_falling']);
      r.addAnnotationByWordAndSyllable(0, 1, annotations['long_falling']);
      r.addAnnotationByWordAndSyllable(0, 2, annotations['short_rising']);
      r.addLineAnnotation(annotations['too_long']);
      const warning = new Annotation('x', Symbol(), analysisConstants.ERROR_LEVEL_WARNING, 10);
      r.addLineAnnotation(warning);
      const groups = r.getAnnotationsGrouped();

      expect(groups.length).toBe(4);
      expect(groups[0].annotation).toBe(annotations['too_long']);
      expect(groups[1].annotation).toBe(annotations['short_rising']);
      expect(groups[2].annotation).toBe(annotations['long_falling']);
      expect(groups[3].annotation).toBe(warning);
    });

    it('should report "OK" error level when there are no annotations', () => {
      expect(r.getLineErrorLevel()).toBe(analysisConstants.ERROR_LEVEL_NONE);
      expect(r.getErrorLevelBySyllable(0)).toBe(analysisConstants.ERROR_LEVEL_NONE);
      expect(r.getErrorLevelByWordAndSyllable(0, 0)).toBe(analysisConstants.ERROR_LEVEL_NONE);
    });

    it('should report highest error level', () => {
      r.addAnnotationByWordAndSyllable(0, 1, annotations['short_rising']);
      const warning = new Annotation('x', Symbol(), analysisConstants.ERROR_LEVEL_WARNING, 10);
      r.addAnnotationByWordAndSyllable(0, 1, warning);

      expect(r.getLineErrorLevel()).toBe(analysisConstants.ERROR_LEVEL_ERROR);
      expect(r.getErrorLevelBySyllable(1)).toBe(analysisConstants.ERROR_LEVEL_ERROR);
      expect(r.getErrorLevelByWordAndSyllable(0, 1)).toBe(analysisConstants.ERROR_LEVEL_ERROR);
    });

    it('should report line error level when highest', () => {
      const warning = new Annotation('x', Symbol(), analysisConstants.ERROR_LEVEL_WARNING, 10);
      r.addLineAnnotation(warning);

      expect(r.getLineErrorLevel()).toBe(analysisConstants.ERROR_LEVEL_WARNING);
    });

  });

});