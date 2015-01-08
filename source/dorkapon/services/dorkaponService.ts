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
/// <reference path="../dorkaponStateMachine.ts"/>
/// <reference path="../dorkaponGameWorld.ts"/>

module dorkapon.services {
   export class DorkaponService {
      loader:pow2.ResourceLoader;
      world:DorkaponGameWorld;
      tileMap:pow2.GameTileMap;
      machine:DorkaponStateMachine;
      entities:pow2.EntityContainerResource;
      constructor(
         public compile:ng.ICompileService,
         public scope:ng.IRootScopeService){
         this.loader = pow2.ResourceLoader.get();
         this.world = new DorkaponGameWorld({
            scene:new pow2.Scene({
               autoStart: true,
               debugRender:false
            }),
            model:new pow2.GameStateModel()
         });
         pow2.registerWorld(dorkapon.NAME,this.world);

         // Tell the world time manager to start ticking.
         this.world.time.start();
         this.entities = <pow2.EntityContainerResource>this.world.loader.load('entities/dorkapon.powEntities');
      }

      createPlayer(from:models.DorkaponEntity,at?:pow2.Point):objects.DorkaponEntity{
         if(!from){
            throw new Error("Cannot create player without valid model");
         }
         if(!this.entities.isReady()){
            throw new Error("Cannot create player before entities container is loaded");
         }
         var sprite = <objects.DorkaponEntity>this.entities.createObject('DorkaponMapPlayer',{
            model:from,
            map:this.tileMap
         });
         sprite.name = from.attributes.name;
         sprite.icon = from.attributes.icon;
         this.world.scene.addObject(sprite);
         sprite.setPoint(at);
         return sprite;
      }

      /**
       * Start a new game.
       * @param then
       */
      newGame(then?:()=>any){
         if(this.tileMap){
            this.tileMap.destroy();
            this.tileMap = null;
         }

         // Create the game state machine
         this.machine = new DorkaponStateMachine();
         this.world.setService('state',this.machine);

         this.world.loader.load(pow2.getMapUrl('dorkapon'),(map:pow2.TiledTMXResource)=>{
            // Create a map
            this.tileMap = this.entities.createObject('DorkaponMapObject',{
               resource:map
            });

            var players:objects.DorkaponEntity[] = [];

            // Ranger player
            var model:models.DorkaponEntity = new models.DorkaponEntity({name:"Ranger"});
            players.push(this.createPlayer(model,new pow2.Point(3,18)));
            this.world.scene.addObject(this.tileMap);

            // Mage player
            var model:models.DorkaponEntity = new models.DorkaponEntity({name:"Mage"});
            players.push(this.createPlayer(model,new pow2.Point(12,11)));
            this.world.scene.addObject(this.tileMap);

            // Give the state machine our players.
            this.machine.playerPool = players.slice();

            this.machine.setCurrentState(DorkaponInitGame.NAME);

            // Loaded!
            this.tileMap.loaded();
            then && then();
         });
      }
   }
   app.factory('$dorkapon', [
      '$compile',
      '$rootScope',
      ($compile:ng.ICompileService,$rootScope:ng.IRootScopeService) => {
         return new DorkaponService($compile,$rootScope);
      }
   ]);
}