var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productController', ['$rootScope', '$scope', '$window', '$timeout', 'dialogService', 'catalogService', 'cartService', 'quoteRequestService', 'customerService', 'listService',
    function ($rootScope, $scope, $window, $timeout, dialogService, catalogService, cartService, quoteRequestService, customerService, listService) {
    //TODO: prevent add to cart not selected variation
    // display validator please select property
    // display price range

    var allVariations = [];
  
    $scope.selectedVariation = {};
    $scope.allVariationPropsMap = {};
    $scope.productPrice = null;
    $scope.productPriceLoaded = false;

    $scope.addProductToCart = function (product, quantity) {
        var dialogData = toDialogDataModel(product, quantity);
        dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl');
        cartService.addLineItem(product.id, quantity).then(function (response) {
            $rootScope.$broadcast('cartItemsChanged');
        });
    }

    // TODO: Replace mock with real function
    $scope.addProductsToCartMock = function () {
        var rejection = {
            data: {
                message: "The 1 product(s) below was not added to cart:",
                modelState: {
                    "Test": "Test"
                }
            }
        };
        var items = [
            {
                id: "9cbd8f316e254a679ba34a900fccb076",
                name: "3DR Solo Quadcopter (No Gimbal)",
                imageUrl: "//localhost/admin/assets/catalog/1428965138000_1133723.jpg",
                price: {
                    actualPrice: {
                        formattedAmount: "$896.39"
                    },
                    actualPriceWithTax: {
                        formattedAmount: "$1,075.67"
                    },
                    listPrice: {
                        formattedAmount: "$995.99"
                    },
                    listPriceWithTax: {
                        formattedAmount: "$1,195.19"
                    },
                    extendedPrice: {
                        formattedAmount: "$1,792.78"
                    },
                    extendedPriceWithTax: {
                        formattedAmount: "$2,151.34"
                    }
                },
                quantity: 2,
                url: "~/camcorders/aerial-imaging-drones/3dr-solo-quadcopter-no-gimbal"
            },
            {
                id: "ad4ae79ffdbc4c97959139a0c387c72e",
                name: "Samsung Galaxy Note 4 SM-N910C 32GB",
                imageUrl: "//localhost/admin/assets/catalog/1416164841000_1097106.jpg",
                price: {
                    actualPrice: {
                        formattedAmount: "$530.99"
                    },
                    actualPriceWithTax: {
                        formattedAmount: "$637.19"
                    },
                    listPrice: {
                        formattedAmount: "$589.99"
                    },
                    listPriceWithTax: {
                        formattedAmount: "$707.99"
                    },
                    extendedPrice: {
                        formattedAmount: "$1,592.97"
                    },
                    extendedPriceWithTax: {
                        formattedAmount: "$1,911.57"
                    }
                },
                quantity: 5,
                url: "~/cell-phones/samsung-galaxy-note-4-sm-n910c-32gb"
            }
        ];
        var dialogData = toDialogDataModelMock(items, rejection);
        dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl');
    }

    $scope.addProductToCartById = function (productId, quantity, event) {
        event.preventDefault();
        catalogService.getProduct([productId]).then(function (response) {
            if (response.data && response.data.length) {
                var product = response.data[0];
                $scope.addProductToCart(product, quantity);
            }
        });
    }

    $scope.addProductToWishlist = function (product) {
        var dialogData = toDialogDataModel(product, 1);
        dialogService.showDialog(dialogData, 'recentlyAddedListItemDialogController', 'storefront.recently-added-list-item-dialog.tpl');
    }

    $scope.addProductToActualQuoteRequest = function (product, quantity) {
        var dialogData = toDialogDataModel(product, quantity);
        dialogService.showDialog(dialogData, 'recentlyAddedActualQuoteRequestItemDialogController', 'storefront.recently-added-actual-quote-request-item-dialog.tpl');
        quoteRequestService.addProductToQuoteRequest(product.id, quantity).then(function (response) {
            $rootScope.$broadcast('actualQuoteRequestItemsChanged');
        });
    }

    function toDialogDataModel(items, quantity) {
        return {
            id: product.id,
            name: product.name,
            imageUrl: product.primaryImage ? product.primaryImage.url : null,
            listPrice: product.price.listPrice,
			listPriceWithTax: product.price.listPriceWithTax,
            placedPrice: product.price.actualPrice,
            placedPriceWithTax: product.price.actualPriceWithTax,
            quantity: quantity,
            updated: false
        }
    }

    function toDialogDataModelMock(items, rejection) {
        var dialogDataModel = {};
        if (rejection) {
            dialogDataModel.errorMessage = rejection.data.message;
            dialogDataModel.errors = rejection.data.modelState;
        }
        dialogDataModel.items = items;
        return dialogDataModel;
    }

    function initialize() {
        var productIds = _.map($window.products, function (product) { return product.id });
        if (!productIds || !productIds.length) {
            return;
        }
        catalogService.getProduct(productIds).then(function (response) {
            var product = response.data[0];
                //Current product is also a variation (titular)
                allVariations = [product].concat(product.variations || []);
                $scope.allVariationPropsMap = getFlatternDistinctPropertiesMap(allVariations);

            //Auto select initial product as default variation  (its possible because all our products is variations)
            var propertyMap = getVariationPropertyMap(product);
            _.each(_.keys(propertyMap), function (x) {
                $scope.checkProperty(propertyMap[x][0])
            });
            $scope.selectedVariation = product;
            compareProductInLists(product.id);
        });        
    };

    function getFlatternDistinctPropertiesMap(variations) {
        var retVal = {};
        _.each(variations, function (variation) {
            var propertyMap = getVariationPropertyMap(variation);
            //merge
            _.each(_.keys(propertyMap), function (x) {
                    retVal[x] = _.uniq(_.union(retVal[x], propertyMap[x]), "value");
            });
        });
        return retVal;
    };

    function getVariationPropertyMap(variation) {
            return _.groupBy(variation.variationProperties, function (x) { return x.displayName });
        }

    function getSelectedPropsMap(variationPropsMap) {
        var retVal = {};
        _.each(_.keys(variationPropsMap), function (x) {
            var property = _.find(variationPropsMap[x], function (y) {
                return y.selected;
            });
            if (property) {
                retVal[x] = [property];
            }
        });
        return retVal;
        }

    function comparePropertyMaps(propMap1, propMap2) {
        return _.every(_.keys(propMap1), function (x) {
            var retVal = propMap2.hasOwnProperty(x);
            if (retVal) {
                    retVal = propMap1[x][0].value == propMap2[x][0].value;
            }
            return retVal;
        });
    };

    function findVariationBySelectedProps(variations, selectedPropMap) {
            return _.find(variations, function (x) {
                return comparePropertyMaps(getVariationPropertyMap(x), selectedPropMap);
        });
    }

    function compareProductInLists(productId) {
        $scope.buttonInvalid = true;
        var listNames = [{ title: 'shopping' }, { title: 'wish' }];
        angular.forEach(listNames, function (listName) {
            listService.contains(productId, listName.title).then(function (result) {
                if (result && (result.data.contains == false)) {
                    $scope.buttonInvalid = false;
                }
            });
        })
    }

        //Method called from View when user clicks one property value
    $scope.checkProperty = function (property) {
            //Select appropriate property and unselect previous selection
            _.each($scope.allVariationPropsMap[property.displayName], function (x) {
            x.selected = x != property ? false : !x.selected;
        });

            //try to find the best variation match for selected properties
            $scope.selectedVariation = findVariationBySelectedProps(allVariations, getSelectedPropsMap($scope.allVariationPropsMap));
    };  

    initialize();
}]);
