/// <reference path="../index.ts"/>
module pow2.ui {
// IconRender directive
// ----------------------------------------------------------------------------
   app.directive('iconRender', function ($compile, game) {
      return {
         restrict: 'A',
         link: function ($scope, element, attrs) {
            // A rendering canvas
            var renderCanvas = $compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="64" height="64"></canvas>')($scope);
            var renderImage = $compile('<img src="" width="64"/>')($scope);
            element.append(renderCanvas);
            element.append(renderImage);

            // Get the context for drawing
            $scope.renderContext = renderCanvas[0].getContext("2d");
            $scope.renderContext.webkitImageSmoothingEnabled = false;
            $scope.renderContext.mozImageSmoothingEnabled = false;

            $scope.$watch(attrs.icon, function(icon) {

               if(!icon){
                  return;
               }
               game.world.sprites.getSingleSprite(icon,function(sprite){
                  $scope.renderContext.clearRect(0, 0, 64, 64);
                  $scope.renderContext.drawImage(sprite, 0, 0, 64, 64);
                  $scope.$apply(function(){
                     renderImage[0].src = renderCanvas[0].toDataURL();
                  });
               });
            });
         }
      };
   });
}