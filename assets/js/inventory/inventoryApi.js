var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('inventoryApi', ['$http', function ($http) {
    return {       
        searchFulfillmentCenters: function (criteria) {
            return $http.post('storefrontapi/fulfillmentcenters/search', criteria);
        },
      
    }
}]);
