import { Injectable } from '@angular/core';

import { AnalyzerFacade } from './analysis/facade';
import { UiBuilder } from './extensions';
import { AnalysisWrapper, FifoCache, PresentationalLineFactory } from './analysis-wrapper';

@Injectable({
  providedIn: 'root'
})
export class AnalyzerService {
  private analysis: AnalysisWrapper;

  constructor() { 
    let builder: any = this;
    if (UiBuilder !== null) {
      builder = new UiBuilder();
    }
    this.analysis = builder.createAnalysisWrapper();
  }

  analyze(input) {
    return this.analysis.analyze(input);
  }

  createAnalysisWrapper() {
    const facade = new AnalyzerFacade();
    const cache = new FifoCache();
    const factory = new PresentationalLineFactory();
    return new AnalysisWrapper(facade, cache, factory);
  }
}
