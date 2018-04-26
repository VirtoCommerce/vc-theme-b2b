angular.module('storefrontApp')
	.component('addToListButton', {
		templateUrl: 'themes/assets/js/lists/add-to-list-button.tpl.html',
		bindings: {
			selectedVariation: '<'
		},
        controller: ['accountApi', 'listService', 'dialogService', function (accountApi, listService, dialogService) {
			var $ctrl = this;
			$ctrl.$onInit = function () {
				compareProductInLists();
			}

			function compareProductInLists() {
				$ctrl.buttonInvalid = true;
                listService.searchLists({
					pageSize: 10000,
					type: $ctrl.type
				}).then(function (response) {
					$ctrl.lists = response.data.results;
		
					_.each($ctrl.lists, function(list) {
						var foundItem = _.find(list.items, function(item) {
								return item.productId === $ctrl.selectedVariation.id;
						});
		
						if (foundItem) {
							list.contains = true;
							$ctrl.buttonInvalid = false;
						}
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
