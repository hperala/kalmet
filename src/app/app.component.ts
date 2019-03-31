import { Component, ViewChild } from '@angular/core';

import { PlainTextDocument, createDefaultDocuments, DocumentHeader, createBlankDocument } from './document';
import { PresentationalLine } from './presentational-line';
import { StorageService } from './storage.service';
import { UiBuilder } from './extensions';
import { ModalDetailsComponent } from './modal-details/modal-details.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  @ViewChild(ModalDetailsComponent)
  private detailsComponent: ModalDetailsComponent;

  document: PlainTextDocument;
  documentHeaders: Array<DocumentHeader>;
  selectedLine: PresentationalLine;

  constructor(private storage: StorageService) {
    this.documentHeaders = [];
    this.selectedLine = null;

    if (UiBuilder !== null) {
      document.title = new UiBuilder().title;
    }

    this.loadDocument();
  }

  onTextChanged(newText: string) {
    this.saveDocument();
  }

  onDetailsButtonClicked(line: PresentationalLine) {
    this.detailsComponent.reset();
    this.selectedLine = line;
  }

  onCreateDocument() {
    this.createAndOpenDocument();
  }

  onDocumentTitleChanged() {
    this.saveDocument();
  }

  onOpenDocumentDialogOpened() {
    if (this.storage.localStorageAvailable()) {
      this.documentHeaders = this.storage.headers();
    }
  }

  onSelectedDocumentChanged(newID) {
    if (this.storage.localStorageAvailable()) {
      this.storage.setCurrentId(newID);
      this.document = this.storage.load(newID);
    }
  }

  onDeleteDocument() {
    if (this.storage.localStorageAvailable()) {
      this.storage.delete(this.document);
      this.storage.setCurrentId(null);
      const headers = this.storage.headers();
      if (headers.length === 0) {
        this.createAndOpenDocument();
      } else {
        this.openDocument(headers[0].id);
      }
    }
  }

  private loadDocument() {
    const defaultDocs = createDefaultDocuments();

    if (!this.storage.localStorageAvailable()) {
      if (this.storage.lastError === 'NS_ERROR_FILE_CORRUPTED') {
        window.alert('Tekstien tallentaminen ei ole käytettävissä, koska selaimesi local storage' +
          ' -tallennustila näyttää olevan korruptoitunut. Selaimen historiatietojen poistaminen' +
          ' saattaa auttaa.');
      }
      this.document = defaultDocs[0];
      return;
    }

    if (this.storageIsEmpty()) {
      this.createDocuments(defaultDocs);
    }

    let currentID = this.storage.currentId();
    if (this.invalidID(currentID)) {
      currentID = this.selectFirstDocument();
      if (currentID === null) {
        window.alert('Tallennettujen tekstien lataamisessa tapahtui virhe.');
        return;
      }
    }

    this.document = this.storage.load(currentID);
  }

  private saveDocument() {
    if (this.storage.localStorageAvailable()) {
      this.storage.save(this.document);
    }
  }

  private createDocuments(documents) {
    for (const document of documents) {
      this.storage.create(document);
    }
  }

  private storageIsEmpty() {
    return this.storage.headers().length === 0;
  }

  private invalidID(id) {
    return id === null || this.storage.load(id) === null;
  }

  private selectFirstDocument() {
    let currentID = null;

    var headers = this.storage.headers();
    if (headers.length > 0) {
      currentID = headers[0].id;
      this.storage.setCurrentId(currentID);
    }

    return currentID;
  }

  private createAndOpenDocument() {
    if (this.storage.localStorageAvailable()) {
      const doc = createBlankDocument();
      this.storage.create(doc);
      this.storage.setCurrentId(doc.header.id);
      this.document = doc;
    }
  }

  private openDocument(id) {
    if (this.storage.localStorageAvailable()) {
      this.storage.setCurrentId(id);
      this.document = this.storage.load(id);
    }
  }
}
