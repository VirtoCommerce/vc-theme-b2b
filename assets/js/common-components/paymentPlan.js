var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcPaymentPlan', {
    templateUrl: "themes/assets/js/common-components/paymentPlan.tpl.html",
    bindings: {
        availablePaymentPlans: '<',
    },
    controller: [function() {
        var $ctrl = this;
        $ctrl.type = 'once';
        $ctrl.paymentPlan = $ctrl.availablePaymentPlans[0];
 
    }]
});
