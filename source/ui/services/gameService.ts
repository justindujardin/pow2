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
/// <reference path="../../../types/underscore/underscore.d.ts"/>
/// <reference path="../../../types/backbone/backbone.d.ts"/>
/// <reference path="../../../types/angularjs/angular.d.ts"/>
/// <reference path="../../../lib/pow2.game.d.ts"/>
/// <reference path="../index.ts"/>
module pow2.ui {
   export class PowGameService {
      loader:ResourceLoader;
      world:GameWorld;
      tileMap:GameTileMap;
      sprite:GameEntityObject;
      machine:GameStateMachine;
      model:GameStateModel;
      private _renderCanvas:HTMLCanvasElement;
      private _canvasAcquired:boolean = false;
      constructor(
         public compile:ng.ICompileService,
         public scope:ng.IRootScopeService){
         this._renderCanvas = <HTMLCanvasElement>compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="64" height="64"></canvas>')(scope)[0];

         this.loader = new ResourceLoader();
         this.world = new GameWorld({
            scene:new Scene({
               autoStart: true,
               debugRender:false
            }),
            state:new GameStateMachine()
         });
         this.machine = this.world.state;
         this.model = this.world.state.model;
         this.world.scene.once('map:loaded',() => {
            // Create a movable character with basic components.

            var model:HeroModel = this.model.party[0];
            this.sprite = new GameEntityObject({
               name:"Hero!",
               icon: model.attributes.icon,
               model:model
            });
            this.sprite.addComponent(new PlayerRenderComponent());
            this.sprite.setPoint(this.tileMap.bounds.getCenter());
            this.sprite.addComponent(new CollisionComponent());
            this.sprite.addComponent(new PlayerComponent());
            this.sprite.addComponent(new PlayerCameraComponent());
            this.sprite.addComponent(new PlayerTouchComponent());
            this.world.scene.addObject(this.sprite);
         });
         this.tileMap = new GameTileMap("sewer");
         this.world.scene.addObject(this.tileMap);
      }

      loadGame(data:any){
         if(data){
            this.model.clear();
            this.model.set(this.model.parse(data));
         }
         // Only add a hero if none exists.
         // TODO: This init stuff should go in a 'newGame' method or something.
         //
         if(this.model.party.length === 0){
            this.model.addHero(HeroModel.create(HeroType.Warrior,"Warrior"));
            this.model.addHero(HeroModel.create(HeroType.DeathMage,"DeathMage"));
            this.model.addHero(HeroModel.create(HeroType.Ranger,"Ranger"));
         }

      }

      /**
       * Returns a canvas rendering context that may be drawn to.  A corresponding
       * call to releaseRenderContext will return the drawn content of the context.
       */
      getRenderContext(width:number,height:number):CanvasRenderingContext2D{
         if(this._canvasAcquired){
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
      releaseRenderContext():string{
         this._canvasAcquired = false;
         return this._renderCanvas.toDataURL();
      }
   }
   app.factory('game', [
      '$compile',
      '$rootScope',
      ($compile:ng.ICompileService,$rootScope:ng.IRootScopeService) => {
         return new PowGameService($compile,$rootScope);
      }
   ]);
}