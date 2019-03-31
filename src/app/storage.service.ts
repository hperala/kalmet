import { Injectable } from '@angular/core';
import { PlainTextDocument } from './document';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private static readonly KEY_PREFIX = 'kalmet.';
  private static readonly HEADERS_KEY = 'headers';
  private static readonly TEMP_HEADER_KEY = 'temp-text-header';
  private static readonly CURRENT_ID_KEY = 'current-id';
  private static readonly CONTENTS_KEY = 'contents.';
  private static readonly TEMP_CONTENTS_KEY = 'temp-text-contents';
  private static readonly MIN_ID = 1;
  private static readonly TEMP_ID = 0;

  lastError;
  private theStorage;
  
  constructor() {
    this.theStorage = window.localStorage;
    this.lastError = null;
  }

  setStorageApi(storageApi) {
    this.theStorage = storageApi;
  }

  storageAvailable(storageApi) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    try {
      const x = '__storage_test__';
      storageApi.setItem(x, x);
      storageApi.removeItem(x);
      this.lastError = null;
      return true;
    } catch (e) {
      this.lastError = e.name;
      return false;
    }
  }
  
  clear() {
    this.theStorage.clear();
  }

  localStorageAvailable() {
    return this.storageAvailable(this.theStorage);
  }

  headers() {
    var key = this.headersKey();
    var headers = this.getJson(key);
    if (headers !== null) {
      return headers;
    } else {
      return [];
    }
  }

  create(doc) {
    this.doCreate(this.headers(), doc);
  }

  load(id) {
    var key = this.contentKeyFromId(id);
    var headers = this.headers();
    var header = this.getHeaderById(headers, id);
    if (header === null) {
      return null;
    }
    var text = this.theStorage.getItem(key);
    return new PlainTextDocument(header, text);
  }

  save(doc) {
    if (doc.header.id === StorageService.TEMP_ID) {
      // For temp documents, saveTemp is used to save the document for the first time.  
      // Subsequent changes can be saved with the save method.
      this.saveTemp(doc);
    } else {
      var headers = this.headers();
      if (this.exists(headers, doc.header)) {
        this.update(headers, doc);
      } else {
        this.doCreate(headers, doc);
      }
    }
  }

  saveTemp(doc) {
    doc.header.id = StorageService.TEMP_ID;
    this.saveTempHeader(doc.header);
    this.saveTempContent(doc.text);
  }

  delete(doc) {
    var headers = this.headers();
    if (this.exists(headers, doc.header)) {
      this.deleteHeader(headers, doc.header);
      this.deleteContent(doc);
    }
  }

  currentId() {
    var key = this.currentIdKey();
    var id = this.theStorage.getItem(key);
    if (id !== null) {
      return parseInt(id);
    } else {
      return null;
    }
  }

  setCurrentId(id) {
    var key = this.currentIdKey();
    this.theStorage.setItem(key, '' + id);
  }

  private getJson(key) {
    var value = this.theStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    } else {
      return null;
    }
  }

  private currentIdKey() {
    return StorageService.KEY_PREFIX + StorageService.CURRENT_ID_KEY;
  }

  private headersKey() {
    return StorageService.KEY_PREFIX + StorageService.HEADERS_KEY;
  }

  private tempHeaderKey() {
    return StorageService.KEY_PREFIX + StorageService.TEMP_HEADER_KEY;
  }

  private contentKeyFromId(id) {
    return StorageService.KEY_PREFIX + StorageService.CONTENTS_KEY + id;
  }

  private contentKey(doc) {
    return this.contentKeyFromId(doc.header.id);
  }

  private tempContentKey() {
    return StorageService.KEY_PREFIX + StorageService.TEMP_CONTENTS_KEY;
  }

  private exists(headers, header) {
    return this.getHeaderById(headers, header.id) !== null;
  }

  private getHeaderById(headers, id) {
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].id === id) {
        return headers[i];
      }
    }
    return null;
  }

  private doCreate(headers, doc) {
    var id = this.nextAvailableId(headers);
    doc.header.id = id;
    this.addHeader(headers, doc.header);
    this.saveContent(doc);
  }

  private addHeader(headers, newHeader) {
    headers.push(newHeader);
    this.saveHeaders(headers);
  }

  private saveHeaders(headers) {
    var key = this.headersKey();
    this.theStorage.setItem(key, JSON.stringify(headers));
  }

  private saveTempHeader(header) {
    var key = this.tempHeaderKey();
    this.theStorage.setItem(key, JSON.stringify(header));
  }

  private saveContent(doc) {
    var key = this.contentKey(doc);
    this.theStorage.setItem(key, doc.text);
  }

  private saveTempContent(content) {
    var key = this.tempContentKey();
    this.theStorage.setItem(key, content);
  }

  private deleteHeader(headers, headerToDelete) {
    headers = headers.filter(function(val) {
      return val.id !== headerToDelete.id;
    });
    this.saveHeaders(headers);
  }

  private deleteContent(doc) {
    var key = this.contentKey(doc);
    this.theStorage.removeItem(key);
  }

  private nextAvailableId(headers) {
    var ids = headers.map(function(header) { return header.id; });
    var max = ids.reduce(function(previousValue, currentValue) {
      return Math.max(previousValue, currentValue);
    }, StorageService.MIN_ID - 1);
    return max + 1;
  }

  private update(headers, doc) {
    var header = this.getHeaderById(headers, doc.header.id);
    this.copyMetadata(header, doc.header);
    this.saveHeaders(headers);
    this.saveContent(doc);
  }
  
  private copyMetadata(target, source) {
    target.title = source.title;
  }
}
