var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyCreateNewListDialogController', ['$rootScope', '$scope', '$window', '$uibModalInstance', 'customerService', 'dialogData', 'listService', '$localStorage', 'loadingIndicatorService', function ($rootScope, $scope, $window, $uibModalInstance, customerService, dialogData, listService, $localStorage, loader) {

    $scope.dialogData = dialogData.lists;
    $scope.predefinedLists = dialogData.lists;
    $scope.userName = dialogData.userName;
    $scope.inProgress = false;
    $scope.data = $scope.listName;
    $scope.selectedTab = dialogData.selectedTab;
    $scope.type = dialogData.type;

    $scope.createList = function () {
        listService.createList($scope.dialogData.listName, $scope.type).then(function(result) {
            $uibModalInstance.close(result.data);
        });
    };

    $scope.selectedList = function (listName, type) {
        var items = listService.getWishlist(listName, type).items;
        $scope.selectedList.items = items;
    };

    $scope.submitSettings = function () {
        var listIds = [];
        _.each(dialogData.lists, function (list) {
            if (list.delete)
                listIds.push(list.id);
        });

        listService.deleteListsByIds(listIds).then(function (result) {
            $uibModalInstance.close();
        });
    };

    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };

    function inititlize() {
        _.each($scope.dialogData, function(list) {
            var foundList = _.find(dialogData.predefinedLists, function (predefinedList) { return predefinedList.name === list.name });
            if (foundList) {
                list.disabled = true;
            }
        });
    }

    inititlize();

}]);
