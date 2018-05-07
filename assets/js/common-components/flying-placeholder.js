angular.module('storefrontApp')
.directive('vcFlyingPlaceholder', function() {
    return {
        controller: ['$scope', function vcFlyingPlaceholderController($scope) {
            //console.log($scope);
            
          }],
        scope: {
            elementName: "@name",
            elementModel: "@ngModel" 
        },
        templateUrl: '',
        link: function(scope, e, attr) {
            //console.log(scope);
            //console.log(e);
            e.before('<label class="vc-flying-placeholder-class" ng-class="{\'keyuped\': ' + scope.elementModel + '.length}" for="' + scope.elementName + '"><span>' + attr.vcFlyingPlaceholder + '</span></label>');
        }
    };
  });


  var storefrontApp = angular.module('storefrontApp');

  storefrontApp.controller('flyingController', ['$q', '$scope', 
      function ($q, $scope) {
        var $ctrl = this;
       // console.log($scope);
        
        $scope.$watch('username', function (address) {
            //console.log($scope);
        }, true);

      }]);