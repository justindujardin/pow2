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
/// <reference path="../services/gameService.ts"/>

module pow2.ui {
   export class EditorCameraComponent extends CameraComponent {
      process(view:SceneView) {
         view.camera.point.set(this.host.point);
         view.cameraScale = Math.max(0.2,Math.min(32,view.cameraScale));
         var canvasSize = view.screenToWorld(new Point(view.context.canvas.width,view.context.canvas.height),view.cameraScale);
         view.camera.extent.set(canvasSize);
      }
  }


   app.directive('editorCanvas', ['$compile','game','$animate',function ($compile, game:PowGameService,$animate:any) {
      return {
         restrict: 'A',
         scope: {
            map: "="
         },
         link: function ($scope, element, attrs) {
            var canvas:HTMLCanvasElement = $scope.canvas = element[0];
            var context = $scope.canvas.getContext("2d");
            context.webkitImageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            window.addEventListener('resize',onResize,false);
            var $window = $(window);
            function onResize(){
               context.canvas.width = $window.width();
               context.canvas.height = $window.height();
               context.webkitImageSmoothingEnabled = false;
               context.mozImageSmoothingEnabled = false;
            }
            var tileView = new pow2.GameMapView(canvas, game.loader);

            element.on('mousemove',(ev) => {
               var coords:pow2.CanvasMouseCoords = pow2.Input.mouseOnView(ev.originalEvent,tileView);
               console.log("mouse at px: " + coords.point + " - world: " + coords.world);
            });
            tileView.camera.extent.set(10, 10);


            // TODO: HACKS MOVE THIS SOMEWHERE
            var selected:pow2.SceneObject = null;
            element.on("click", (ev) => {
               var coords:pow2.CanvasMouseCoords = pow2.Input.mouseOnView(ev.originalEvent,tileView);
               var results:SceneObject[] = [];
               // TODO: IMPORTANT
               // This should be able to select TileMaps and support alternate search functions to allow
               // for differet searches based on the context.   e.g. Selecting a TileMap in a scene vs
               // selecting a tile within a map (if in map editing context)
               if(game.currentScene.db.queryPoint(coords.world,SceneObject,results)){
                  console.log(results);
               }
            });
            element.on("mousewheel DOMMouseScroll MozMousePixelScroll", (ev) => {
               var delta = (ev.originalEvent.detail ? ev.originalEvent.detail * -1 : ev.originalEvent.wheelDelta);
               var scale = tileView.cameraScale;
               var move = scale / 10;
               scale += (delta > 0 ? move : -move);
               tileView.cameraScale = scale;
               ev.stopImmediatePropagation();
               ev.preventDefault();
               return false;

            });

            var map:TileMap = attrs.map || game.tileMap;
            var edCamera = new EditorCameraComponent();
            tileView.addComponent(edCamera);
            tileView.cameraComponent = edCamera;
            tileView.setTileMap(map);
            game.world.scene.addView(tileView);

            onResize();
         }
      };
   }]);
}