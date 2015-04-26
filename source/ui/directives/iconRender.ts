/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="./../pow2.ts"/>

module pow2.ui.directives {

  export class IconRenderController {
    static WORLD_NAME:string = "icon-render-world";
    private _renderCanvas:HTMLCanvasElement;
    private _canvasAcquired:boolean = false;
    renderer:pow2.SpriteRender = new pow2.SpriteRender();
    world:pow2.World = new pow2.World();

    static $inject:string[] = [
      '$compile',
      '$scope'
    ];

    constructor(public $compile:ng.ICompileService,
                public $scope:any) {
      this.renderer = new pow2.SpriteRender();
      this.world = pow2.getWorld<pow2.World>(IconRenderController.WORLD_NAME);
      if (!this.world) {
        this.world = new pow2.World();
        pow2.registerWorld(IconRenderController.WORLD_NAME, this.world);
      }
      this.world.mark(this.renderer);
      this._renderCanvas = <HTMLCanvasElement>this.$compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="64" height="64"></canvas>')($scope)[0];
    }

    /**
     * Returns a canvas rendering context that may be drawn to.  A corresponding
     * call to releaseRenderContext will return the drawn content of the context.
     */
    getRenderContext(width:number, height:number):CanvasRenderingContext2D {
      if (this._canvasAcquired) {
        throw new Error("Only one rendering canvas is available at a time.  Check for calls to this function without corresponding releaseCanvas() calls.");
      }
      this._canvasAcquired = true;
      this._renderCanvas.width = width;
      this._renderCanvas.height = height;
      var context:any = this._renderCanvas.getContext('2d');
      context.webkitImageSmoothingEnabled = false;
      context.mozImageSmoothingEnabled = false;
      return context;
    }


    /**
     * Call this after getRenderContext to finish rendering and have the source
     * of the canvas content returned as a data url string.
     */
    releaseRenderContext():string {
      this._canvasAcquired = false;
      return this._renderCanvas.toDataURL();
    }
  }

  app.directive('iconRender', ['$compile', ($compile) => {
    return {
      restrict: 'A',
      controller: IconRenderController,
      link: function ($scope, element, attrs, controller:IconRenderController) {
        var width:number = parseInt(attrs.width || "64");
        var height:number = parseInt(attrs.height || "64");
        // A rendering canvas
        var renderImage = $compile('<img src="" width="' + width + '"/>')($scope);
        element.append(renderImage);
        $scope.$watch(attrs.icon, function (icon) {
          if (!icon) {
            renderImage[0].src = '/images/a/blank.gif';
            return;
          }
          controller.renderer.getSingleSprite(icon, attrs.frame || 0, function (sprite) {
            // Get the context for drawing
            var renderContext:any = controller.getRenderContext(width, height);
            renderContext.clearRect(0, 0, width, height);
            renderContext.drawImage(sprite, 0, 0, width, height);
            var data = controller.releaseRenderContext();
            $scope.$apply(function () {
              renderImage[0].src = data;
            });
          });
        });
      }
    };
  }]);
}