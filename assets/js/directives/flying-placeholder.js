angular.module('storefrontApp')
.directive('vcFlyingPlaceholder', function() {
    return {
        controller: ['$scope', function vcFlyingPlaceholderController($scope) {
        }],
        require: 'ngModel',
        templateUrl: '',
        link: function(scope, element, attr, ngModel) {
            var labelContent = '<label class="vc-flying-placeholder-class" for="' + attr.name + '">' + attr.vcFlyingPlaceholder + '</label>';
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