angular.module('storefront.account')
.factory('authService', ['storefrontApp.mainContext', '$http', '$interpolate', '$rootScope', function (mainContext, $http, $interpolate, $rootScope) {
    var serviceBase = 'http://localhost/admin';
    //var serviceBase = 'http://demovc-admin-dev.azurewebsites.net';
    var api_key = '1b5ad880c3ce44089f8312c3cde88645';

    var userService = '/api/platform/security/users/';
    var currentAuthContext = {
        userId: null,
        userLogin: null,
        fullName: null,
        userType: null,
        roles: null,
        permissions: null,
        isAuthenticated: false
    };

    currentAuthContext.fillAuthData = function (userName) {
        return $http.get(serviceBase + userService + (userName || mainContext.customer.userName) + '?api_key=' + api_key).then(
            function (results) {
                var authContext = changeAuth(results.data);
                if (!userName) {
                    angular.extend(currentAuthContext, authContext);
                    $rootScope.$broadcast('loginStatusChanged', authContext);
                }
                return authContext;
            });
    };

    currentAuthContext.changeAuthData = function (data, userName) {
        // get all available roles
        $http.post(serviceBase + '/api/platform/security/roles/').then(function (rolesSearch) {
            // get full filled user entity
            $http.get(serviceBase + userService + (userName || mainContext.customer.userName)).then(
                function(results) {
                    var authContext = changeAuth(results.data);
                    var dataRoles = data.roles;
                    data.roles = authContext.roles;
                    angular.extend(authContext, data);
                    var user = angular.extend({ }, results.data, {
                        id: authContext.userId,
                        permissions: authContext.permissions,
                        userName: authContext.userLogin,
                        userLogin: authContext.fullName,
                        userType: authContext.userType,
                        isAdministrator: authContext.isAdministrator
                    });

                    // assign & unassign roles
                    var isEqualRole = function(firstRole, secondRole) { return firstRole.name === secondRole.name };
                    var currentRoles = authContext.roles;
                    var unassignedRoles = _.filter(currentRoles, function (currentRole) { return _.some(dataRoles, function (role) { return isEqualRole(role, currentRole) && role.assigned === false; }); });
                    var assignedRoles = _.filter(rolesSearch.data.roles, function (availableRole) { return _.some(dataRoles, function (role) { return isEqualRole(role, availableRole) && role.assigned === true; }); });
                    currentRoles = _.filter(currentRoles, function(currentRole) { return !unassignedRoles.length || !_.some(unassignedRoles, function(unassignedRole) { return isEqualRole(currentRole, unassignedRole); }); });
                    Array.prototype.push.apply(currentRoles, _.filter(assignedRoles, function (assignedRole) { return !currentRoles.length || !_.some(currentRoles, function (currentRole) { return isEqualRole(currentRole, assignedRole); }); }));
                    user.roles = currentRoles;

                    // update user
                    $http.put(serviceBase + userService, user).then(
                    function() {
                        if (!userName) {
                            angular.extend(currentAuthContext, authContext);
                            $rootScope.$broadcast('loginStatusChanged', authContext);
                        }
                    });
                });
            });
    };

    currentAuthContext.checkPermission = function (permission, securityScopes) {
        //first check admin permission
        // var hasPermission = $.inArray('admin', authContext.permissions) > -1;
        var hasPermission = currentAuthContext.isAdministrator;
        if (!hasPermission && permission) {
            permission = permission.trim();
            //first check global permissions
            hasPermission = $.inArray(permission, currentAuthContext.permissions) > -1;
            if (!hasPermission && securityScopes) {
                if (typeof securityScopes === 'string' || angular.isArray(securityScopes)) {
                    securityScopes = angular.isArray(securityScopes) ? securityScopes : securityScopes.split(',');
                    //Check permissions in scope
                    hasPermission = _.some(securityScopes, function (x) {
                        var permissionWithScope = permission + ":" + x;
                        var retVal = $.inArray(permissionWithScope, currentAuthContext.permissions) > -1;
                        //console.log(permissionWithScope + "=" + retVal);
                        return retVal;
                    });
                }
            }
        }
        return hasPermission;
    };

    function changeAuth(results) {
        var authContext = {};
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
        return authContext;
    };

    return currentAuthContext;
}]);