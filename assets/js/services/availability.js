storefrontApp.service('availabilityService', ['$http', '$q', 'apiBaseUrl', function ($http, $q, apiBaseUrl) {
    return {
        getProductsAvailability: function (ids) {
            // return $http.post(apiBaseUrl + 'api/availabilty/product', ids);
            // mock
            var deferredData = $q.defer();
            deferredData.resolve({
                data: ids.map(function(id) {
                    return { productId: id, expectedArrival: Date.now(), availableSince: Date.now() };
                })
            });
            return deferredData.promise;
        }
    }
}]);
