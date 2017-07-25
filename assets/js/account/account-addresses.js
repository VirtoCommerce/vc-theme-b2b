angular.module('storefront.account')
.component('vcAccountAddresses', {
    templateUrl: "themes/assets/account-addresses.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefrontApp.mainContext', 'confirmService', '$translate', '$scope', 'storefront.corporateAccountApi', 'storefront.corporateApiErrorHelper', 'loadingIndicatorService', function (mainContext, confirmService, $translate, $scope, corporateAccountApi, corporateApiErrorHelper, loader) {
        var $ctrl = this;
        $ctrl.loader = loader;
        
        $scope.$watch(
            function () { return mainContext.customer; },
            function (customer) {
                if (customer) {
                    loader.wrapLoading(function() {
                        return corporateAccountApi.getCompanyMember({ id: customer.id }, function (member) {
                            $ctrl.currentMember = member;
                        }).$promise;
                    });
                }
            });

        $ctrl.addNewAddress = function () {
            if (_.last(components).validate()) {
                $ctrl.currentMember.addresses.push($ctrl.newAddress);
                $ctrl.newAddress = null;
                $ctrl.updateCompanyMember($ctrl.currentMember);
            }
        };

        $ctrl.submit = function () {
            if (components[$ctrl.editIdx].validate()) {
                angular.copy($ctrl.editItem, $ctrl.currentMember.addresses[$ctrl.editIdx]);
                $ctrl.updateCompanyMember($ctrl.currentMember, $ctrl.cancel);
            }
        };

        $ctrl.cancel = function () {
            $ctrl.editIdx = -1;
            $ctrl.editItem = null;
        };

        $ctrl.edit = function ($index) {
            $ctrl.editIdx = $index;
            $ctrl.editItem = angular.copy($ctrl.currentMember.addresses[$ctrl.editIdx]);
        };

        $ctrl.delete = function ($index) {
            var showDialog = function (text) {
                confirmService.confirm(text).then(function (confirmed) {
                    if (confirmed) {
                        $ctrl.currentMember.addresses.splice($index, 1);
                        $ctrl.updateCompanyMember($ctrl.currentMember);
                    }
                });
            };

            $translate('customer.addresses.delete_confirm').then(showDialog, showDialog);
        };

        $ctrl.updateCompanyMember = function (companyMember, handler) {
            return loader.wrapLoading(function () {
                return corporateAccountApi.updateCompanyMember(companyMember, handler, function (response) {
                    corporateApiErrorHelper.clearErrors($scope);
                }).$promise;
            });
        };

        var components = [];
        $ctrl.addComponent = function (component) {
            components.push(component);
        };
        $ctrl.removeComponent = function (component) {
            components = _.without(components, component);
        };
    }]
});
