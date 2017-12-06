(function(){
  angular.module('reqsApp').service('requisitionData', requisitionData);
  requisitionData.$inject = ['$http','authentication']
  function requisitionData($http, authentication) {
    let submitReq = function(requisition) {
      console.log(requisition);
      requisition.submitterId = authentication.currentUser()._id;
      requisition.submitterName = authentication.currentUser().name;
      return $http.post('/api/requisitions', requisition, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };

    let readReq = function(requisitionid) {
      return $http.get('/api/requisitions/' + requisitionid, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };

    let approveReq = function(requisitionid, data) {
      data.status=2;
      return $http.put('/api/requisitions/' + requisitionid, data, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };

    let updateReq = function(requisitionid, data) {
      return $http.put('/api/requisitions/' + requisitionid, data, {
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    }

    let getReqs = function(submitterId, vendorId, po, startDate, endDate) {
      let URI = '/api/requisitions?submitterId=' +
      encodeURIComponent(submitterId) + "&vendorId=" +
      encodeURIComponent(vendorId) + "&po=" +
      encodeURIComponent(po) + "&startDate=" +
      encodeURIComponent(startDate) + "&endDate=" +
      encodeURIComponent(endDate);
      return $http.get(URI,{
        headers: {
          Authorization: 'Bearer ' + authentication.getToken()
        }
      });
    };

    let getVendors = function() {
      return $http.get('/api/vendors');
    }

    return {
      readReq: readReq,
      submitReq: submitReq,
      approveReq: approveReq,
      updateReq: updateReq,
      getReqs: getReqs,
      getVendors: getVendors
    };

  }
})();
