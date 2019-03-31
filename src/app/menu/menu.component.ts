import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UiBuilder } from '../extensions';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styles: []
})
export class MenuComponent implements OnInit {
  @Output() newDocumentClicked: EventEmitter<string>;
  @Output() openDocumentClicked: EventEmitter<string>;
  @Output() deleteDocumentClicked: EventEmitter<string>;
  
  title = 'Kalevalamitan tarkistin';

  constructor() {
    this.newDocumentClicked = new EventEmitter<string>();
    this.openDocumentClicked = new EventEmitter<string>();
    this.deleteDocumentClicked = new EventEmitter<string>();

    if (UiBuilder !== null) {
      this.title = new UiBuilder().title;
    }
  }

  ngOnInit() {
  }

  onNewDocument() {
    this.newDocumentClicked.emit();
  }

  onOpenDocument() {
    this.openDocumentClicked.emit();
  }

  onDeleteDocument() {
    this.deleteDocumentClicked.emit();
  }
}
