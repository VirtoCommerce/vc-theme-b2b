angular.module('storefront.account')
.component('vcAccountCheckoutDefaults', {
    templateUrl: "themes/assets/account-checkout-defaults.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefrontApp.mainContext', '$scope', 'cartService', 'loadingIndicatorService', 'checkoutDefaultService', 'customerService', function (mainContext, $scope, cartService, loader, checkoutDefaultService, customerService) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.paymentMethods = [];
        $ctrl.preferedPaymentMethod = {};
        $ctrl.shippingMethods = [];
        $ctrl.preferedShippingMethod = {};
        $ctrl.deliveryMethods = [{type:'shipping'}, {type:'pickup'}];
        $ctrl.deliveryMethod = {};
        $ctrl.customer = {};
        $ctrl.preferedAddress = {};

        function refresh() {
            var preferedPaymentMethodCode = checkoutDefaultService.GetPreferedPaymentMethod();
            var preferedShippingMethodCode = checkoutDefaultService.GetPreferedShippingMethod();
            var preferedDeliveryMethodCode = checkoutDefaultService.GetPreferedDeliveryMethod();
            var preferedAddress = checkoutDefaultService.GetPreferedAddress();

            $ctrl.getAvailPaymentMethods().then(function(paymentMethods) {
                $ctrl.paymentMethods = paymentMethods;
                if (preferedPaymentMethodCode) {
                    $ctrl.preferedPaymentMethod = _.findWhere($ctrl.paymentMethods, {code: preferedPaymentMethodCode});
                }
            });

            $ctrl.getAvailShippingMethods().then(function(shippingMethods) {
                $ctrl.shippingMethods = shippingMethods;
                if (preferedShippingMethodCode) {
                    $ctrl.preferedShippingMethod = _.findWhere($ctrl.shippingMethods, {shipmentMethodCode: preferedShippingMethodCode});
                }
            });

            if (preferedDeliveryMethodCode) {
                $ctrl.deliveryMethod = _.findWhere($ctrl.deliveryMethods, {type: preferedDeliveryMethodCode});
            }

            customerService.getCurrentCustomer().then(function(response) {
                $ctrl.customer = response.data;
                if (preferedAddress && $ctrl.customer.addresses) {
                    $ctrl.preferedAddress = _.findWhere($ctrl.customer.addresses, {name: preferedAddress});
                }
            });
            
            
        };

        $ctrl.getAvailPaymentMethods = function () {
            return cartService.getAvailablePaymentMethods().then(function (response) {
                return response.data;
            });
        };

        $ctrl.getAvailShippingMethods = function () {
            return cartService.getAvailableShippingMethods().then(function (response) {
                return response.data;
            });
        }

        $ctrl.submit = function(){
            if ($ctrl.preferedPaymentMethod) {
                checkoutDefaultService.SetPreferedPaymentMethod($ctrl.preferedPaymentMethod.code);
            }
            if ($ctrl.preferedShippingMethod) {
                checkoutDefaultService.SetPreferedShippingMethod($ctrl.preferedShippingMethod.shipmentMethodCode);
            }
            if ($ctrl.deliveryMethod) {
                checkoutDefaultService.SetPreferedDeliveryMethod($ctrl.deliveryMethod.type);
            }
            if ($ctrl.preferedAddress) {
                checkoutDefaultService.SetPreferedAddress($ctrl.preferedAddress.name);
            }
        }

        refresh();
    }]
});