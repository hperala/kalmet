import { TestBed } from '@angular/core/testing';

import { AnalyzerService } from './analyzer.service';

describe('AnalyzerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AnalyzerService = TestBed.get(AnalyzerService);
    expect(service).toBeTruthy();
  });
});
