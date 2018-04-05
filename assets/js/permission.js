angular.module('storefrontApp')
    .directive('vaPermission', ['storefrontApp.mainContext', function (mainContext) {
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

                function checkPermission(user, permission, securityScopes) {
                    //first check admin permission
                    // var hasPermission = $.inArray('admin', authContext.permissions) > -1;
                    var hasPermission = user.isAdministrator;
                    if (!hasPermission && permission) {
                        permission = permission.trim();
                        //first check global permissions
                        hasPermission = $.inArray(permission, user.permissions) > -1;
                        if (!hasPermission && securityScopes) {
                            if (typeof securityScopes === 'string' || angular.isArray(securityScopes)) {
                                securityScopes = angular.isArray(securityScopes) ? securityScopes : securityScopes.split(',');
                                //Check permissions in scope
                                hasPermission = _.some(securityScopes, function (x) {
                                    var permissionWithScope = permission + ":" + x;
                                    var retVal = $.inArray(permissionWithScope, user.permissions) > -1;
                                    //console.log(permissionWithScope + "=" + retVal);
                                    return retVal;
                                });
                            }
                        }
                    }
                    return hasPermission;
                };

                function toggleVisibilityBasedOnPermission(securityScopes) {
                    var hasPermission = checkPermission(mainContext.user, permissionValue, securityScopes);
                    if (hasPermission)
                        angular.element(element).show();
                    else
                        angular.element(element).hide();
                }
                toggleVisibilityBasedOnPermission();
                scope.$on('loginStatusChanged', toggleVisibilityBasedOnPermission);
            }
        }
    };
}]);
