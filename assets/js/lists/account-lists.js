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
