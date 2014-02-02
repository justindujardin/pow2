/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
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
            var renderContext = renderCanvas[0].getContext("2d");
            renderContext.webkitImageSmoothingEnabled = false;
            renderContext.mozImageSmoothingEnabled = false;

            $scope.$watch(attrs.icon, function(icon) {
               if(!icon){
                  return;
               }
               game.world.sprites.getSingleSprite(icon,function(sprite){
                  renderContext.clearRect(0, 0, 64, 64);
                  renderContext.drawImage(sprite, 0, 0, 64, 64);
                  $scope.$apply(function(){
                     renderImage[0].src = renderCanvas[0].toDataURL();
                  });
               });
            });
         }
      };
   });
}