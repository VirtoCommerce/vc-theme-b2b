angular.module('storefront.account')
.component('vcAccountAddresses', {
    templateUrl: "themes/assets/account-addresses.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefrontApp.mainContext', 'confirmService', '$translate', '$scope', 'accountApi', 'loadingIndicatorService', function (mainContext, confirmService, $translate, $scope, accountApi, loader) {
        var $ctrl = this;
        $ctrl.loader = loader;

        $ctrl.currentMember = mainContext.customer;
        $scope.$watch(
            function () { return mainContext.customer; },
            function (customer) {
                $ctrl.currentMember = customer;
            });

        $ctrl.addNewAddress = function () {
            if (_.last(components).validate()) {
                $ctrl.currentMember.addresses.push($ctrl.newAddress);
                $ctrl.newAddress = null;
                $ctrl.updateAddresses($ctrl.currentMember);              
            }
        };

        $ctrl.setAsDefault = function(address) {
            $ctrl.currentMember.defaultShippingAddress = $ctrl.currentMember.contact.defaultShippingAddress = address;
            $ctrl.updateCustomer($ctrl.currentMember);
        }

        $ctrl.submit = function () {
            if (components[$ctrl.editIndex].validate()) {
                angular.copy($ctrl.editAddress, $ctrl.currentMember.addresses[$ctrl.editIndex]);
                $ctrl.updateAddresses($ctrl.currentMember, $ctrl.cancel);
            }
        };

        $ctrl.cancel = function () {
            $ctrl.editIndex = -1;
            $ctrl.editAddress = null;
        };

        $ctrl.edit = function ($index) {
            $ctrl.editIndex = $index;
            $ctrl.editAddress = angular.copy($ctrl.currentMember.addresses[$ctrl.editIndex]);
        };

        $ctrl.delete = function ($index) {
            var showDialog = function (text) {
                confirmService.confirm(text).then(function (confirmed) {
                    if (confirmed) {
                        $ctrl.currentMember.addresses.splice($index, 1);
                        $ctrl.updateAddresses($ctrl.currentMember);
                    }
                });
            };

            $translate('customer.addresses.delete_confirm').then(showDialog, showDialog);
        };

        $ctrl.updateCustomer = function (customer, handler) {
            return loader.wrapLoading(function () {
                if (customer.role) {
                    customer.roles = [customer.role.id];
                }
                return accountApi.updateUser(customer).then(function () {
                    return mainContext.loadCustomer().then(function (customer) {
                        $ctrl.currentMember = customer;
                        if (handler) {
                            handler();
                        }
                    });
                });
            });
        };

        $ctrl.updateAddresses = function (companyMember, handler) {
            return loader.wrapLoading(function () {
                return accountApi.updateUserAddresses(companyMember.addresses).then(function () {
                    return mainContext.loadCustomer().then(function (customer) {
                        $ctrl.currentMember = customer;
                        if (handler) {
                            handler();
                        }
                    });
                });
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
