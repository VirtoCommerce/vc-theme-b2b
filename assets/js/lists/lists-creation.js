var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyCreateNewListDialogController', ['$rootScope', '$scope', '$window', '$uibModalInstance', 'customerService', 'dialogData', 'listsApi', '$localStorage', 'loadingIndicatorService', '$translate', 'confirmService', function ($rootScope, $scope, $window, $uibModalInstance, customerService, dialogData, listsApi, $localStorage, loader, $translate, confirmService) {

    $scope.dialogData = dialogData.lists;
    $scope.predefinedLists = dialogData.lists;
    $scope.userName = dialogData.userName;
    $scope.inProgress = false;
    $scope.data = $scope.listName;
    $scope.selectedTab = dialogData.selectedTab;
    $scope.type = dialogData.type;

    $scope.createList = function () {
        listsApi.createList($scope.dialogData.listName, $scope.type).then(function(result) {
            $uibModalInstance.close(result.data);
        });
    };

    $scope.selectedList = function (listName, type) {
        var items = listsApi.getWishlist(listName, type).items;
        $scope.selectedList.items = items;
    };

    $scope.isSelected = function () {
        return _.find(dialogData.lists,  function (item) { return  item.delete; }) == undefined;
    } 

    $scope.submitSettings = function () {
        var showDialog = function (text) {
            confirmService.confirm(text).then(function (confirmed) {
                if (confirmed) {
                    var listIds = [];
                    _.each(dialogData.lists, function (list) {
                        if (list.delete)
                            listIds.push(list.id);
                    });

                    if(listIds.length > 0){
                        listsApi.deleteListsByIds(listIds).then(function (result) {
                            $uibModalInstance.close();
                        });
                    }
                }
            });
        };

        showDialog("Are you sure you wish to delete this list?");
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
