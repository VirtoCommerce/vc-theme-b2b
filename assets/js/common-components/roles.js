var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcRoles', {
    templateUrl: "themes/assets/roles.tpl.html.liquid",
    bindings: {
        value: '=',
        availableRoles: "<",
        form: '=',
        name: "@",
        required: "<",
        disabled: "<"
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;
        $ctrl.loader = loader;
    }]
});
