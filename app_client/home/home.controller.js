(function(){
  angular.module('reqsApp').controller('homeCtrl', homeCtrl);
  homeCtrl.$inject = ['requisitionData','authentication', 'userData'];
  function homeCtrl(requisitionData,authentication, userData){
    let vm = this;
    vm.pageHeader = {
      title: "Requisitions"
    };

    vm.filterPanelUpdateIcon = function() {
      if(angular.element("#filterBody").hasClass('in')){
        vm.filterIcon="glyphicon glyphicon-chevron-down";
      } else {
        vm.filterIcon="glyphicon glyphicon-chevron-up";
      }      
    };

    vm.getRequisitions = function() {
      requisitionData.getReqs(vm.submitter._id, vm.vendor.num, vm.po, vm.startDate, vm.endDate).then(function(data) {
        let reqs = data.data;
        vm.submitted = [];
        vm.approved = [];
        vm.ordered = [];
        vm.completed = [];
        vm.rejected = [];
        vm.summary = {
          approved: [],
          ordered: [],
          forApproval: []
        };
        vm.totalSubmitted = 0;
        vm.totalApproved = 0;
        vm.totalOrdered = 0;
        vm.totalCompleted = 0;
        vm.totalRejected = 0;
        for(r in reqs) {
          switch (reqs[r].status) {
            case 1:
              vm.submitted.push(reqs[r]);
              vm.totalSubmitted+=reqs[r].total;
              let isApprover = false;
              for(let o in reqs[r].optApprovers) {
                if(vm.currentUser._id===reqs[r].optApprovers[o] && reqs[r].optApprovals[o]===0) {
                  vm.summary.forApproval.push(reqs[r]);
                  isApprover = true;
                }
              }
              if(!isApprover) {
                for(let m in reqs[r].manApprovers) {
                  if(vm.currentUser._id===reqs[r].manApprovers[m] && reqs[r].manApprovals[m]===0) {
                    vm.summary.forApproval.push(reqs[r]);
                    isApprover = true;
                  }
                }
              }
              break;
            case 2:
              vm.approved.push(reqs[r]);
              if(vm.currentUser._id==reqs[r].submitterId) {
                vm.summary.approved.push(reqs[r]);
              }
              vm.totalApproved+=reqs[r].total;
              break;
            case 3:
              vm.ordered.push(reqs[r]);
              if(vm.currentUser._id==reqs[r].submitterId) {
                vm.summary.ordered.push(reqs[r]);
              }
              vm.totalOrdered+=reqs[r].total;
              break;
            case 4:
              vm.completed.push(reqs[r]);
              vm.totalCompleted+=reqs[r].total;
              break;
            case -2:
              vm.rejected.push(reqs[r]);
              vm.totalRejected+=reqs[r].total;
              break;
          }
        }
      }, function(err) {
        console.log(err);
      });
    };

    vm.getVendors = function() {
      requisitionData.getVendors().then(function(data) {
        vm.vendors = [
          {
            num: -1,
            name: "ALL"
          }
        ];
        vm.vendors =  vm.vendors.concat(data.data);
        vm.vendor=vm.vendors[0];
        vm.getRequisitions();
      }, function(err) {
        console.log(err);
      });
    };
    vm.getUsers = function() {
      userData.getUsers().then(function(data) {
        vm.submitters = [
          {
            _id: -1,
            name: "ALL"
          }
        ];
        vm.submitters = vm.submitters.concat(data.data);
        vm.submitter = vm.submitters[0];
        vm.getVendors();
      })
    };
    vm.currentUser=authentication.currentUser();
    if(vm.currentUser) {
      vm.getUsers();
      vm.startDate = new Date();
      vm.startDate.setDate(vm.startDate.getDate() - 30);
      vm.endDate = new Date();
      vm.po="";
      vm.filterIcon="glyphicon glyphicon-chevron-down";
    }
  }
})();
