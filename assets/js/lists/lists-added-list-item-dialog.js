var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyAddedListItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData', 'listsApi', '$translate', function ($scope, $window, $uibModalInstance, dialogData, listsApi, $translate) {
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

    $scope.initialize = function () {
        listsApi.searchLists({
            pageSize: 10000,
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
    };

    $scope.initialize();
}]);
