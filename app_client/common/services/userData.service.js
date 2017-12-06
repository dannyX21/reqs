(function(){
  angular.module('reqsApp').service('userData', userData);
  userData.$inject = ['$http'];
  function userData($http) {
    let getUsers = function(query) {
      return query ? ($http.get('/api/users?query=' + query)) : ( $http.get('/api/users'));
    };

    let getDelegatingUsers = function() {
      return $http.get('/api/delegatingusers/');
    };

    let getUser = function(userid) {
      return $http.get('/api/user/' + userid);
    };

    let updateUser = function(user) {
      return $http.put('/api/user/' + user._id, user);
    };

    return {
      getUsers : getUsers,
      getDelegatingUsers: getDelegatingUsers,
      getUser : getUser,
      updateUser: updateUser
    };
  }
})();
