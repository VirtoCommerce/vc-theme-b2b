var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcShippingType', {
    templateUrl: "themes/assets/js/common-components/shippingType.tpl.html",
    bindings: {
        customer: '=',
        shipment: '=',
        pickupMethodCode: "@",
        getAvailShippingMethods: '&',
        selectShippingMethod: '&'
    },
    controller: ['$scope', function($scope) {
        var $ctrl = this;
        $ctrl.type = $ctrl.shipment.shipmentMethodCode === $ctrl.pickupMethodCode ? 'shipping' : 'pickup';
        $ctrl.pickupShippingMethod = _.findWhere($ctrl.getAvailShippingMethods(), { code: $ctrl.pickupMethodCode });
        $ctrl.shipment.deliveryAddress = {
            countryName: 'N/A',
            city: 'N/A',
            postalCode: $ctrl.customer.defaultShippingAddress ? $ctrl.customer.defaultShippingAddress.postalCode : 'N/A',
            firstName: $ctrl.customer.firstName,
            lastName: $ctrl.customer.lastName
        }
        $ctrl.save = function() {
            if ($ctrl.type === 'shipping') {
                $ctrl.selectShippingMethod();
            } else {
                $ctrl.shipment.fulfillmentCenterId = $ctrl.fulfillmentCenter.id;
                $ctrl.shipment.fulfillmentCenterName = $ctrl.fulfillmentCenter.name;
                $ctrl.shipment.deliveryAddress = {
                    postalCode: $ctrl.fulfillmentCenter.postalCode,
                    countryName: $ctrl.fulfillmentCenter.countryName,
                    countryCode: $ctrl.fulfillmentCenter.countryCode,
                    stateProvince: $ctrl.fulfillmentCenter.stateProvince,
                    city: $ctrl.fulfillmentCenter.city,
                    line1: $ctrl.fulfillmentCenter.line1,
                    line2: $ctrl.fulfillmentCenter.line2,
                    firstName: customer.firstName,
                    lastName: customer.lastName
                }
                $ctrl.selectShippingMethod(pickupShippingMethod);
            }
        }
    }]
});
