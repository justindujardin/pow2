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
/// <reference path="../../../lib/pow2.game.d.ts"/>
module pow2.ui {
// IconRender directive
// ----------------------------------------------------------------------------
   app.directive('iconRender', ['$compile','game',function ($compile, game) {
      return {
         restrict: 'A',
         link: function ($scope, element, attrs) {
            var width:number = parseInt(attrs.width || "64");
            var height:number = parseInt(attrs.height || "64");
            // A rendering canvas
            var renderImage = $compile('<img src="" width="' + width + '"/>')($scope);
            element.append(renderImage);
            $scope.$watch(attrs.icon, function(icon) {
               if(!icon){
                  return;
               }
               game.world.sprites.getSingleSprite(icon,attrs.frame || 0,function(sprite){
                  // Get the context for drawing
                  var renderContext:any = game.getRenderContext(width,height);
                  renderContext.clearRect(0, 0, width, height);
                  renderContext.drawImage(sprite, 0, 0, width, height);
                  var data = game.releaseRenderContext();
                  $scope.$apply(function(){
                     renderImage[0].src = data;
                  });
               });
            });
         }
      };
   }]);
}