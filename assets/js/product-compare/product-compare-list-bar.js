angular.module('storefrontApp')
    .component('productCompareListBar', {
        templateUrl: "product-compare-list-bar.tpl.html",
        controller: ['compareProductService', 'catalogService', '$scope', '$rootScope',
            function(compareProductService, catalogService, $scope, $rootScope) {
                var $ctrl = this;
                $ctrl.showedBody = true;
                $ctrl.products = [];

                function initialize() {
                    var productsIds = compareProductService.getProductsIds();
                    if (!_.isEmpty(productsIds)) {
                        catalogService.getProducts(productsIds).then(function(response) {
                            if (_.indexOf(productsIds, '&') != -1) {
                                console.log('sss');
                                $ctrl.products = response.data;
                                
                            }
                        });
                    };
                }

                $ctrl.$onInit = function() {
                    $ctrl.itemsCount = compareProductService.getProductsCount();
                    initialize();
                }

                $scope.$on('productCompareListChanged', function(event, data) {
                    $ctrl.itemsCount = compareProductService.getProductsCount();
                    initialize();
                });

                $ctrl.clearCompareList = function () {
                    compareProductService.clearComapreList();
                    $ctrl.products = [];
                    $rootScope.$broadcast('productCompareListChanged');
                }

                $ctrl.showBody = function () {
                    $ctrl.showedBody = !$ctrl.showedBody;
                }
            
                $ctrl.removeProduct = function (product) {
                    compareProductService.removeProduct(product.id)
                    $scope.products = _.without($ctrl.products, product);
                    $rootScope.$broadcast('productCompareListChanged');
                    $scope.getProductProperties();
                }
            }]
    });
