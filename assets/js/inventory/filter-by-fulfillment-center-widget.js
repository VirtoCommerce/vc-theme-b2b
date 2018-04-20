var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('filterByFulfillmentCenterWidget', {
    templateUrl: "themes/assets/js/inventory/filter-by-fulfillment-center-widget.tpl.html",
    bindings: {
    }, 
    controller: ['$scope', 'inventoryApi', 'dialogService', 'baseUrl', '$localStorage', function ($scope, inventoryApi, dialogService, baseUrl, $localStorage) {
        var ctrl = this;

        ctrl.baseUrl = baseUrl;
        this.$onInit = function () {
            ctrl.fulfillmentCenter = $localStorage['fulfillmentCenter'];
        };

        ctrl.selectFulfillmentCenter = function () {
            var dialogInstance = dialogService.showDialog({ isFilter: true }, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
            dialogInstance.result.then(function (result) {
                ctrl.fulfillmentCenter = result;
                $localStorage['fulfillmentCenter'] = result;
             });
        };
    }]
});
