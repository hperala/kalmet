import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';

import { AnalyzerService } from '../analyzer.service';
import { PlainTextDocument } from '../document';
import { PresentationalLine } from '../presentational-line';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styles: []
})
export class EditorComponent implements OnInit {
  @Input()
  set document(document: PlainTextDocument) {
    this._document = document;
    this.update();
  }
  @Output() textChanged: EventEmitter<string>;
  @Output() detailsButtonClicked: EventEmitter<PresentationalLine>;

  private presentationalLines: Array<PresentationalLine>;
  private _document: PlainTextDocument;
  
  constructor(private analyzerService: AnalyzerService) { 
    this.presentationalLines = [];
    this.textChanged = new EventEmitter<string>();
    this.detailsButtonClicked = new EventEmitter<PresentationalLine>();
  }

  get document(): PlainTextDocument {
    return this._document;
  }

  ngOnInit() {
  }

  onTextChanged() {
    this.update();
    this.textChanged.emit(this.document.text);
  }

  onDetailsButtonClicked(lineIndex) {
    this.detailsButtonClicked.emit(this.presentationalLines[lineIndex]);
  }

  trackByLines(index: number, line: PresentationalLine): number { 
    return line.id;
  }

  private update() {
    console.time('1');
    this.presentationalLines = this.analyzerService.analyze(this.document.text);
    console.timeEnd('1');
  }
}
