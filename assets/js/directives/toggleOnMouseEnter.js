var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcToggleOnMouseEnter', function () {
    return {
        require: ['?^uibDropdown', '?uibDropdownToggle'],
        link: function (scope, element, attrs, ctrls) {
            var dropdownCtrl = ctrls[0];
            var dropdownToggleCtrl = ctrls[1];
            if (!(dropdownCtrl && dropdownToggleCtrl)) {
                return;
            }

            element.addClass('toggle-on-mouse-enter');

            var openDropdown = function () {
                if (!element.hasClass('disabled') && !attrs.disabled) {
                    scope.$apply(function () {
                        dropdownCtrl.toggle(true);
                    });
                }
            };

            element.on('mouseenter', openDropdown);

            scope.$on('$destroy', function () {
                element.off('mouseenter', openDropdown);
            });
        }
    };
});
