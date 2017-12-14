var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('priceController', ['$scope', '$window', 'pricingService', 'loadingIndicatorService', function ($scope, $window, pricingService, loader) {
    $scope.loader = loader;
    loader.wrapLoading(function() {
        return pricingService.getActualProductPrices($window.products).then(function(response) {
            var prices = response.data;
            $scope.prices = _.object(_.map(prices, function(price) {
                return [price.productId, price];
            }));
            $scope.prices.length = response.data.length;
        });
    });
}]);
