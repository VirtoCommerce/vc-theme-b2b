angular.module('storefrontApp')
    .directive('vaPermission', ['storefrontApp.mainContext', function (mainContext) {
    return {
        link: function (scope, element, attrs) {
            if (attrs.vaPermission) {
                var permissionValue = attrs.vaPermission.trim();

                function checkPermission(user, permission) {
                    //first check admin permission
                    var hasPermission = user.isAdministrator;
                    if (!hasPermission && permission) {
                        permission = permission.trim();
                        //check global permissions
                        hasPermission = $.inArray(permission, user.permissions) > -1;
                    }
                    return hasPermission;
                };

                function toggleVisibilityBasedOnPermission(user) {
                    var hasPermission = checkPermission(user, permissionValue);
                    if (hasPermission)
                        angular.element(element).show();
                    else
                        angular.element(element).hide();
                }

                toggleVisibilityBasedOnPermission(mainContext.customer);

                
                scope.$watch(function () { return mainContext.customer; }, function (value) {
                    if (value) {
                        toggleVisibilityBasedOnPermission(value);
                    }
                });
            }
        }
    };
}]);
