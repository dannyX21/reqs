(function(){
  angular.module('reqsApp').controller('userCtrl', userCtrl);
  userCtrl.$inject=['userData', 'authentication', '$routeParams', '$location'];
  function userCtrl (userData, authentication, $routeParams, $location) {
    let vm = this;
    vm.getUser = function() {
      userData.getUser(vm.userid).then(function(data) {
        vm.user = data.data;
        vm.user.delegateToU = vm.user.delegateTo ? {
          _id: vm.user.delegateTo._id
        } : undefined;
      }, function(err) {
        console.log(err);
      });
    };
    vm.getUsersList = function(){
      userData.getUsers().then(function(data) {
        vm.users = data.data;
      }, function(err) {
        console.log(err);
      });
    };

    vm.updateDelegateTo = function() {
      vm.user.delegateTo = vm.user.delegateToU._id;
    };

    vm.updateDelegateUntil = function() {
      if(vm.user.delegating) {
        vm.user.delegateUntil = new Date();
        vm.user.delegateUntil.setDate(vm.user.delegateUntil.getDate() + 7);
      } else {
        vm.user.delegateUntil = undefined;
        vm.user.delegateTo = undefined;
        vm.user.delegateToU = undefined;
      }
    };

    vm.updateUser = function() {
      userData.updateUser(vm.user).then(function(data) {
        vm.user = data.data;
        vm.user.delegateToU = {
          _id: vm.user.delegateTo
        };
        $location.path("/");
      }, function(err) {
        console.log(err);
      });
    };

    vm.userid = $routeParams.userid;
    vm.pageHeader = {
      title: "User profile"
    };
    if(authentication.isLoggedIn()) {
      vm.currentUser = authentication.currentUser();
    }
    vm.getUser();
    vm.getUsersList();
  }
})();
