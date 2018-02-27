var defaultTitle = 'Nimetön teksti';
var tempTitle = 'Tilapäinen teksti';

angular.module('kalmetApp')
.controller('TopCtrl', ['$scope', '$routeParams', 'analyzer', 'storage', 
  function($scope, $routeParams, analyzer, storage) {
  'use strict';
  /* globals $ */

  var defaultDocs = [
    new storage.Document(
      new storage.DocumentHeader('Esimerkki 1'),
'Vanha vaka Väinämöinen,\n' +
'laulaja iän-aikainen,\n' +
'itse laululle rupesi,\n' +
'töille virtten työntelihe.'
    ),
    new storage.Document(
      new storage.DocumentHeader('Esimerkki 2'),
'Joko teen tikasta virren,\n' +
'pakinan tikan pojasta?\n' +
'Paljo on tikalla huolta\n' +
'ja paljo tikan pojalla\n' +
'syömisestä, juomisesta,\n' +
'henkensä pitämisestä.'
    )
  ];

  function decodeTextInUrl(encodedText) {
    return encodedText.replace(/\|/g, '\n');
  }

  if (storage.localStorageAvailable()) {
    if (storage.headers().length === 0) {
      for (var i = 0; i < defaultDocs.length; i++) {
        storage.create(defaultDocs[i]);
      }
    }
    var currentId = storage.currentId();
    if (currentId === null || storage.load(currentId) === null) {
      var headers = storage.headers();
      if (headers.length > 0) {
        currentId = headers[0].id;
        storage.setCurrentId(currentId);
      } else {
        window.alert('Tallennettujen tekstien lataamisessa tapahtui virhe.');
      }
    }
    analyzer.document = storage.load(currentId);
  } else {
    if (storage.lastError === 'NS_ERROR_FILE_CORRUPTED') {
      window.alert('Tekstien tallentaminen ei ole käytettävissä, koska selaimesi local storage' +
        ' -tallennustila näyttää olevan korruptoitunut. Selaimen historiatietojen poistaminen' +
        ' saattaa auttaa.');
    }
    analyzer.document = defaultDocs[0];
  }
  analyzer.updateAll();
  $scope.analyzerService = analyzer;

  $scope.openDialogHeaders = [];
  $scope.openDialogVisible = false;

  $scope.detailsDialogLine = {
    text: '',
    result: { 
      feet: []
    }
  };

  $scope.endEditingTitle = function() {
    storage.save(analyzer.document);
  };

  $scope.deleteDocument = function() {
    storage.delete(analyzer.document);
    storage.setCurrentId(null);
    if (storage.headers().length === 0) {
      $scope.newDocument();
    } else {
      var id = storage.headers()[0].id;
      $scope.openDocument(id);
    }
  };

  $scope.keyPressedEditingTitle = function(event) {
    if ((typeof event.key !== 'undefined' && event.key === 'Enter') ||
      (typeof event.keyCode !== 'undefined' && event.keyCode === 13)) {
      $scope.endEditingTitle();
      $('#modal-edit-title').modal('hide');
    }  
  };

  $scope.newDocument = function() {
    if (storage.localStorageAvailable()) {
      if (storage.localStorageAvailable()) {
        var doc = new storage.Document(new storage.DocumentHeader(defaultTitle), '');
        storage.create(doc);
        storage.setCurrentId(doc.header.id);
        analyzer.document = doc;
        analyzer.updateAll();
      }
    }
  };

  $scope.openDocumentSelector = function() {
    if (storage.localStorageAvailable()) {
      $scope.openDialogHeaders = storage.headers();
    }
  };

  $scope.openDocument = function(id) {
    if (storage.localStorageAvailable()) {
      storage.setCurrentId(id);
      analyzer.document = storage.load(id);
      analyzer.updateAll();
    }
  };

  $scope.openAsTempDocument = function(text) {
    var doc = new storage.Document(
      new storage.DocumentHeader(tempTitle),
      text);
    analyzer.document = doc;
    if (storage.localStorageAvailable()) {
      storage.saveTemp(doc);
      storage.setCurrentId(doc.header.id);
    }
    analyzer.updateAll();
  };

  $scope.openDetailsDialog = function(index) {
    $scope.detailsDialogLine = analyzer.presentationalLines[index];
  };

  $scope.textChanged = function() {
    if (storage.localStorageAvailable()) {
      storage.save(analyzer.document);
    }
    $scope.analyzerService.updateAll();
  };

  $scope.$on("$routeChangeSuccess", function(event, current) {
    if (typeof($routeParams.text) !== 'undefined') {
      $scope.openAsTempDocument(decodeTextInUrl($routeParams.text));
    }
  });
}]);