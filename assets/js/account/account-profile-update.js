angular.module('storefront.account')
.component('vcAccountProfileUpdate', {
    templateUrl: "themes/assets/account-profile-update.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['$q', '$scope', 'storefrontApp.mainContext', 'accountApi', 'loadingIndicatorService', 'availableRoles', function ($q, $scope, mainContext, accountApi, loader, availableRoles) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.availableRoles = availableRoles;
        $ctrl.member = mainContext.customer;
  
        $scope.$watch(
            function () { return mainContext.customer; },
            function (customer) {
                $ctrl.member = customer;
                if ($ctrl.member.roles) {
                    $ctrl.member.role = _.find($ctrl.availableRoles, function (x) { return x.id == $ctrl.member.roles[0].id });
                }
            });


        $ctrl.submit = function () {
            $ctrl.member.fullName = $ctrl.member.firstName + ' ' + $ctrl.member.lastName;
            $ctrl.member.emails = [$ctrl.member.email];
            $ctrl.member.roles = [$ctrl.member.role.id];

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
