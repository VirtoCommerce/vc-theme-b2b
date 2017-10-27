var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcPaymentPlan', {
    templateUrl: "themes/assets/js/common-components/paymentPlan.tpl.html",
    bindings: {
    },
    controller: ['$scope', '$localStorage', function($scope, $localStorage) {
        var $ctrl = this;

        $scope.$watch(function() {
            return $ctrl.availablePaymentPlans;
        }, function (availablePaymentPlans) {
            if (availablePaymentPlans) {
                $ctrl.paymentPlan = $localStorage['paymentPlan'];
                $ctrl.type = $ctrl.paymentPlan ? 'auto-reorder' : 'one-time';
                $ctrl.paymentPlan = ($ctrl.paymentPlan ? _.findWhere($ctrl.availablePaymentPlans, { intervalCount: $ctrl.paymentPlan.intervalCount, interval: $ctrl.paymentPlan.interval }) : undefined) ||
                    _.findWhere($ctrl.availablePaymentPlans, { intervalCount: 1, interval: 'months' });
            }
        });

        $ctrl.save = function() {
            if ($ctrl.type === 'auto-reorder') {
                $localStorage['paymentPlan'] = $ctrl.paymentPlan;
            } else {
                $localStorage['paymentPlan'] = undefined;
            }
        }
    }]
});
