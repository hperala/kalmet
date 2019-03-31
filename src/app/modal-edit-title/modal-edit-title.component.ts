import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { PlainTextDocument } from '../document';

@Component({
  selector: 'app-modal-edit-title',
  templateUrl: './modal-edit-title.component.html',
  styles: []
})
export class ModalEditTitleComponent implements OnInit {
  @Input() document: PlainTextDocument;
  @Output() titleChanged: EventEmitter<any>;
  @ViewChild('closeModal') closeModal: ElementRef;

  constructor() {
    this.titleChanged = new EventEmitter<any>();
  }

  onKeypress(event) {
    if (event.code === 'Enter') {
      this.closeModal.nativeElement.click();
      this.titleChanged.emit(null);
    }  
  }

  onOK() {
    this.titleChanged.emit(null);
  }

  ngOnInit() {
  }

}
