var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcShipmentType', {
    templateUrl: "themes/assets/js/components/purchase/shipmentType.tpl.html",
    bindings: {
        ctrl: '=',
        shipmentType: '<',
        shipmentAddress: '<',
        shipmentFulfillmentCenter: '<',
        onFulfillmentCenterSelection: '&',
        onChange: '&'
    },
    transclude: true,
    controllerAs: '$ctrl',
    controller: ['$scope', '$localStorage', 'storefrontApp.mainContext', 'dialogService', function($scope, $localStorage, mainContext, dialogService) {
        var $ctrl = this;
        $ctrl.ctrl = $ctrl;

        $ctrl.selectFulfillmentCenter = function () {
            var modalInstance = dialogService.showDialog({ searchPhrase: $ctrl.shipmentFulfillmentCenter ? $ctrl.shipmentFulfillmentCenter.postalCode : null }, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
            modalInstance.result.then(function(fulfillmentCenter) {
                $ctrl.shipmentFulfillmentCenter = fulfillmentCenter;
                if ($ctrl.onFulfillmentCenterSelection) {
                    $ctrl.onFulfillmentCenterSelection();
                }
            });
        };
        $ctrl.change = function () {
            if ($ctrl.shipmentType === 'shipping' && $ctrl.shipmentAddress || $ctrl.shipmentType === 'pickup' && $ctrl.shipmentFulfillmentCenter) {
                $ctrl.onChange({ shipmentType: $ctrl.shipmentType, shipmentTypeInfo: $ctrl.shipmentType === 'shipping' ? $ctrl.shipmentAddress : $ctrl.shipmentFulfillmentCenter });
            }
        }
    }]
});
