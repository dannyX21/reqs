(function(){
  angular.module('reqsApp', ['ngRoute', 'ngSanitize', 'ngMaterial', 'ngMessages','angularMoment', 'lr.upload']);
  function config($routeProvider, $locationProvider, $httpProvider, ) { //Module config function to hold route definition.
  $locationProvider.hashPrefix('');
  $routeProvider
    .when('/', {
      templateUrl: "/home/home.view.html",
      controller: "homeCtrl",
      controllerAs: "vm"
    })
    .when('/requisition/:requisitionid', {
      templateUrl: "/requisition/requisition.view.html",
      controller: "requisitionCtrl",
      controllerAs: "vm"
    })
    .when('/new-requisition/', {
      templateUrl: "/requisition/requisition.view.html",
      controller: "newRequisitionCtrl",
      controllerAs: "vm"
    })
    .when('/accounts/:accountid', {
      templateUrl: "/account/newAccount.view.html",
      controller: 'accountCtrl',
      controllerAs: "vm"
    })
    .when('/accounts/', {
      templateUrl: "/account/accounts.view.html",
      controller: "accountsCtrl",
      controllerAs: "vm"
    })
    .when('/new-account/', {
      templateUrl: "/account/newAccount.view.html",
      controller: 'newAccountCtrl',
      controllerAs: 'vm'
    })
    .when('/register/', {
      templateUrl: "/auth/register/register.view.html",
      controller: "registerCtrl",
      controllerAs: "vm"
    })
    .when('/login/', {
      templateUrl: "/auth/login/login.view.html",
      controller: "loginCtrl",
      controllerAs: "vm"
    })
    .when('/user/:userid', {
      templateUrl: "/user/user.view.html",
      controller: 'userCtrl',
      controllerAs: "vm"
    })
    .otherwise({ redirectTo: '/'});
    $locationProvider.html5Mode(true);
}

angular.module('reqsApp').config(['$routeProvider','$locationProvider','$httpProvider', config]);
})();
