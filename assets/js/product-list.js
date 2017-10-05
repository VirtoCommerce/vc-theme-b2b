var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productListController', ['$scope', '$window', 'pricingService', function ($scope, $window, pricingService) {
    var $ctrl = this;

    $ctrl.loaded = false;
    $ctrl.prices = [];

    pricingService.getActualProductPrices($window.productList).then(function (response) {
        var prices = response.data;
        if (prices.length) {
            for (var i = 0; i < prices.length; i++) {
                $ctrl.prices[prices[i].productId] = prices[i];
            }
        }
        var productListPricesSize = $scope.getObjectSize($ctrl.prices);
        $ctrl.loaded = productListPricesSize > 0;
    });
}]);
