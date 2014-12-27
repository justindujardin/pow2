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

/// <reference path="../game/objects/gameEntityObject.ts" />

module pow2 {

   export interface IResumeCallback {
      ():void;
   }

   /**
    * Completion callback for a player action.
    */
   export interface IPlayerActionCallback {
      (action:IPlayerAction,error?:any):void;
   }
   /**
    * A Player action during combat
    */
   export interface IPlayerAction {
      name:string;
      from:GameEntityObject;
      to:GameEntityObject;
      act(then?:IPlayerActionCallback):boolean;
   }


   // Combat State Machine
   //--------------------------------------------------------------------------
   export class CombatStateMachine extends StateMachine {
      parent:GameStateMachine;
      defaultState:string = CombatStartState.NAME;
      states:IState[] = [
         new CombatStartState(),
         new CombatVictoryState(),
         new CombatDefeatState(),
         new CombatBeginTurnState(),
         new CombatChooseActionState(),
         new CombatEndTurnState(),
         new CombatEscapeState()
      ];

      party:GameEntityObject[] = [];
      enemies:GameEntityObject[] = [];
      turnList:GameEntityObject[] = [];
      playerChoices:{
         [id:string]:IPlayerAction
      } = {};
      focus:GameEntityObject;
      current:GameEntityObject;
      currentDone:boolean = false;

      /**
       * Notify the game UI of a combat event, and wait for it to handled
       * if there is a specified handler.
       */
      notify(msg:string,data:any,callback?:()=>any){
         if(this._asyncProcessing){
            throw new Error("TODO: CombatStateMachine cannot handle multiple async UI waits");
         }
         this._asyncProcessing = false;
         this._asyncCurrentCallback = () => {
            if(msg === 'combat:victory'){
               var foo = "bar";
            }
            console.log("Done ASYNC " + msg);
            this._asyncProcessing = false;
            callback && callback();
         };
         this.trigger(msg,data);
         if(!this._asyncProcessing){
            callback && callback();
         }
      }
      private _asyncProcessing:boolean = false;
      private _asyncCurrentCallback:IResumeCallback = null;
      notifyWait():IResumeCallback {
         if(!this._asyncCurrentCallback){
            throw new Error("No valid async callback set!  Perhaps you called this outside of a notify event handler?");
         }
         this._asyncProcessing = true;
         return this._asyncCurrentCallback;
      }

      isFriendlyTurn():boolean {
         return this.current && !!_.find(this.party,(h:GameEntityObject) => {
            return h._uid === this.current._uid;
         });
      }

      getLiveParty():GameEntityObject[] {
         return _.reject(this.party,(obj:GameEntityObject) => {
            return obj.isDefeated();
         });
      }
      getLiveEnemies():GameEntityObject[] {
         return _.reject(this.enemies,(obj:GameEntityObject) => {
            return obj.isDefeated();
         });
      }

      getRandomPartyMember():GameEntityObject {
         var players = <GameEntityObject[]>_.shuffle(this.party);
         while(players.length > 0){
            var p = players.shift();
            if(!p.isDefeated()){
               return p;
            }
         }
         return null;
      }

      getRandomEnemy():GameEntityObject {
         var players = <GameEntityObject[]>_.shuffle(this.enemies);
         while(players.length > 0){
            var p = players.shift();
            if(!p.isDefeated()){
               return p;
            }
         }
         return null;
      }

      partyDefeated():boolean {
         var deadList = _.reject(this.party,(obj:GameEntityObject) => {
            return obj.model.attributes.hp <= 0;
         });
         return deadList.length === 0;
      }
      enemiesDefeated():boolean {
         return _.reject(this.enemies,(obj:GameEntityObject) => {
            return obj.model.attributes.hp <= 0;
         }).length === 0;
      }

      constructor(parent:GameStateMachine){
         super();
         this.parent = parent;
      }
   }

   // Combat Lifetime State Machine
   //--------------------------------------------------------------------------

   /**
    * Construct a combat scene with appropriate GameEntityObjects for the players
    * and enemies.
    *
    * TODO: This should be loaded from a serializable composite object format for
    * easier customization.   JSON with fully qualified type names as strings?
    * e.g.
    * "WarriorPlayer": {
    *    "type":"pow2.GameEntityObject",
    *    "properties":{},
    *    "components":[
    *       "pow2.PlayerComponent",
    *       "pow2.PlayerCombatRenderComponent"
    *    ]
    * }
    *
    */
   export class GameCombatState extends State {
      static NAME:string = "combat";
      name:string = GameCombatState.NAME;
      machine:CombatStateMachine = null;
      parent:GameStateMachine = null;
      tileMap:GameTileMap;
      finished:boolean = false; // Trigger state to exit when true.

      factory:pow2.EntityContainerResource;
      spreadsheet:pow2.GameDataResource;
      constructor() {
         super();
         pow2.GameWorld.get().loader.load('entities/combat.powEntities',(factory:pow2.EntityContainerResource)=>{
            this.factory = factory;
         });
         GameStateModel.getDataSource((spreadsheet:pow2.GameDataResource) => {
            this.spreadsheet = spreadsheet;
         });
      }

      enter(machine:GameStateMachine){
         super.enter(machine);
         this.parent = machine;
         this.machine = new CombatStateMachine(machine);
         var combatScene = machine.world.combatScene = new Scene();
         machine.world.mark(combatScene);
         if(!this.factory || !this.spreadsheet){
            throw new Error("Invalid combat entity container or game data spreadsheet");
         }


         // Build party
         _.each(machine.model.party,(hero:HeroModel,index:number) => {
            var heroEntity:GameEntityObject = this.factory.createObject('CombatPlayer',{
               model: hero,
               combat: this
            });
            if(!heroEntity){
               throw new Error("Entity failed to validate with given inputs");
            }
            if(!heroEntity.isDefeated()){
               heroEntity.icon = hero.get('icon');
               this.machine.party.push(heroEntity);
               combatScene.addObject(heroEntity);
            }
         });


         machine.world.loader.load('/maps/combat.tmx',(map:pow2.TiledTMXResource)=>{

            this.tileMap = new pow2.GameTileMap(map);

            // Hide all layers that don't correspond to the current combat zone
            var zone:IZoneMatch = machine.encounterInfo;
            var visibleZone:string = zone.target || zone.map;
            _.each(this.tileMap.getLayers(),(l)=>{
               l.visible = (l.name === visibleZone);
            });
            this.tileMap.dirtyLayers = true;
            this.tileMap.addComponent(new pow2.CombatCameraComponent);
            combatScene.addObject(this.tileMap);

            // Position Party/Enemies

            // Get enemies data from spreadsheet
            var enemyList:any[] = this.spreadsheet.getSheetData("enemies");
            var enemiesLength:number = machine.encounter.enemies.length;
            for(var i:number = 0; i < enemiesLength; i++){
               var tpl = _.where(enemyList,{id:machine.encounter.enemies[i]});
               if(tpl.length === 0){
                  continue;
               }
               var nmeModel = new CreatureModel(tpl[0]);

               var nme:GameEntityObject = this.factory.createObject('CombatEnemy',{
                  model:nmeModel,
                  combat:this,
                  sprite: {
                     name:"enemy",
                     icon:nmeModel.get('icon')
                  }
               });
               if(!nme){
                  throw new Error("Entity failed to validate with given inputs");
               }
               combatScene.addObject(nme);
               this.machine.enemies.push(nme);
            }
            if(this.machine.enemies.length){
               _.each(this.machine.party,(heroEntity:GameEntityObject,index:number) => {
                  var battleSpawn = this.tileMap.getFeature('p' + (index + 1));
                  heroEntity.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
               });

               _.each(this.machine.enemies,(enemyEntity:GameEntityObject,index:number) => {
                  var battleSpawn = this.tileMap.getFeature('e' + (index + 1));
                  if(battleSpawn){
                     enemyEntity.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
                  }
               });
               machine.trigger('combat:begin',this);
               this.machine.update(this);
            }
            else {
               // TODO: This is an error, I think.  Player entered combat with no valid enemies.
               machine.trigger('combat:end',this);
            }

         });
      }
      exit(machine:GameStateMachine){
         machine.trigger('combat:end',this);
         var world:GameWorld = this.parent.world;
         if(world && world.combatScene){
            world.combatScene.destroy();
            world.combatScene = null;
         }
         this.tileMap.destroy();
         this.finished = false;
         this.machine = null;
         this.parent = null;
      }
   }
}