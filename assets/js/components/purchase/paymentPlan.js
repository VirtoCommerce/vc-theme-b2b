var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcPaymentPlan', {
    templateUrl: "themes/assets/js/components/purchase/paymentPlan.tpl.html",
    bindings: {
        availablePaymentPlans: '<',
        paymentPlanType: '<',
        paymentPlan: '<',
        onChange: '&'
    },
    controller: [function() {
        var $ctrl = this;

        $ctrl.change = function() {
            $ctrl.onChange({ paymentPlanType: $ctrl.paymentPlanType, paymentPlan: $ctrl.paymentPlan });
        };
    }]
});
