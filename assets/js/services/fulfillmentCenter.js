var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('fulfillmentCenterService', ['$location', '$http', 'apiBaseUrl', function($location, $http, apiBaseUrl) {
    return {
        searchFulfillmentCenters: function (criteria) {
            return $http.post(apiBaseUrl + 'api/fulfillment/search/centers', criteria);
        },
        toAddress: function (fulfillmentCenter) {
            var address = {};
            angular.extend(address, fulfillmentCenter);
            address.regionName = address.stateProvince;
            delete address.stateProvince;
            address.phone = address.daytimePhoneNumber;
            delete address.daytimePhoneNumber;
            delete address.name;
            delete address.pickDelay;
            delete address.maxReleasesPerPickBatch;
            return address;
        }
    };
}]);
