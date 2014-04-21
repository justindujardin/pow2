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

/// <reference path="../../../types/underscore/underscore.d.ts" />
/// <reference path="../../../types/jquery/jquery.d.ts" />
/// <reference path="../rect.ts" />
/// <reference path="../point.ts" />
/// <reference path="../world.ts" />
/// <reference path="../resourceLoader.ts" />
/// <reference path="./scene.ts" />
/// <reference path="./sceneObject.ts" />
/// <reference path="./components/cameraComponent.ts" />

// A view that renders a `Scene`.
//
// You should probably only have one of these per Canvas that you render to.
module pow2 {
   export class SceneView extends SceneObject implements IWorldObject {
      static UNIT: number = 16;

      animations: any[];
      $el: JQuery;
      canvas:HTMLCanvasElement;
      context: CanvasRenderingContext2D;
      camera: Rect;
      cameraComponent:CameraComponent = null;
      cameraScale: number;
      unitSize: number;
      _sheets: any;
      scene: Scene = null;
      loader: ResourceLoader = null;
      world:IWorld;

      constructor(canvas: HTMLCanvasElement, loader: any) {
         super();
         this.animations = [];
         this.canvas = canvas;
         if (!canvas) {
            throw new Error("A Canvas is required");
         }
         this.$el = $(canvas);
         this.context = canvas.getContext("2d");
         if (!this.context) {
            throw new Error("Could not retrieve Canvas context");
         }
         var contextAny: any = this.context;
         contextAny.webkitImageSmoothingEnabled = false;
         contextAny.mozImageSmoothingEnabled = false;
         this.camera = new Rect(0, 0, 9, 9);
         this.cameraScale = 1.0;
         this.unitSize = SceneView.UNIT;
         this._sheets = {};
         this.loader = loader;
      }

      // IWorldObject
      // -----------------------------------------------------------------------------
      onAddToWorld(world:IWorld){}
      onRemoveFromWorld(world:IWorld){}

      setScene(scene:Scene){
         if(this.scene){
            this.scene.removeView(this);
         }
         this.scene = scene;
         if(this.scene){
            this.scene.addView(this);
         }
      }


      // Scene rendering interfaces
      // -----------------------------------------------------------------------------

      renderToCanvas(width, height, renderFunction) {
         var buffer = document.createElement('canvas');
         buffer.width = width;
         buffer.height = height;
         var context:any = buffer.getContext('2d');
         // Disable smoothing for nearest neighbor scaling.
         context.webkitImageSmoothingEnabled = false;
         context.mozImageSmoothingEnabled = false;
         renderFunction(context);
         return buffer;
      }

      // Render a frame. Subclass this to do your specific rendering.
      renderFrame(elapsed: number) {
      }

      // Render post effects
      renderPost() {
      }

      // Set the render state for this scene view.
      setRenderState() {
         if (!this.context) {
            return;
         }
         this.context.save();
         this.context.scale(this.cameraScale,this.cameraScale);
      }

      // Restore the render state to what it was before a call to setRenderState.
      restoreRenderState(): boolean {
         if (!this.context) {
            return false;
         }
         this.context.restore();
         return true;
      }

      // Public render invocation.
      render() {
         this._render(0);
      }

      // Render the scene
      _render(elapsed: number) {
         this.processCamera();
         this.setRenderState();
         this.renderFrame(elapsed);
         this.renderAnimations();
         this.renderPost();
         if (this.scene && this.scene.options.debugRender) {
            this.debugRender();
         }
         this.restoreRenderState();
      }

      // Do any debug rendering for this view.
      debugRender(debugStrings: string[] = []) {
         if (!this.context) {
            return;
         }
         var fontSize = 4;
         debugStrings.push("MSPF: " + this.world.time.mspf);
         debugStrings.push("FPS:  " + this.scene.fps.toFixed(0));
         // MSPF/FPS Counter debug
         this.context.save();
         this.context.scale(1,1);
         this.context.font = "bold " + fontSize + "px Arial";
         var renderPos = this.worldToScreen(this.camera.point);
         var x = renderPos.x + 10;
         var y = renderPos.y + 10;
         var i:number;
         for (i = 0; i < debugStrings.length; ++i) {
            this.context.fillStyle = "rgba(0,0,0,0.8)";
            this.context.fillText(<string>debugStrings[i], x + 0.5, y + 0.5);
            this.context.fillStyle = "rgba(255,255,255,1)";
            this.context.fillText(<string>debugStrings[i], x, y);
            y += fontSize;
         }
         this.context.restore();
      }

      getSpriteSheet(name: string, done?) { // TODO: typedef (callback)
         if (!this._sheets[name]) {
            this._sheets[name] = this.loader.load("/images/" + name + ".png", done);
         }
         return this._sheets[name];
      }

      // Scene Camera updates
      // -----------------------------------------------------------------------------
      processCamera() {
         if(this.cameraComponent){
            this.cameraComponent.process(this);
         }
      }

      // Scene rendering utilities
      // -----------------------------------------------------------------------------

      clearRect() {
         var renderPos, x, y;
         x = y = 0;
         if (this.camera) {
            renderPos = this.worldToScreen(this.camera.point);
            x = renderPos.x;
            y = renderPos.y;
         }
         return this.context.clearRect(x, y, this.context.canvas.width, this.context.canvas.height);
      }

      // Coordinate Conversions (World/Screen)
      // -----------------------------------------------------------------------------

      // Convert a Rect/Point/Number from world coordinates (game units) to
      // screen coordinates (pixels)
      worldToScreen(value: Point, scale?): Point;

      worldToScreen(value: Rect, scale?): Rect;

      worldToScreen(value: number, scale?): number;

      worldToScreen(value: any, scale = 1): any {
         if (value instanceof Rect) {
            return new Rect(value).scale(this.unitSize * scale);
         } else if (value instanceof Point) {
            return new Point(value).multiply(this.unitSize * scale);
         }
         return value * (this.unitSize * scale);
      }

      // Convert a Rect/Point/Number from screen coordinates (pixels) to
      // game world coordinates (game unit sizes)
      screenToWorld(value: Point, scale?): Point;

      screenToWorld(value: Rect, scale?): Rect;

      screenToWorld(value: number, scale?): number;

      screenToWorld(value: any, scale = 1): any {
         if (value instanceof Rect) {
            return new Rect(value).scale(1 / (this.unitSize * scale));
         } else if (value instanceof Point) {
            return new Point(value).multiply(1 / (this.unitSize * scale));
         }
         return value * (1 / (this.unitSize * scale));
      }

      // Animations
      // -----------------------------------------------------------------------------
      renderAnimations() {
         var i, len, animation;
         for (i = 0, len = this.animations.length; i < len; i++) {
            animation = this.animations[i];
            animation.done = animation.fn(animation.frame);
            if (this.scene.time >= animation.time) {
               animation.frame += 1;
               animation.time = this.scene.time + animation.rate;
            }
         }
         return this.animations = _.filter(this.animations, (a:any) => {
            return a.done !== true;
         });
      }

      playAnimation(tickRate, animFn) { // TODO: typedef
         if (!this.scene) {
            throw new Error("Cannot queue an animation for a view that has no scene");
         }
         return this.animations.push({
            frame: 0,
            time: this.scene.time + tickRate,
            rate: tickRate,
            fn: animFn
         });
      }
   }
}

