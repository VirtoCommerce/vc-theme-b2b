var storefrontApp = angular.module('storefrontApp');

storefrontApp.config(['$provide', function ($provide) {
    $provide.decorator('uibDropdownDirective', ['$delegate', function ($delegate) {
        var directive = $delegate[0];
        var compile = directive.compile;
        directive.compile = function () {
            var link = compile.apply(this, arguments);
            return function (scope, element, attrs, dropdownCtrl) {
                if (attrs.autoClose === 'mouseleave') {
                    dropdownCtrl.toggle(false);
                }

                var closeDropdown = function() {
                    scope.$apply(function () {
                        if (attrs.autoClose === 'mouseleave') {
                            dropdownCtrl.toggle(false);
                        }
                    });
                };

                element.on('mouseleave', closeDropdown);

                link.apply(this, arguments);

                scope.$on('$destroy', function() {
                    element.off('mouseleave', closeDropdown);
                });
            };
        };
        return $delegate;
    }]);

    $provide.decorator('uibDropdownToggleDirective', ['$delegate', function($delegate) {
        var directive = $delegate[0];
        directive.controller = function () { };
        $delegate[0] = directive;
        return $delegate;
    }]);
}]);

storefrontApp.directive('toggleOnMouseEnter', function() {
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

storefrontApp.directive('dropdownClose', function () {
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
