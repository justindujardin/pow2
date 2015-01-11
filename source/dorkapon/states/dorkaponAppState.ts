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

/// <reference path="../index.ts" />

module dorkapon {
   export class DorkaponAppStateMachine extends pow2.StateMachine {
      states:pow2.IState[] = [
         new states.AppMainMenuState(),
         new states.AppMapState(),
         new states.AppCombatState()
      ];
  }
}

module dorkapon.states {
   export class AppMainMenuState extends pow2.State {
      static NAME:string = "app.states.mainmenu";
      name:string = AppMainMenuState.NAME;
   }


   export class AppCombatState extends pow2.State {
      static NAME:string = "app.states.combat";
      name:string = AppCombatState.NAME;
   }


   export class AppMapState extends pow2.State {
      static NAME:string = "app.states.map";
      name:string = AppMapState.NAME;

      world:DorkaponGameWorld = pow2.getWorld<DorkaponGameWorld>(dorkapon.NAME);

      map:DorkaponTileMap = null;

      machine:DorkaponMapStateMachine = null;

      createPlayer(from:models.DorkaponEntity,at?:pow2.Point):objects.DorkaponEntity{
         if(!from){
            throw new Error("Cannot create player without valid model");
         }
         if(!this.world.factory.isReady()){
            throw new Error("Cannot create player before entities container is loaded");
         }
         var sprite = <objects.DorkaponEntity>this.world.factory.createObject('DorkaponMapPlayer',{
            model:from,
            machine:this.machine,
            map:this.map
         });
         sprite.name = from.attributes.name;
         sprite.icon = from.attributes.icon;
         this.world.scene.addObject(sprite);
         sprite.setPoint(at);
         return sprite;
      }

      exit(machine:DorkaponAppStateMachine) {
         if(!this.world.mapView){
            throw new Error("Entering map state without view to render it");
         }
         this.world.mapView.stateMachine = null;
         super.exit(machine);
      }
      enter(machine:DorkaponAppStateMachine) {
         if(!this.world.mapView){
            throw new Error("Entering map state without view to render it");
         }
         this.machine = new DorkaponMapStateMachine();
         this.world.mapView.stateMachine = this.machine;

         this.world.loader.load(pow2.getMapUrl('dorkapon'),(map:pow2.TiledTMXResource)=>{
            // Create a map
            this.map = this.world.factory.createObject('DorkaponMapObject',{
               resource:map
            });
            this.world.mapView.setTileMap(this.map);

            DorkaponGameWorld.getDataSource((res:pow2.GameDataResource)=>{
               var classes:any = res.getSheetData('classes');

               var players:objects.DorkaponEntity[] = [];

               // Ranger player
               var tpl:any = _.where(classes,{id:"warrior"})[0];
               tpl.icon = tpl.icon.replace("[gender]","male");

               var model:models.DorkaponEntity = new models.DorkaponEntity(tpl);
               players.push(this.createPlayer(model,new pow2.Point(3,18)));

               // Mage player
               tpl = _.where(classes,{id:"mage"})[0];
               tpl.icon = tpl.icon.replace("[gender]","female");
               model = new models.DorkaponEntity(tpl);
               players.push(this.createPlayer(model,new pow2.Point(12,11)));

               this.world.scene.addObject(this.map);

               // Give the state machine our players.
               this.machine.playerPool = players;

               this.machine.setCurrentState(DorkaponInitGame.NAME);

               // Loaded!
               this.map.loaded();

               // TODO: Listen for changes?  To combat state?  Or just run forever until exit?
            });
         });
      }
   }

}