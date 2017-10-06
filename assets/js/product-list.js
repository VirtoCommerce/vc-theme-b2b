var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productListController', ['$scope', '$window', 'pricingService', function ($scope, $window, pricingService) {
    var $ctrl = this;

    $ctrl.loaded = false;
    $ctrl.prices = {};

    pricingService.getActualProductPrices($window.productList).then(function (response) {
        var prices = response.data;
        $ctrl.prices = _.object(_.map(prices, function(price) {
            return [price.productId, price];
        }));
        $ctrl.loaded = !!prices.length;
    });
}]);
