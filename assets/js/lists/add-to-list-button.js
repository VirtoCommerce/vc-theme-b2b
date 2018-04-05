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
                accountApi.getCurrentUser().then(function(user) {
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
