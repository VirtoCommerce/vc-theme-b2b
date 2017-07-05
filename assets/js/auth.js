angular.module('storefront.account')
.factory('authService', ['storefrontApp.mainContext', '$http', '$interpolate', '$rootScope', function (mainContext, $http, $interpolate, $rootScope) {
    var serviceBase = 'http://localhost/admin';
    //var serviceBase = 'http://demovc-admin-dev.azurewebsites.net';
    var api_key = '1b5ad880c3ce44089f8312c3cde88645';

    var authContext = {
        userId: null,
        userLogin: null,
        fullName: null,
        userType: null,
        roles: null,
        permissions: null,
        isAuthenticated: false
    };

    authContext.fillAuthData = function (userName) {
        return $http.get(serviceBase + '/api/platform/security/users/' + (userName || mainContext.customer.userName) + '?api_key=' + api_key).then(
            function (results) {
                changeAuth(results.data)
                $rootScope.$broadcast('loginStatusChanged', authContext);
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
    };

    return authContext;
}]);