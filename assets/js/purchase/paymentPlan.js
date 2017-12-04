var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcPaymentPlan', {
    templateUrl: "themes/assets/js/purchase/paymentPlan.tpl.html",
    bindings: {
        productId: '<'
    },
    controller: ['$scope', '$localStorage', function($scope, $localStorage) {
        var $ctrl = this;

        $scope.$watch(function() {
            return $ctrl.availablePaymentPlans;
        }, function (availablePaymentPlans) {
            if (availablePaymentPlans) {
                $ctrl.paymentPlan = ($localStorage['paymentPlans'] || { })[$ctrl.productId] ;
                $ctrl.type = $ctrl.paymentPlan ? 'auto-reorder' : 'one-time';
                $ctrl.paymentPlan = ($ctrl.paymentPlan ? _.findWhere($ctrl.availablePaymentPlans, { intervalCount: $ctrl.paymentPlan.intervalCount, interval: $ctrl.paymentPlan.interval }) : undefined) ||
                    _.findWhere($ctrl.availablePaymentPlans, { intervalCount: 1, interval: 'months' });
            }
        });

        $ctrl.save = function () {
            if (!$localStorage['paymentPlans']) {
                $localStorage['paymentPlans'] = { };
            }
            if ($ctrl.type === 'auto-reorder') {
                $localStorage['paymentPlans'][$ctrl.productId] = $ctrl.paymentPlan;
            } else {
                $localStorage['paymentPlans'][$ctrl.productId]  = undefined;
            }
        }
    }]
});
