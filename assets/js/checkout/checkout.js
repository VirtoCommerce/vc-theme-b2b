//Call this to register our module to main application
var moduleName = "storefront.checkout";

if (storefrontAppDependencies != undefined) {
    storefrontAppDependencies.push(moduleName);
}
angular.module(moduleName, ['credit-cards', 'angular.filter'])
    .controller('checkoutController', ['$rootScope', '$scope', '$window', 'cartService', 'commonService', 'dialogService', 'orderService',
        function ($rootScope, $scope, $window, cartService, commonService, dialogService, orderService) {
            $scope.checkout = {
                wizard: {},
                order: {},
                deliveryAddress: {},
                paymentMethod: {},
                shipmentMethod: {},
                deliveryMethod: {},
                shipment: {},
                payment: {},
                coupon: {},
                availCountries: [],               
                loading: false,
                isValid: false,
                newAddress: {}
            };

            $scope.getInvoicePdf = function () {
                var url = $window.BASE_URL + 'storefrontapi/orders/' + $scope.checkout.order.number + '/invoice';
                $window.open(url, '_blank');
            }

            $scope.changeShippingMethod = function () {
                $scope.getAvailShippingMethods($scope.checkout.shipment).then(function (response) {
                    var dialogInstance = dialogService.showDialog({ availShippingMethods: response, checkout: $scope.checkout }, 'universalDialogController', 'storefront.select-shipment-method-dialog.tpl');
                    dialogInstance.result.then(function (shipmentMethod) {
                        $scope.selectShippingMethod(shipmentMethod);
                    });
                });
            };

            $scope.changePaymentMethod = function () {
                $scope.getAvailPaymentMethods().then(function (response) {
                    var dialogInstance = dialogService.showDialog({ availPaymentMethods: response, checkout: $scope.checkout }, 'universalDialogController', 'storefront.select-payment-method-dialog.tpl');
                    dialogInstance.result.then(function (paymentMethod) {
                        $scope.selectPaymentMethod(paymentMethod);
                    });
                });
            };

            $scope.changePickupAddress = function () {
                var dialogInstance = dialogService.showDialog({}, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
                dialogInstance.result.then(function (fulfillmentCenter) {
                    $scope.checkout.shipment.deliveryAddress = fulfillmentCenter.address;
                });
            };

            $scope.changeShippingAddress = function () {
                var dialogInstance = dialogService.showDialog({ checkout: $scope.checkout, addresses: $scope.checkout.cart.customer.addresses }, 'universalDialogController', 'storefront.select-address-dialog.tpl');
                dialogInstance.result.then(function (address) {
                    $scope.checkout.shipment.deliveryAddress = address;
                });
            };

            $scope.evalAvailability = function (deliveryMethod) {
                _.each($scope.checkout.cart.items, function (x) {
                    x.availability = {
                        deliveryMethod: deliveryMethod,
                        availDate: Date.now()
                    };
                });
            };

            $scope.changeItemQty = function (lineItem) {
                return wrapLoading(function () {
                    return cartService.changeLineItemsQuantity({ lineItemId: lineItem.id, Quantity: lineItem.quantity }).then($scope.reloadCart);
                });
            };

            $scope.removeItem = function (lineItem) {
                return wrapLoading(function () {
                    return cartService.removeLineItem(lineItem.id).then($scope.reloadCart);
                });
            };
            $scope.validateCheckout = function (checkout) {
                checkout.isValid = checkout.payment && checkout.payment.paymentGatewayCode;
                if (checkout.isValid && !checkout.billingAddressEqualsShipping) {
                    checkout.isValid = angular.isObject(checkout.payment.billingAddress);
                }
                if (checkout.isValid && checkout.cart && checkout.cart.hasPhysicalProducts) {
                    checkout.isValid = angular.isObject(checkout.shipment)
                        && checkout.shipment.shipmentMethodCode
                        && angular.isObject(checkout.shipment.deliveryAddress);
                }
            };

            $scope.reloadCart = function () {
                return cartService.getCart().then(function (response) {
                    var cart = response.data;

                    $scope.checkout.cart = cart;
                    if (cart.payments.length) {
                        $scope.checkout.payment = cart.payments[0];
                        $scope.checkout.paymentMethod.code = $scope.checkout.payment.paymentGatewayCode;
                        $scope.getAvailPaymentMethods().then(function (response) {
                            _.each(cart.payments, function (x) {
                                var paymentMethod = _.find(response, function (pm) { return pm.code == x.paymentGatewayCode; });
                                if (paymentMethod) {
                                    angular.extend(x, paymentMethod);
                                }
                            });
                        });
                    }
                    if (cart.shipments.length) {
                        $scope.checkout.shipment = cart.shipments[0];
                    }
                    else {
                        //Set default shipping address
                        if ($scope.checkout.cart.customer.addresses) {
                            $scope.checkout.shipment.deliveryAddress = $scope.checkout.cart.customer.addresses[0];
                        }
                    }
                    $scope.checkout.billingAddressEqualsShipping = cart.hasPhysicalProducts && !angular.isObject($scope.checkout.payment.billingAddress);

                    $scope.checkout.canCartBeRecurring = $scope.customer.isRegisteredUser && _.all(cart.items, function (x) { return !x.isReccuring });
                    $scope.checkout.paymentPlan = cart.paymentPlan && _.findWhere($scope.checkout.availablePaymentPlans, { intervalCount: cart.paymentPlan.intervalCount, interval: cart.paymentPlan.interval }) ||
                        _.findWhere($scope.checkout.availablePaymentPlans, { intervalCount: 1, interval: 'months' });

                    $scope.validateCheckout($scope.checkout);
                    return cart;
                });
            };

            $scope.selectPaymentMethod = function (paymentMethod) {
                angular.extend($scope.checkout.payment, paymentMethod);
                $scope.checkout.payment.paymentGatewayCode = paymentMethod.code;
                $scope.checkout.payment.amount = angular.copy($scope.checkout.cart.total);
                $scope.checkout.payment.amount.amount += paymentMethod.totalWithTax.amount;

                updatePayment($scope.checkout.payment);
            };

            function getAvailCountries() {
                //Load avail countries
                return commonService.getCountries().then(function (response) {
                    return response.data;
                });
            };

            $scope.checkout.getCountryRegions = $scope.getCountryRegions = function (country) {
                return commonService.getCountryRegions(country.code3).then(function (response) {
                    return response.data;
                });
            };

            $scope.getAvailShippingMethods = function (shipment) {
                return wrapLoading(function () {
                    return cartService.getAvailableShippingMethods(shipment.id).then(function (response) {
                        return response.data;
                    });
                });
            }

            $scope.getAvailPaymentMethods = function () {
                return wrapLoading(function () {
                    return cartService.getAvailablePaymentMethods().then(function (response) {
                        return response.data;
                    });
                });
            };

            $scope.selectShippingMethod = function (shippingMethod) {
                if (shippingMethod) {
                    $scope.checkout.shipment.shipmentMethodCode = shippingMethod.shipmentMethodCode;
                    $scope.checkout.shipment.shipmentMethodOption = shippingMethod.optionName;
                }
                else {
                    $scope.checkout.shipment.shipmentMethodCode = undefined;
                    $scope.checkout.shipment.shipmentMethodOption = undefined;
                }
                $scope.updateShipment($scope.checkout.shipment);
            };

            $scope.updateShipment = function (shipment) {
                if (shipment.deliveryAddress) {
                    $scope.checkout.shipment.deliveryAddress.type = 'Shipping';
                };
                //Does not pass validation errors to API
                shipment.validationErrors = undefined;
                return wrapLoading(function () {
                    return cartService.addOrUpdateShipment(shipment).then($scope.reloadCart);
                });
            };

            $scope.createOrder = function () {
                updatePayment($scope.checkout.payment).then(function () {
                    $scope.checkout.loading = true;
                    cartService.createOrder($scope.checkout.paymentMethod.card).then(function (response) {

                        var orderProcessingResult = response.data.orderProcessingResult;
                        var paymentMethod = response.data.paymentMethod;

                        orderService.getOrder(response.data.order.number).then(function (response) {
                            var order = response.data;                         
                            $scope.checkout.order = order;
                            handlePostPaymentResult(order, orderProcessingResult, paymentMethod);
                        });

                    });
                });
            };

            $scope.savePaymentPlan = function () {
                wrapLoading(function () {
                    return cartService.addOrUpdatePaymentPlan($scope.checkout.paymentPlan).then(function () {
                        $scope.checkout.cart.paymentPlan = $scope.checkout.paymentPlan;
                    });
                });
            };

            $scope.isRecurringChanged = function (isRecurring) {
                if ($scope.checkout.paymentPlan) {
                    if (isRecurring) {
                        $scope.savePaymentPlan();
                    } else {
                        wrapLoading(function () {
                            return cartService.removePaymentPlan().then(function () {
                                $scope.checkout.cart.paymentPlan = undefined;
                            });
                        });
                    }
                }
            };

            function updatePayment(payment) {
                if ($scope.checkout.billingAddressEqualsShipping) {
                    payment.billingAddress = undefined;
                }

                if (payment.billingAddress) {
                    payment.billingAddress.type = 'Billing';
                }
                return wrapLoading(function () {
                    return cartService.addOrUpdatePayment(payment).then($scope.reloadCart);
                });
            }

            function handlePostPaymentResult(order, orderProcessingResult, paymentMethod) {
                if (!orderProcessingResult.isSuccess) {
                    $scope.checkout.loading = false;
                    $rootScope.$broadcast('storefrontError', {
                        type: 'error',
                        title: ['Error in new order processing: ', orderProcessingResult.error, 'New Payment status: ' + orderProcessingResult.newPaymentStatus].join(' '),
                        message: orderProcessingResult.error,
                    });
                    return;
                }

                if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() == 'preparedform' && orderProcessingResult.htmlForm) {
                    $scope.outerRedirect($scope.baseUrl + 'cart/checkout/paymentform?orderNumber=' + order.number);
                } else if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() == 'redirection' && orderProcessingResult.redirectUrl) {
                    $window.location.href = orderProcessingResult.redirectUrl;
                } else {
                    if (!$scope.customer.isRegisteredUser) {
                        $scope.checkout.wizard.nextStep();
                        // $scope.outerRedirect($scope.baseUrl + 'cart/thanks/' + order.number);
                    } else {
                        $scope.checkout.wizard.nextStep();
                        // $scope.outerRedirect($scope.baseUrl + 'account#/orders/' + order.number);
                    }
                }
            }

            function wrapLoading(func) {
                $scope.checkout.loading = true;
                return func().then(function (result) {
                    $scope.checkout.loading = false;
                    return result;
                },
                    function () {
                        $scope.checkout.loading = false;
                    });
            }

            $scope.initialize = function () {

                $scope.reloadCart().then(function (cart) {
                    $scope.checkout.wizard.goToStep(cart.hasPhysicalProducts ? 'shipping-address' : 'payment-method');
                });
            };

            getAvailCountries().then(function (countries) {
                $scope.checkout.availCountries = countries;
            });

        }]);
