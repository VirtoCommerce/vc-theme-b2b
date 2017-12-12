var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('cartController', ['$rootScope', '$scope', '$timeout', 'cartService', 'catalogService', 'availabilityService', 'loadingIndicatorService', function ($rootScope, $scope, $timeout, cartService, catalogService, availabilityService, loader) {
    var timer;

    $scope.loader = loader;
    $scope.coupon = {};

    var reloadCart = $scope.reloadCart = function() {
        loader.wrapLoading(function() {
            return cartService.getCart().then(function(response) {
                var cart = response.data;
                cart.hasValidationErrors = _.some(cart.validationErrors) || _.some(cart.items, function(item) { return _.some(item.validationErrors) });
                $scope.cart = cart;

                var coupon = cart.coupon || $scope.coupon;
                coupon.loader = $scope.coupon.loader;
                $scope.coupon = coupon;
                if ($scope.coupon.code && !$scope.coupon.appliedSuccessfully) {
                    $scope.coupon.errorCode = 'InvalidCouponCode';
                }

                return availabilityService.getProductsAvailability(_.pluck(cart.items, 'productId')).then(function(response) {
                    $scope.availability = _.object(_.pluck(response.data, 'productId'), response.data);
                });
            });
        });
    };

    initialize();

    $scope.setCartForm = function (form) {
        $scope.formCart = form;
    }

    $scope.changeLineItemQuantity = function (lineItemId, quantity) {
        var lineItem = _.find($scope.cart.items, function (i) { return i.id == lineItemId });
        if (!lineItem || quantity < 1 || $scope.cartIsUpdating || $scope.loader.isLoading || $scope.formCart.$invalid) {
            return;
        }
        var initialQuantity = lineItem.quantity;
        lineItem.quantity = quantity;
        $timeout.cancel(timer);
        timer = $timeout(function () {
            $scope.cartIsUpdating = true;
            cartService.changeLineItemQuantity(lineItemId, quantity).then(function (response) {
                reloadCart();
                $rootScope.$broadcast('cartItemsChanged');
            }, function (response) {
                lineItem.quantity = initialQuantity;
                $scope.cartIsUpdating = false;
            });
        }, 300);
    }

    $scope.changeLineItemPrice = function (lineItemId, newPrice) {
    	var lineItem = _.find($scope.cart.items, function (i) { return i.id == lineItemId });
        if (!lineItem || $scope.cartIsUpdating || $scope.loader.isLoading) {
    		return;
    	}
    	$scope.cartIsUpdating = true;
    	cartService.changeLineItemPrice(lineItemId, newPrice).then(function (response) {
    		reloadCart();
    		$rootScope.$broadcast('cartItemsChanged');
    	}, function (response) {
    		$scope.cart.items = initialItems;
    		$scope.cartIsUpdating = false;
    	});
    };
    $scope.removeLineItem = function (lineItemId) {
        var lineItem = _.find($scope.cart.items, function (i) { return i.id == lineItemId });
        if (!lineItem || $scope.cartIsUpdating || $scope.loader.isLoading) {
            return;
        }
        $scope.cartIsUpdating = true;
        var initialItems = angular.copy($scope.cart.items);
        $scope.recentCartItemModalVisible = false;
        $scope.cart.items = _.without($scope.cart.items, lineItem);
        cartService.removeLineItem(lineItemId).then(function (response) {
            reloadCart();
            $rootScope.$broadcast('cartItemsChanged');
        }, function (response) {
            $scope.cart.items = initialItems;
            $scope.cartIsUpdating = false;
        });
    }

    $scope.clearCart = function() {
        loader.wrapLoading(function() {
            return cartService.clearCart().then(function() {
                reloadCart();
                $rootScope.$broadcast('cartItemsChanged');
            });
        });
    };

    $scope.submitCart = function () {
        $scope.formCart.$setSubmitted();
        if ($scope.formCart.$invalid) {
            return;
        }
        if ($scope.cart.hasPhysicalProducts) {
            $scope.outerRedirect($scope.baseUrl + 'cart/checkout');
        } else {
            $scope.outerRedirect($scope.baseUrl + 'cart/checkout');
        }
    }

    $scope.searchProduct = function () {
        $scope.productSearchResult = null;
        if ($scope.productSkuOrName) {
            $timeout.cancel(timer);
            timer = $timeout(function () {
                $scope.productSearchProcessing = true;
                var criteria = {
                    keyword: $scope.productSkuOrName,
                    start: 0,
                    pageSize: 5
                }
                catalogService.search(criteria).then(function (response) {
                    $scope.productSearchProcessing = false;
                    $scope.productSearchResult = response.data.products;
                }, function (response) {
                    $scope.productSearchProcessing = false;
                });
            }, 300);
        }
    }

    $scope.selectSearchedProduct = function (product) {
        $scope.productSearchResult = null;
        $scope.selectedSearchedProduct = product;
        $scope.productSkuOrName = product.name;
    }

    $scope.addProductToCart = function (product, quantity) {
        $scope.cartIsUpdating = true;
        cartService.addLineItem(product.id, quantity).then(function (response) {
            reloadCart();
            $scope.productSkuOrName = null;
            $scope.selectedSearchedProduct = null;
            $rootScope.$broadcast('cartItemsChanged');
        });
    }
    
    $scope.applyCoupon = function (coupon) {
        coupon.loader.wrapLoading(function() {
            return cartService.addCoupon(coupon.code).then(function() {
                reloadCart();
            });
        });
    }

    $scope.removeCoupon = function (coupon) {
        coupon.loader.wrapLoading(function() {
            return cartService.removeCoupon().then(function() {
                $scope.coupon = { loader: $scope.coupon.loader };
                reloadCart();
            });
        });
    }

    function initialize() {
        reloadCart();
    }
}]);

storefrontApp.controller('cartBarController', ['$scope', 'cartService', function ($scope, cartService) {
    getCartItemsCount();

    $scope.$on('cartItemsChanged', function (event, data) {
        getCartItemsCount();
    });

    function getCartItemsCount() {
        cartService.getCartItemsCount().then(function (response) {
            $scope.cartItemsCount = response.data;
        });
    }
}]);

storefrontApp.controller('recentlyAddedCartItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData', function ($scope, $window, $uibModalInstance, dialogData) {
    $scope.dialogData = dialogData;

    $scope.close = function () {
        $uibModalInstance.close();
    }

    $scope.redirect = function (url) {
        $window.location = url;
    }
}]);
