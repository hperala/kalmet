angular.module('kalmetApp.services')
.factory('storage', [function() {
  'use strict';

  var KEY_PREFIX = 'kalmet.';
  var HEADERS_KEY = 'headers';
  var TEMP_HEADER_KEY = 'temp-text-header';
  var CURRENT_ID_KEY = 'current-id';
  var CONTENTS_KEY = 'contents.';
  var TEMP_CONTENTS_KEY = 'temp-text-contents';
  var MIN_ID = 1;
  var TEMP_ID = 0;
  var UNDEFINED_ID = -1;

  var theStorage = window.localStorage;

  function getJson(key) {
    var value = theStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    } else {
      return null;
    }
  }

  function currentIdKey() {
    return KEY_PREFIX + CURRENT_ID_KEY;
  }

  function headersKey() {
    return KEY_PREFIX + HEADERS_KEY;
  }

  function tempHeaderKey() {
    return KEY_PREFIX + TEMP_HEADER_KEY;
  }

  function contentKeyFromId(id) {
    return KEY_PREFIX + CONTENTS_KEY + id;
  }

  function contentKey(doc) {
    return contentKeyFromId(doc.header.id);
  }

  function tempContentKey() {
    return KEY_PREFIX + TEMP_CONTENTS_KEY;
  }

  function exists(headers, header) {
    return getHeaderById(headers, header.id) !== null;
  }

  function getHeaderById(headers, id) {
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].id === id) {
        return headers[i];
      }
    }
    return null;
  }

  function doCreate(headers, doc) {
    var id = nextAvailableId(headers);
    doc.header.id = id;
    addHeader(headers, doc.header);
    saveContent(doc);
  }

  function addHeader(headers, newHeader) {
    headers.push(newHeader);
    saveHeaders(headers);
  }

  function saveHeaders(headers) {
    var key = headersKey();
    theStorage.setItem(key, JSON.stringify(headers));
  }

  function saveTempHeader(header) {
    var key = tempHeaderKey();
    theStorage.setItem(key, JSON.stringify(header));
  }

  function saveContent(doc) {
    var key = contentKey(doc);
    theStorage.setItem(key, doc.text);
  }

  function saveTempContent(content) {
    var key = tempContentKey();
    theStorage.setItem(key, content);
  }

  function deleteHeader(headers, headerToDelete) {
    headers = headers.filter(function(val) {
      return val.id !== headerToDelete.id;
    });
    saveHeaders(headers);
  }

  function deleteContent(doc) {
    var key = contentKey(doc);
    theStorage.removeItem(key);
  }

  function nextAvailableId(headers) {
    var ids = headers.map(function(header) { return header.id; });
    var max = ids.reduce(function(previousValue, currentValue) {
      return Math.max(previousValue, currentValue);
    }, MIN_ID - 1);
    return max + 1;
  }

  function update(headers, doc) {
    var header = getHeaderById(headers, doc.header.id);
    copyMetadata(header, doc.header);
    saveHeaders(headers);
    saveContent(doc);
  }
  
  function copyMetadata(target, source) {
    target.title = source.title;
  }

  var storage = {
    lastError: null,

    DocumentHeader: function (title) {
      this.id = UNDEFINED_ID;
      this.title = title;
    },

    Document: function (header, text) {
      this.header = header;
      this.text = text;
    },

    setImplementation: function(newStorage) {
      theStorage = newStorage;
    },

    storageAvailable: function(storage) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
      try {
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        this.lastError = null;
        return true;
      } catch (e) {
        this.lastError = e.name;
        return false;
      }
    },
    
    clear: function() {
      theStorage.clear();
    },

    localStorageAvailable: function() {
      return this.storageAvailable(theStorage);
    },

    headers: function() {
      var key = headersKey();
      var headers = getJson(key);
      if (headers !== null) {
        return headers;
      } else {
        return [];
      }
    },

    create: function(doc) {
      doCreate(this.headers(), doc);
    },

    load: function(id) {
      var key = contentKeyFromId(id);
      var headers = this.headers();
      var header = getHeaderById(headers, id);
      if (header === null) {
        return null;
      }
      var text = theStorage.getItem(key);
      return new this.Document(header, text);
    },

    save: function(doc) {
      if (doc.header.id === TEMP_ID) {
        // For temp documents, saveTemp is used to save the document for the first time.  
        // Subsequent changes can be saved with the save method.
        this.saveTemp(doc);
      } else {
        var headers = this.headers();
        if (exists(headers, doc.header)) {
          update(headers, doc);
        } else {
          doCreate(headers, doc);
        }
      }
    },

    saveTemp: function(doc) {
      doc.header.id = TEMP_ID;
      saveTempHeader(doc.header);
      saveTempContent(doc.text);
    },

    delete: function(doc) {
      var headers = this.headers();
      if (exists(headers, doc.header)) {
        deleteHeader(headers, doc.header);
        deleteContent(doc);
      }
    },

    currentId: function() {
      var key = currentIdKey();
      var id = theStorage.getItem(key);
      if (id !== null) {
        return parseInt(id);
      } else {
        return null;
      }
    },

    setCurrentId: function(id) {
      var key = currentIdKey();
      theStorage.setItem(key, '' + id);
    }
  };

  return storage;
}]);