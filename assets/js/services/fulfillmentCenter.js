var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('fulfillmentCenterService', ['$http', 'apiBaseUrl', function ($http, apiBaseUrl) {
    return {
        searchFulfillmentCenters: function (criteria) {
            return $http.post(apiBaseUrl + 'api/fulfillment/search/centers', criteria);
        },
        toAddress: function (fulfillmentCenter) {
            if (fulfillmentCenter) {
                return {
                    countryName: fulfillmentCenter.countryName,
                    countryCode: fulfillmentCenter.countryCode,
                    regionName: fulfillmentCenter.stateProvince,
                    city: fulfillmentCenter.city,
                    line1: fulfillmentCenter.line1,
                    line2: fulfillmentCenter.line2,
                    postalCode: fulfillmentCenter.postalCode,
                    phone: fulfillmentCenter.daytimePhoneNumber
                };
            }
        }
    };
}]);
