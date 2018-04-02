var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productCompareListController', ['$rootScope', '$scope', '$localStorage', '$window', 'catalogService', 'dialogService', 'compareProductService',
function ($rootScope, $scope, $localStorage, $window, catalogService, dialogService, compareProductService) {
    var $ctrl = this;
    $ctrl.containProduct = false;
    $scope.properties = [];
    $scope.products = [];

    function initialize() {
        $scope.loaded = false;
        $ctrl.loading = true;
        var productsIds = compareProductService.getProductsIds();
        if (_.isEmpty(productsIds)) {
            $scope.loaded = true;
            $ctrl.loading = false;
            return;
        }
        catalogService.getProducts(productsIds).then(function(response) {
            if (_.indexOf(productsIds, '&') != -1) {
                $scope.products = response.data;
                _.each($scope.products, function(product) {
                    modifyProperty(product);
                })
            }
            else {
                var product = response.data[0];
                modifyProperty(product);
                $scope.products.push(product);
            }
            $scope.getProductProperties();
            $scope.loaded = true;
            $ctrl.loading = false;
        })
    };

    $scope.addProductToCompareList = function (productId, event) {
        event.preventDefault();
        var isInProductList = compareProductService.isInProductCompareList(productId);
        if (!isInProductList) {
            $ctrl.containProduct = true;
            compareProductService.addProduct(productId);
            $rootScope.$broadcast('productCompareListChanged');
        }
    }

    $scope.getProductProperties = function () {
        if (_.isEmpty($scope.products))
            return [];
        var grouped = {};
        var properties = _.flatten(_.map($scope.products, function(product) { return product.properties; }));
        var propertyDisplayNames = _.uniq(_.map(properties, function(property) { return property.displayName; }));
        _.each(propertyDisplayNames, function(displayName) {
            grouped[displayName] = [];
            var props = _.where(properties, { displayName: displayName });
            _.each($scope.products, function(product) {
                var productProperty = _.find(props, function(prop) { return prop.productId === product.id });
                if (productProperty) {
                    grouped[displayName].push(productProperty);
                } else {
                    grouped[displayName].push({ valueType: 'ShortText', value: '-' });
                }
            });
        });
        $scope.properties = grouped;
    }

    function modifyProperty(product) {
        _.each(product.properties, function(property) {
            property.productId = product.id;
            if (property.valueType.toLowerCase() === 'number') {
                property.value = formatNumber(property.value);
            }
        })
        return product;
    }

    $scope.hasValues = function (properties, onlyDifferences) {
        var uniqueValues = _.uniq(_.map(properties, function (p) { return p.value }));
        if (onlyDifferences && properties.length > 1 && uniqueValues.length == 1) {
            return false;
        }
        return true;
    }

    $scope.clearCompareList = function () {
        compareProductService.clearComapreList();
        $scope.products = [];
        $rootScope.$broadcast('productCompareListChanged');
        $scope.properties = [];
    }

    $scope.removeProduct = function (product) {
        compareProductService.removeProduct(product.id)
        $scope.products = _.without($scope.products, product);
        $rootScope.$broadcast('productCompareListChanged');
        $scope.getProductProperties();
    }

    function formatNumber(number) {
        var float = parseFloat(number);
        return !isNaN(float) ? float : number;
    }
    initialize();
}]);

storefrontApp.controller('productCompareListDialogController', ['$scope', '$window', 'dialogData', '$uibModalInstance',
function ($scope, $window, dialogData, $uibModalInstance) {
    $scope.dialogData = dialogData;

    $scope.close = function () {
        $uibModalInstance.close();
    }

    $scope.redirect = function (url) {
        $window.location = url;
    }    
}]);