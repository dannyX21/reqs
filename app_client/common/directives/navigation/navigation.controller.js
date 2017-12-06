(function() {
  angular.module('reqsApp').controller('navigationCtrl', navigationCtrl);
  navigationCtrl.$inject=['$location','authentication', '$route', 'userData'];
  function navigationCtrl($location, authentication, $route, userData) {
    let vm = this;

    vm.currentPath = $location.path();

    vm.isLoggedIn = authentication.isLoggedIn();

    vm.currentUser = authentication.currentUser();    

    vm.logout = function(){
      authentication.logout();
      $location.path("/");
      $route.reload();
    };
    vm.unDelegate = function() {
      vm.currentUser.delegating = false;
      vm.currentPath.delegateTo = undefined;
      vm.currentUser.delegateUntil = undefined;
      userData.updateUser(vm.currentUser).then(function(data) {
        vm.currentUser = data.data;
        authentication.logout();
        $location.path('/login');
      }, function(err) {
        console.log(err);
        $route.reload();
      })
    }
  };
})();
