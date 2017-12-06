(function () {
  angular.module('reqsApp').controller("newRequisitionCtrl", newRequisitionCtrl);

  newRequisitionCtrl.$inject=['$location', 'requisitionData', 'authentication', 'accountData', 'userData', '$timeout'];

  function newRequisitionCtrl($location, requisitionData, authentication, accountData, userData, $timeout) {
    let vm = this;
    vm.editMode = false;
    vm.canSubmit = authentication.canSubmit();

    vm.removeLine = function(index) {
      vm.requisition.lines.splice(index,1);
      vm.updateTotal();
    };

    vm.updateTotal = function() {
      vm.requisition.total=0;
      for(let i in vm.requisition.lines){
        vm.requisition.total += vm.requisition.lines[i].unitPrice * vm.requisition.lines[i].qty;
      }
      vm.updateApprovers();
    };

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

    vm.updateAcct = function() {
      if(vm.requisition.orderType=='I') {
        vm.requisition.acct=vm.materialAccount._id;
        vm.account = vm.materialAccount;
        vm.updateApprovers();
      } else {
        vm.requisition.acct = undefined;
        vm.account = undefined;
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

    vm.switchToEditMode = function(){
      vm.editMode = true;
    };

    vm.submitReq = function(){
      vm.errorMsg = "";
      if(vm.requisition.vendor.num==undefined || vm.requisition.vendor.name == undefined) {
        vm.errorMsg = "Please select the vendor.\n";
      }
      if(vm.requisition.total <= 0) {
        vm.errorMsg += "The total can't be <= 0.\n";
      }
      if(vm.requisition.orderType=="N" && vm.requisition.acct==undefined) {
        vm.errorMsg += "For Non-Inventory items, you must select an account."
      }
      if(vm.errorMsg=="") {
        requisitionData.submitReq({
          submitterId: vm.currentUser._id,
          submitterName: vm.currentUser.name,
          vendorId: vm.requisition.vendor.num,
          vendorName: vm.requisition.vendor.name,
          dateRequired: vm.requisition.dateRequired,
          currency: vm.requisition.currency,
          orderType: vm.requisition.orderType,
          acct: vm.requisition.acct,
          lines: vm.requisition.lines,
          attachments: vm.requisition.attachments,
          comments: vm.requisition.comments,
          optApprovers: vm.requisition.optApprovers,
          optApprovals: vm.requisition.optApprovals,
          manApprovers: vm.requisition.manApprovers,
          manApprovals: vm.requisition.manApprovals
        }).then(function(data) {
          let req = data.data;
          vm.requisition._id = req._id;
          vm.showMessage("<span class='glyphicon glyphicon-ok'></span> <strong>Requisition# " + vm.requisition._id + "</strong> has been created!", "alert-success", function() {
            $location.path('/');
          })
        }, function(err) {
          vm.errorMsg=err;
        });
      }
    };

    vm.cancel = function() {
      $location.path('/');
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

    vm.getDelegatingUsers = function() {
      userData.getDelegatingUsers().then(function(data) {
        vm.delegatingUsers = data.data;
        vm.getMaterialAccount();
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
      }
      let fechaActual = new Date()
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
    };

    vm.getMaterialAccount = function() {
      accountData.getMaterialAccount("00-00-00000-0000").then(function(data) {
        vm.materialAccount = data.data;
        vm.account = vm.materialAccount;
        vm.requisition.acct = vm.account._id;
        console.log(vm.account);
        vm.updateApprovers();
      }, function(err) {
        console.log(err);
      });
    };

    vm.onAddAttachment = function(response) {
      let fileName = response.data.fileName;
      console.log(fileName);
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

    vm.currentUser = authentication.currentUser();
    vm.ums = ['BX','CS','CT','DZ','EA','FT','GM','HR','IN','KI','KT','LB','M','MM','PK','RE','RO','ST'];

    vm.getVendors();
    vm.getAccountsMin();
    vm.getDelegatingUsers();

    vm.requisition = {
      submitterId: vm.currentUser._id,
      submitterName: vm.currentUser.name,
      vendorid: 0,
      vendorName: "",
      status: 0,
      dateSubmitted: new Date(),
      dateRequired: new Date(),
      currency: "USD",
      orderType: "I",
      acct: "",
      comments: "",
      attachments:[],
      lines: [],
      total:0
    };
    vm.requisition.dateRequired.setDate(vm.requisition.dateRequired.getDate() + 7);
    vm.addLine();
  }
})();
