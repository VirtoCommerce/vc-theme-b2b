angular.module('storefront.account')
.directive('vaPermission', ['authService', function (authService) {
    return {
        link: function (scope, element, attrs) {
            if (attrs.vaPermission) {
                var permissionValue = attrs.vaPermission.trim();

                //modelObject is a scope property of the parent/current scope
                scope.$watch(attrs.securityScopes, function (value) {
                    if (value) {
                        toggleVisibilityBasedOnPermission(value);
                    }
                });

                function toggleVisibilityBasedOnPermission(securityScopes) {
                    var hasPermission = authService.checkPermission(permissionValue, securityScopes);
                    if (hasPermission)
                        element.show();
                    else
                        element.hide();
                }

                toggleVisibilityBasedOnPermission();
            }
        }
    };
}]);