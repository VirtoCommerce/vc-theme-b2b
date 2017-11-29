var storefrontApp = angular.module('storefrontApp');

storefrontApp.config(['$provide', function ($provide) {
    $provide.decorator('uibDropdownService', ['$delegate', function($delegate) {
        var service = $delegate;
        var close = service.close;
        service.close = function (dropdownScope, element, appendTo) {
            dropdownScope.focusToggleElement = function() {};
            close(dropdownScope, element, appendTo);
        }
        return $delegate;
    }]);

    $provide.decorator('uibDropdownDirective', ['$delegate', function ($delegate) {
        var directive = $delegate[0];
        var compile = directive.compile;
        directive.compile = function () {
            var link = compile.apply(this, arguments);
            return function (scope, element, attrs, dropdownCtrl) {
                if (attrs.autoClose === 'mouseleave') {
                    dropdownCtrl.toggle(false);
                }

                var closeDropdown = function () {
                    scope.$apply(function () {
                        if (attrs.autoClose === 'mouseleave') {
                            dropdownCtrl.toggle(false);
                        }
                    });
                };

                element.on('mouseleave', closeDropdown);

                link.apply(this, arguments);

                scope.$on('$destroy', function () {
                    element.off('mouseleave', closeDropdown);
                });
            };
        };
        return $delegate;
    }]);

    $provide.decorator('uibDropdownToggleDirective', ['$delegate', function ($delegate) {
        var directive = $delegate[0];
        directive.controller = function () { };
        $delegate[0] = directive;
        return $delegate;
    }]);
}]);
