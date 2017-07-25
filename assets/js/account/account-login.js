 var storefrontApp = angular.module('storefrontApp');

 storefrontApp
 .controller('accountLoginController', ['$scope', 'authService', function ($scope, authService) {
     $scope.login = function () {
         authService.login($scope.userName, $scope.password).then(function(){
             angular.element(document.querySelector('#customer_login')).submit();
         });
     };
 }]);