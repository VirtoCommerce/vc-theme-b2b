var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('inventoryController', ['$scope', 'dialogService', 'fulfillmentCenterService', function ($scope, dialogService, fulfillmentCenterService) {
    $inventory = this;
    $inventory.parentfulfillmentCenters = $scope.fulfillmentCenters;
    $inventory.currentfulfillmentCenter = $scope.currentfulfillmentCenter;

    $scope.searchFulfillmentCenters = function() {
        // fulfillmentCenterService.searchFulfillmentCenters({ searchPhrase: $scope.searchPhrase }).then(function(response) {
        //     $scope.fulfillmentCenters = response.data.results;
        // });
        //$scope.fulfillmentCenters = $inventory.parentfulfillmentCenters;
        $inventory.parentfulfillmentCenters.push({name: "branch1", selected: false},{ name: "branch2", selected: false});
        
    };

    $scope.selectFulfillmentCenter = function() {
        //dialogService.showDialog({ isFilter: true }, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
        $scope.searchFulfillmentCenters();
        $inventory.currentfulfillmentCenter = $inventory.parentfulfillmentCenters[0];
        $inventory.currentfulfillmentCenter.selected = true;
        //$scope.fulfillmentCenters = angular.copy($inventory.parentfulfillmentCenters); 
    };

    $scope.fulfillmentCenterToAddress = function (fulfillmentCenter) {
        return fulfillmentCenterService.toAddress(fulfillmentCenter);
    };
}]);
