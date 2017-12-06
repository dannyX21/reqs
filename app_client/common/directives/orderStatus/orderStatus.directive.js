(function(){
  angular.module('reqsApp').directive('orderStatus',orderStatus);

  function orderStatus() {
    return {
      restrict: "EA",
      scope: {
        thisStatus: "=status"
      },
      templateUrl: "/common/directives/orderStatus/orderStatus.template.html"
    }
  }
})();
