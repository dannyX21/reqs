(function(){
  angular.module('reqsApp').service('authentication',authentication);
  authentication.$inject=['$window','$http'];
  function authentication($window, $http) {
    let saveToken = function(token) {
      $window.localStorage['reqs-token'] = token;
    };

    let getToken = function() {
      return $window.localStorage['reqs-token'];
    };

    let register = function(user) {
      return $http.post('/api/register', user).then(function(data) {
        saveToken(data.data.token);
      }, function(err) {
        console.log(err);
      });
    };

    let login = function(user) {
      return $http.post('/api/login', user).then(function(data) {
        saveToken(data.data.token);
      }, function(err) {
        console.log(err);
      });
    };

    let logout = function() {
      $window.localStorage.removeItem('reqs-token');
    };

    let isLoggedIn = function() {
      let token = getToken();
      if(token) {
        let payload = JSON.parse($window.atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };

    let currentUser = function() {
      if(isLoggedIn()) {
        let token = getToken();
        let payload = JSON.parse($window.atob(token.split('.')[1]));
        return {
          _id: payload._id,
          name: payload.name,
          username: payload.username,
          email: payload.email,
          submit: payload.submit,
          approve: payload.approve,
          delegating: payload.delegating,
          delegateTo: payload.delegateTo,
          delegateUntil: payload.delegateUntil,
          admin: payload.admin
        };
      }
    };

    let canSubmit = function() {
      let user = currentUser();
      return user ? user.submit : false;
    };

    let canApprove = function() {
      let user = currentUser();
      return user ? user.approve : false;
    };

    let isAdmin = function() {
      let user = currentUser();
      return user ? user.admin : false;
    };

    return {
      saveToken: saveToken,
      getToken: getToken,
      register: register,
      login: login,
      logout: logout,
      isLoggedIn: isLoggedIn,
      currentUser: currentUser,
      canSubmit: canSubmit,
      canApprove: canApprove,
      isAdmin: isAdmin
    };
  }
})();
