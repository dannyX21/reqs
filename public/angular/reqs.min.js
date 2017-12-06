(function(){
  angular.module('reqsApp', ['ngRoute', 'ngSanitize', 'ngMaterial', 'ngMessages','angularMoment']);
  function config($routeProvider, $locationProvider, $httpProvider, ) { //Module config function to hold route definition.
  $locationProvider.hashPrefix('');
  $routeProvider
    .when('/', {
      templateUrl: "public/home/home.view.html",
      controller: "homeCtrl",
      controllerAs: "vm"
    })
    .when('/requisition', {
      templateUrl: "public/requisition/requisition.view.html",
      controller: "requisitionCtrl",
      controllerAs: "vm"
    })
    .when('/requisition/new', {
      templateUrl: "public/requisition/requisition.view.html",
      controller: "newRequisitionCtrl",
      controllerAs: "vm"
    })
    .otherwise({ redirectTo: '/'});
    $locationProvider.html5Mode(true);
}

angular.module('reqsApp').config(['$routeProvider','$locationProvider','$httpProvider', config]);
})();

(function() {
  angular.module('reqsApp').directive('navigation', navigation);
  function navigation() {
    return {
      restrict: 'EA',
      templateUrl: 'public/common/directives/navigation/navigation.template.html',
      controller: "navigationCtrl as navvm"
    };
  }
})();

(function() {
  angular.module('reqsApp').controller('navigationCtrl', navigationCtrl);
  navigationCtrl.$inject=['$location'];
  function navigationCtrl($location) {
    let vm = this;
  };  
})();

(function() {
  angular.module('reqsApp').directive('pageHeader', pageHeader);
  function pageHeader() {
    return {
      restrict: 'EA',
      scope: {
        content: '=content'
      },
      templateUrl: 'public/common/directives/pageHeader/pageHeader.template.html'
    };
  }
})();

(function(){
  angular.module('reqsApp').directive('convertToNumber', convertToNumber);

  function convertToNumber() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function(val) {
          return val != null ? parseInt(val, 10) : null;
        });
        ngModel.$formatters.push(function(val) {
          return val != null ? '' + val : null;
        });
      }
    };
  };  
})();

(function(){
  angular.module('reqsApp').directive('badgeQty', badgeQty);

  function badgeQty() {
    return {
      restrict: 'EA',
      scope: {
        thisQty: "=qty"
      },
      templateUrl: "public/common/directives/badgeQty/badgeQty.template.html"
    };
  }  
})();

(function(){
  angular.module('reqsApp').directive('orderStatus',orderStatus);

  function orderStatus() {
    return {
      restrict: "EA",
      scope: {
        thisStatus: "=status"
      },
      templateUrl: "public/common/directives/orderStatus/orderStatus.template.html"
    }
  }
})();

(function () {
  angular.module('reqsApp').controller("requisitionCtrl", requisitionCtrl);
  function requisitionCtrl() {
    let vm = this;
    vm.vendors=[
      {
        id: 13157,
        name: "Kenta"
      },
      {
        id: 12612,
        name: "Berk-Tek"
      },
      {
        id: 12721,
        name: "Quabbin"
      }
    ]
    vm.accounts = ["01-40-54420-9100","01-40-54415-9100","01-40-70206-9100","01-40-54640-9100"];

    vm.requisition = {
      id: 1234,
      created: new Date(),
      submitter: "Daniel Lopez",
      status: 1,
      vendor: {
        id: 12612,
        name: "Berk-Tek"
      },
      dateRequired: new Date(),
      dateOrdered: undefined,
      dateConfirmed: undefined,
      currency: "USD",
      orderType: "N",
      acct: "01-40-54230-9100",
      items: [
        {
          ln:1,
          pn:"10300287",
          desc:"Cat6 UTP Blue",
          um: "FT",
          rev: "01",
          qty: 15000,
          unitPrice: 0.140
        },
        {
          ln:2,
          pn:"10300300",
          desc:"Cat6A UTP Blue",
          um: "FT",
          rev: "04",
          qty: 18000,
          unitPrice: 0.251
        }
      ]
    };
    vm.addItem = function() {
      let item = {
        ln:vm.requisition.items.length + 1,
        pn:"",
        desc:"",
        um: "EA",
        rev: "",
        qty: 0,
        unitPrice: 0
      }
      console.log(item);
      vm.requisition.items.push(item);
    };
    vm.ums = ["EA","FT","IN","KT","RE","LB"];

    vm.removeItem = function(index) {
      console.log(index);
      vm.requisition.items.splice(index,1);
      vm.updateTotal();
    };

    vm.updateTotal = function() {
      vm.requisition.total=0;
      for(i in vm.requisition.items){
        vm.requisition.total += vm.requisition.items[i].unitPrice * vm.requisition.items[i].qty;
      }
    };

    vm.showItems = function() {
      let result = "";
      for(let c = 0; c< vm.requisition.items.length; c++) {
        result += "ln: " + vm.requisition.items[c].ln + ", pn: " + vm.requisition.items[c].pn + ", description: " + vm.requisition.items[c].desc + ", um: " + vm.requisition.items[c].um + ", qty: " + vm.requisition.items[c].qty +"\n";
      }
      alert(result);
    }

    vm.updateConfirmedDate = function() {
      for(let c=0;c<vm.requisition.items.length; c++)
      {
        vm.requisition.items[c].dateConfirmed = vm.confirmedDate;
      }
    }

    vm.updateStatus = function() {
      if(vm.requisition.po!="" && vm.requisition.status==2) {
        vm.requisition.status = 3;
        vm.requisition.dateOrdered = new Date();
      } else if(vm.requisition.po=="" && vm.requisition.status>2) {
        vm.requisition.status = 2;
        vm.requisition.dateOrdered = undefined;
        if (vm.requisition.confirmed) {
          vm.requisition.confirmed = false;
          vm.requisition.dateConfirmed = undefined;
        }
      }
    };

    vm.updateConfirmed = function() {
      if(vm.requisition.confirmed) {
        vm.requisition.dateConfirmed = new Date();
        vm.requisition.status = 4;
      } else {
        vm.requisition.dateConfirmed = undefined;
        if (vm.requisition.po!=""){
          vm.requisition.status = 3;
        } else {
          vm.requisition.status = 2;
        }
      }
    };

    vm.showRequisition = function () {
      let req = JSON.stringify(vm.requisition);
      alert(req);
      vm.requisition.status = 1;
    };

    vm.approveRequisition = function() {
      vm.requisition.status = 2;
    };

    vm.rejectRequisition = function() {
      vm.requisition.status = -2;
    };

    vm.voidRequisition = function() {
      vm.requisition.status = -1;
    };

    vm.updateTotal();
  }

})();

(function () {
  angular.module('reqsApp').controller("newRequisitionCtrl", newRequisitionCtrl);

  newRequisitionCtrl.$inject=['$location'];

  function newRequisitionCtrl($location) {
    let vm = this;

    vm.removeItem = function(index) {
      vm.requisition.items.splice(index,1);
      vm.updateTotal();
    };

    vm.updateTotal = function() {
      vm.requisition.total=0;
      for(i in vm.requisition.items){
        vm.requisition.total += vm.requisition.items[i].unitPrice * vm.requisition.items[i].qty;
      }
    };

    vm.showItems = function() {
      let result = "";
      for(let c = 0; c< vm.requisition.items.length; c++) {
        result += "ln: " + vm.requisition.items[c].ln + ", pn: " + vm.requisition.items[c].pn + ", description: " + vm.requisition.items[c].desc + ", um: " + vm.requisition.items[c].um + ", qty: " + vm.requisition.items[c].qty +"\n";
      }
      console.log(result);
      alert(result);
    };

    vm.showRequisition = function () {
      let req = JSON.stringify(vm.requisition);
      alert(req);
      vm.requisition.status = 1;
    };

    vm.addItem = function() {
      let item = {
        ln:vm.requisition.items.length + 1,
        pn:"",
        desc:"",
        um: "EA",
        rev: "",
        qty: 0,
        unitPrice: 0
      }
      console.log(item);
      vm.requisition.items.push(item);
    };

    vm.cancel = function() {
      $location.path('/');
    };

    vm.ums = ["EA","FT","IN","KT","RE","LB"];

    vm.vendors=[
      {
        id: 13157,
        name: "Kenta"
      },
      {
        id: 12612,
        name: "Berk-Tek"
      },
      {
        id: 12721,
        name: "Quabbin"
      }
    ]
    vm.accounts = ["01-40-54420-9100","01-40-54415-9100","01-40-70206-9100","01-40-54640-9100"];

    vm.requisition = {
      id: undefined,
      created: new Date(),
      submitter: "Daniel Lopez",
      status: 0,
      vendor: {
        id: undefined,
        name: undefined
      },
      dateRequired: new Date(),
      currency: "USD",
      orderType: "I",
      items: [
        {
          ln:1,
          pn:"",
          desc:"",
          um: "EA",
          rev: "",
          qty: 0,
          unitPrice: 0
        }
      ]
    };
    vm.requisition.dateRequired.setDate(vm.requisition.dateRequired.getDate() + 7);
    vm.updateTotal();
  }
})();

(function(){
  angular.module('reqsApp').controller('homeCtrl', homeCtrl);
  function homeCtrl(){
    let vm = this;
    vm.pageHeader = {
      title: "Requisitions"
    };
    vm.submitted = [
      {
        id: 123,
        submitter: "Daniel Lopez",
        submitted: new Date(2017,9,25,15,43,22,0),
        vendorName: "Quabbin Cable",
        orderType: "I",
        total: 3452.23
      },
      {
        id: 124,
        submitter: "Jose Aceves",
        submitted: new Date(2017,9,25,16,43,12,0),
        vendorName: "Draka Elevator",
        orderType: "I",
        total: 12521.32
      },
      {
        id: 126,
        submitter: "Daniel Lopez",
        submitted: new Date(2017,9,26,7,31,14,0),
        vendorName: "ULINE",
        orderType: "N",
        total: 532.87
      },
      {
        id: 127,
        submitter: "Daniel Lopez",
        submitted: new Date(2017,9,26,22,30,14,0),
        vendorName: "ULINE",
        orderType: "N",
        total: 532.87
      }
    ];
    vm.approved = [
      {
        id: 120,
        submitter: "Jose Aceves",
        approvers: [
          {
            id: 23,
            name:"Deb Noll"
          }
        ],
        submitted: new Date(2017,9,25,12,37,2,0),
        approved: new Date(2017,9,26,7,13,25,0),
        vendorName: "Kenta",
        orderType: "I",
        total: 4867.34
      },
      {
        id: 121,
        submitter: "Jose Aceves",
        approvers: [
          {
            id: 20,
            name:"Derek Imchweiler"
          }
        ],
        submitted: new Date(2017,9,24,10,29,17,0),
        approved: new Date(2017,9,24,10,49,12,0),
        vendorName: "JingMao",
        orderType: "I",
        total: 6521.29
      },
      {
        id: 122,
        submitter: "Daniel Lopez",
        approvers: [
          {
            id: 23,
            name:"Deb Noll"
          },
          {
            id: 20,
            name:"Derek Imchweiler"
          }
        ],
        submitted: new Date(2017,9,26,11,30,41,0),
        approved: new Date(2017,9,26,12,53,1,0),
        vendorName: "Wing Cheong",
        orderType: "I",
        total: 754.16
      }
    ];
    vm.ordered = [
      {
        id: 117,
        po: "A20135",
        submitter: "Daniel Lopez",
        submitted: new Date(2017,9,23,10,7,2,0),
        ordered: new Date(2017,9,24,8,43,21,0),
        vendorName: "MAPISA",
        orderType: "I",
        total: 4674.19
      },
      {
        id: 118,
        po: "A20134",
        submitter: "Jose Aceves",
        submitted: new Date(2017,9,22,15,1,5,0),
        ordered: new Date(2017,9,22,16,29,56,0),
        vendorName: "Dunbar",
        orderType: "I",
        total: 31.29
      },
      {
        id: 119,
        po: "A20136",
        submitter: "Daniel Lopez",
        submitted: new Date(2017,9,21,11,3,1,0),
        ordered: new Date(2017,9,23,16,17,19,0),
        vendorName: "Staples Advantage",
        orderType: "N",
        total: 324.60
      },
      {
        id: 116,
        po: "A20138",
        submitter: "Daniel Lopez",
        submitted: new Date(2017,9,20,12,34,1,0),
        ordered: new Date(2017,9,21,7,21,0,0),
        vendorName: "Quabbin cable",
        orderType: "I",
        total: 4563.04
      }
    ];
    vm.completed = [
      {
        id: 105,
        po: "A20112",
        submitter: "Daniel Lopez",
        submitted: new Date(2017,9,20,12,7,2,0),
        confirmed: new Date(2017,9,22,9,43,21,0),
        vendorName: "ULINE",
        orderType: "I",
        total: 424.19
      },
      {
        id: 106,
        po: "A20113",
        submitter: "Jose Aceves",
        submitted: new Date(2017,9,21,7,1,5,0),
        confirmed: new Date(2017,9,22,15,29,56,0),
        vendorName: "Draka Elevator",
        orderType: "I",
        total: 3156.29
      },
      {
        id: 107,
        po: "A20114",
        submitter: "Daniel Lopez",
        submitted: new Date(2017,9,22,11,3,1,0),
        confirmed: new Date(2017,9,24,16,17,19,0),
        vendorName: "Buckeye business",
        orderType: "N",
        total: 324.60
      },
      {
        id: 108,
        po: "A20115",
        submitter: "Daniel Lopez",
        submitted: new Date(2017,9,20,14,54,1,0),
        confirmed: new Date(2017,9,21,9,29,0,0),
        vendorName: "Quabbin cable",
        orderType: "I",
        total: 453.04
      }
    ];
    vm.rejected = [
      {
        id: 98,
        submitter: "Daniel Lopez",
        submitted: new Date(2017,9,14,12,7,2,0),
        rejecter: "Deb Noll",
        rejected: new Date(2017,9,20,9,43,21,0),
        vendorName: "Global Industrial",
        orderType: "N",
        total: 46.19
      },
      {
        id: 102,

        submitter: "Jose Aceves",
        submitted: new Date(2017,9,11,7,1,5,0),
        rejecter: "Derek Imschweiler",
        rejected: new Date(2017,9,18,15,29,56,0),
        vendorName: "Draka Elevator",
        orderType: "I",
        total: 5456.29
      }
    ];
    vm.submitters = [
      {
        id: 1,
        name: "Jose Aceves"
      },
      {
        id: 2,
        name: "Daniel Lopez"
      }
    ];
    vm.vendors=[
      {
        id: 13157,
        name: "Kenta"
      },
      {
        id: 12612,
        name: "Berk-Tek"
      },
      {
        id: 12721,
        name: "Quabbin"
      }
    ];
  }
})();
