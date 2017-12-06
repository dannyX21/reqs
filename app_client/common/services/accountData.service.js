(function() {
  angular.module("reqsApp").service('accountData', accountData);
  accountData.$inject=['$http'];
  function accountData($http) {
    let getAccount = function(accountid) {
      return $http.get("/api/accounts/" + accountid);
    };

    let getAccounts = function() {
      return $http.get("/api/accounts");
    };

    let getAccountsMin= function() {
      return $http.get("/api/accountsMin");
    };

    let getMaterialAccount = function(num) {
      return $http.get("/api/accountByNum/" + num);
    };

    let createAccount = function(account) {
      console.log(account);
      return $http.post("/api/accounts", account);
    };

    let updateAccount = function(accountid, account) {
      return $http.put("/api/accounts/" + accountid, account);
    }

    return {
      getAccount: getAccount,
      getMaterialAccount: getMaterialAccount,
      getAccounts : getAccounts,
      getAccountsMin : getAccountsMin,
      createAccount: createAccount,
      updateAccount: updateAccount
    };
  }
})();
