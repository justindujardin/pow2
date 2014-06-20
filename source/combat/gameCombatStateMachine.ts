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
/// <reference path="../game/components/animatedComponent.ts" />
/// <reference path="../game/components/features/combatFeatureComponent.ts" />
/// <reference path="../tile/components/animatedSpriteComponent.ts" />
/// <reference path="../game/gameStateMachine.ts" />
/// <reference path="../game/states/gameMapState.ts" />
/// <reference path="./states/combatBeginTurnState.ts" />
/// <reference path="./states/combatEndTurnState.ts" />
/// <reference path="./states/combatVictoryState.ts" />
/// <reference path="./states/combatDefeatState.ts" />
/// <reference path="./states/combatStartState.ts" />
/// <reference path="./components/combatCameraComponent.ts" />
/// <reference path="../game/models/entityModel.ts" />
/// <reference path="../game/models/creatureModel.ts" />
/// <reference path="./combat.ts" />

module pow2 {
   // Combat State Machine
   //--------------------------------------------------------------------------
   export class CombatStateMachine extends TickedStateMachine {
      parent:GameStateMachine;
      defaultState:string = CombatStartState.NAME;
      states:IState[] = [
         new CombatStartState(),
         new CombatVictoryState(),
         new CombatDefeatState(),
         new CombatBeginTurnState(),
         new CombatEndTurnState()
      ];

      party:GameEntityObject[] = [];
      enemies:GameEntityObject[] = [];
      turnList:GameEntityObject[] = [];

      focus:GameEntityObject;
      current:GameEntityObject;
      currentDone:boolean = false;


      isFriendlyTurn():boolean {
         return this.current && !!_.find(this.party,(h:GameEntityObject) => {
            return h.id === this.current.id;
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
   export class GameCombatState extends State {
      static NAME:string = "combat";
      name:string = GameCombatState.NAME;
      transitions:IStateTransition[] = [
         new GameMapTransition()
      ];
      machine:CombatStateMachine = null;
      parent:GameStateMachine = null;
      scene:Scene;
      tileMap:GameTileMap;
      finished:boolean = false; // Trigger state to exit when true.
      enter(machine:GameStateMachine){
         super.enter(machine);
         this.parent = machine;
         this.machine = new CombatStateMachine(machine);
         this.scene = new Scene();
         machine.world.mark(this.scene);

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
            heroEntity.addComponent(<pow2.combat.PlayerCombatRenderComponent>playerRender);
            heroEntity.addComponent(new AnimatedComponent());
            if(heroEntity.isDefeated()){
               return;
            }
            heroEntity.icon = hero.get('icon');
            this.machine.party.push(heroEntity);
            this.scene.addObject(heroEntity);
         });

         this.tileMap = new pow2.GameTileMap("combat");
         this.tileMap.once('loaded',() => {
            // Hide all layers that don't correspond to the current combat zone
            var zone:IZoneMatch = machine.encounter.host.getCombatZones(machine.encounter.player.point);
            var visibleZone:string = zone.target || zone.map;
            _.each(this.tileMap.getLayers(),(l)=>{
               l.visible = (l.name === visibleZone);
            });
            this.tileMap.dirtyLayers = true;
            this.tileMap.addComponent(new pow2.CombatCameraComponent);
            this.scene.addObject(this.tileMap);

            // Position Party/Enemies

            // Get enemies data from spreadsheet
            GameStateModel.getDataSource((enemiesSpreadsheet:pow2.GoogleSpreadsheetResource) => {
               var encounters:any[] = _.filter(enemiesSpreadsheet.getSheetData("encounters"),(enc:any)=>{
                  if(machine.combatType === pow2.COMBAT_ENCOUNTERS.RANDOM && enc.type === pow2.COMBAT_ENCOUNTERS.RANDOM){
                     return _.indexOf(enc.zones,zone.map) !== -1 || _.indexOf(enc.zones,zone.target) !== -1;
                  }
                  if(machine.combatType === pow2.COMBAT_ENCOUNTERS.FIXED && enc.type === pow2.COMBAT_ENCOUNTERS.FIXED){
                     return enc.id === machine.combatant.id;
                  }
               });
               if(encounters.length === 0){
                  throw new Error("No valid encounters for this zone");
               }
               var max = encounters.length - 1;
               var min = 0;
               var encounter = encounters[Math.floor(Math.random() * (max - min + 1)) + min];

               var enemyList:any[] = enemiesSpreadsheet.getSheetData("enemies");

               var enemiesLength:number = encounter.enemies.length;
               for(var i:number = 0; i < enemiesLength; i++){
                  var tpl = _.where(enemyList,{id:encounter.enemies[i]});
                  if(tpl.length === 0){
                     continue;
                  }
                  var nmeModel = new CreatureModel(tpl[0]);
                  var nme = new pow2.GameEntityObject({
                     model: nmeModel
                  });
                  this.scene.addObject(nme);
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
         this.scene.destroy();
         machine.updatePlayer();
         this.tileMap.destroy();
         this.scene.destroy();
         this.finished = false;
         this.machine = null;
         this.parent = null;
         if(machine.combatant){
            machine.combatant.destroy();
         }
      }
      update(machine:IStateMachine){
         if(this.machine){
            this.machine.update(machine);
         }
      }
   }
   export class GameCombatTransition extends StateTransition {
      targetState:string = GameCombatState.NAME;
      evaluate(machine:GameStateMachine):boolean {
         if(!super.evaluate(machine) || !machine.player || !machine.player.tileMap){
            return false;
         }
         if(machine.encounter && machine.encounter.combatFlag === true){
            machine.combatType = pow2.COMBAT_ENCOUNTERS.RANDOM;
            return true;
         }
         var coll = <CollisionComponent>machine.player.findComponent(CollisionComponent);
         if(coll){
            var results = [];
            if(coll.collide(machine.player.point.x,machine.player.point.y,GameFeatureObject,results)){
               var touched = <GameFeatureObject>_.find(results,(r:GameFeatureObject) => {
                  return !!r.findComponent(CombatFeatureComponent);
               });
               if(touched){
                  var combat = <CombatFeatureComponent>touched.findComponent(CombatFeatureComponent);
                  if(combat.isEntered){
                     machine.combatType = pow2.COMBAT_ENCOUNTERS.FIXED;
                     machine.combatant = touched;
                     return true;
                  }
               }
            }
         }
         return false;
      }
   }
}