/*
 Copyright (C) 2013-2014 by Justin DuJardin and Contributors

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

module dorkapon.services {
   export class DorkaponGameService {
      loader:pow2.ResourceLoader;
      world:pow2.GameWorld;
      tileMap:pow2.GameTileMap;
      sprite:pow2.GameEntityObject;
      machine:pow2.GameStateMachine;
      currentScene:pow2.Scene;
      entities:pow2.EntityContainerResource;
      private _renderCanvas:HTMLCanvasElement;
      private _canvasAcquired:boolean = false;
      private _stateKey:string = "_test2DorkaponState";
      constructor(
         public compile:ng.ICompileService,
         public scope:ng.IRootScopeService){

         if(this.qs().hasOwnProperty('dev')){
            console.log("Clearing gameData cache and loading live from Google Spreadsheets");
            pow2.GameDataResource.clearCache();
         }

         this._renderCanvas = <HTMLCanvasElement>compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="64" height="64"></canvas>')(scope)[0];

         this.loader = new pow2.ResourceLoader();
         this.currentScene = new pow2.Scene({
            autoStart: true,
            debugRender:false
         });
         this.world = new pow2.GameWorld({
            scene:this.currentScene,
            model:new pow2.GameStateModel(),
            state:new pow2.GameStateMachine()
         });
         this.machine = this.world.state;
         pow2.registerWorld('dorkapon',this.world);
         // Tell the world time manager to start ticking.
         this.world.time.start();
         this.entities = <pow2.EntityContainerResource>this.world.loader.load('entities/dorkapon.powEntities');
      }

      getSaveData():any {
         return localStorage.getItem(this._stateKey);
      }
      resetGame(){
         localStorage.removeItem(this._stateKey);
      }
      saveGame(data:any){
         localStorage.setItem(this._stateKey,data);
      }



      createPlayer(from:pow2.HeroModel,at?:pow2.Point){
         if(!from){
            throw new Error("Cannot create player without valid model");
         }
         if(!this.entities.isReady()){
            throw new Error("Cannot create player before entities container is loaded");
         }
         if(this.sprite){
            this.sprite.destroy();
            this.sprite = null;
         }
         this.sprite = this.entities.createObject('DorkaponMapPlayer',{
            model:from,
            map:this.tileMap
         });
         this.sprite.name = from.attributes.name;
         this.sprite.icon = from.attributes.icon;
         this.world.scene.addObject(this.sprite);
         if(typeof at === 'undefined' && this.tileMap instanceof pow2.TileMap) {
            at = this.tileMap.bounds.getCenter();
         }
         this.sprite.setPoint(at || new pow2.Point());
      }

      loadMap(mapName:string,then?:()=>any,player?:pow2.HeroModel,at?:pow2.Point){
         if(this.tileMap){
            this.tileMap.destroy();
            this.tileMap = null;
         }

         this.world.loader.load(pow2.getMapUrl(mapName),(map:pow2.TiledTMXResource)=>{
            this.tileMap = this.entities.createObject('DorkaponMapObject',{
               resource:map
            });
            var model:pow2.HeroModel = player || this.world.model.party[0];
            this.createPlayer(model,at);
            this.world.scene.addObject(this.tileMap);
            this.tileMap.loaded();
            then && then();
         });
      }

      newGame(then?:()=>any){
         this.loadMap("dorkapon",then,pow2.HeroModel.create(pow2.HeroTypes.Warrior,"Warrior"),new pow2.Point(7,9));
      }

      loadGame(data:any, then?:()=>any){
         if(data){
            //this.world.model.clear();
            this.world.model.initData(()=>{
               this.world.model.parse(data);
               var at = this.world.model.getKeyData('playerPosition');
               at = at ? new pow2.Point(at.x,at.y) : undefined;
               this.loadMap("dorkapon",then,this.world.model.party[0],at);
            });
         }
         else {
            if(this.world.model.party.length === 0){
               this.world.model.addHero(pow2.HeroModel.create(pow2.HeroTypes.Warrior,"Warrior"));
               this.world.model.addHero(pow2.HeroModel.create(pow2.HeroTypes.Ranger,"Ranger"));
               this.world.model.addHero(pow2.HeroModel.create(pow2.HeroTypes.LifeMage,"Mage"));
            }
            this.newGame(then);
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

      /**
       * Extract the browser location query params
       * http://stackoverflow.com/questions/9241789/how-to-get-url-params-with-javascript
       */
      qs():any {
         if(window.location.search){
            var query_string = {};
            (function () {
               var e,
                  a = /\+/g,  // Regex for replacing addition symbol with a space
                  r = /([^&=]+)=?([^&]*)/g,
                  d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                  q = window.location.search.substring(1);

               while ((e = r.exec(q))){
                  query_string[d(e[1])] = d(e[2]);
               }
            })();
            return query_string;
         }
         return {};
      }
   }
   app.factory('$dorkapon', [
      '$compile',
      '$rootScope',
      ($compile:ng.ICompileService,$rootScope:ng.IRootScopeService) => {
         return new DorkaponGameService($compile,$rootScope);
      }
   ]);
}