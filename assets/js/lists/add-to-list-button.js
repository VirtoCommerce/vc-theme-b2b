angular.module('storefrontApp')
	.component('addToListButton', {
		templateUrl: 'themes/assets/js/lists/add-to-list-button.tpl.html',
		bindings: {
			selectedVariation: '<'
		},
        controller: ['accountApi', 'dialogService', 'listsApi', 'customerService', function (accountApi, dialogService, listsApi, customerService) {
			var $ctrl = this;
			$ctrl.$onInit = function () {
				compareProductInLists();
			}

			function compareProductInLists() {
				$ctrl.buttonInvalid = true;
                listsApi.searchLists({
					pageSize: 10000,
					type: $ctrl.type
				}).then(function (response) {
					$ctrl.lists = response.data.results;

					if ($ctrl.lists) {
						var nameLists = _.pluck($ctrl.lists, 'name');
						listsApi.getListsWithProduct($ctrl.selectedVariation.id, nameLists, $ctrl.type).then(function(containsResponse) {
							var containsLists = containsResponse.data;
							if (containsLists) {
								_.each($ctrl.lists, function(list) {
									list.contains = _.contains(containsLists, list.name);
								});
							}
						});
					}
				});
				customerService.getCurrentCustomer().then(function(response) {
					$ctrl.customer = response.data;
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
				dialogService.showDialog(dialogData, 'recentlyAddedListItemDialogController', 'storefront.lists-added-list-item-dialog.tpl');
            }

            $ctrl.signInToProceed = function() {
                dialogService.showDialog({ title: 'Add product to list...' }, 'universalDialogController', 'storefront.sign-in-to-proceed.tpl');
            }

		}]
	})
