import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { DocumentHeader } from '../document';

@Component({
  selector: 'app-modal-open-doc',
  templateUrl: './modal-open-doc.component.html',
  styles: []
})
export class ModalOpenDocComponent implements OnInit {
  @Input() headers: Array<DocumentHeader>;
  @Output() documentChanged: EventEmitter<number>;

  constructor() {
    this.documentChanged = new EventEmitter<number>();
  }

  openDocument(id) {
    this.documentChanged.emit(id);
  }

  ngOnInit() {
  }

}
