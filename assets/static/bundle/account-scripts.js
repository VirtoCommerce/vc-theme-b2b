angular.module('storefrontApp')
    .factory('authService', ['storefrontApp.mainContext', '$auth', '$httpParamSerializerJQLike', '$interpolate', '$rootScope', 'storefront.corporateAccountApi',
        function (mainContext, $auth, $httpParamSerializerJQLike, $interpolate, $rootScope, corporateAccountApi) {

            var authContext = {
                userId: null,
                userLogin: null,
                fullName: null,
                userType: null,
                roles: null,
                permissions: null,
                isAuthenticated: false
            };

            authContext.login = function (login, password) {
                return $auth.login($httpParamSerializerJQLike({
                    userName: login,
                    password: password,
                    grant_type: "password"
                }),
                    {
                        headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
                    });
            };

            authContext.fillAuthData = function () {
                return corporateAccountApi.getUser({ userName: mainContext.customer.userName },
                    function (result) {
                        changeAuth(result)
                        $rootScope.$broadcast('loginStatusChanged', authContext);
                    },
                    function (error) { });
            };

            authContext.checkPermission = function (permission, securityScopes) {
                //first check admin permission
                // var hasPermission = $.inArray('admin', authContext.permissions) > -1;
                var hasPermission = authContext.isAdministrator;
                if (!hasPermission && permission) {
                    permission = permission.trim();
                    //first check global permissions
                    hasPermission = $.inArray(permission, authContext.permissions) > -1;
                    if (!hasPermission && securityScopes) {
                        if (typeof securityScopes === 'string' || angular.isArray(securityScopes)) {
                            securityScopes = angular.isArray(securityScopes) ? securityScopes : securityScopes.split(',');
                            //Check permissions in scope
                            hasPermission = _.some(securityScopes, function (x) {
                                var permissionWithScope = permission + ":" + x;
                                var retVal = $.inArray(permissionWithScope, authContext.permissions) > -1;
                                //console.log(permissionWithScope + "=" + retVal);
                                return retVal;
                            });
                        }
                    }
                }
                return hasPermission;
            };

            function changeAuth(results) {
                authContext.userId = results.id;
                authContext.roles = results.roles;
                authContext.permissions = results.permissions;
                authContext.userLogin = results.userName;
                authContext.fullName = results.userLogin;
                authContext.isAuthenticated = results.userName != null;
                authContext.userType = results.userType;
                authContext.isAdministrator = results.isAdministrator;
                //Interpolate permissions to replace some template to real value
                if (authContext.permissions) {
                    authContext.permissions = _.map(authContext.permissions, function (x) {
                        return $interpolate(x)(authContext);
                    });
                }
            };

            return authContext;
        }])
    .constant('tokenExpirationName', 'platform_access_token_expiration_time')
    .config(['$authProvider', '$provide', 'apiBaseUrl', function ($authProvider, $provide, apiBaseUrl) {
        $authProvider.loginUrl = apiBaseUrl + 'Token';
        $authProvider.tokenName = 'access_token';
        $authProvider.tokenPrefix = 'platform';
        $authProvider.oauth2({
            name: 'platform',
            clientId: 'web'
        });
        $provide.decorator('SatellizerShared', ['$delegate', 'tokenExpirationName', function ($delegate, tokenExpirationName) {
            var service = $delegate;
            var originalSetToken = service.setToken;
            service.setToken = function (response) {
                originalSetToken.apply(service, arguments);
                var expirationTime = Date.parse(response.data['.expires']);
                this.SatellizerStorage.set(tokenExpirationName, expirationTime);;
            };
            return service;
        }]);
    }])
    .run(['$auth', 'SatellizerConfig', 'SatellizerStorage', 'tokenExpirationName', '$timeout', '$window', '$location', function ($auth, $authProvider, $authStorage, tokenExpirationName, $timeout, $window, $location) {
        var logOut = function () {
            $auth.logout();
            $authStorage.remove(tokenExpirationName);
            $window.location.href = $location.protocol() + "://" + $location.host() + ":" + $location.port() + '/account/logout';
        };

        if ($auth.isAuthenticated()) {
            $timeout(logOut, parseFloat($authStorage.get(tokenExpirationName)) - Date.now());
        }
    }]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('dialogService', ['$uibModal', function ($uibModal) {
    return {
        showDialog: function (dialogData, controller, templateUrl) {
            var modalInstance = $uibModal.open({
                controller: controller,
                templateUrl: templateUrl,
                resolve: {
                    dialogData: function () {
                        return dialogData;
                    }
                }
            });
            return modalInstance;
        }
    }
}]);

storefrontApp.service('mailingService', ['$http', 'apiBaseUrl', function ($http, apiBaseUrl) {
    return {
        sendProduct: function(id, data) {
            return $http.post(apiBaseUrl + 'api/b2b/send/product/' + id, data);
        }
    }
}]);

storefrontApp.service('feedbackService', ['$http', function ($http) {
    return {
        postFeedback: function (data) {
            return $http.post('storefrontapi/feedback', { model: data });
        }
    }
}]);

storefrontApp.service('customerService', ['$http', function ($http) {
    return {
        getCurrentCustomer: function () {
            return $http.get('storefrontapi/account?t=' + new Date().getTime());
        }
    }
}]);

storefrontApp.service('marketingService', ['$http', function ($http) {
    return {
        getDynamicContent: function (placeName) {
            return $http.get('storefrontapi/marketing/dynamiccontent/' + placeName + '?t=' + new Date().getTime());
        },
    }
}]);

storefrontApp.service('pricingService', ['$http', function ($http) {
	return {
		getActualProductPrices: function (products) {
		    return $http.post('storefrontapi/pricing/actualprices', products);
		}
	}
}]);

storefrontApp.service('catalogService', ['$http', function ($http) {
    return {
        getProduct: function (productIds) {
            return $http.get('storefrontapi/products?productIds=' + productIds + '&t=' + new Date().getTime());
        },
        getProducts: function(productIds) {
            return $http.get('storefrontapi/products?' + productIds + '&t=' + new Date().getTime());
        },
        search: function (criteria) {
            return $http.post('storefrontapi/catalog/search', criteria);
        },
        searchCategories: function (criteria) {
            return $http.post('storefrontapi/categories/search', criteria);
        }
    }
}]);

storefrontApp.service('cartService', ['$http', function ($http) {
    return {
        getCart: function () {
            return $http.get('storefrontapi/cart?t=' + new Date().getTime());
        },
        getCartItemsCount: function () {
            return $http.get('storefrontapi/cart/itemscount?t=' + new Date().getTime());
        },
        addLineItem: function (productId, quantity) {
            return $http.post('storefrontapi/cart/items', { id: productId, quantity: quantity });
        },
        changeLineItemQuantity: function (lineItemId, quantity) {
            return $http.put('storefrontapi/cart/items', { lineItemId: lineItemId, quantity: quantity });
        },
        changeLineItemsQuantity: function(items) {
            return $http.put('storefrontapi/cart/items', items);
        },
        removeLineItem: function (lineItemId) {
            return $http.delete('storefrontapi/cart/items?lineItemId=' + lineItemId);
        },
        changeLineItemPrice: function (lineItemId, newPrice) {
        	return $http.put('storefrontapi/cart/items/price', { lineItemId: lineItemId, newPrice: newPrice});
        },
        clearCart: function () {
            return $http.post('storefrontapi/cart/clear');
        },
        getCountries: function () {
            return $http.get('storefrontapi/countries?t=' + new Date().getTime());
        },
        getCountryRegions: function (countryCode) {
        	return $http.get('storefrontapi/countries/' + countryCode + '/regions?t=' + new Date().getTime());
        },
        addCoupon: function (couponCode) {
            return $http.post('storefrontapi/cart/coupons/' + couponCode);
        },
        removeCoupon: function () {
            return $http.delete('storefrontapi/cart/coupons');
        },
        addOrUpdateShipment: function (shipment) {
            return $http.post('storefrontapi/cart/shipments', shipment);
        },
        addOrUpdatePayment: function (payment) {
            return $http.post('storefrontapi/cart/payments', payment );
        },
        getAvailableShippingMethods: function (shipmentId) {
            return $http.get('storefrontapi/cart/shipments/' + shipmentId + '/shippingmethods?t=' + new Date().getTime());
        },
        getAvailablePaymentMethods: function () {
            return $http.get('storefrontapi/cart/paymentmethods?t=' + new Date().getTime());
        },
        addOrUpdatePaymentPlan: function (plan) {
            return $http.post('storefrontapi/cart/paymentPlan', plan);
        },
        removePaymentPlan: function () {
            return $http.delete('storefrontapi/cart/paymentPlan');
        },
        createOrder: function (bankCardInfo) {
            return $http.post('storefrontapi/cart/createorder', { bankCardInfo: bankCardInfo });
        }
    }
}]);

storefrontApp.service('listService', ['$q', '$http', '$localStorage', 'customerService', function ($q, $http, $localStorage, customerService) {
    return {
        getOrCreateMyLists: function (userName, lists) {
            if (!$localStorage['lists']) {
                $localStorage['lists'] = {};
                $localStorage['lists'][userName] = [];
                $localStorage['sharedListsIds'] = {};
                $localStorage['sharedListsIds'][userName] = [];
                _.each(lists, function (list) {
                    list.author = userName;
                    list.id = Math.floor(Math.random() * 230910443210623294 + 1).toString();
                });
                _.extend($localStorage['lists'][userName], lists);
            }
            return $q(function (resolve, reject) { resolve($localStorage['lists'][userName]) });
        },

        getSharedLists: function (userName) {
            var lists = $localStorage['lists'];
            var sharedLists = [];
            if ($localStorage['sharedListsIds']) {
                _.each($localStorage['sharedListsIds'][userName], function(cartId) {
                    _.each(lists, function(list) {
                        if (angular.isDefined(_.find(list, { id: cartId.toString() }))) {
                            sharedLists.push(_.find(list, { id: cartId }));
                        }

                    });
                });
            }
            return $q(function (resolve, reject) { resolve(sharedLists) });
        },
        getWishlist: function (listName, permission, id, userName) {
            if (_.contains($localStorage['lists'][userName], _.find($localStorage['lists'][userName], { name: listName })) && angular.isDefined(userName)) {
                $localStorage['lists'][userName].push({ name: listName + 1, permission: permission, id: id, items: [], author: userName });
            }
            else $localStorage['lists'][userName].push({ name: listName, permission: permission, id: id, items: [], author: userName })

            return _.find($localStorage['lists'][userName], { name: listName });
        },

        addItemToList: function (listId, product) {
            _.each($localStorage['lists'], function(list) {
                if (angular.isDefined(_.find(list, { id: listId }))) {
                    var searchedList = _.find(list, { id: listId });
                    searchedList.items.push(product);
                }

            });
        },

        containsInList: function (productId, cartId) {
            var lists = angular.copy($localStorage['lists']);
            var contains;
            _.each(lists, function(list) {
                if (angular.isDefined(_.find(list, { id: cartId }))) {
                    var currentList = _.find(list, { id: cartId });
                    if (angular.isDefined(_.find(currentList.items, { productId: productId })))
                        contains = true;
                    else
                        contains = false;
                }
            });
            return $q(function (resolve, reject) { resolve({ contains: contains }) });
        },

        addSharedList: function (userName, myLists, sharedCartId) {
            if (!_.some($localStorage['sharedListsIds'][userName], function (x) { return x === sharedCartId }) && (!_.find(myLists, { id: sharedCartId }))) {
                $localStorage['sharedListsIds'][userName].push(sharedCartId);
                return $q(function (resolve, reject) {
                    resolve();
                });
            }
            else return $q(function (resolve, reject) {
                resolve();
            });
        },

        contains: function (productId, listName) {
            return $http.get('storefrontapi/lists/' + listName + '/items/' + productId + '/contains?t=' + new Date().getTime());
        },
        addLineItem: function (productId, listName) {
            return $http.post('storefrontapi/lists/' + listName + '/items', { productId: productId });
        },

        removeLineItem: function (lineItemId, listId, userName) {
            var searchedList = _.find($localStorage['lists'][userName], { id: listId });
            searchedList.items = _.filter(searchedList.items, function (item) { return item.id != lineItemId });
            return $q(function (resolve, reject) {
                resolve(searchedList)
            });
            //return $http.delete('storefrontapi/lists/' + listName + '/items/' + lineItemId);
        },
        clearList: function (cartId, userName) {
            $localStorage['lists'][userName] = _.filter($localStorage['lists'][userName], function (x) { return x.id != cartId });
            //return $http.post('storefrontapi/lists/clear', { listName: listName });
        },
        removeFromFriendsLists: function (currentId, userName) {
            $localStorage['sharedListsIds'][userName] = _.filter($localStorage['sharedListsIds'][userName], function(cartId) {
                return $q(function(resolve, reject) {
                    resolve(cartId !== currentId)
                });
            });
        }
    }
}]);

storefrontApp.service('quoteRequestService', ['$http', function ($http) {
    return {
        getCurrentQuoteRequest: function () {
            return $http.get('storefrontapi/quoterequest/current?t=' + new Date().getTime());
        },
        getQuoteRequest: function (number) {
            return $http.get('storefrontapi/quoterequests/' + number + '?t=' + new Date().getTime());
        },
        getQuoteRequestItemsCount: function (number) {
            return $http.get('storefrontapi/quoterequests/' + number + '/itemscount?t=' + new Date().getTime());
        },
        addProductToQuoteRequest: function (productId, quantity) {
            return $http.post('storefrontapi/quoterequests/current/items', { productId: productId, quantity: quantity });
        },
        removeProductFromQuoteRequest: function (quoteRequestNumber, quoteItemId) {
            return $http.delete('storefrontapi/quoterequests/' + quoteRequestNumber + '/items/' + quoteItemId);
        },
        submitQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/submit', { quoteForm: quoteRequest });
        },
        rejectQuoteRequest: function (quoteRequestNumber) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/reject');
        },
        updateQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.put('storefrontapi/quoterequests/' + quoteRequestNumber + '/update', { quoteRequest: quoteRequest });
        },
        getTotals: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/totals', { quoteRequest: quoteRequest });
        },
        confirmQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/confirm', { quoteRequest: quoteRequest });
        }
    }
}]);

storefrontApp.service('recommendationService', ['$http', function ($http) {
    return {
        getRecommendedProducts: function (requestData) {
            return $http.post('storefrontapi/recommendations', requestData );
        }
    }
}]);

storefrontApp.service('orderService', ['$http', function ($http) {
    return {
        getOrder: function (orderNumber) {
            return $http.get('storefrontapi/orders/' + orderNumber + '?t=' + new Date().getTime());
        }
    }
}]);

storefrontApp.service('compareProductService', ['$http', '$localStorage', function($http, $localStorage) {
    return {
        isInProductCompareList: function(productId) {
            var containProduct;
            if (!_.some($localStorage['productCompareListIds'], function(id) { return id === productId })) {
                containProduct = false;
            }
            else
                containProduct = true
            return containProduct;
        },
        addProduct: function(productId) {
            if (!$localStorage['productCompareListIds']) {
                $localStorage['productCompareListIds'] = [];
            }
            $localStorage['productCompareListIds'].push(productId);
            _.uniq($localStorage['productCompareListIds']);
        },
        getProductsIds: function() {
            if (!$localStorage['productCompareListIds']) {
                $localStorage['productCompareListIds'] = [];
                return;
            }
            var ids = [];
            for (i = 0; i < $localStorage['productCompareListIds'].length; i++) {
                ids.push('productIds=' + $localStorage['productCompareListIds'][i]);
            }
            return ids.join("&");
        },
        getProductsCount: function() {
            var count = $localStorage['productCompareListIds'] ? $localStorage['productCompareListIds'].length : 0;
            return count;
        },
        clearCompareList: function() {
            $localStorage['productCompareListIds'] = [];
        },
        removeProduct: function(productId) {
            $localStorage['productCompareListIds'] = _.without($localStorage['productCompareListIds'], productId);
        }
    }
}]);

storefrontApp.service('accountService', ['$http', function ($http) {
    return {
        getUserOrganization: function () {
            return $http.get('storefrontapi/account/organization?t=' + new Date().getTime());
        },
        updateUserOrganization: function (organization) {
            return $http.put('storefrontapi/account/organization', organization);
        },
        searchUserOrganizationContacts: function (criteria) {
            return $http.post('storefrontapi/account/organization/contacts/search', criteria);
        },
        createInvitation: function (invitation) {
            return $http.post('storefrontapi/account/invitation', invitation);
        },
        registerNewUser: function (user) {
            return $http.post('storefrontapi/account/user', user);
        },
        lockUser: function (userName) {
            return $http.post('storefrontapi/account/' + userName + '/lock');
        },
        unlockUser: function (userName) {
            return $http.post('storefrontapi/account/' + userName + '/unlock');
        },
        deleteUser: function (userName) {
            return $http.delete('storefrontapi/account/' + userName);
        },
     
    }
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('mainController', ['$rootScope', '$scope', '$location', '$window', 'customerService', 'storefrontApp.mainContext',
    function ($rootScope, $scope, $location, $window, customerService, mainContext) {

        //Base store url populated in layout and can be used for construction url inside controller
        $scope.baseUrl = {};

        $rootScope.$on('$locationChangeSuccess', function () {
            var path = $location.path();
            if (path) {
                $scope.currentPath = path.replace('/', '');
            }
        });

        $rootScope.$on('storefrontError', function (event, data) {
            $rootScope.storefrontNotification = data;
            $rootScope.storefrontNotification.detailsVisible = false;
        });

        $rootScope.toggleNotificationDetails = function () {
            $rootScope.storefrontNotification.detailsVisible = !$rootScope.storefrontNotification.detailsVisible;
        }

        $rootScope.closeNotification = function () {
            $rootScope.storefrontNotification = null;
        }

        //For outside app redirect (To reload the page after changing the URL, use the lower-level API)
        $scope.outerRedirect = function (absUrl) {
            $window.location.href = absUrl;
        };

        //change in the current URL or change the current URL in the browser (for app route)
        $scope.innerRedirect = function (path) {
            $location.path(path);
            $scope.currentPath = $location.$$path.replace('/', '');
        };

        $scope.stringifyAddress = function (address) {
            var stringifiedAddress = address.firstName + ' ' + address.lastName + ', ';
            stringifiedAddress += address.organization ? address.organization + ', ' : '';
            stringifiedAddress += address.countryName + ', ';
            stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
            stringifiedAddress += address.city + ' ';
            stringifiedAddress += address.line1 + ', ';
            stringifiedAddress += address.line2 ? address.line2 : '';
            stringifiedAddress += address.postalCode;
            return stringifiedAddress;
        }

        $scope.getObjectSize = function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        }

        mainContext.getCustomer = $scope.getCustomer = function () {
            customerService.getCurrentCustomer().then(function (response) {
                var addressId = 1;
                _.each(response.data.addresses, function (address) {
                    address.id = addressId;
                    addressId++;
                });
                response.data.isContact = response.data.memberType === 'Contact';
                mainContext.customer = $scope.customer = response.data;
            });
        };

        $scope.getCustomer();
    }])

.factory('storefrontApp.mainContext', function () {
    return {};
});

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

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('quoteRequestController', ['$rootScope', '$scope', '$window', '$location', 'quoteRequestService', 'cartService',
    function ($rootScope, $scope, $window, $location, quoteRequestService, cartService) {
    initialize();

    $scope.setQuoteRequestForm = function (form) {
        $scope.formQuoteRequest = form;
    }

    $scope.displayForStatuses = function (statuses) {
        return _.contains(statuses, $scope.quoteRequest.status);
    }

    $scope.addTierPrice = function (quoteItem) {
        quoteItem.proposalPrices.push({
            id: quoteItem.proposalPrices.length + 1,
            price: quoteItem.salePrice,
            quantity: 1
        });
    }

    $scope.changeTierPriceQuantity = function (tierPrice, quantity) {
        if (quantity < 1 || quantity.isNaN) {
            return;
        }
        tierPrice.quantity = quantity;
    }

    $scope.removeTierPrice = function (quoteItem, tierPrice) {
        quoteItem.proposalPrices = _.without(quoteItem.proposalPrices, tierPrice);
    }

    $scope.removeProductFromQuoteRequest = function (quoteItem) {
        var initialQuoteItems = angular.copy($scope.quoteRequest.items);
        $scope.quoteRequest.items = _.without($scope.quoteRequest.items, quoteItem);
        quoteRequestService.removeProductFromQuoteRequest($scope.quoteRequest.id, quoteItem.id).then(function (response) {
            getQuoteRequest($scope.quoteRequest.id);
            $rootScope.$broadcast('actualQuoteRequestItemsChanged');
        }, function (response) {
            $scope.quoteRequest.items = initialQuoteItems;
        });
    }

    $scope.setCountry = function (addressType, countryName) {
        var country = _.find($scope.countries, function (c) { return c.name == countryName });
        if (!country) {
            return;
        }
        if (addressType == 'Billing') {
            $scope.billingCountry = country;
            $scope.billingCountryRegions = [];
            $scope.quoteRequest.billingAddress.countryCode = country.code3 || country.code2;
            $scope.quoteRequest.billingAddress.regionId = null;
            $scope.quoteRequest.billingAddress.regionName = null;
        }
        if (addressType == 'Shipping') {
            $scope.shippingCountry = country;
            $scope.shippingCountryRegions = [];
            $scope.quoteRequest.shippingAddress.countryCode = country.code3 || country.code2;
            $scope.quoteRequest.shippingAddress.regionId = null;
            $scope.quoteRequest.shippingAddress.regionName = null;
        }
        if (country.code3) {
            getCountryRegions(addressType, country.code3);
        }
    }

    $scope.setCountryRegion = function (addressType) {
        if (addressType == 'Billing') {
            var countryRegion = _.find($scope.billingCountryRegions, function (r) { return r.name == $scope.quoteRequest.billingAddress.regionName });
            if (!countryRegion) {
                return;
            }
            $scope.quoteRequest.billingAddress.regionId = countryRegion.code;
        }
        if (addressType == 'Shipping') {
            var countryRegion = _.find($scope.shippingCountryRegions, function (r) { return r.name == $scope.quoteRequest.shippingAddress.regionName });
            if (!countryRegion) {
                return;
            }
            $scope.quoteRequest.shippingAddress.regionId = countryRegion.code;
        }
    }

    $scope.selectCustomerAddress = function (addressType) {
        if (addressType === 'Billing') {
            var billingAddress = _.find($scope.customer.addresses, function (a) { return a.id === $scope.quoteRequest.billingAddress.id });
            if (billingAddress) {
                billingAddress.type = 'Billing';
                if (billingAddress.countryCode) {
                    getCountryRegions('Billing', billingAddress.countryCode);
                }
                $scope.quoteRequest.billingAddress = angular.copy(billingAddress);
            }
        }
        if (addressType === 'Shipping') {
            var shippingAddress = _.find($scope.customer.addresses, function (a) { return a.id === $scope.quoteRequest.shippingAddress.id });
            if (shippingAddress) {
                shippingAddress.type = 'Shipping';
                if (shippingAddress.countryCode) {
                    getCountryRegions('Shipping', shippingAddress.countryCode);
                }
                $scope.quoteRequest.shippingAddress = angular.copy(shippingAddress);
            }
        }
    }

    $scope.stringifyAddress = function (address) {
        if (!address) {
            return;
        }
        var stringifiedAddress = address.firstName + ' ' + address.lastName + ', ';
        stringifiedAddress += address.organization ? address.organization + ', ' : '';
        stringifiedAddress += address.countryName + ', ';
        stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
        stringifiedAddress += address.city + ' ';
        stringifiedAddress += address.line1 + ', ';
        stringifiedAddress += address.line2 ? address.line2 : '';
        stringifiedAddress += address.postalCode;
        return stringifiedAddress;
    }

    $scope.submitQuoteRequest = function () {
        $scope.formQuoteRequest.$setSubmitted();
        if ($scope.formQuoteRequest.$invalid) {
            return;
        }
        $scope.quoteRequest.billingAddress.email = $scope.quoteRequest.email;
        if ($scope.quoteRequest.shippingAddress) {
            $scope.quoteRequest.shippingAddress.email = $scope.quoteRequest.email;
        }
        quoteRequestService.submitQuoteRequest($scope.quoteRequest.id, toFormModel($scope.quoteRequest)).then(function (response) {
            if ($scope.customer.isRegisteredUser) {
                $scope.outerRedirect($scope.baseUrl + 'account/quoterequests');
            } else {
                $scope.outerRedirect($scope.baseUrl + 'account/login');
            }
        });
    }

    $scope.rejectQuoteRequest = function () {
        quoteRequestService.rejectQuoteRequest($scope.quoteRequest.id).then(function (response) {
            quoteRequestService.getQuoteRequest($scope.quoteRequest.id).then(function (response) {
                $scope.quoteRequest = response.data;
            });
        });
    }

    $scope.selectTierPrice = function () {
        quoteRequestService.getTotals($scope.quoteRequest.id, toFormModel($scope.quoteRequest)).then(function (response) {
            $scope.quoteRequest.totals = response.data;
        });
    }

    $scope.confirmQuoteRequest = function () {
        quoteRequestService.confirmQuoteRequest($scope.quoteRequest.id, toFormModel($scope.quoteRequest)).then(function (response) {
            $scope.outerRedirect($scope.baseUrl + 'cart/checkout/#/shipping-address');
        });
    }

    $scope.setRequestShippingQuote = function () {
        if (!$scope.quoteRequest.requestShippingQuote) {
            $scope.quoteRequest.shippingAddress = null;
        }
    }

    $scope.setShippingAddressEqualsBilling = function () {
        if ($scope.quoteRequest.shippingAddressEqualsBilling) {
            $scope.quoteRequest.shippingAddress = angular.copy($scope.quoteRequest.billingAddress);
            $scope.quoteRequest.shippingAddress.type = 'Shipping';
            if ($scope.quoteRequest.shippingAddress.countryCode) {
                $scope.shippingCountry = $scope.billingCountry;
                getCountryRegions('Shipping', $scope.quoteRequest.shippingAddress.countryCode);
            }
        }
    }

    $scope.tierPricesUnique = function (quoteItem) {
        var quantities = _.map(quoteItem.proposalPrices, function (p) { return p.quantity });
        return _.uniq(quantities).length == quoteItem.proposalPrices.length;
    }

    function initialize() {
        var quoteRequestNumber = $location.url().replace('/', '') || $window.currentQuoteRequestNumber;
        $scope.billingCountry = null;
        $scope.shippingCountry = null;
        getCountries();
        if (quoteRequestNumber) {
            getQuoteRequest(quoteRequestNumber);
        } else {
            $scope.quoteRequest = { itemsCount: 0 };
        }
    }

    function getQuoteRequest(number) {
        quoteRequestService.getQuoteRequest(number).then(function (response) {
            var quoteRequest = response.data;
            if (!quoteRequest.billingAddress) {
                if ($scope.customer.addresses.length) {
                    quoteRequest.billingAddress = angular.copy($scope.customer.addresses[0]);
                    quoteRequest.billingAddress.type = 'Billing';
                    if (quoteRequest.billingAddress.countryCode) {
                        getCountryRegions('Billing', quoteRequest.billingAddress.countryCode);
                    }
                } else {
                    quoteRequest.billingAddress = {
                        firstName: $scope.customer.firstName,
                        lastName: $scope.customer.lastName
                    };
                }
            }
            _.each(quoteRequest.items, function (quoteItem) {
                var i = 1;
                _.each(quoteItem.proposalPrices, function (tierPrice) {
                    tierPrice.id = i;
                    if (quoteItem.selectedTierPrice.quantity == tierPrice.quantity) {
                        quoteItem.selectedTierPrice = tierPrice;
                    }
                    i++;
                });
            });
            quoteRequest.requestShippingQuote = true;
            $scope.quoteRequest = quoteRequest;
        });
    }

    function getCountries() {
        cartService.getCountries().then(function (response) {
            $scope.countries = response.data;
        });
    }

    function getCountryRegions(addressType, countryCode) {
        cartService.getCountryRegions(countryCode).then(function (response) {
            var countryRegions = response.data;
            if (addressType == 'Billing') {
                $scope.billingCountryRegions = countryRegions || [];
            }
            if (addressType == 'Shipping') {
                $scope.shippingCountryRegions = countryRegions || [];
            }
        });
    }

    function toFormModel(quoteRequest) {
        var quoteRequestFormModel = {
            id: quoteRequest.id,
            tag: quoteRequest.tag,
            status: quoteRequest.status,
            comment: quoteRequest.comment,
            billingAddress: quoteRequest.billingAddress,
            shippingAddress: quoteRequest.shippingAddress,
            items: []
        };
        _.each(quoteRequest.items, function (quoteItem) {
            var quoteItemFormModel = {
                id: quoteItem.id,
                comment: quoteItem.comment,
                selectedTierPrice: {
                    price: quoteItem.selectedTierPrice.price.amount,
                    quantity: quoteItem.selectedTierPrice.quantity
                },
                proposalPrices: []
            };
            _.each(quoteItem.proposalPrices, function (tierPrice) {
                quoteItemFormModel.proposalPrices.push({
                    price: tierPrice.price.amount,
                    quantity: tierPrice.quantity
                });
            });
            quoteRequestFormModel.items.push(quoteItemFormModel);
        });

        return quoteRequestFormModel;
    }
}]);

storefrontApp.controller('actualQuoteRequestBarController', ['$scope', 'quoteRequestService', function ($scope, quoteRequestService) {
    getCurrentQuoteRequest();

    $scope.$on('actualQuoteRequestItemsChanged', function (event, data) {
        getCurrentQuoteRequest();
    });

    function getCurrentQuoteRequest() {
        quoteRequestService.getCurrentQuoteRequest().then(function (response) {
            $scope.actualQuoteRequest = response.data;
        });
    }
}]);

storefrontApp.controller('recentlyAddedActualQuoteRequestItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData',
    function ($scope, $window, $uibModalInstance, dialogData) {

    $scope.$on('actualQuoteRequestItemsChanged', function (event, data) {
        dialogData.updated = true;
    });

    $scope.dialogData = dialogData;

    $scope.close = function () {
        $uibModalInstance.close();
    }

    $scope.redirect = function (url) {
        $window.location = url;
    }
}]);
var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcAddress', {
    templateUrl: "themes/assets/address.tpl.html",
    bindings: {
        address: '=',
        addresses: '<',
        countries: '=',
        validationContainer: '=',
        getCountryRegions: '&',
        editMode: '<',
        onUpdate: '&'
    },
    require: {
        checkoutStep: '?^vcCheckoutWizardStep'
    },
    transclude: {
        header: '?addressHeader', footer: '?addressFooter'
    },
    controller: ['$scope', function ($scope) {
        var ctrl = this;
        ctrl.types = [{ id: 'Billing', name: 'Billing' }, { id: 'Shipping', name: 'Shipping' }, { id: 'BillingAndShipping', name: 'Billing and Shipping' }];
        
        this.$onInit = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.addComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.removeComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.removeComponent(this);
        };

        function populateRegionalDataForAddress(address) {
            if (address) {
                //Set country object for address
                address.country = _.findWhere(ctrl.countries, { code3: address.countryCode });
                if (address.country != null) {
                    ctrl.address.countryName = ctrl.address.country.name;
                    ctrl.address.countryCode = ctrl.address.country.code3;
                }

                if (address.country) {
                    if (address.country.regions) {
                        setAddressRegion(address, address.country.regions);
                    }
                    else {
                        ctrl.getCountryRegions({ country: address.country }).then(function (regions) {
                            address.country.regions = regions;
                            setAddressRegion(address, regions);
                        });
                    }
                }
            }
        }

        function setAddressRegion(address, regions) {
            address.region = _.findWhere(regions, { code: address.regionId });
            if (address.region) {
                ctrl.address.regionId = ctrl.address.region.code;
                ctrl.address.regionName = ctrl.address.region.name;
            }
            else {
                ctrl.address.regionId = undefined;
                ctrl.address.regionName = undefined;
            }
        }

        ctrl.setForm = function (frm) { ctrl.form = frm; };

        ctrl.validate = function () {
            if (ctrl.form) {
                ctrl.form.$setSubmitted();
                return ctrl.form.$valid;
            }
            return true;
        };

        function stringifyAddress(address) {
            var addressType = '';

            var type = _.find(ctrl.types, function (i) { return i.id == ctrl.address.addressType });
            if (type)
                addressType = '[' + type.name + '] ';

            var stringifiedAddress = addressType;
            stringifiedAddress += address.firstName + ' ' + address.lastName + ', ';
            stringifiedAddress += address.organization ? address.organization + ', ' : '';
            stringifiedAddress += address.countryName + ', ';
            stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
            stringifiedAddress += address.city + ' ';
            stringifiedAddress += address.line1 + ', ';
            stringifiedAddress += address.line2 ? address.line2 : '';
            stringifiedAddress += address.postalCode;
            return stringifiedAddress;
        }

        $scope.$watch('$ctrl.address', function () {
            if (ctrl.address) {
                populateRegionalDataForAddress(ctrl.address);
                ctrl.address.name = stringifyAddress(ctrl.address);
            }
            ctrl.onUpdate({ address: ctrl.address });
        }, true);

    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCreditCard', {
    templateUrl: "themes/assets/js/common-components/creditCard.tpl.html",
    require: {
        checkoutStep: '?^vcCheckoutWizardStep'
    },
    bindings: {
        card: '=',
        validationContainer: '='
    },
    controller: ['$scope', '$filter', function ($scope, $filter) {
        var ctrl = this;

        this.$onInit = function () {
            if(ctrl.validationContainer)
                ctrl.validationContainer.addComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.removeComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.removeComponent(this);
        };

        $scope.$watch('$ctrl.card.bankCardHolderName', function (val) {
            if (ctrl.card) {
                ctrl.card.bankCardHolderName = $filter('uppercase')(val);
            }
        }, true);

        ctrl.validate = function () {
            ctrl.form.$setSubmitted();
            return !ctrl.form.$invalid;
        }

    }]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcErrors', {
    templateUrl: "themes/assets/errors.tpl.html",
    bindings: {
        level: '<',
        message: '<',
        errors: '<'
    },
    controller: [function () {
        var $ctrl = this;
        $ctrl.level = $ctrl.level || 'danger';
    }]
});

angular.module('storefrontApp')

.component('vcLabeledInput', {
    templateUrl: "themes/assets/labeled-input.tpl.html",
    bindings: {
        value: '=',
        form: '=',
        name: '@',
        inputClass: '<',
        placeholder: '@',
        type: '@?',
        required: '<',
        requiredError: '@?',
        autofocus: '<',
        pattern: '@',
        disabled: '<'
    },
    controller: [function () {
        var $ctrl = this;
        
        $ctrl.validate = function () {
            $ctrl.form.$setSubmitted();
            return $ctrl.form.$valid;
        };

    }]
});

angular.module('storefrontApp')

.component('vcLabeledSelect', {
    templateUrl: "themes/assets/labeled-select.tpl.html",
    require: {
        ngModel: "?ngModel"
    },
    bindings: {
        options: '<',
        select: '&',
        form: '=',
        name: '@',
        placeholder: '<',
        required: '<',
        requiredError: '@?',
        autofocus: '<',
        disabled: '<'
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;
        
        $ctrl.$onInit = function() {
            if ($ctrl.required)
                $ctrl.ngModel.$setValidity('required', false);
            $ctrl.ngModel.$render = function() {
                $ctrl.value = $ctrl.ngModel.$viewValue;
            };
        };

        $ctrl.validate = function () {
            $ctrl.form.$setSubmitted();
            return $ctrl.form.$valid;
        };

        var select = $ctrl.select;
        $ctrl.select = function(option) {
            select(option);
            $ctrl.value = option;
            if ($ctrl.required)
                $ctrl.ngModel.$setValidity('required', false);
            $ctrl.ngModel.$setViewValue($ctrl.value);
        };        
    }]
});
angular.module('storefrontApp')

.component('vcLabeledTextArea', {
    templateUrl: "themes/assets/labeled-textarea.tpl.html",
    bindings: {
        value: '=',
        form: '=',
        name: '@',
        label: '@',
        required: '<',
        requiredError: '@?',
        pattern: '<?',
        autofocus: '<'
    },
    controller: [function () {
        var $ctrl = this;

        $ctrl.validate = function () {
            $ctrl.form.$setSubmitted();
            return $ctrl.form.$valid;
        };

    }]
});
var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcLineItems', {
    templateUrl: "themes/assets/js/common-components/lineItems.tpl.liquid",
    bindings: {
        items: '='
    }
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcMember', {
    templateUrl: "themes/assets/member.tpl.html",
    bindings: {
        member: '=',
        memberComponent: '='
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;

        this.$onInit = function () {
            $ctrl.memberComponent = this;
        };

        this.$onDestroy = function () {
            $ctrl.memberComponent = null;
        };

        $ctrl.setForm = function (frm) { $ctrl.form = frm; };


        $ctrl.validate = function () {
            if ($ctrl.form) {
                $ctrl.form.$setSubmitted();
                return $ctrl.form.$valid;
            }
            return true;
        };
    }]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcMemberDetail', {
    templateUrl: "themes/assets/memberDetail.tpl.html",
    bindings: {
        member: '=',
        memberComponent: '=',
        fieldsConfig: '<'
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;
        
        $ctrl.config = [
            {
                field: 'CompanyName',
                disabled: false,
                visible: true,
                required: true
            },
            {
                field: 'Email',
                disabled: false,
                visible: true,
                required: true
            },
            {
                field: 'UserName',
                disabled: false,
                visible: true
            },
            {
                field: 'Password',
                disabled: false,
                visible: true
            },
            {
                field: 'Roles',
                disabled: false,
                visible:  false
            }
        ];

        if ($ctrl.fieldsConfig)
            angular.extend($ctrl.config, $ctrl.fieldsConfig);

        $ctrl.rolesComponent = null;

        this.$onInit = function () {
            $ctrl.memberComponent = this;
        };

        this.$onDestroy = function () {
            $ctrl.memberComponent = null;
        };

        $ctrl.setForm = function (frm) {
            $ctrl.form = frm;
        };

        $ctrl.validate = function () {
            if ($ctrl.form) {
                $ctrl.form.$setSubmitted();
                return $ctrl.form.$valid;
            }
            return true;
        };

        $ctrl.showField = function (field) {
            return getFieldConfig(field).visible == true;
        }

        $ctrl.disableField = function (field) {
            return getFieldConfig(field).disabled == true;
        }

        $ctrl.requiredField = function (field) {
            return getFieldConfig(field).required == true;
        }

        function getFieldConfig(field) {
            var configItem = _.first(_.filter($ctrl.config, function (configItem) { return configItem.field === field; }));
            return configItem;
        }
    }]
});

storefrontApp.directive('confirmPasswordValidation', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {
            ngModel.$parsers.unshift(function (value, scope) {
                var isValid = true;
                var password = ngModel.$$parentForm['customer[password]'].$viewValue;

                if (password) {
                    isValid = password === value;
                }

                ngModel.$setValidity('confirmPasswordValidation', isValid);
                return value;
            });
        }
    };
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcPaymentMethods', {
    templateUrl: "themes/assets/js/common-components/paymentMethods.tpl.html",
    require: {
        checkoutStep: '?^vcCheckoutWizardStep'
    },
    bindings: {
        getAvailPaymentMethods: '&',
        onSelectMethod: '&',
        paymentMethod: '=',
        validationContainer: '='
    },
    controller: ['$scope', function ($scope) {
        var ctrl = this;

        this.$onInit = function () {
            ctrl.getAvailPaymentMethods().then(function (methods) {
                ctrl.availPaymentMethods = _.sortBy(methods, function (x) { return x.priority; });
                if (ctrl.paymentMethod) {
                    ctrl.paymentMethod = _.findWhere(ctrl.availPaymentMethods, { code: ctrl.paymentMethod.code });
                }
                if (!ctrl.paymentMethod && ctrl.availPaymentMethods.length > 0) {
                    ctrl.selectMethod(ctrl.availPaymentMethods[0]);
                }
            })
            if (ctrl.validationContainer)
                ctrl.validationContainer.addComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.removeComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.removeComponent(this);
        };

        ctrl.validate = function () {
            return ctrl.paymentMethod;
        }

        ctrl.selectMethod = function (method) {
            ctrl.paymentMethod = method;
            ctrl.onSelectMethod({ paymentMethod: method });
        };
    }]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcRoles', {
    templateUrl: "themes/assets/roles.tpl.html.liquid",
    bindings: {
        value: '=',
        availableRoles: "<",
        form: '=',
        name: "@",
        required: "<",
        disabled: "<"
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;
        $ctrl.loader = loader;
    }]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcSearchBar', {
    templateUrl: "themes/assets/js/common-components/searchBar.tpl.html",
    bindings: {
        placeholder: '<',
        searching: '<',
        noResults: '<',
        query: '@',
        categoriesLabel: '<',
        productsLabel: '<',
        submitLabel: '<',
        categoryLimit: '@',
        productLimit: '@'
    },
    controller: ['$scope', '$q', 'catalogService', function ($scope, $q, catalogService) {
        var $ctrl = this;
        $ctrl.hasHint = false;

        $scope.$watch('$ctrl.isOpen', function (isOpen) {
            $ctrl.hasHint = !!$ctrl.query && !isOpen;
        });

        $scope.$watch('$ctrl.query', function(query) {
            $ctrl.hasHint = !!query && !$ctrl.isOpen;
        });

        $ctrl.getSuggestions = function () {
            var searchCriteria = { keyword: $ctrl.query, start: 0 };
            return $q.all([
                catalogService.searchCategories(angular.extend({ }, searchCriteria, { pageSize: $ctrl.categoryLimit })),
                catalogService.search(angular.extend({ }, searchCriteria, { pageSize: $ctrl.productLimit }))
            ]).then(function(results) {
                var process = function(within) {
                    return (results[0].data[within] || results[1].data[within]).map(function (suggestion) {
                        suggestion['within'] = within;
                        return suggestion;
                    });
                }
                return process('categories').concat(process('products')).map(function (suggestion, index) {
                    suggestion['index'] = index;
                    return suggestion;
                });
            });
        };
    }]
});

angular.module('storefront.account')
.component('vcAccountAddresses', {
    templateUrl: "themes/assets/account-addresses.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefrontApp.mainContext', 'confirmService', '$translate', '$scope', 'storefront.corporateAccountApi', 'storefront.corporateApiErrorHelper', 'loadingIndicatorService', function (mainContext, confirmService, $translate, $scope, corporateAccountApi, corporateApiErrorHelper, loader) {
        var $ctrl = this;
        $ctrl.loader = loader;
        
        $scope.$watch(
            function () { return mainContext.customer; },
            function (customer) {
                if (customer) {
                    loader.wrapLoading(function() {
                        return corporateAccountApi.getCompanyMember({ id: customer.id }, function (member) {
                            $ctrl.currentMember = member;
                        }).$promise;
                    });
                }
            });

        $ctrl.addNewAddress = function () {
            if (_.last(components).validate()) {
                $ctrl.currentMember.addresses.push($ctrl.newAddress);
                $ctrl.newAddress = null;
                $ctrl.updateCompanyMember($ctrl.currentMember);
            }
        };

        $ctrl.submit = function () {
            if (components[$ctrl.editIdx].validate()) {
                angular.copy($ctrl.editItem, $ctrl.currentMember.addresses[$ctrl.editIdx]);
                $ctrl.updateCompanyMember($ctrl.currentMember, $ctrl.cancel);
            }
        };

        $ctrl.cancel = function () {
            $ctrl.editIdx = -1;
            $ctrl.editItem = null;
        };

        $ctrl.edit = function ($index) {
            $ctrl.editIdx = $index;
            $ctrl.editItem = angular.copy($ctrl.currentMember.addresses[$ctrl.editIdx]);
        };

        $ctrl.delete = function ($index) {
            var showDialog = function (text) {
                confirmService.confirm(text).then(function (confirmed) {
                    if (confirmed) {
                        $ctrl.currentMember.addresses.splice($index, 1);
                        $ctrl.updateCompanyMember($ctrl.currentMember);
                    }
                });
            };

            $translate('customer.addresses.delete_confirm').then(showDialog, showDialog);
        };

        $ctrl.updateCompanyMember = function (companyMember, handler) {
            return loader.wrapLoading(function () {
                return corporateAccountApi.updateCompanyMember(companyMember, handler, function (response) {
                    corporateApiErrorHelper.clearErrors($scope);
                }).$promise;
            });
        };

        var components = [];
        $ctrl.addComponent = function (component) {
            components.push(component);
        };
        $ctrl.removeComponent = function (component) {
            components = _.without(components, component);
        };
    }]
});

angular.module('storefront.account')
.component('vcAccountCompanyInfo', {
    templateUrl: "themes/assets/account-company-info.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefrontApp.mainContext', '$scope', '$translate', 'accountService', 'loadingIndicatorService', 'confirmService', function (mainContext, $scope, $translate, accountService, loader, confirmService) {
        var $ctrl = this;
        $ctrl.loader = loader;

        function refresh() {
            loader.wrapLoading(function () {
                return accountService.getUserOrganization().then(function (response) {
                    $ctrl.company = response.data;
                });
            });
        };

      

        $ctrl.updateCompanyInfo = function (company) {
            return loader.wrapLoading(function () {
                return accountService.updateUserOrganization(company).then(function () { refresh(); });
            });
        };

        $ctrl.addNewAddress = function () {
            if (_.last(components).validate()) {
                $ctrl.company.addresses.push($ctrl.newAddress);
                $ctrl.newAddress = null;
                $ctrl.updateCompanyInfo($ctrl.company);
            }
        };

        $ctrl.submitCompanyAddress = function () {
            if (components[$ctrl.editIdx].validate()) {
                angular.copy($ctrl.editItem, $ctrl.company.addresses[$ctrl.editIdx]);
                $ctrl.updateCompanyInfo($ctrl.company).then($ctrl.cancel);
            }
        };

        $ctrl.cancel = function () {
            $ctrl.editIdx = -1;
            $ctrl.editItem = null;
        };

        $ctrl.edit = function ($index) {
            $ctrl.editIdx = $index;
            $ctrl.editItem = angular.copy($ctrl.company.addresses[$ctrl.editIdx]);
        };

        $ctrl.delete = function ($index) {
            var showDialog = function (text) {
                confirmService.confirm(text).then(function (confirmed) {
                    if (confirmed) {
                        $ctrl.company.addresses.splice($index, 1);
                        $ctrl.updateCompanyInfo($ctrl.company);
                    }
                });
            };

            $translate('customer.addresses.delete_confirm').then(showDialog, showDialog);
        };

        var components = [];
        $ctrl.addComponent = function (component) {
            components.push(component);
        };
        $ctrl.removeComponent = function (component) {
            components = _.without(components, component);
        };
    }]
});

angular.module('storefront.account')
.component('vcAccountCompanyMembers', {
    templateUrl: "themes/assets/account-company-members.tpl.liquid",
    $routeConfig: [
     { path: '/', name: 'MemberList', component: 'vcAccountCompanyMembersList', useAsDefault: true },
     { path: '/:member', name: 'MemberDetail', component: 'vcAccountCompanyMemberDetail' }
    ],
    controller: ['storefront.accountApi', function (accountApi) {
        var $ctrl = this;
    }]
})

.component('vcAccountCompanyMembersList', {
    templateUrl: "account-company-members-list.tpl",
    bindings: { $router: '<' },
    controller: ['storefrontApp.mainContext', '$scope', 'accountService', 'loadingIndicatorService', 'confirmService', '$location', '$translate', function (mainContext, $scope, accountService, loader, confirmService, $location, $translate) {
        var $ctrl = this;
        $ctrl.currentMemberId = mainContext.customer.id;
        $ctrl.newMemberComponent = null;
        $ctrl.loader = loader;
        $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
        $ctrl.pageSettings.pageChanged = function () { refresh(); };

        function refresh() {
                 loader.wrapLoading(function () {
                 return accountService.searchUserOrganizationContacts({
                    skip: ($ctrl.pageSettings.currentPage - 1) * $ctrl.pageSettings.itemsPerPageCount,
                    take: $ctrl.pageSettings.itemsPerPageCount,
                    sortInfos: $ctrl.sortInfos
                }).then(function (response) {
                    $ctrl.entries = response.data.results;
                    $ctrl.pageSettings.totalItems = response.data.totalCount;
                });
            });
        };
        
        $ctrl.addNewMemberFieldsConfig =[
            {
                field: 'CompanyName',
                disabled: true,
                visible: false,
                required: false
            },
            {
                field: 'Email',
                disabled: false,
                visible: true,
                required: true
            },
            {
                field: 'UserName',
                disabled: false,
                visible: true
            },
            {
                field: 'Password',
                disabled: false,
                visible:  true
            },
            {
                field: 'Roles',
                disabled: false,
                visible:  true,
                required: true
            }
        ];
        
        $scope.init = function(storeId, cultureName, registrationUrl){
            $ctrl.storeId = storeId;
            $ctrl.cultureName = cultureName;
            $ctrl.registrationUrl = registrationUrl;
        };

        this.$routerOnActivate = function (next) {
            $ctrl.pageSettings.currentPage = next.params.pageNumber || $ctrl.pageSettings.currentPage;
            refresh();
        };

        $ctrl.inviteEmailsValidationPattern = new RegExp(/((^|((?!^)([,;]|\r|\r\n|\n)))([a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*))+$/);
        $ctrl.invite = function () {
            $ctrl.inviteInfo.emails = $ctrl.inviteInfo.rawEmails.split(/[,;]|\r|\r\n|\n/g);
            loader.wrapLoading(function(){
                return accountService.createInvitation({
                    emails: $ctrl.inviteInfo.emails,
                    message: $ctrl.inviteInfo.message
                }).then(function (response) {
                    $ctrl.cancel();
                    $ctrl.pageSettings.pageChanged();
                });
            });
        };

        $ctrl.addNewMember = function () {
            if ($ctrl.newMemberComponent.validate()) {
                $ctrl.newMember.companyId = mainContext.customer.companyId;
                $ctrl.newMember.role = $ctrl.newMember.role;
                $ctrl.newMember.storeId = $ctrl.storeId;

                loader.wrapLoading(function () {
                    return accountService.registerNewUser($ctrl.newMember).then(function (response) {
                        $ctrl.cancel();
                        $ctrl.pageSettings.currentPage = 1;
                        $ctrl.pageSettings.pageChanged();
                    });
                });
            }
        };

        $ctrl.cancel = function () {
            $ctrl.inviteInfo = null;
            $ctrl.newMember = null;
        };

        $ctrl.changeStatus = function (member) {
            loader.wrapLoading(function () {
                var action = member.isActive ? accountService.lockUser : accountService.unlockUser;
                member.isActive = !member.isActive;                
                loader.wrapLoading(function () {
                    return action(member.securityAccounts[0].userName);
                });
            });
        };

        $ctrl.edit = function (memberId) {
            this.$router.navigate(['MemberDetail', {member: memberId, pageNumber: $ctrl.pageSettings.currentPage}]);
        }

        $ctrl.delete = function (member) {
            var showDialog = function (text) {
                confirmService.confirm(text).then(function (confirmed) {
                    if (confirmed) {
                        loader.wrapLoading(function () {
                            return accountService.deleteUser(member.securityAccounts[0].userName).then(function (response) {
                                $ctrl.pageSettings.pageChanged();
                                //TODO: errors handling
                            });
                        });
                    }
                });
            };

            $translate('customer.edit_company_members.delete_confirm').then(showDialog, showDialog);
        };

        $ctrl.validate = function (){
            $ctrl.inviteForm.$setSubmitted();
            return $ctrl.inviteForm.valid;
        };

        $ctrl.showActions = function (member) {
            return member.id != mainContext.customer.id;
        }
    }]
})

.component('vcAccountCompanyMemberDetail', {
    templateUrl: "account-company-members-detail.tpl",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['$q', '$rootScope', '$scope', '$window', 'accountService', 'loadingIndicatorService', function ($q, $rootScope, $scope, $window, accountService, loader) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.fieldsConfig =[
            {
                field: 'CompanyName',
                disabled: true,
                visible: false,
                required: false
            },
            {
                field: 'Email',
                disabled: false,
                visible: true,
                required: true
            },
            {
                field: 'UserName',
                disabled: true,
                visible: false
            },
            {
                field: 'Password',
                disabled: true,
                visible: false
            },
            {
                field: 'Roles',
                disabled: false,
                visible:  true
            }
        ];

        $ctrl.memberComponent = null;
        
        $scope.init = function(storeId){
            $ctrl.storeId = storeId;
        };

        function refresh() {
            loader.wrapLoading(function () {
                return accountService.getOrganizationMember({ id: $ctrl.memberNumber }).then(function (response) {
                    var member = response.data;
                    $ctrl.member = {
                        id: member.id,
                        firstName: member.firstName,
                        lastName: member.lastName,
                        email: _.first(member.emails),
                        organizations: [member.organization],
                        title: member.title,
                        securityAccounts: member.securityAccounts
                    };
                });
            });
        }

        this.$routerOnActivate = function (next) {
            $ctrl.pageNumber = next.params.pageNumber || 1;
            $ctrl.memberNumber = next.params.member;

            refresh();
        };

        $ctrl.submitMember = function () {
            if ($ctrl.memberComponent.validate()) {
                loader.wrapLoading(function () {
                    $ctrl.member.fullName = $ctrl.member.firstName + ' ' + $ctrl.member.lastName;
                    $ctrl.member.emails = [ $ctrl.member.email ];
                    return $q.all([
                        roleService.set($ctrl.member.securityAccounts, $ctrl.member.role),
                        corporateAccountApi.updateCompanyMember($ctrl.member, function(response) {
                            corporateApiErrorHelper.clearErrors($scope);
                        }, function (rejection){
                            corporateApiErrorHelper.handleErrors($scope, rejection);
                        }).$promise
                    ]);
                });
            };
        };
    }]
});

 var storefrontApp = angular.module('storefrontApp');

 storefrontApp
 .controller('accountLoginController', ['$scope', 'authService', function ($scope, authService) {
     $scope.login = function ($event) {
         if (!$event || $event.keyCode === 13){
             var submit = function(){
                angular.element(document.querySelector('#customer_login')).submit();
            };
            // submit form even when error occurs
            authService.login($scope.userName, $scope.password).then(submit, submit);
         }
     };
 }]);
angular.module('storefront.account')
.component('vcAccountOrders', {
    templateUrl: "themes/assets/js/account/account-orders.tpl.liquid",
    $routeConfig: [
     { path: '/', name: 'OrderList', component: 'vcAccountOrdersList', useAsDefault: true },
     { path: '/:number', name: 'OrderDetail', component: 'vcAccountOrderDetail' }
    ],
    controller: ['orderHelper', function (orderHelper) {
        var $ctrl = this;
        $ctrl.orderHelper = orderHelper;
    }]
})

.component('vcAccountOrdersList', {
    templateUrl: "account-orders-list.tpl",
    controller: ['storefront.orderApi', 'loadingIndicatorService', function (orderApi, loader) {
        var ctrl = this;
        ctrl.loader = loader;
        ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
        ctrl.pageSettings.pageChanged = function () {
            loader.wrapLoading(function () {
                return orderApi.search({
                    pageNumber: ctrl.pageSettings.currentPage,
                    pageSize: ctrl.pageSettings.itemsPerPageCount,
                    sortInfos: ctrl.sortInfos
                }, function (data) {
                    ctrl.entries = data.results;
                    ctrl.pageSettings.totalItems = data.totalCount;
                }).$promise;
            });
        };

        this.$routerOnActivate = function (next) {
            ctrl.pageSettings.currentPage = next.params.pageNumber || ctrl.pageSettings.currentPage;
            ctrl.pageSettings.pageChanged();
        };
    }]
})

.component('vcAccountOrderDetail', {
    templateUrl: "account-order-detail.tpl",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefront.orderApi', '$rootScope', '$window', 'loadingIndicatorService', 'confirmService', 'orderHelper', function (orderApi, $rootScope, $window, loader, confirmService, orderHelper) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.hasPhysicalProducts = true;

        function refresh() {
            loader.wrapLoading(function () {
                $ctrl.order = orderApi.get({ number: $ctrl.orderNumber }, function (result) {
                    $ctrl.isShowPayment = false;
                    var lastPayment = _.last(_.sortBy($ctrl.order.inPayments, 'createdDate'));
                    $ctrl.billingAddress = (lastPayment && lastPayment.billingAddress) ||
                            _.findWhere($ctrl.order.addresses, { type: 'billing' }) ||
                            _.first($ctrl.order.addresses);
                    $ctrl.amountToPay = orderHelper.getNewPayment($ctrl.order).sum.amount;

                    if ($ctrl.amountToPay > 0) {
                        $ctrl.billingAddressEqualsShipping = true;
                        loadPromise = orderApi.getNewPaymentData({ number: $ctrl.orderNumber }, function (result) {
                            //$ctrl.order = result.order;
                            configurePayment(result.paymentMethods, result.payment);
                        }).$promise;
                    }
                });
                return $ctrl.order.$promise;
            });
        }

        this.$routerOnActivate = function (next) {
            $ctrl.pageNumber = next.params.pageNumber || 1;
            $ctrl.orderNumber = next.params.number;

            refresh();
        };

        $ctrl.getInvoicePdf = function () {
            var url = $window.BASE_URL + 'storefrontapi/orders/' + $ctrl.orderNumber + '/invoice';
            $window.open(url, '_blank');
        }

        $ctrl.showPayment = function () {
            loadPromise.then(function (result) {
                $ctrl.isShowPayment = true;
            });
        };

        var loadPromise;
        $ctrl.getAvailPaymentMethods = function () {
            return loadPromise.then(function (result) {
                var preselectedMaymentMethod;
                if ($ctrl.payment.gatewayCode) {
                    preselectedMaymentMethod = _.findWhere(result.paymentMethods, { code: $ctrl.payment.gatewayCode });
                }

                return preselectedMaymentMethod ? [preselectedMaymentMethod] : result.paymentMethods;
            });
        };

        $ctrl.selectPaymentMethod = function (paymentMethod) {
            angular.extend($ctrl.payment, paymentMethod);
            $ctrl.payment.gatewayCode = paymentMethod.code;
            // $ctrl.payment.sum = angular.copy($ctrl.order.total);
            // $ctrl.payment.sum.amount += paymentMethod.totalWithTax.amount;

            $ctrl.validate();
        };

        $ctrl.validate = function () {
            $ctrl.isValid = $ctrl.payment &&
                $ctrl.payment.gatewayCode &&
                $ctrl.payment.sum && $ctrl.payment.sum.amount > 0 &&
                _.every(components, function (x) {
                    return typeof x.validate !== "function" || x.validate();
                });

            return $ctrl.isValid;
        };

        $ctrl.submit = function () {
            if ($ctrl.validate()) {
                loader.wrapLoading(function () {
                    $ctrl.payment.bankCardInfo = $ctrl.paymentMethod.card;
                    return orderApi.addOrUpdatePayment({ number: $ctrl.orderNumber }, $ctrl.payment, function (payment) {
                        orderApi.processPayment({ number: $ctrl.orderNumber, paymentNumber: payment.number }, $ctrl.paymentMethod.card, function (result) {
                            var orderProcessingResult = result.orderProcessingResult;
                            var paymentMethod = result.paymentMethod;

                            if (!orderProcessingResult.isSuccess) {
                                $rootScope.$broadcast('storefrontError', {
                                    type: 'error',
                                    title: ['Error in new payment processing: ', orderProcessingResult.error, 'New Payment status: ' + orderProcessingResult.newPaymentStatus].join(' '),
                                    message: orderProcessingResult.error,
                                });
                                return;
                            }

                            if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() === 'preparedform' && orderProcessingResult.htmlForm) {
                                outerRedirect($ctrl.accountManager.baseUrl + 'cart/checkout/paymentform?orderNumber=' + $ctrl.orderNumber);
                            } else if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() === 'redirection' && orderProcessingResult.redirectUrl) {
                                outerRedirect(orderProcessingResult.redirectUrl);
                            } else {
                                if ($ctrl.accountManager.customer.isRegisteredUser) {
                                    refresh();
                                } else {
                                    outerRedirect($ctrl.accountManager.baseUrl + 'cart/thanks/' + $ctrl.orderNumber);
                                }
                            }
                        })
                    }).$promise;
                });
            }
        };

        $ctrl.cancel = function () {
            confirmService.confirm('Cancel this payment?').then(function (confirmed) {
                if (confirmed) {
                    loader.wrapLoading(function () {
                        return orderApi.cancelPayment({ number: $ctrl.orderNumber, paymentNumber: $ctrl.payment.number }, null, refresh).$promise;
                    });
                }
            });
        };

        var components = [];
        $ctrl.addComponent = function (component) {
            components.push(component);
        };
        $ctrl.removeComponent = function (component) {
            components = _.without(components, component);
        };

        function configurePayment(paymentMethods, newPaymentTemplate) {
            $ctrl.payment = orderHelper.getNewPayment($ctrl.order, paymentMethods, newPaymentTemplate);
            $ctrl.payment.purpose = $ctrl.payment.purpose || 'Repeated payment';
            $ctrl.amountToPay = $ctrl.payment.sum.amount;

            $ctrl.canCancelPayment = $ctrl.payment.id !== newPaymentTemplate.id;
            if ($ctrl.canCancelPayment) {
                $ctrl.selectPaymentMethod(_.findWhere(paymentMethods, { code: $ctrl.payment.gatewayCode }));
            }

            if (!_.some($ctrl.order.shipments)) {
                $ctrl.hasPhysicalProducts = false;
                $ctrl.billingAddressEqualsShipping = false;
            }
        }

        function outerRedirect(absUrl) {
            $window.location.href = absUrl;
        };
    }]
})

.factory('orderHelper', function () {
    var retVal = {
        getNewPayment: function (order, paymentMethods, newPaymentTemplate) {
            var retVal;
            var paidPayments = _.filter(order.inPayments, function (x) {
                return x.status === 'Paid';
            });
            var paidAmount = _.reduce(paidPayments, function (memo, num) { return memo + num.sum.amount; }, 0);
            var amountToPay = order.total.amount - paidAmount;

            var pendingPayments = _.filter(order.inPayments, function (x) {
                return !x.isCancelled &&
                        (x.status === 'New' || x.status === 'Pending') &&
                        x.sum.amount > 0; // && x.sum.amount === amountToPay;
            });
            var pendingPayment = _.last(_.sortBy(pendingPayments, 'createdDate'));
            if (pendingPayment && (!paymentMethods || _.findWhere(paymentMethods, { code: pendingPayment.gatewayCode }))) {
                retVal = pendingPayment;
            } else {
                newPaymentTemplate = newPaymentTemplate || { sum: {} };
                newPaymentTemplate.sum.amount = amountToPay;
                retVal = newPaymentTemplate;
            }

            return retVal;
        }
    };

    return retVal;
})

.filter('orderToSummarizedStatusLabel', ['orderHelper', function (orderHelper) {
    return function (order) {
        var retVal = order.status || 'New';

        var found = _.findWhere(orderHelper.statusLabels, { status: retVal.toLowerCase() });
        if (found) {
            retVal = found.label;
        }

        return retVal;
    };
}])
;

angular.module('storefront.account')
.component('vcAccountPasswordChange', {
    templateUrl: "themes/assets/js/account/account-password-change.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['loadingIndicatorService', function (loader) {
        var ctrl = this;
        ctrl.loader = loader;
        ctrl.passwordChangeData = {};

        ctrl.submit = function () {
            // validation
            ctrl.errors = null;
            ctrl.error = {};
            var hasError = false;
            var errorMsg;

            errorMsg = ctrl.passwordChangeData.oldPassword === ctrl.passwordChangeData.newPassword;
            ctrl.error.newPassword = errorMsg
            hasError = hasError || errorMsg;

            if (!hasError) {
                errorMsg = ctrl.passwordChangeData.newPassword !== ctrl.passwordChangeData.newPassword2;
                ctrl.error.newPassword2 = errorMsg;
                hasError = hasError || errorMsg;
            }

            if (!hasError) {
                ctrl.accountManager.changePassword(ctrl.passwordChangeData).then(function (result) {
                    angular.extend(ctrl, result);
                    ctrl.passwordChangeData = {};
                    ctrl.form.$setPristine();
                });
            }
        };

        ctrl.setForm = function (frm) { ctrl.form = frm; };
    }]
});

angular.module('storefront.account')
.component('vcAccountProfileUpdate', {
    templateUrl: "themes/assets/account-profile-update.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['$q', '$scope', 'storefrontApp.mainContext', 'storefront.corporateAccountApi', 'storefront.corporateApiErrorHelper', 'loadingIndicatorService', function ($q, $scope, mainContext, corporateAccountApi, corporateApiErrorHelper, loader) {
        var $ctrl = this;
        $ctrl.loader = loader;

        $scope.$watch(
            function () { return mainContext.customer; },
            function (customer) {
                if (customer) {
                    loader.wrapLoading(function() {
                        return corporateAccountApi.getCompanyMember({ id: customer.id }, function(member) {
                            $ctrl.member = {
                                id: member.id,
                                firstName: member.firstName,
                                lastName: member.lastName,
                                email: _.first(member.emails),
                                organizations: member.organizations,
                                title: member.title,
                                addresses: member.addresses,
                                securityAccounts: member.securityAccounts
                            };
                        }).$promise;
                    });
                }
            });

        $ctrl.submit = function () {
            $ctrl.member.fullName = $ctrl.member.firstName + ' ' + $ctrl.member.lastName;
            $ctrl.member.emails = [$ctrl.member.email];

            return loader.wrapLoading(function () {
                return corporateAccountApi.updateCompanyMember($ctrl.member, function(response) {
                    corporateApiErrorHelper.clearErrors($scope);
                }, function (rejection){
                    corporateApiErrorHelper.handleErrors($scope, rejection);
                }).$promise;
            });
        };
    }]
});

angular.module('storefront.account')
.component('vcAccountQuotes', {
    templateUrl: "themes/assets/js/account/account-quotes.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: [function () {
        var ctrl = this;
        ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
        ctrl.pageSettings.pageChanged = function () {
            ctrl.accountManager.getQuotes(ctrl.pageSettings.currentPage, ctrl.pageSettings.itemsPerPageCount, ctrl.sortInfos, function (data) {
                ctrl.entries = data.results;
                ctrl.pageSettings.totalItems = data.totalCount;
            });
        };
        
        this.$routerOnActivate = function (next) {
            ctrl.pageSettings.currentPage = next.params.pageNumber || ctrl.pageSettings.currentPage;
            ctrl.pageSettings.pageChanged();
        };
    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('accountRegisterController', ['$q', '$scope', 'storefrontApp.mainContext', 'storefront.corporateRegisterApi', 'storefront.corporateApiErrorHelper', 'storefront.accountApi', 'loadingIndicatorService', 'vcRecaptchaService',
    function ($q, $scope, mainContext, corporateRegisterApi, corporateApiErrorHelper, accountApi, loader, vcRecaptchaService) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.countries = accountApi.getCountries();

        $scope.isOrg = function () {
            return $scope.member.type === 'Business';
        };

        $scope.$watch('member.address.countryCode', function () {
            if ($scope.member.address.countryCode) {
                populateRegionalDataForAddress($scope.member.address);
                $scope.member.address.name = stringifyAddress($scope.member.address);
            }
        });

        function populateRegionalDataForAddress(address) {
            if (address) {
                //Set country object for address
                address.country = _.findWhere($ctrl.countries, { code3: address.countryCode });
                if (address.country) {
                    address.countryName = address.country.name;
                    address.countryCode = address.country.code3;

                    if (address.country.regions) {
                        setAddressRegion(address, address.country.regions);
                    }
                    else {
                        //$ctrl.getCountryRegions({ country: address.country }).then(function (regions) {
                        accountApi.getCountryRegions(address.country, function (regions) {
                            address.country.regions = regions;
                            setAddressRegion(address, regions);
                        });
                    }
                }
            }
        }

        function setAddressRegion(address, regions) {
            address.region = _.findWhere(regions, { code: address.regionId });
            if (address.region) {
                address.regionId = address.region.code;
                address.regionName = address.region.name;
            }
            else {
                address.regionId = undefined;
                address.regionName = undefined;
            }
        }

        function stringifyAddress(address) {
            var addressType = '';

            //var type = _.find($ctrl.types, function (i) { return i.id == $ctrl.address.addressType });
            //if (type)
            //    addressType = '[' + type.name + '] ';

            var stringifiedAddress = addressType;
            stringifiedAddress += address.firstName + ' ' + address.lastName + ', ';
            stringifiedAddress += address.companyName ? address.companyName + ', ' : '';
            stringifiedAddress += address.countryName + ', ';
            stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
            stringifiedAddress += address.city + ' ';
            stringifiedAddress += address.line1 + ', ';
            stringifiedAddress += address.line2 ? address.line2 : '';
            stringifiedAddress += address.postalCode;
            return stringifiedAddress;
        }

        //$scope.registerMemberFieldsConfig = [
        //    {
        //        field: 'CompanyName',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    },
        //    {
        //        field: 'Email',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    },
        //    {
        //        field: 'UserName',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    },
        //    {
        //        field: 'Password',
        //        disabled: false,
        //        visible: true,
        //        required: true
        //    }
        //];

        function getParams() {
            var params = window.location.search.substring(1).split("&"), result = {}, param, i;
            for (i in params) {
                if (params.hasOwnProperty(i)) {
                    if (params[i] === "") continue;

                    param = params[i].split("=");
                    result[decodeURIComponent(param[0])] = decodeURIComponent(param[1]);
                }
            }
            return result;
        }

        $scope.init = function (storeId) {
            $scope.member = { storeId: storeId, type: 'Business', address: {}, email: null };
            var invite = getParams().invite;
            if (invite) {
                //$scope.registerMemberFieldsConfig[0] = {
                //    field: 'CompanyName',
                //    disabled: true,
                //    visible: true,
                //    required: true
                //};
                //$scope.registerMemberFieldsConfig[1] = {
                //    field: 'Email',
                //    disabled: true,
                //    visible: true,
                //    required: true
                //};

                $scope.member.invite = invite;
                $ctrl.loader.wrapLoading(function () {
                    return corporateRegisterApi.getRegisterInfoByInvite({ invite: invite }).$promise
                        .then(function (result) {
                            if (result.message) {
                                $scope.error = result.message;
                                return $q.reject("Invite is invalid");
                            }
                            $scope.member.companyName = result.companyName;
                            $scope.member.email = result.email;
                        });
                });
            }
            
        };

        $scope.submit = function () {
            corporateApiErrorHelper.clearErrors($scope);
            $ctrl.error = {};
            var hasError = false;
            var member = $scope.member;
            var errorMsg = member.password.length < 5;
            $ctrl.error.password = errorMsg;
            hasError = hasError || errorMsg;

            if (!hasError) {
                errorMsg = member.password !== member.confirmPassword;
                $ctrl.error.confirmPassword = errorMsg;
                hasError = hasError || errorMsg;
            }

            if (!hasError) {
                populateRegionalDataForAddress(member.address);
                //member.address.name = addressService.stringify(member.address);

                $ctrl.loader.wrapLoading(function () {
                    var urlParam, apiMethodToCall;
                    if (member.invite) {
                        urlParam = { invite: member.invite };
                        apiMethodToCall = corporateRegisterApi.registerByInvite;
                    } else {
                        apiMethodToCall = $scope.isOrg() ? corporateRegisterApi.register : corporateRegisterApi.registerPersonal;
                    }

                    return apiMethodToCall(urlParam, member, function (result) {
                        $scope.$parent.userName = member.username;
                        $scope.$parent.password = member.password;
                        $scope.login();
                    }, function (rejection) {
                        vcRecaptchaService.reload();
                        corporateApiErrorHelper.handleErrors($scope, rejection);
                    }).$promise;
                });
            }
        }
    }]);

angular.module('storefront.account')
.component('vcAccountSubscriptions', {
    templateUrl: "themes/assets/js/account/account-subscriptions.tpl.liquid",
    $routeConfig: [
     { path: '/', name: 'SubscriptionList', component: 'vcAccountSubscriptionsList', useAsDefault: true },
     { path: '/:number', name: 'SubscriptionDetail', component: 'vcAccountSubscriptionDetail' }
    ]
})

.component('vcAccountSubscriptionsList', {
    templateUrl: "account-subscriptions-list.tpl",
    controller: ['storefront.subscriptionApi', 'confirmService', 'loadingIndicatorService', '$translate', function (subscriptionApi, confirmService, loader, $translate) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 10 };
        $ctrl.pageSettings.pageChanged = function () {
            loader.wrapLoading(function () {
                return subscriptionApi.search({
                    pageNumber: $ctrl.pageSettings.currentPage,
                    pageSize: $ctrl.pageSettings.itemsPerPageCount,
                    sortInfos: $ctrl.sortInfos
                }, function (data) {
                    $ctrl.entries = data.results;
                    $ctrl.pageSettings.totalItems = data.totalCount;
                }).$promise;
            });
        };

        this.$routerOnActivate = function (next) {
            $ctrl.pageSettings.currentPage = next.params.pageNumber || $ctrl.pageSettings.currentPage;
            $ctrl.pageSettings.pageChanged();
        };
    }]
})

.component('vcAccountSubscriptionDetail', {
    templateUrl: "account-subscription-detail.tpl",
    controller: ['storefront.subscriptionApi', 'confirmService', 'loadingIndicatorService', '$translate', function (subscriptionApi, confirmService, loader, $translate) {
        var $ctrl = this;
        $ctrl.loader = loader;

        function refresh() {
            loader.wrapLoading(function () {
                return subscriptionApi.get({ number: $ctrl.entryNumber }, function (result) {
                    $ctrl.subscription = angular.copy(result);
                }).$promise;
            });
        }

        this.$routerOnActivate = function (next) {
            $ctrl.pageNumber = next.params.pageNumber || 1;
            $ctrl.entryNumber = next.params.number;

            refresh();
        };

        $ctrl.cancel = function () {
            //var showDialog = function (text) {
            //    confirmService.confirm(text).then(function (confirmed) {
            //        if (confirmed) {
            loader.wrapLoading(function () {
                return subscriptionApi.cancel({ number: $ctrl.entryNumber }, { number: $ctrl.entryNumber, cancelReason: $ctrl.cancelReason }, function (result) {
                    $ctrl.subscription = angular.copy(result);
                    $ctrl.isCancelFormVisible = false;
                }).$promise;
            });
            //        }
            //    });
            //};
            //$translate('customer.subscription.cancel_confirmation').then(showDialog, showDialog);
        };
    }]
})

.filter('toIntervalKey', function () {
    return function (data, data_intervalCount) {
        var retVal = 'customer.subscriptions.intervals.' + data.interval.toLowerCase() + '_' + (data_intervalCount === 1 ? 1 : 'plural');
        //var everyKey = 'customer.subscriptions.intervals.every';

        //$translate([intervalKey, everyKey]).then(function (translations) {
        //var intervalVal = translations[intervalKey];
        //  var everyVal = translations[everyKey];

        //if (data_intervalCount === 1) {
        //    retVal = intervalKey;
        //} else {
        //    retVal = data_intervalCount + intervalVal;
        //}
        //});

        return retVal;
    };
})
;
//Call this to register our module to main application
var moduleName = "storefront.account";

if (storefrontAppDependencies !== undefined) {
    storefrontAppDependencies.push(moduleName);
}
angular.module(moduleName, ['ngResource', 'ngComponentRouter', /*'credit-cards', */'pascalprecht.translate', 'ngSanitize', 'satellizer', 'storefrontApp', 'storefrontApp.consts'])

    .config(['$translateProvider', 'baseUrl', function ($translateProvider, baseUrl) {
        $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
        $translateProvider.useUrlLoader(baseUrl + 'themes/localization.json');
        $translateProvider.preferredLanguage('en');
    }])

    .run(['$templateCache', 'apiBaseUrl', function ($templateCache, apiBaseUrl) {
        // cache application level templates
        $templateCache.put('pagerTemplate.html', '<uib-pagination boundary-links="true" max-size="$ctrl.pageSettings.numPages" items-per-page="$ctrl.pageSettings.itemsPerPageCount" total-items="$ctrl.pageSettings.totalItems" ng-model="$ctrl.pageSettings.currentPage" ng-change="$ctrl.pageSettings.pageChanged()" class="pagination-sm" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" last-text="&raquo;"></uib-pagination>');
    }])

    .value('$routerRootComponent', 'vcAccountManager')
    .service('accountDialogService', ['$uibModal', function ($uibModal) {
        return {
            showDialog: function (dialogData, controller, templateUrl) {
                var modalInstance = $uibModal.open({
                    controller: controller,
                    templateUrl: templateUrl,
                    resolve: {
                        dialogData: function () {
                            return dialogData;
                        }
                    }
                });
            }
        }
    }])

    .component('vcAccountManager', {
        templateUrl: "account-manager.tpl",
        bindings: {
            baseUrl: '<',
            customer: '<'
        },
        $routeConfig: [
            { path: '/orders/...', name: 'Orders', component: 'vcAccountOrders' },
            { path: '/subscriptions/...', name: 'Subscriptions', component: 'vcAccountSubscriptions' },
            { path: '/quotes', name: 'Quotes', component: 'vcAccountQuotes' },
            { path: '/profile', name: 'Profile', component: 'vcAccountProfileUpdate', useAsDefault: true },
            { path: '/addresses', name: 'Addresses', component: 'vcAccountAddresses' },
            { path: '/changePassword', name: 'PasswordChange', component: 'vcAccountPasswordChange' },
            { path: '/companyInfo', name: 'CompanyInfo', component: 'vcAccountCompanyInfo' },
            { path: '/companyMembers/...', name: 'CompanyMembers', component: 'vcAccountCompanyMembers' },
            { path: '/lists/...', name: 'Lists', component: 'vcAccountLists' }
        ],
        controller: ['$scope', '$timeout', 'storefront.accountApi', 'storefrontApp.mainContext', 'authService', 'storefront.corporateAccountApi', 'loadingIndicatorService', function ($scope, $timeout, accountApi, mainContext, authService, corporateAccountApi, loader) {
            var $ctrl = this;
            $ctrl.loader = loader;

            $ctrl.getQuotes = function (pageNumber, pageSize, sortInfos, callback) {
                loader.wrapLoading(function () {
                    return accountApi.getQuotes({ pageNumber: pageNumber, pageSize: pageSize, sortInfos: sortInfos }, callback).$promise;
                });
            };

            $ctrl.updateProfile = function (updateRequest) {
                loader.wrapLoading(function () {
                    return accountApi.updateAccount(updateRequest, mainContext.getCustomer).$promise;
                });
            };

            $ctrl.updateAddresses = function (data) {
                return loader.wrapLoading(function () {
                    return accountApi.updateAddresses(data, mainContext.getCustomer).$promise;
                });
            };

            $ctrl.availCountries = accountApi.getCountries();

            $ctrl.getCountryRegions = function (country) {
                return accountApi.getCountryRegions(country).$promise;
            };

            $ctrl.changePassword = function (changePasswordData) {
                return loader.wrapLoading(function () {
                    return accountApi.changePassword(changePasswordData).$promise;
                });
            };

            $scope.$watch(function () {
                return mainContext.customer;
            }, function (customer) {
                if (customer) {
                    loader.wrapLoading(function () {
                        return corporateAccountApi.getCompanyMember({ id: customer.id, memberType: 'CompanyMember' }, function (member) {
                            customer.companyId = _.first(member.organizations);
                            customer.email = _.first(member.emails);
                        }).$promise;
                    });
                    authService.fillAuthData();
                }
            });

            $scope.$on('loginStatusChanged', function () {
                $timeout(function () {
                    $(".nav *:hidden").parent().prev().find(".nav-title").hide();
                });
            });
        }]
    })

    .service('confirmService', ['$q', function ($q) {
        this.confirm = function (message) {
            return $q.when(window.confirm(message || 'Is it OK?'));
        };
    }])


angular.module('storefront.account')
    .factory('storefront.accountApi', ['$resource', function ($resource) {
        return $resource('storefrontapi/account', null, {
            updateAccount: { url: 'storefrontapi/account', method: 'POST' },
            changePassword: { url: 'storefrontapi/account/password', method: 'POST' },
            getQuotes: { url: 'storefrontapi/account/quotes' },
            updateAddresses: { url: 'storefrontapi/account/addresses', method: 'POST' },
            getCountries: { url: 'storefrontapi/countries', isArray: true },
            getCountryRegions: { url: 'storefrontapi/countries/:code3/regions', isArray: true }
        });
    }])
    .factory('storefront.orderApi', ['$resource', function ($resource) {
        return $resource('storefrontapi/orders/:number', null, {
            search: { url: 'storefrontapi/orders/search', method: 'POST' },
            getNewPaymentData: { url: 'storefrontapi/orders/:number/newpaymentdata' },
            addOrUpdatePayment: { url: 'storefrontapi/orders/:number/payments', method: 'POST' },
            processPayment: { url: 'storefrontapi/orders/:number/payments/:paymentNumber/process', method: 'POST' },
            cancelPayment: { url: 'storefrontapi/orders/:number/payments/:paymentNumber/cancel', method: 'POST' }
        });
    }])
    .factory('storefront.subscriptionApi', ['$resource', function ($resource) {
        return $resource('storefrontapi/subscriptions/:number', null, {
            search: { url: 'storefrontapi/subscriptions/search', method: 'POST' },
            cancel: { url: 'storefrontapi/subscriptions/:number/cancel', method: 'POST' }
        });
    }]);
angular.module('storefront.account')
.factory('storefront.corporateAccountApi', ['$resource', 'apiBaseUrl', function ($resource, apiBaseUrl) {
    return $resource(apiBaseUrl + 'api/b2b/companyMembers', {}, {
        getCompanyById: { url: apiBaseUrl + 'api/b2b/company/:id' },
        updateCompany: { url: apiBaseUrl + 'api/b2b/company', method: 'POST' },

        getCompanyMembers: { url: apiBaseUrl + 'api/b2b/companyMembers', method: 'POST' },
        getCompanyMember: { url: apiBaseUrl + 'api/b2b/companyMember/:id' },
        updateCompanyMember: { url: apiBaseUrl + 'api/b2b/companyMember', method: 'POST' },
        deleteCompanyMember: { url: apiBaseUrl + 'api/b2b/companyMembers', method: 'DELETE' },

        invite: { url: apiBaseUrl + 'api/b2b/invite', method: 'POST' },

        getUser: { url: apiBaseUrl + 'api/b2b/users/:userName' },
        updateUser: { url: apiBaseUrl + 'api/b2b/users', method: 'PUT' },
        getRoles: { url: apiBaseUrl + 'api/b2b/roles', isArray: true }
    });
}])
.factory('storefront.corporateRegisterApi', ['$resource', 'apiBaseUrl', function ($resource, apiBaseUrl) {
    return $resource(apiBaseUrl + 'api/b2b/register', {}, {
        register: { method: 'POST' },
        registerMember: { url: apiBaseUrl + 'api/b2b/registerMember', method: 'POST' },
        getRegisterInfoByInvite: { url: apiBaseUrl + 'api/b2b/registerMember/:invite' },
        registerByInvite: { url: apiBaseUrl + 'api/b2b/registerMember/:invite', method: 'POST' },
        registerPersonal: { url: apiBaseUrl + 'api/b2b/registerPersonal', method: 'POST' }
    });
}])
.factory('storefront.corporateApiErrorHelper', ['$rootScope', function ($rootScope) {
    return {
        clearErrors: function($scope) {
            $scope.errorMessage = null;
            $scope.errors = null;
        },
        handleErrors: function ($scope, rejection) {
            if (rejection.status == 400) {
                $scope.errorMessage = rejection.data.message;
                $scope.errors = rejection.data.modelState;
                $rootScope.closeNotification();
            }
        }
    };
}]);

angular.module('storefront.account')
.factory('roleService', ['$q', '$http', 'storefront.corporateAccountApi', 'availableRoles', function ($q, $http, corporateAccountApi, availableRoles) {
    var service = {
        available: null,
        get: null,
        set: null
    };

    // get all available roles from settings
    service._roles = availableRoles;
    corporateAccountApi.getRoles(function (roles) {
        service.available = _.map(service._roles, function(role) {
            var realRole = _.findWhere(roles, { name: role });
            return angular.extend({}, realRole, { description: 'customer.roles.descriptions.' + role.toLowerCase().replace(" ", "_") });
        });
    });

    service.get = function(accounts){
        var availableRoles = angular.copy(service.available);
        _.each(availableRoles, function(availableRole) {            
            // role is assigned to member if any of member's security accounts has this role assigned
            var roles = _.chain(accounts).map(function(account) { return account.roles; }).flatten().value();
            availableRole.assigned = _.some(roles,
            function(assignedRole) {
                return availableRole.name === assignedRole.name;
            });
        });
        // if multiple roles assigned, return the role with minimal privilidges
        return _.last(_.where(availableRoles, { assigned: true }));
    };

    service.set = function(accounts, role) {
        // assign current role to all member's security accounts
        return $q.all(_.map(accounts, function(account) {
            account.roles = _.without.apply(_, [account.roles].concat(_.filter(account.roles, function(role) { return _.contains(service._roles, role.name); })));
            account.roles.push(role);
            return corporateAccountApi.updateUser(account).$promise;
        }));
    };

    return service;
}]);

angular.module('storefrontApp')
    .component('vcAccountLists', {
        templateUrl: "lists-manager.tpl",
        $routeConfig: [
            { path: '/', name: 'Lists', component: 'vcAccountLists' },
            { path: '/friendsLists', name: 'FriendsLists', component: 'vcAccountFriendsLists' },
            { path: '/myLists', name: 'MyLists', component: 'vcAccountMyLists', useAsDefault: true }
        ],
        controller: ['listService', '$rootScope', '$location', 'customerService', 'cartService', '$translate', 'loadingIndicatorService', '$timeout', 'dialogService', '$localStorage', function (listService, $rootScope, $location, customerService, cartService, $translate, loader, $timeout, dialogService, $localStorage) {
        	var $ctrl = this;

            $ctrl.getCustomer = function () {
                customerService.getCurrentCustomer().then(function (user) {
                    $ctrl.userName = user.data.userName;
                    $ctrl.initialize();
                })
            };

            $ctrl.selectTab = function (tabName) {
                $ctrl.selectedList = [];
                $ctrl.selectedTab = tabName;
                $ctrl.getCustomer();
            };

            $ctrl.initialize = function (lists) {     
				if ($ctrl.selectedTab === 'myLists') {
					loader.wrapLoading(function () {
						return listService.getOrCreateMyLists($ctrl.userName).then(function (result) {
							$ctrl.lists = result;
							selectDefault($ctrl.lists);
						});
					})
				}

				else if ($ctrl.selectedTab === 'friendsLists') {
					loader.wrapLoading(function () {
						return listService.getSharedLists($ctrl.userName).then(function (result) {
							$ctrl.lists = result;
							selectDefault($ctrl.lists);
						});
					})
				}
            };

			function selectDefault(lists) {
				if (_.find(lists, { default: true })) {
					var selected = _.find(lists, { default: true });
					$ctrl.selectList(selected);
				}
				else if (!_.isEmpty(lists)) {
					_.first(lists).default = true;
					$ctrl.selectList(_.first(lists));
				}
			}

            $ctrl.selectList = function (list) {
                $ctrl.selectedList = list;
            };

            $ctrl.addToCart = function (lineItem) {
                loader.wrapLoading(function () {
                    return cartService.addLineItem(lineItem.productId, 1).then(function (response) {
                        $ctrl.productAdded = true;
                        $timeout(function () {
                            $ctrl.productAdded = false;
                        }, 2000);
                    });
                });
            };

            $ctrl.removeList = function (listName) {
				loader.wrapLoading(function () {
					return listService.clearList(listName, $ctrl.userName).then(function (response) {
						document.location.reload();
					});
                });
            };

            $ctrl.removeLineItem = function (lineItem) {
				loader.wrapLoading(function () {
					return listService.removeLineItem(lineItem.id, $ctrl.selectedList.id, $ctrl.userName).then(function (result) {
					});
				});
            };

            $ctrl.generateLink = function () {
                $ctrl.sharedLink = $location.absUrl().substr(0, _.lastIndexOf($location.absUrl(), '/')) + '/friendsLists?id=' + $ctrl.selectedList.id;
                $ctrl.selectedList.permission = 'public';
                var dialogData = {sharedLink:$ctrl.sharedLink};
                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.list-shared-link-dialog.tpl');
            };

            $ctrl.addToCartAllProducts = function () {
                _.each($ctrl.selectedList.items, function (item) {
                    loader.wrapLoading(function () {
                        return cartService.addLineItem(item.productId, 1).then(function (response) {
                            $ctrl.productAdded = true;
                            $timeout(function () {
                                $ctrl.productAdded = false;
                            }, 6000);
                        });
                    });
                })
            }

            $ctrl.createList = function () {
                var dialogData = $ctrl.lists;
                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.recently-create-new-list-dialog.tpl');
            };

            $ctrl.listSettings = function () {
                var dialogData = {};
                dialogData.lists = $ctrl.lists;
                dialogData.userName = $ctrl.userName;
                dialogData.selectedTab = $ctrl.selectedTab;
                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.list-settings-dialog.tpl');
            };

        }]
    })
    .component('vcAccountMyLists', {
        templateUrl: 'themes/assets/js/lists/account-lists.tpl.liquid',
        require: {
            accountLists: '^^vcAccountLists'
        },
        controller: ['$rootScope', 'listService', 'customerService', 'loadingIndicatorService', '$timeout', 'accountDialogService', '$localStorage', function ($rootScope, listService, customerService, loader, $timeout, dialogService, $localStorage) {
			var $ctrl = this;
			$ctrl.listPreSetting = function (lists) {
				customerService.getCurrentCustomer().then(function (user) {
					var userName = user.data.userName;
					loader.wrapLoading(function () {
						return listService.getOrCreateMyLists(userName, lists).then(function (result) {
						})
					})
				})
			};

            $ctrl.$onInit = function (lists) {
                $ctrl.accountLists.selectTab('myLists');
            }
        }]
    })
    .component('vcAccountFriendsLists', {
        templateUrl: "themes/assets/js/lists/account-lists.tpl.liquid",
        require: {
            accountLists: '^^vcAccountLists'
        },
        controller: ['$rootScope', 'listService', '$location', 'customerService', 'loadingIndicatorService', '$timeout', 'accountDialogService', '$localStorage', function ($rootScope, listService, $location, customerService, loader, $timeout, dialogService, $localStorage) {
            var $ctrl = this;

            function checkLocation() {
                var sharedCartId = $location.search().id.toString();
                customerService.getCurrentCustomer().then(function (user) {
                    var userName = user.data.userName;
				    var myLists = listService.getOrCreateMyLists(userName);
					loader.wrapLoading(function () {
                        return listService.addSharedList(userName, myLists, sharedCartId).then(function (result) {
                            $ctrl.accountLists.selectTab('friendsLists');
						});
					})
                })
            }

            $ctrl.$onInit = function () {
                if ($location.search().id)
                    checkLocation();               
                $ctrl.accountLists.selectTab('friendsLists');
            }
        }]
    });

angular.module('storefrontApp')
	.component('addToListButton', {
		templateUrl: 'themes/assets/js/lists/add-to-list-button.tpl.html',
		bindings: {
			selectedVariation: '<'
		},
		controller: ['customerService', 'listService', 'dialogService', function (customerService, listService, dialogService) {
			var $ctrl = this;
			$ctrl.$onInit = function () {
				compareProductInLists();
			}

			function compareProductInLists() {
				$ctrl.buttonInvalid = true;
			    customerService.getCurrentCustomer().then(function(user) {
			        listService.getOrCreateMyLists(user.data.userName, $ctrl.lists).then(function(result) {
			            $ctrl.lists = result;
			            angular.forEach($ctrl.lists, function(list) {
			                listService.containsInList($ctrl.selectedVariation.id, list.id).then(function(result) {
			                    if (result.contains === false) {
			                        $ctrl.buttonInvalid = false;
			                    }
			                });
			            });
			        });
			    });
			}

			function toListsDialogDataModel(product, quantity) {
				return {
					product: product,
					quantity: quantity,
					updated: false
				}
			}

			$ctrl.addProductToWishlist = function () {
				var dialogData = toListsDialogDataModel($ctrl.selectedVariation, 1);
				dialogService.showDialog(dialogData, 'recentlyAddedListItemDialogController', 'storefront.recently-added-list-item-dialog.tpl');
            }

            $ctrl.signInToProceed = function() {
                dialogService.showDialog({ title: 'Add product to list...' }, 'universalDialogController', 'storefront.sign-in-to-proceed.tpl');
            }

		}]
	})

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyAddedListItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData', 'listService', '$translate', '$localStorage', 'customerService', function ($scope, $window, $uibModalInstance, dialogData, listService, $translate, $localStorage, customerService) {
    $scope.availableLists = [];
    $scope.selectedList = {};
    dialogData.product.imageUrl = dialogData.product.primaryImage.url;
    dialogData.product.createdDate = new Date;
    dialogData.product.productId = dialogData.product.price.productId;
    _.extend(dialogData.product, dialogData.product.price);
    _.extend(dialogData.product, dialogData.product.salePrice);

    $scope.dialogData = dialogData.product;
    $scope.dialogData.quantity = dialogData.quantity;
    $scope.inProgress = false;
    $scope.itemAdded = false;

    $scope.addProductToList = function () {
        $scope.inProgress = true;
        var customer = { userName: $scope.userName, id: $scope.userId, isRegisteredUser: true };

        if ($scope.userName !== $scope.selectedList.author) {
            dialogData.product.modifiedBy = $scope.userName;
		}
        listService.addItemToList($scope.selectedList.id, dialogData.product);

        $scope.inProgress = false;
        $scope.itemAdded = true;
    }
    $scope.selectList = function (list) {
        $scope.selectedList = list;
    };

    $scope.close = function () {
        $uibModalInstance.close();
    };
    $scope.redirect = function (url) {
        $window.location = url;
    }

    $scope.initialize = function (lists) {
        customerService.getCurrentCustomer().then(function (user) {
            $scope.userName = user.data.userName;
			listService.getOrCreateMyLists($scope.userName, lists).then(function (result) {
                $scope.lists = result;
                angular.forEach($scope.lists, function (list) {
                    list.title = list.name;
                    list.description = list.name;
                    listService.containsInList(dialogData.product.id, list.id).then(function (result) {
                        list.contains = result.contains;
                    })
                });
			})
			
			listService.getSharedLists($scope.userName).then(function (result) {
                $scope.sharedLists = result;
                angular.forEach($scope.sharedLists, function (list) {
                    list.title = list.name;
                    list.description = list.name;
                    listService.containsInList(dialogData.product.id, list.id).then(function (result) {
                        list.contains = result.contains;
                    })
                });
			})
        })
    };
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyCreateNewListDialogController', ['$rootScope', '$scope', '$window', '$uibModalInstance', 'customerService', 'dialogData', 'listService', '$localStorage', 'loadingIndicatorService', '$translate', function($rootScope, $scope, $window, $uibModalInstance, customerService, dialogData, listService, $localStorage, loader, $translate) {

    if (dialogData.sharedLink)
        $scope.sharedLink = dialogData.sharedLink;
    else {
        $scope.dialogData = dialogData.lists;
        $scope.userName = dialogData.userName;
        $scope.inProgress = false;
        $scope.data = $scope.listName;
        $scope.selectedTab = dialogData.selectedTab;
    }

    $scope.createList = function () {   
        if ($scope.dialogData.permission != 'public')
            $scope.dialogData.permission = 'private';

        $scope.dialogData.id = Math.floor(Math.random() * 230910443210623294 + 1).toString();
        customerService.getCurrentCustomer().then(function (user) {
            $scope.userName = user.data.userName;
            listService.getWishlist($scope.dialogData.listName, $scope.dialogData.permission, $scope.dialogData.id, user.data.userName);
            $uibModalInstance.close();
        })

    };

    $scope.setDefault = function (list) {
        _.each($scope.dialogData, function (x) {
            x.default = list === x;
        })
    };

    $scope.removeList = function (list) {
        if ($scope.selectedTab === 'friendsLists') {
			loader.wrapLoading(function () {
				return listService.removeFromFriendsLists(list.id, $scope.userName).then(function () {
				});
			})
        }
        else
            listService.clearList(list.id, $scope.userName);

        $uibModalInstance.close();
        document.location.reload();
    };

    $scope.selectedList = function (listName) {
        var items = listService.getWishlist(listName, '', '', $scope.userName).items;
        $scope.selectedList.items = items;
    };

    $scope.submitSettings = function () {
        angular.forEach(dialogData.lists, function (list) {
            if (list.delete)
                $scope.removeList(list);
        })
        $uibModalInstance.close();
    };

    $scope.close = function() {
        $uibModalInstance.close();
    };

    $scope.redirect = function (url) {
        $window.location = url;
    };
}]);

angular.module('storefrontApp')
.directive('vaPermission', ['authService', function (authService) {
    return {
        link: function (scope, element, attrs) {
            if (attrs.vaPermission) {
                var permissionValue = attrs.vaPermission.trim();

                //modelObject is a scope property of the parent/current scope
                scope.$watch(attrs.securityScopes, function (value) {
                    if (value) {
                        toggleVisibilityBasedOnPermission(value);
                    }
                });

                function toggleVisibilityBasedOnPermission(securityScopes) {
                    var hasPermission = authService.checkPermission(permissionValue, securityScopes);
                    if (hasPermission)
                        angular.element(element).show();
                    else
                        angular.element(element).hide();
                }

                toggleVisibilityBasedOnPermission();
                scope.$on('loginStatusChanged', toggleVisibilityBasedOnPermission);
            }
        }
    };
}]);
//# sourceMappingURL=account-scripts.js.map
