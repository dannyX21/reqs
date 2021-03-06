(function() {
  angular.module('reqsApp').controller('accountCtrl', accountCtrl);
  accountCtrl.$inject=['accountData', 'userData', '$routeParams', '$location', '$timeout', 'authentication'];

  function accountCtrl (accountData, userData, $routeParams, $location, $timeout, authentication) {
    let vm = this;

    vm.selectedItemChange = function(item) {
      vm.result = JSON.stringify(item);
    };

    vm.searchTextChange = function(query) {
      userData.getUsers(query).then(function(data) {
        vm.users = data.data;
        console.log(vm.users);
      }, function(err) {
        vm.users = [];
        console.log(err);
      });
    };

    vm.getAllUsers = function() {
      userData.getUsers().then(function(data) {
        vm.users = data.data;
        vm.users.map(function(user) {
          user._lowername = user.name.toLowerCase();
        });
        console.log(vm.users);
      }, function(err) {
        vm.users = [];
        console.log(err);
      });
    };

    vm.querySearch = function (query) {
      var results = query ? vm.users.filter(vm.createFilterFor(query)) : [];
      return results;
    };

    vm.createFilterFor = function(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(user) {
        return (user._lowername.indexOf(lowercaseQuery) >= 0) ||
            (user.username.indexOf(lowercaseQuery) >= 0);
      };
    };

    vm.transformChip = function(chip) {
      if(angular.isObject(chip)) {
        return chip;
      } else {
        return { name: chip, type: 'new'};
      }
    };

    vm.newRule = function() {
      vm.rule={
        optional:[],
        mandatory:[]
      };
      vm.rule.index = vm.account.length;
      if(vm.account.rules.length>0) {
        vm.rule.valueFrom = parseInt(vm.account.rules[vm.account.rules.length-1].valueTo) + 1;
      } else {
        vm.rule.valueFrom = 0;
      }
      vm.rule.valueTo = vm.rule.valueFrom + 1;
      $("#myModal").modal('show');
    };

    vm.addRule = function() {
      vm.account.rules.push(vm.rule);
    };

    vm.removeRule = function (index){
      if(index<vm.account.rules.length-1){
        vm.account.rules[index+1].valueFrom = vm.account.rules[index].valueFrom;
      }
      vm.account.rules.splice(index,1);
    };

    vm.cancel = function() {
      $location.path (vm.returnPage);
    };

    vm.showMessage = function(message, cls, callback) {
      vm.message = message;
      vm.messageClass = cls;
      vm.messageVisible = true;
      $timeout(function(){
        vm.messageVisible = false;
        callback();
      },3000);
    };

    vm.onCategoriaChange = function(){
      if(vm.account.categoria!=undefined) {
        vm.account.category = vm.account.categoria.id;
      }
      console.log("vm.account.category: " + vm.account.category);
    };

    vm.saveAccount = function() {
      accountData.updateAccount(vm.account._id, vm.account).then(function(data) {
        vm.account = data.data;
        vm.account.categoria = {
          id: vm.account.category
        };
        vm.showMessage("Account# " + vm.account.num + " (" + vm.account.name + ") has been updated!","alert-success", function(){
          $location.path(vm.returnPage);
        });
      }, function(err) {
        console.log(err);
      });
    };

    vm.getAllUsers();
    vm.throttle = 300;

    vm.categories = [
      {
        id: 0,
        name: "G & A Expense"
      },
      {
        id: 1,
        name: "Intercompany"
      },
      {
        id: 2,
        name: "Other factory overhead"
      }
    ];
    vm.returnPage = $location.search().page || '/';
    vm.messageVisible=false;
    vm.accountid = $routeParams.accountid;
    vm.currentUser = authentication.currentUser();
    accountData.getAccount(vm.accountid).then(function(data) {
      vm.account=data.data;
      vm.account.categoria = {
        id: vm.account.category
      }
    }, function (err) {
      console.log(err);
    });
  };
})();
