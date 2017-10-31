var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcShippingType', {
    templateUrl: "themes/assets/js/common-components/shippingType.tpl.html",
    bindings: {
        isDropdown: '<',
        pickupMethodCode: "@"
    },
    controller: ['$scope', '$localStorage', 'storefrontApp.mainContext', 'dialogService', function($scope, $localStorage, mainContext, dialogService) {
        var $ctrl = this;
        $ctrl.shipmentType = $localStorage['shipmentType'];
        if (!$ctrl.shipmentType) {
            $ctrl.shipmentType = 'shipping';
            $ctrl.isChanging = true;
        }
        $ctrl.shipmentAddress = $localStorage['shipmentAddress'];
        $ctrl.shipmentFulfillmentCenter = $localStorage['shipmentFulfillmentCenter'];
        $scope.$watch(
            function() { return mainContext.customer; },
            function (customer) {
                if (customer) {
                    $ctrl.customer = customer;
                    if (!$ctrl.shipmentAddress && $ctrl.customer.defaultShippingAddress) {
                        $ctrl.shipmentAddress = { postalCode: $ctrl.customer.defaultShippingAddress.postalCode };
                    }
                }
            }
        );
        $ctrl.selectFulfillmentCenter = function () {
            var modalInstance = dialogService.showDialog(null, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
            modalInstance.result.then(function(fulfillmentCenter) {
                $ctrl.shipmentFulfillmentCenter = fulfillmentCenter;
                if (!$ctrl.isDropdown) {
                    $ctrl.save();
                }
            });
        };
        $ctrl.save = function (isDefined) {
            if (isDefined !== false) {
                $localStorage['shipmentType'] = $ctrl.shipmentType;
                if ($ctrl.shipmentType === 'shipping') {
                    $localStorage['shipmentAddress'] = $ctrl.shipmentAddress;
                } else {
                    $localStorage['shipmentFulfillmentCenter'] = $ctrl.shipmentFulfillmentCenter;
                }
            }
        }
    }]
});
