var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCheckoutDeliveryMethod', {
    templateUrl: "themes/assets/js/checkout/checkout-delivery-method.tpl.html",
    require: {
        checkoutStep: '^vcCheckoutWizardStep'
    },
    bindings: {
        deliveryMethod: '=',
        onEvalAvailability: '&',
        defaultMethodType: '<'
    },
    controller: ['$scope', 'dialogService', function ($scope, dialogService) {
        var ctrl = this;

        if (!ctrl.defaultMethodType) {
            ctrl.defaultMethodType = 'shipping';
        };

        this.$onInit = function () {
            ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            ctrl.checkoutStep.removeComponent(this);
        };
        this.evalAvailability = function () {
            ctrl.onEvalAvailability({ deliveryMethod: ctrl.deliveryMethod });
        }

        ctrl.validate = function () {
            return true;
        }

        ctrl.selectFulfillmentCenter = function () {
            var dialogInstance = dialogService.showDialog({ isFilter: true }, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
            dialogInstance.result.then(function (result) {
                ctrl.deliveryMethod.fulfillmentCenter = result;
                ctrl.evalAvailability();
            });
        };

        $scope.$watch('$ctrl.deliveryMethod', function () {
            if (ctrl.deliveryMethod) {
                ctrl.deliveryMethod.type = ctrl.deliveryMethod.type ? ctrl.deliveryMethod.type : ctrl.defaultMethodType;
            }
        }, true);
    }]
});
