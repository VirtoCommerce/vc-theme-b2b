var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('inventoryController', ['$scope', 'inventoryApi', function ($scope, inventoryApi) {
    $inventory = this;
    $scope.fulfillmentCenters = [];
   
    $scope.searchFulfillmentCenters = function (searchPhrase) {
        inventoryApi.searchFulfillmentCenters({ searchPhrase: searchPhrase }).then(function(response) {
             $scope.fulfillmentCenters = response.data.results;
         });       
    };
   
}]);

