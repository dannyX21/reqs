(function () {
  angular.module('reqsApp').controller('loginCtrl', loginCtrl);
  loginCtrl.$inject=['$location','authentication'];

  function loginCtrl($location, authentication) {
    let vm = this;

    vm.pageHeader = {
      title: "Sign in."
    };

    vm.credentials = {
      username: "",
      password: ""
    };

    vm.returnPage = $location.search().page || '/';

    vm.onSubmit = function() {
      vm.formError = "";
      if(!vm.credentials.username || !vm.credentials.password) {
        vm.formError = "All fields are required, please try again.";
        return false;
      } else {
        vm.doLogin();
      }
    };

    vm.doLogin = function() {
      vm.formError = "";
      authentication.login(vm.credentials).then(function(data) {
        $location.search('page', null);
        $location.path(vm.returnPage);
      }, function(err) {
        vm.formError = err;
      });
    };
  }
})();
