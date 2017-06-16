angular.module('storefront.account')
.component('vcAccountPermissions', {
    templateUrl: "themes/assets/js/account/account-permissions.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['loadingIndicatorService', '$scope', function (loader, $scope) {
        var $ctrl = this;
        $ctrl.loader = loader;
        
        $scope.permissions = [];
    }]
});
