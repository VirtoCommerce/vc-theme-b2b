angular.module('storefrontApp')

    .component('vcLabeledSelect', {
        templateUrl: "themes/assets/labeled-select.tpl.html",
        require: {
            ngModel: "?ngModel"
        },
        bindings: {
            options: '<',
            select: '&',
            form: '<',
            name: '@',
            placeholder: '<',
            required: '<',
            requiredError: '@?',
            autofocus: '<',
            isOpen: '=?',
            disabled: '<'
        },
        controller: ['$scope', function ($scope) {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                if ($ctrl.required)
                    $ctrl.ngModel.$setValidity('required', false);
                $ctrl.ngModel.$render = function () {
                    $ctrl.value = $ctrl.ngModel.$viewValue;
                };
            };

            $ctrl.validate = function () {
                $ctrl.form.$setSubmitted();
                return $ctrl.form.$valid;
            };

            var select = $ctrl.select;
            $ctrl.select = function (option) {
                $ctrl.value = option;
                if ($ctrl.required)
                    $ctrl.ngModel.$setValidity('required', false);
                $ctrl.ngModel.$setViewValue($ctrl.value);
                select(option);
            };
        }]
    });
