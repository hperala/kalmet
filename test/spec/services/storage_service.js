'use strict';

describe('Storage service', function() {

  var storage;

  beforeEach(module('kalmetApp.services'));
  beforeEach(function() {
    inject(function($injector) {
      storage = $injector.get('storage');
    });

    window.localStorage.clear();
  });

  describe('currentId method', function() {

    it('should return null if storage is empty', function() {
      expect(storage.currentId()).toBeNull();
    });

    it('should get stored ID', function() {
      storage.setCurrentId(100);
      expect(storage.currentId()).toBe(100);
    });
  });
});