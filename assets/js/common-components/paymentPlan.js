var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcPaymentPlan', {
    templateUrl: "themes/assets/js/common-components/paymentPlan.tpl.html",
    bindings: {
        availablePaymentPlans: '<',
        paymentPlan: '=',
    },
    controller: [function() {
        var $ctrl = this;       
    }]
});
