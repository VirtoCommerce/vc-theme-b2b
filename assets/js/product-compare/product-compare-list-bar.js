angular.module('storefrontApp')
    .component('productCompareListBar', {
        templateUrl: "product-compare-bar.tpl.html",
        controller: ['compareProductService', '$scope',
            function(compareProductService, $scope) {
                var $ctrl = this;
                $ctrl.$onInit = function() {
                    $ctrl.itemsCount = compareProductService.getProductsCount();
                }
                $scope.$on('productCompareListChanged', function(event, data) {
                    $ctrl.itemsCount = compareProductService.getProductsCount();
                });
            }]
    });
