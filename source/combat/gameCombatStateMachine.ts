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
         new CombatEndTurnState()
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

      keyListener:any = null;
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
    *       "pow2.combat.PlayerCombatRenderComponent"
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
      enter(machine:GameStateMachine){
         super.enter(machine);
         this.parent = machine;
         this.machine = new CombatStateMachine(machine);
         var combatScene = machine.world.combatScene = new Scene();
         machine.world.mark(combatScene);

         // Build party
         _.each(machine.model.party,(hero:HeroModel,index:number) => {

            var heroEntity:GameEntityObject = new GameEntityObject({
               name:hero.attributes.name,
               icon: hero.attributes.icon,
               model:hero
            });

            // Instantiate a [Class]CombatRenderComponent implementation for the
            // hero type, if available.
            var playerType:string = hero.attributes.type[0].toUpperCase() + hero.attributes.type.substr(1);
            var playerRender:any = pow2.combat[playerType + 'CombatRenderComponent'];
            if(typeof playerRender === 'undefined'){
               playerRender = new pow2.combat.PlayerCombatRenderComponent();
            }
            else {
               playerRender = new playerRender();
            }
            heroEntity.addComponent(playerRender);
            heroEntity.addComponent(new AnimatedComponent());

            // Player Actions
            heroEntity.addComponent(new pow2.combat.CombatAttackComponent(this));
            heroEntity.addComponent(new pow2.combat.CombatRunComponent(this));
            if(heroEntity.isDefeated()){
               return;
            }
            heroEntity.icon = hero.get('icon');
            this.machine.party.push(heroEntity);
            combatScene.addObject(heroEntity);
         });

         this.tileMap = new pow2.GameTileMap("combat");
         this.tileMap.once('loaded',() => {
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
            GameStateModel.getDataSource((enemiesSpreadsheet:pow2.GameDataResource) => {
               var enemyList:any[] = enemiesSpreadsheet.getSheetData("enemies");
               var enemiesLength:number = machine.encounter.enemies.length;
               for(var i:number = 0; i < enemiesLength; i++){
                  var tpl = _.where(enemyList,{id:machine.encounter.enemies[i]});
                  if(tpl.length === 0){
                     continue;
                  }
                  var nmeModel = new CreatureModel(tpl[0]);
                  var nme = new pow2.GameEntityObject({
                     model: nmeModel
                  });
                  combatScene.addObject(nme);
                  nme.addComponent(new pow2.SpriteComponent({
                     name:"enemy",
                     icon:nme.model.get('icon')
                  }));
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
         });
         this.tileMap.load();
      }
      exit(machine:GameStateMachine){
         machine.trigger('combat:end',this);
         var world:GameWorld = this.parent.world;
         if(world && world.combatScene){
            world.combatScene.destroy();
            world.combatScene = null;
         }
         this.tileMap.destroy();
         machine.update(this);
         this.finished = false;
         this.machine = null;
         this.parent = null;
      }
   }
}