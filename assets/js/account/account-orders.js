angular.module('storefront.account')
    .component('vcAccountOrders', {
        templateUrl: "themes/assets/js/account/account-orders.tpl.liquid",
        $routeConfig: [
            { path: '/', name: 'OrderList', component: 'vcAccountOrdersList', useAsDefault: true },
            { path: '/:number', name: 'OrderDetail', component: 'vcAccountOrderDetail' }
        ],
        controller: [function () {
            var $ctrl = this;
        }]
    })
    .component('vcAccountOrdersList', {
        templateUrl: "account-orders-list.tpl",
        controller: ['accountApi', 'loadingIndicatorService', '$window', 'sortAscending', 'sortDescending', 'orderStatuses', function (accountApi, loader, $window, sortAscending, sortDescending, orderStatuses ) {
            var $ctrl = this;
            $ctrl.sortDescending = sortDescending;
            $ctrl.sortAscending = sortAscending;
            $ctrl.orderStatuses = orderStatuses;
            $ctrl.selectedStatus = "All";
            $ctrl.loader = loader;
            $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 10, numPages: 10 };
            $ctrl.pageSettings.pageChanged = function () {
                loadData();
            };

            $ctrl.getInvoicePdf = function (orderNumber) {
                var url = $window.BASE_URL + 'storefrontapi/orders/' + orderNumber + '/invoice';
                $window.open(url, '_blank');
            }

            $ctrl.sortInfos = {
                sortBy: 'number',
                sortDirection: sortDescending
            }

            $ctrl.sortChanged = function (sortBy) {
                $ctrl.sortInfos.sortDirection = ($ctrl.sortInfos.sortBy === sortBy) ?
                invertSortDirection($ctrl.sortInfos.sortDirection)
                : sortAscending;
                $ctrl.sortInfos.sortBy = sortBy;
                loadData();
            }

            $ctrl.selectedStatusChanged = function () {
                $ctrl.pageSettings.currentPage = 1;
                loadData();
            }

            $ctrl.getSortDirection = function (fieldName) {
                return $ctrl.sortInfos.sortBy === fieldName ? $ctrl.sortInfos.sortDirection : '';
            }

            function loadData() {
                return loader.wrapLoading(function () {
                    return accountApi.searchUserOrders({
                        pageNumber: $ctrl.pageSettings.currentPage,
                        pageSize: $ctrl.pageSettings.itemsPerPageCount,
                        sort: `${$ctrl.sortInfos.sortBy}:${$ctrl.sortInfos.sortDirection}`,
                        status: getSelectedStatus(),
                    }).then(function (response) {
                        $ctrl.entries = response.data.results;
                        $ctrl.pageSettings.totalItems = response.data.totalCount;
                    });
                });
            }

            function invertSortDirection(sortDirection) {
                return sortDirection == sortAscending ? sortDescending : sortAscending;
            }

            function getSelectedStatus() {
                return $ctrl.selectedStatus === "All" ? '' : $ctrl.selectedStatus;
            }

            this.$routerOnActivate = function (next) {
                $ctrl.pageSettings.currentPage = next.params.pageNumber || $ctrl.pageSettings.currentPage;
                $ctrl.pageSettings.pageChanged();
            };
        }]
    })
    .component('vcAccountOrderDetail', {
        templateUrl: "account-order-detail.tpl",
        require: {
            accountManager: '^vcAccountManager'
        },
        controller: ['$rootScope', '$window', 'loadingIndicatorService', 'confirmService', 'accountApi', 'inventoryApi', function($rootScope, $window, loader, confirmService, accountApi, inventoryApi) {
            var $ctrl = this;
            $ctrl.loader = loader;
            $ctrl.hasPhysicalProducts = true;
            var loadPromise;

            function refresh() {
                loader.wrapLoading(function () {
                    return accountApi.getUserOrder($ctrl.orderNumber).then(function (result) {
                        $ctrl.order = result.data;
                        return $ctrl.order;
                    }).then(function (order) {
                        var lastPayment = _.last(_.sortBy(order.inPayments, 'createdDate'));
                        $ctrl.billingAddress = (lastPayment && lastPayment.billingAddress) ||
                            _.findWhere(order.addresses, { type: 'billing' }) ||
                            _.first(order.addresses);

                        accountApi.getUserOrderNewPaymentData(order.number).then(function (response) {
                            _.each($ctrl.order.inPayments, function (x) {
                                var paymentMethod = _.find(response.data.paymentMethods, function (pm) { return pm.code == x.gatewayCode; });
                                if (paymentMethod) {
                                    x.paymentMethod = paymentMethod;
                                }
                            });
                        });

                        //Workaround because order doesn't have any properties for pickup delivery method
                        $ctrl.deliveryMethod = { type: 'shipping' };
                        inventoryApi.searchFulfillmentCenters({}).then(function(response) {
                            $ctrl.deliveryMethod.fulfillmentCenter = _.find(response.data.results, function(x) { return x.address.line1 == order.shipments[0].deliveryAddress.line1; });
                            if ($ctrl.deliveryMethod.fulfillmentCenter) {
                                $ctrl.deliveryMethod.type ='pickup';
                            }
                        });
                    });
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

            var components = [];
            $ctrl.addComponent = function (component) {
                components.push(component);
            };
            $ctrl.removeComponent = function (component) {
                components = _.without(components, component);
            };

            function outerRedirect(absUrl) {
                $window.location.href = absUrl;
            };
        }]
    })
    .filter('orderToSummarizedStatusLabel', [function () {
        return function (order) {
            if (!order)
                return false;

            var retVal = order.status || 'New';

            return retVal;
        };
    }]);
