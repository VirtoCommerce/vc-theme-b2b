var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('inventoryController', ['dialogService', 'commerceService', function (dialogService, commerceService) {
    var $ctrl = this;

    $ctrl.selectFulfillmentCenter = function() {
        dialogService.showDialog(null, 'inventoryController', 'select-fulfillment-center-dialog.tpl');
    };

    $ctrl.searchFulfillmentCenters = function() {
        commerceService.searchFulfillmentCenters({ searchPhrase: $ctrl.searchPhrase }).then(function(response) {
            $ctrl.fulfillmentCenters = response.data.results;
        });
    };
}]);
