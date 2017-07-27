 var storefrontApp = angular.module('storefrontApp');

 storefrontApp
 .controller('accountLoginController', ['$scope', 'authService', function ($scope, authService) {
     $scope.login = function ($event) {
         if (!$event || $event.keyCode === 13){
             var submit = function(){
                angular.element(document.querySelector('#customer_login')).submit();
            };
            // submit form even when error occurs
            authService.login($scope.userName, $scope.password).then(submit, submit);
         }
     };
 }]);