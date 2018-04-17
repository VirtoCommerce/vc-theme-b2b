var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('inventoryController', ['$scope', 'dialogService', 'fulfillmentCenterService', '$location', '$window', function ($scope, dialogService, fulfillmentCenterService, $location, $window) {
    $inventory = this;
    $inventory.inStock = false;
    $scope.customerId = "ss";
    $inventory.selectedFulfillmentCenter = null;
    
    $scope.searchFulfillmentCenters = function() {
        fulfillmentCenterService.searchFulfillmentCenters({ searchPhrase: $scope.searchPhrase }).then(function(response) {
            $scope.fulfillmentCenters = response.data.results;
        });
    };

    $inventory.selectFulfillmentCenter = function() {
        dialogService.showDialog({ isFilter: true }, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
    };

    $scope.fulfillmentCenterToAddress = function (fulfillmentCenter) {
        return fulfillmentCenterService.toAddress(fulfillmentCenter);
    };

    $inventory.queryInStock = function() {
        var sc = $scope;
        var inv = $inventory;
        // $location.search('branch', $inventory.query);
        // $location.search('id','123');
        // $window.location.reload();
    }

    $scope.$watch('inStock', function (newVal) {
        var sc = $scope;
    });
}]);
