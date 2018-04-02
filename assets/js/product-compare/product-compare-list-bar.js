angular.module('storefrontApp')
    .component('productCompareListBar', {
        templateUrl: "product-compare-list-bar.tpl.html",
        controller: ['compareProductService', 'catalogService', '$scope', '$rootScope',
            function(compareProductService, catalogService, $scope, $rootScope) {
                var $ctrl = this;
                $ctrl.showedBody = true;
                $ctrl.products = [];
                $ctrl.showBodyText = "Hide";
                $ctrl.showBodyIcon = "fa fa-angle-down";

                function initialize() {
                    var productsIds = compareProductService.getProductsIds();
                    if (!_.isEmpty(productsIds)) {
                        catalogService.getProducts(productsIds).then(function(response) {
                            $ctrl.products = response.data;
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
                    compareProductService.clearCompareList();
                    $ctrl.products = [];
                    $rootScope.$broadcast('productCompareListChanged');
                }

                $ctrl.showBody = function () {
                    $ctrl.showedBody = !$ctrl.showedBody;
                    if ($ctrl.showedBody) {
                        $ctrl.showBodyText = "Hide";
                        $ctrl.showBodyIcon = "fa fa-angle-down";
                    }
                    else {
                        $ctrl.showBodyText = "Show";
                        $ctrl.showBodyIcon = "fa fa-angle-up";
                    }
                }
            
                $ctrl.removeProduct = function (product) {
                    compareProductService.removeProduct(product.id)
                    $ctrl.products = _.without($ctrl.products, product);
                    $rootScope.$broadcast('productCompareListChanged');
                }
            }]
    });
