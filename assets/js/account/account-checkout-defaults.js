angular.module('storefront.account')
    .component('vcAccountCheckoutDefaults', {
        templateUrl: "themes/assets/account-checkout-defaults.tpl.liquid",
        require: {
            accountManager: '^vcAccountManager'
        },
        controller: ['storefrontApp.mainContext', '$scope', 'cartService', 'loadingIndicatorService', 'checkoutDefaultService', 'customerService', function (mainContext, $scope, cartService, loader, checkoutDefaultService, customerService) {
            var $ctrl = this;
            $ctrl.loader = loader;
            $ctrl.defaults = checkoutDefaultService;
            $ctrl.deliveryMethods = [{ type: 'shipping' }, { type: 'pickup' }];
            $ctrl.customer = {};

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

            $ctrl.getAvailPaymentMethods().then(function (paymentMethods) {
                $ctrl.paymentMethods = paymentMethods;             
            });

            $ctrl.getAvailShippingMethods().then(function (shippingMethods) {
                $ctrl.shippingMethods = shippingMethods;          
            });

    
            customerService.getCurrentCustomer().then(function (response) {
                $ctrl.customer = response.data;             
            });

        
        }]
    });
