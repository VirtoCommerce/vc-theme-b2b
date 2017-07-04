angular.module('storefront.account')
.component('vcAccountProfileUpdate', {
    templateUrl: "themes/assets/js/account/account-profile-update.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefrontApp.mainContext', '$scope', 'authService', 'loadingIndicatorService', 'storefront.corporateAccountApi', function (mainContext, $scope, authService, loader, corporateAccountApi) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.currentMember = mainContext.customer;

        this.$routerOnActivate = function (next) {
            loader.wrapLoading(function () {
                return corporateAccountApi.getCompanyMember({ id: $ctrl.currentMember.id }, function (member) {
                    $ctrl.member = {
                        id: member.id,
                        firstName: member.firstName,
                        lastName: member.lastName,
                        email: _.first(member.emails),
                        organizations: member.organizations,
                        title: member.title,
                        addresses: member.addresses
                    };
                }).$promise;
            });
        };

        $ctrl.logins = authService.userLogin ? [authService.userLogin] : [];
        $scope.$on('loginStatusChanged', function (e, authContext) {
            if (!$ctrl.logins.length)
                $ctrl.logins = [authContext.userLogin];
        });

        $ctrl.submit = function () {
            $ctrl.member.fullName = $ctrl.member.firstName + ' ' + $ctrl.member.lastName;
            $ctrl.member.emails = [$ctrl.member.email];

            return loader.wrapLoading(function () {
                return corporateAccountApi.updateCompanyMember($ctrl.member).$promise;
            });
        };
    }]
});
