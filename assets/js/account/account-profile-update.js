angular.module('storefront.account')
.component('vcAccountProfileUpdate', {
    templateUrl: "themes/assets/js/account/account-profile-update.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefrontApp.mainContext', '$scope', 'authService', 'loadingIndicatorService', function (mainContext, $scope, authService, loader) {
        var $ctrl = this;
        $ctrl.loader = loader;

        $scope.$watch(
            function () { return mainContext.customer; },
            function (newValue) {
                $ctrl.changeData =
                {
                    firstName: mainContext.customer.firstName,
                    lastName: mainContext.customer.lastName,
                    email: mainContext.customer.email
                };
            });

        $ctrl.logins = authService.userLogin ? [authService.userLogin] : [];
        $scope.$on('loginStatusChanged', function(e, authContext) {
            if (!$ctrl.logins.length)
                $ctrl.logins = [authContext.userLogin];
        });

        $ctrl.submit = function () {
            // no validation
            $ctrl.accountManager.updateProfile($ctrl.changeData);
        };
    }]
});