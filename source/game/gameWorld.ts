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

/// <reference path="../../lib/pow2.d.ts" />
/// <reference path="./gameStateMachine.ts" />
/// <reference path="./resources/gameData.ts" />

module pow2 {

   var _sharedGameWorld:GameWorld=null;

   export class GameWorld extends SceneWorld {
      state:GameStateMachine;
      // TODO: Fix game loading and multiple scenes/maps state.
      // Put the game model here, and use the pow2.getWorld() api
      // for access to the game model.   Reset state methods should
      // exist there, and angular UI should listen in.
      model:GameStateModel;

      // TODO: More than two scenes?  Scene managers?  ugh.  If we need them.
      combatScene:Scene = null;

      scene:Scene;

      constructor(services?:any){
         super(services);
         if(!this.scene){
            this.setService('scene',new Scene());
         }
         this.loader.registerType('powEntities',pow2.EntityContainerResource);
      }

      static get():pow2.GameWorld {
         if(!_sharedGameWorld){
            _sharedGameWorld = new pow2.GameWorld();
         }
         return _sharedGameWorld;
      }


      private _encounterCallback:IGameEncounterCallback = null;
      reportEncounterResult(victory:boolean){
         if(this._encounterCallback){
            this._encounterCallback(victory);
            this._encounterCallback = null;
         }
      }

      randomEncounter(zone:IZoneMatch,then?:IGameEncounterCallback){
         GameStateModel.getDataSource((gsr:GameDataResource)=>{
            var encounters:IGameEncounter[] = _.filter(gsr.getSheetData("encounters"),(enc:any)=>{
               return _.indexOf(enc.zones,zone.map) !== -1 || _.indexOf(enc.zones,zone.target) !== -1;
            });
            if(encounters.length === 0){
               throw new Error("No valid encounters for this zone");
            }
            var max = encounters.length - 1;
            var min = 0;
            var encounter = encounters[Math.floor(Math.random() * (max - min + 1)) + min];
            this._encounter(zone,encounter,then);
         });
      }
      fixedEncounter(zone:IZoneMatch,encounterId:string,then?:IGameEncounterCallback){
         GameStateModel.getDataSource((gsr:GameDataResource)=>{
            var encounters = <IGameEncounter[]>_.where(gsr.getSheetData("encounters"),{
               id:encounterId
            });
            if(encounters.length === 0){
               throw new Error("No encounter found with id: " + encounterId);
            }
            this._encounter(zone,encounters[0],then);
         });
      }

      private _encounter(zoneInfo:IZoneMatch,encounter:IGameEncounter,then?:IGameEncounterCallback){
         this.scene.trigger('combat:encounter',this);
         this.state.encounter = encounter;
         this.state.encounterInfo = zoneInfo;
         this.state.setCurrentState(GameCombatState.NAME);
         this._encounterCallback = then;
      }
   }
}