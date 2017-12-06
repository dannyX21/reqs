(function(){
  angular.module('reqsApp').directive('badgeQty', badgeQty);

  function badgeQty() {
    return {
      restrict: 'EA',
      scope: {
        thisQty: "=qty"
      },
      templateUrl: "/common/directives/badgeQty/badgeQty.template.html"
    };
  }
})();
