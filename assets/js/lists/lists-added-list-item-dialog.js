var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyAddedListItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData', 'listsApi', '$translate', 'defaultLists', '$q', 'loadingIndicatorService', function ($scope, $window, $uibModalInstance, dialogData, listsApi, $translate, defaultLists, $q, loader ) {
    $scope.availableLists = [];
    $scope.selectedList = {};
    $scope.dialogData = dialogData;
    $scope.inProgress = false;
    $scope.itemAdded = false;
    $scope.type = dialogData.listType;

    $scope.addProductToList = function () {
        $scope.inProgress = true;
        listsApi.addLineItem(dialogData.product.id, $scope.selectedList.name, $scope.selectedList.type).then(function (response) {
            if (response.data) {
                $scope.inProgress = false;
                $scope.itemAdded = true;
            }
        });
    };
    $scope.selectList = function (list) {
        $scope.selectedList = list;
    };

    $scope.close = function () {
        $uibModalInstance.close();
    };

    $scope.redirect = function (url) {
        $window.location = url;
    };

    $scope._searchLists = function () {
        loader.wrapLoading(function () {
            return listsApi.searchLists({
                pageSize: 1000,
                type: $scope.type
            }).then(function (response) {
                $scope.lists = response.data.results;
                if ($scope.lists) {
                    var nameLists = _.pluck($scope.lists, 'name');
                    listsApi.getListsWithProduct(dialogData.product.id, nameLists, $scope.type).then(function(containsResponse) {
                        var containsLists = containsResponse.data;
                        if ($scope.lists && containsLists) {
                            _.each($scope.lists, function(list) {
                                list.contains = _.contains(containsLists, list.name);
                            });
                        }
                    });
                }
            });
        });
    };

    $scope.initialize = function () {
        $scope.predefinedLists = defaultLists.default_lists;
        $scope.type = defaultLists.default_list_type;

        var promises = [];
        _.each($scope.predefinedLists, function (list) {
            promises.push(createList(list.name, list.type));
        });

        $q.all(promises).then(function () {
            $scope._searchLists();
        });
    };

    function createList(listName, type) {
        return listsApi.createList(listName, type);
    }

    $scope.initialize();
}]);
