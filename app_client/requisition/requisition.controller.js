(function () {
  angular.module('reqsApp').controller("requisitionCtrl", requisitionCtrl);

  requisitionCtrl.$inject = ['$routeParams','$location','requisitionData','authentication', 'accountData', 'userData', '$timeout'];

  function requisitionCtrl($routeParams, $location, requisitionData,authentication, accountData, userData, $timeout) {
    let vm = this;

    vm.addLine = function() {
      let line = {
        ln:vm.requisition.lines.length + 1,
        pn:"",
        desc:"",
        um: "EA",
        rev: "",
        qty: 0,
        unitPrice: 0
      }
      vm.requisition.lines.push(line);
    };

    vm.removeLine = function(index) {
      vm.requisition.lines.splice(index,1);
      vm.updateTotal();
    };

    vm.updateTotal = function() {
      vm.requisition.total=0;
      for(i in vm.requisition.lines){
        vm.requisition.total += vm.requisition.lines[i].unitPrice * vm.requisition.lines[i].qty;
      }
      vm.updateApprovers();
    };

    vm.showItems = function() {
      let result = "";
      for(let c = 0; c< vm.requisition.items.length; c++) {
        result += "ln: " + vm.requisition.items[c].ln + ", pn: " + vm.requisition.items[c].pn + ", description: " + vm.requisition.items[c].desc + ", um: " + vm.requisition.items[c].um + ", qty: " + vm.requisition.items[c].qty +"\n";
      }
      alert(result);
    };

    vm.updateConfirmedDate = function() {
      for(let c=0;c<vm.requisition.lines.length; c++)
      {
        vm.requisition.lines[c].dateConfirmed = vm.confirmedDate;
      }
    };

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

    vm.setAcct = function() {
      vm.requisition.acct = vm.account._id;
      accountData.getAccount(vm.requisition.acct).then(function(data) {
        vm.account = data.data;
        vm.updateApprovers();
      }, function(err) {
        console.log(err);
      });
    };

    vm.updateAcct = function() {
      if(vm.requisition.orderType=='I') {
        vm.requisition.acct=vm.materialAccount._id;
        vm.account = vm.materialAccount;
      }
    };

    vm.showRequisition = function () {
      let req = JSON.stringify(vm.requisition);
      alert(req);
      vm.requisition.status = 1;
    };

    vm.approveRequisition = function() {
      // vm.requisition.status = 2;
      // vm.requisition.dateApproved = new Date();
      //
      // if(vm.requisition.dateRejected) {
      //   vm.requisition.dateRejected=undefined;
      //   vm.requisition.rejecter=undefined;
      // }
      // requisitionData.approveReq(vm.requisition._id, vm.requisition).then(function(data) {
      //   vm.requisition = data.data;
      //   vm.editMode = false;
      //
      //   vm.correctVendor(vm.requisition.vendorId, vm.requisition.vendorName);
      //   $location.path('/');
      // }, function(err) {
      //   console.log(err);
      // });
      let totOptApprovers = 0;
      let totManApprovers = 0;
      for(let c=0; c<vm.requisition.optApprovers.length;c++){
        if(vm.currentUser._id===vm.requisition.optApprovers[c]._id) {
          vm.requisition.optApprovals[c]=1;
        }
        if(vm.requisition.optApprovals[c]===1){
          totOptApprovers++;
        }
      }
      for(let c=0; c<vm.requisition.manApprovers.length;c++){
        if(vm.currentUser._id===vm.requisition.manApprovers[c]._id) {
          vm.requisition.manApprovals[c]=1;
        }
        if(vm.requisition.manApprovals[c]===1){
          totManApprovers++;
        }
      }

      if((!vm.requisition.optApprovers || vm.requisition.optApprovers.length === 0 || totOptApprovers >=1) && (!vm.requisition.manApprovers || vm.requisition.manApprovers.length === 0 || totManApprovers === vm.requisition.manApprovers.length)) {
        vm.requisition.status = 2;
        vm.requisition.dateApproved = new Date();
        if(vm.requisition.dateRejected) {
          vm.requisition.dateRejected = undefined;
        }
      }
      vm.updateRequisition("<span class='glyphicon glyphicon-thumbs-up'></span> You have approved this requisition.", "alert-success", function(){
        $location.path('/');
      });
    };

    vm.rejectRequisition = function() {
      // vm.requisition.status = -2;
      // vm.requisition.rejecter = authentication.currentUser().name;
      // vm.requisition.dateRejected = new Date();
      // vm.requisition.dateApproved = undefined;
      // vm.editMode = false;
      // requisitionData.updateReq(vm.requisition._id, vm.requisition).then(function(data) {
      //   vm.requisition = data.data;
      //   vm.correctVendor(vm.requisition.vendorId, vm.requisition.vendorName);
      //   $location.path('/');
      // }, function(err){
      //   console.log(err);
      // });
      for(let c=0; c<vm.requisition.optApprovers.length;c++){
        if(vm.currentUser._id===vm.requisition.optApprovers[c]._id) {
          vm.requisition.optApprovals[c]=-1;
        }
      }
      for(let c=0; c<vm.requisition.manApprovers.length;c++){
        if(vm.currentUser._id===vm.requisition.manApprovers[c]._id) {
          vm.requisition.manApprovals[c]=-1;
        }
      }
      vm.requisition.status = -2;
      vm.requisition.dateRejected = new Date();
      vm.requisition.dateApproved = undefined;
      vm.editMode = false;
      vm.updateRequisition("<span class='glyphicon glyphicon-thumbs-down'></span> Requisition has been rejected.","alert-danger", function(){
        $location.path('/');
      });
    };

    vm.updateRequisition = function(message, cls, callback) {
      requisitionData.updateReq(vm.requisition._id, vm.requisition).then(function(data) {
        vm.requisition = data.data;
        vm.correctVendor(vm.requisition.vendorId, vm.requisition.vendorName);
      }, function(err) {
        console.log(err);
      });
      if(message==undefined) {
        message="<span class='glyphicon glyphicon-floppy-disk'></span> Changes have been saved succesfully.";
      }
      if(cls==undefined) {
        cls="alert-success"
      }
      vm.showMessage(message, cls, callback);
    };

    vm.correctVendor = function (vendorId, vendorName) {
      vm.requisition.vendor=  {
        num: vm.requisition.vendorId,
        name: vm.requisition.vendorName
      };
      vm.account = vm.requisition.acct;
      if(vm.requisition.dateConfirmed!=undefined) {
        vm.requisition.confirmed=true;
      }
    };

    vm.switchToEditMode = function(){
      vm.editMode = true;
      if(!vm.vendors) {
        vm.getVendors();
      }
      if(!vm.accounts) {
        vm.getAccountsMin();
      }
      if(!vm.materialAccount) {
        vm.getMaterialAccount();
      }
      if(!vm.delegatingUsers) {
        vm.getDelegatingUsers();
      }
    };

    vm.voidRequisition = function() {
      vm.requisition.status = -1;
      vm.updateRequisition("<span class='glyphicon glyphicon-ban-circle'></span> Requisition has been voided.", "alert-warning", function() {
        $location.path('/');
      });
    };

    vm.getVendors = function() {
      requisitionData.getVendors().then(function(data) {
        vm.vendors = data.data;
      }, function(err) {
        console.log(err);
      });
    };

    vm.getAccountsMin = function() {
      accountData.getAccountsMin().then(function(data) {
        vm.accounts = data.data;
      }, function(err) {
        console.log(err);
      });
    };

    vm.getMaterialAccount = function() {
      accountData.getMaterialAccount("00-00-00000-0000").then(function(data) {
        vm.materialAccount = data.data;
        vm.account = vm.materialAccount;
        vm.requisition.acct = vm.account._id;
      }, function(err) {
        console.log(err);
      });
    };

    vm.getDelegatingUsers = function() {
      userData.getDelegatingUsers().then(function(data) {
        vm.delegatingUsers = data.data;
      })
    };

    vm.updateApprovers = function() {
      for(let c=0; c<vm.account.rules.length; c++) {
        if(Math.round(vm.requisition.total) >= vm.account.rules[c].valueFrom && (Math.round(vm.requisition.total) <= vm.account.rules[c].valueTo || c === vm.account.rules.length-1)){
          vm.requisition.optApprovers = vm.account.rules[c].optional;
          vm.requisition.optApprovals = Array.apply(null, Array(vm.requisition.optApprovers.length)).map(Number.prototype.valueOf,0);
          vm.requisition.manApprovers = vm.account.rules[c].mandatory;
          vm.requisition.manApprovals = Array.apply(null, Array(vm.requisition.manApprovers.length)).map(Number.prototype.valueOf,0);
          break;
        }
        vm.canUserApprove();
      }
    };

    vm.canUserApprove = function() {
      let fechaActual = new Date();
      if(vm.delegatingUsers) {
        for(let x = 0; x < vm.delegatingUsers.length; x++) {
          if(vm.requisition.optApprovers) {
            for(let y=0; y<vm.requisition.optApprovers.length;y++) {
              if(vm.delegatingUsers[x]._id === vm.requisition.optApprovers[y]._id && fechaActual<= Date.parse(vm.delegatingUsers[x].delegateUntil))
              {
                vm.requisition.optApprovers[y] = vm.delegatingUsers[x].delegateTo;
              }
            }
          }
          if(vm.requisition.manApprovers){
            for(let z=0; z<vm.requisition.manApprovers.length;z++) {
              if(vm.delegatingUsers[x]._id === vm.requisition.manApprovers[z]._id && fechaActual<= Date.parse(vm.delegatingUsers[x].delegateUntil))
              {
                vm.requisition.manApprovers[z] = vm.delegatingUsers[x].delegateTo;
              }
            }
          }
        }
      }
      vm.canApprove = false;
      for(let x=0;x<vm.requisition.optApprovers.length;x++) {
        if(vm.currentUser._id === vm.requisition.optApprovers[x]._id) {
          vm.canApprove = true;
        }
      }
      for(let x=0;x<vm.requisition.manApprovers.length;x++) {
        if(vm.currentUser._id === vm.requisition.manApprovers[x]._id) {
          vm.canApprove = true;
        }
      }
    };

    vm.onAddAttachment = function(response) {
      let fileName = response.data.fileName;
      vm.requisition.attachments.push(fileName);
    };

    vm.showMessage = function(message, cls, callback) {
      vm.message = message;
      vm.messageClass = cls;
      vm.messageVisible = true;
      $timeout(function(){
        vm.messageVisible = false;
        if(callback) {
          callback();
        }
      },3000);
    };

    vm.editMode = false;
    if(authentication.isLoggedIn()) {
      vm.currentUser=authentication.currentUser();
    }
    vm.getVendors();
    vm.getAccountsMin();
    vm.getDelegatingUsers();
    vm.ums = ['BX','CS','CT','DZ','EA','FT','GM','HR','IN','KI','KT','LB','M','MM','PK','RE','RO','ST'];

    vm.requisitionid = $routeParams.requisitionid;
    requisitionData.readReq(vm.requisitionid).then(function(data) {
      vm.requisition = data.data;
      vm.correctVendor(vm.requisition.vendorId, vm.requisition.vendorName);
      vm.canUserApprove();
    }, function(err) {
      console.log(err);
    });
  }
})();
