var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcDropdownClose', function () {
    return {
        require: ['?^uibDropdown'],
        link: function (scope, element, attrs, ctrls) {
            var dropdownCtrl = ctrls[0];
            if (!dropdownCtrl) {
                return;
            }

            var closeDropdown = function () {
                if (!element.hasClass('disabled') && !attrs.disabled) {
                    scope.$apply(function () {
                        dropdownCtrl.toggle(false);
                    });
                }
            };

            element.on('click', closeDropdown);

            scope.$on('$destroy', function () {
                element.off('click', closeDropdown);
            });
        }
    };
});
