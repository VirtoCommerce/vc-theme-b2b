angular.module('storefront.account')
.component('vcAccountProfileUpdate', {
    templateUrl: "themes/assets/account-profile-update.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['$q', '$scope', 'storefrontApp.mainContext', 'accountApi', 'loadingIndicatorService', 'b2bRoles', function ($q, $scope, mainContext, accountApi, loader, b2bRoles) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.availableRoles = b2bRoles;
        $ctrl.member = mainContext.customer;

        $scope.$watch(
            function () { return mainContext.customer; },
            function (customer) {
                $ctrl.member = customer;
                if ($ctrl.member.roles && $ctrl.member.roles.length) {
                    $ctrl.member.role = _.find($ctrl.availableRoles, function (x) { return x.id == $ctrl.member.roles[0].id });
                }
            });


        $ctrl.submit = function () {
            $ctrl.member.fullName = $ctrl.member.firstName + ' ' + $ctrl.member.lastName;
            $ctrl.member.emails = [$ctrl.member.email];
            if ($ctrl.member.role) {
                $ctrl.member.roles = [$ctrl.member.role.id];
            }

            return loader.wrapLoading(function () {
                return accountApi.updateUser($ctrl.member).then(function (response) {
                    return mainContext.loadCustomer().then(function (customer) {
                        $ctrl.member = customer;
                    });
                });
            });
        };
    }]
});
