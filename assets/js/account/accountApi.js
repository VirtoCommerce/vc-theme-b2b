var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('accountApi', ['$http', function ($http) {
    return {
        getCurrentUser: function () {
            return $http.get('storefrontapi/account?t=' + new Date().getTime());
        },
        getUserOrganizationContactById: function (contactId) {
            return $http.get('storefrontapi/account/organization/contacts/' + contactId + '?t=' + new Date().getTime());
        },
        updateUser: function (user) {
            return $http.post('storefrontapi/account', user);
        },
        updateUserAddresses: function (addresses) {
            return $http.post('storefrontapi/account/addresses', addresses);
        },
        getUserOrganization: function () {
            return $http.get('storefrontapi/account/organization?t=' + new Date().getTime());
        },
        updateUserOrganization: function (organization) {
            return $http.put('storefrontapi/account/organization', organization);
        },
        searchUserOrganizationContacts: function (criteria) {
            return $http.post('storefrontapi/account/organization/contacts/search', criteria);
        },
        createInvitation: function (invitation) {
            return $http.post('storefrontapi/account/invitation', invitation);
        },
        registerNewUser: function (user) {
            return $http.post('storefrontapi/account/user', user);
        },
        lockUser: function (userName) {
            return $http.post('storefrontapi/account/' + userName + '/lock');
        },
        unlockUser: function (userName) {
            return $http.post('storefrontapi/account/' + userName + '/unlock');
        },
        deleteUser: function (userName) {
            return $http.delete('storefrontapi/account/' + userName);
        },
        searchUserOrders: function (searchCriteria) {
            return $http.post('storefrontapi/orders/search', searchCriteria);
        },
        getUserOrder: function (orderNumber) {            
            return $http.get('storefrontapi/orders/' + orderNumber + '?t=' + new Date().getTime());
        },
        getUserOrderNewPaymentData: function (orderNumber) {
            return $http.get('storefrontapi/orders/' + orderNumber + '/newpaymentdata?t=' + new Date().getTime());
        },
        changeUserPassword: function (passwordChangeData) {
            return $http.post('storefrontapi/account/password', passwordChangeData);
        },
    }
}]);
