var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcErrors', {
    templateUrl: "themes/assets/errors.tpl.html",
    bindings: {
        message: '<',
        errors: '<'
    },
    controller: [function () {
        var $ctrl = this;
    }]
});
