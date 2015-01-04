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
      constructor(
         public compile:ng.ICompileService,
         public scope:ng.IRootScopeService){
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

      newGame(then?:()=>any){
         if(this.tileMap){
            this.tileMap.destroy();
            this.tileMap = null;
         }

         this.world.loader.load(pow2.getMapUrl('dorkapon'),(map:pow2.TiledTMXResource)=>{
            this.tileMap = this.entities.createObject('DorkaponMapObject',{
               resource:map
            });
            var model:pow2.HeroModel = pow2.HeroModel.create(pow2.HeroTypes.Ranger,"Ranger");
            this.createPlayer(model,new pow2.Point(3,18));
            this.world.scene.addObject(this.tileMap);
            this.tileMap.loaded();
            then && then();
         });
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