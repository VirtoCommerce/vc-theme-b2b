var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcMemberDetail', {
    templateUrl: "themes/assets/memberDetail.tpl.html",
    bindings: {
        member: '=',
        memberComponent: '='
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;

        this.$onInit = function () {
            $ctrl.memberComponent = this;
        };

        this.$onDestroy = function () {
            $ctrl.memberComponent = null;
        };

        $ctrl.setForm = function (frm) {
            $ctrl.form = frm;
        };

        $ctrl.validate = function () {
            if ($ctrl.form) {
                $ctrl.form.$setSubmitted();
                return $ctrl.form.$valid;
            }
            return true;
        };
    }]
});
