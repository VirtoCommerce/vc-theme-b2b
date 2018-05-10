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
        require: 'ngModel',
        templateUrl: '',
        link: function(scope, element, attr, ngModel) {
            //console.log(scope);
            //console.log(element);
            var labelContent = '<label class="vc-flying-placeholder-class" for="' + scope.elementName + '">' + attr.vcFlyingPlaceholder + '</label>';
            element.after(labelContent);
            var parentElement = element.parent();
            parentElement.addClass("vc-flying-placeholder-group-class");
            
            scope.$watch(function() {
                if (ngModel.$modelValue) {
                    parentElement.addClass("keyuped");
                }
                else {
                    parentElement.removeClass("keyuped");
                }
            });
        }
    };
  });