var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('inventoryController', ['$scope', 'dialogService', 'fulfillmentCenterService', '$localStorage', function ($scope, dialogService, fulfillmentCenterService, $localStorage) {
    $inventory = this;
    $scope.fulfillmentCenters = [];
    $scope.currentFulfillmentCenter = $localStorage['selectedBranch'];
    $scope.widgetBranchUrl = null;
    

    $scope.searchFulfillmentCenters = function() {
        // fulfillmentCenterService.searchFulfillmentCenters({ searchPhrase: $scope.searchPhrase }).then(function(response) {
        //     $scope.fulfillmentCenters = response.data.results;
        // });
        $scope.fulfillmentCenters = [{name: "branch1", id: "1", city:"NY"},{ name: "branch2", id: "2", city:"Chicago"}];
    };

    $scope.selectFulfillmentCenter = function() {
        var dialogInstance = dialogService.showDialog({ isFilter: true }, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
        dialogInstance.result.then(function(result) {
            $scope.currentFulfillmentCenter = result;
            $localStorage['selectedBranch'] = $scope.currentFulfillmentCenter;
            $scope.switchTemplate();
        });
    };

    $scope.fulfillmentCenterToAddress = function (fulfillmentCenter) {
        return fulfillmentCenterService.toAddress(fulfillmentCenter);
    };

    $scope.switchTemplate = function () {
        if ($scope.currentFulfillmentCenter) {
            $scope.widgetBranchUrl = "selected-branch";
        } else {
            $scope.widgetBranchUrl = "unselected-branch";
        }
    }

    $scope.switchTemplate();
}]);
