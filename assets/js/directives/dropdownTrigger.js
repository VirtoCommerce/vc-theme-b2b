var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcDropdownTrigger', function () {
    return {
        require: ['?^uibDropdown', '?uibDropdownToggle'],
        link: function (scope, element, attrs, ctrls) {
            if (attrs.vcDropdownTrigger === 'mouseenter') {
                var dropdownCtrl = ctrls[0];
                var dropdownToggleCtrl = ctrls[1];
                if (!(dropdownCtrl && dropdownToggleCtrl)) {
                    return;
                }

                element.addClass('dropdown-trigger-mouseenter');

                var openDropdown = function() {
                    if (!element.hasClass('disabled') && !attrs.disabled) {
                        scope.$apply(function() {
                            dropdownCtrl.toggle(true);
                        });
                    }
                };

                element.on('mouseenter', openDropdown);

                scope.$on('$destroy', function() {
                    element.off('mouseenter', openDropdown);
                });
            }
        }
    };
});
