var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('mainController', ['$rootScope', '$scope', '$location', '$window', 'accountApi', 'storefrontApp.mainContext', 'loadingIndicatorService',
    function ($rootScope, $scope, $location, $window, accountApi, mainContext, loader) {
        var $ctrl = this;
        $ctrl.loader = loader;

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

        $rootScope.$on('successOperation', function (event, data) {
            $rootScope.storefrontNotification = data;
            $rootScope.storefrontNotification.detailsVisible = true;
        })

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

        mainContext.loadCustomer = $scope.loadCustomer = function () {
            return loader.wrapLoading(function() {
                return accountApi.getCurrentUser().then(function (response) {
                    var addressId = 1;
                    _.each(response.data.addresses, function (address) {
                        address.id = addressId;
                        addressId++;
                    });
                    response.data.isContact = response.data.memberType === 'Contact';
                    mainContext.customer = $scope.customer = response.data;
                    return response.data;
                });

            });
        };

       $scope.loadCustomer();
    }])

    .factory('storefrontApp.mainContext', function () {
        return {};
    });
