// Create modules here, as this file is included before others

angular.module('kalmetApp', [
  'ngRoute',
  'ngSanitize',
  'kalmetApp.services'
])
.config(['$routeProvider', function($routeProvider) {
  return $routeProvider.when('/', {
    controller: 'TopCtrl'
  })
  .when('/teksti/:text', {
    controller: 'TopCtrl'
  })
  .otherwise({redirectTo: '/'});
}])
// $route service needs to be initiated because ng-view is not used
.run(function($route) {});

angular.module('kalmetApp.services', []);
