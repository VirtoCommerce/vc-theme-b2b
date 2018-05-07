var storefrontApp = angular.module('storefrontApp');
storefrontApp.service('listsApi', ['$http', function ($http) {
    return {
        getWishlist: function (listName, type) {
            return $http.get('storefrontapi/lists/' + listName + '/' + type + '?t=' + new Date().getTime());
        },
        getListsWithProduct: function (productId, listNames, type) {
            return $http.post('storefrontapi/lists/getlistswithproduct', { productId: productId, listNames: listNames, type: type });
        },
        addLineItem: function (productId, listName, type) {
            return $http.post('storefrontapi/lists/items', { productId: productId, listName: listName, type: type });
        },
        removeLineItem: function (lineItemId, listName, type) {
            return $http.delete('storefrontapi/lists/' + listName + '/' + type + '/items/' + lineItemId);
        },
        searchLists: function (searchCriteria) {
            return $http.post('storefrontapi/lists/search', searchCriteria);
        },
        createList: function(listName, type) {
            return $http.post('storefrontapi/lists/' + listName + '/' + type + '/create');
        },
        deleteListsByIds: function(listIds) {
            return $http.delete('storefrontapi/lists/deletelistsbyids?listIds=' + listIds.join('&listIds='));
        },
        mergeWithCurrentCart: function(listName, type) {
            return $http.post('storefrontapi/lists/' + listName + '/' + type + '/mergewithcurrentcart');
        }
    }
}]);