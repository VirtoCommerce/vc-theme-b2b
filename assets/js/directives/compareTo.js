//https://stackoverflow.com/questions/45102658/confirm-password-validation-angularjs-material-design
var storefrontApp = angular.module('storefrontApp');
storefrontApp.directive('compareTo', function () {
    return {
        require: "ngModel",
        scope: {
            compareTolValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function (modelValue) {

                return modelValue == scope.compareTolValue;
            };

            scope.$watch("compareTolValue", function () {
                ngModel.$validate();
            });
        }
    };
});
