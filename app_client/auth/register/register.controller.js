(function () {
  angular.module('reqsApp').controller('registerCtrl', registerCtrl);
  registerCtrl.$inject=['$location','authentication'];

  function registerCtrl($location, authentication) {
    let vm = this;

    vm.pageHeader = {
      title: "Create a new account."
    };

    vm.credentials = {
      name: "",
      username: "",
      email: "",
      password: ""
    };

    console.log("returnPage:" + $location.search().page);
    vm.returnPage = $location.search().page || '/';

    vm.onSubmit = function() {
      vm.formError = "";
      if(!vm.credentials.name || !vm.credentials.username || !vm.credentials.email || !vm.credentials.password) {
        vm.formError = "All fields are required, please try again.";
        return false;
      } else {
        vm.doRegister();
      }
    };

    vm.doRegister = function() {
      vm.formError = "";
      authentication.register(vm.credentials).then(function(data) {
        $location.search('page', null);
        $location.path(vm.returnPage);
      }, function(err) {
        vm.formError = err;
      });
    };
  }
})();
