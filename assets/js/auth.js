angular.module('storefront.account')
.factory('authService', ['storefrontApp.mainContext', '$http', '$interpolate', '$rootScope', function (mainContext, $http, $interpolate, $rootScope) {
    var serviceBase = 'http://localhost/admin/' + '/api/platform/security/users/';
    var authContext = {
        userId: null,
        userLogin: null,
        fullName: null,
        userType: null,
        roles: null,
        permissions: null,
        isAuthenticated: false
    };

    authContext.fillAuthData = function () {
        $http.get(serviceBase + mainContext.customer.userName).then(
            function (results) {
                changeAuth(results.data);
            },
            function (error) { });
    };

    authContext.checkPermission = function (permission, securityScopes) {
        //first check admin permission
        // var hasPermission = $.inArray('admin', authContext.permissions) > -1;
        var hasPermission = authContext.isAdministrator;
        if (!hasPermission && permission) {
            permission = permission.trim();
            //first check global permissions
            hasPermission = $.inArray(permission, authContext.permissions) > -1;
            if (!hasPermission && securityScopes) {
                if (typeof securityScopes === 'string' || angular.isArray(securityScopes)) {
                    securityScopes = angular.isArray(securityScopes) ? securityScopes : securityScopes.split(',');
                    //Check permissions in scope
                    hasPermission = _.some(securityScopes, function (x) {
                        var permissionWithScope = permission + ":" + x;
                        var retVal = $.inArray(permissionWithScope, authContext.permissions) > -1;
                        //console.log(permissionWithScope + "=" + retVal);
                        return retVal;
                    });
                }
            }
        }
        return hasPermission;
    };

    function changeAuth(results) {
        authContext.userId = results.id;
        authContext.roles = results.roles;
        authContext.permissions = results.permissions;
        authContext.userLogin = results.userName;
        authContext.fullName = results.userLogin;
        authContext.isAuthenticated = results.userName != null;
        authContext.userType = results.userType;
        authContext.isAdministrator = results.isAdministrator;
        //Interpolate permissions to replace some template to real value
        if (authContext.permissions) {
            authContext.permissions = _.map(authContext.permissions, function (x) {
                return $interpolate(x)(authContext);
            });
        }

        $rootScope.$broadcast('loginStatusChanged', authContext);
    };

    return authContext;
}]);