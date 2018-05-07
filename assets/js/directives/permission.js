angular.module('storefrontApp')
    .directive('vaPermission', ['storefrontApp.mainContext', function (mainContext) {
    return {
        link: function (scope, element, attrs) {
            if (attrs.vaPermission) {
                var permissionValue = attrs.vaPermission.trim();

                function checkPermission(user, permission) {
                    var result = angular.isDefined(user);
                    if (result) {
                        //first check admin permission
                        result = user.isAdministrator;
                        if (!result && permission) {
                            permission = permission.trim();
                            //check global permissions
                            result = $.inArray(permission, user.permissions) > -1;
                        }
                    }
                    return result;
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
