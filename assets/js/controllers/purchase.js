var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('purchaseController', ['$scope', '$localStorage', 'storefrontApp.mainContext', function ($scope, $localStorage, mainContext) {

    $scope.loadPaymentPlan = function(availablePaymentPlans, objectType, objectId) {
        $scope.availablePaymentPlans = availablePaymentPlans;
        $scope.paymentPlan = (($localStorage['paymentPlans'] || { })[objectType] || { })[objectId];
        $scope.paymentPlanType = $scope.paymentPlan ? 'auto-reorder' : 'one-time';
        $scope.paymentPlan = ($scope.paymentPlan ? _.findWhere(availablePaymentPlans, { intervalCount: $scope.paymentPlan.intervalCount, interval: $scope.paymentPlan.interval }) : undefined) ||
            _.findWhere($scope.availablePaymentPlans, { intervalCount: 1, interval: 'months' });
    };

    $scope.updatePaymentPlan = function(objectType, objectId, paymentPlanType, paymentPlan) {
        if (!$localStorage['paymentPlans']) {
            $localStorage['paymentPlans'] = { };
        }
        if (!$localStorage['paymentPlans'][objectType]) {
            $localStorage['paymentPlans'][objectType] = { };
        }
        $scope.paymentPlanType = paymentPlanType;
        if (paymentPlanType === 'auto-reorder') {
            $localStorage['paymentPlans'][objectType][objectId] = paymentPlan;
            $scope.paymentPlan = paymentPlan;
        } else {
            $localStorage['paymentPlans'][objectType][objectId] = undefined;
            $scope.paymentPlan = undefined;
        }
    };

    $scope.shipmentType = $localStorage['shipmentType'] || 'shipping';
    $scope.shipmentAddress = $localStorage['shipmentAddress'];
    $scope.shipmentFulfillmentCenter = $localStorage['shipmentFulfillmentCenter'];
    if ($scope.shipmentFulfillmentCenter) {
        $scope.shipmentFulfillmentCenterAddress = $scope.shipmentFulfillmentCenter.address;
    }

    $scope.$watch(
        function () { return mainContext.customer; },
        function (customer) {
            if (customer) {
                if (!$scope.shipmentAddress && customer.defaultShippingAddress) {
                    $scope.shipmentAddress = { postalCode: customer.defaultShippingAddress.postalCode };
                }
            }
        }
    );

    $scope.updateShipmentType = function(shipmentType, shipmentTypeInfo) {
        $localStorage['shipmentType'] = shipmentType;
        $scope.shipmentType = shipmentType;
        if (shipmentType === 'shipping') {
            $localStorage['shipmentAddress'] = shipmentTypeInfo;
            $scope.shipmentAddress = shipmentTypeInfo;
        } else {
            $localStorage['shipmentFulfillmentCenter'] = shipmentTypeInfo;
            $scope.shipmentFulfillmentCenter = shipmentTypeInfo;
            $scope.shipmentFulfillmentCenterAddress = fulfillmentCenterService.address;
        }
    };
}]);
