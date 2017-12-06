(function() {
  angular.module('reqsApp').controller('accountsCtrl', accountsCtrl);
  accountsCtrl.$inject = ['accountData', 'authentication', '$location'];

  function accountsCtrl(accountData, authentication, $location) {
    let vm = this;
    accountData.getAccounts().then(function(data) {
      vm.accounts = data.data;
      console.log(vm.accounts);
    }, function(err) {
      console.log(err);
    });
  };

})();
