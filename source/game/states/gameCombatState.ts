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

/// <reference path="../objects/gameEntityObject.ts" />
/// <reference path="../../tile/components/animatedSpriteComponent.ts" />
/// <reference path="../gameStateMachine.ts" />
/// <reference path="./gameMapState.ts" />
/// <reference path="./combat/combatBeginTurnState.ts" />
/// <reference path="./combat/combatEndTurnState.ts" />
/// <reference path="./combat/combatVictoryState.ts" />
/// <reference path="./combat/combatDefeatState.ts" />
/// <reference path="./combat/combatStartState.ts" />
/// <reference path="../components/combatCameraComponent.ts" />
/// <reference path="../models/entityModel.ts" />
/// <reference path="../models/creatureModel.ts" />


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

      current:GameEntityObject;
      currentDone:boolean = false;


      isFriendlyTurn():boolean {
         return this.current && !!_.find(this.party,(h) => {
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
         var players:GameEntityObject[] = _.shuffle(this.party);
         while(players.length > 0){
            var p = players.shift();
            if(!p.isDefeated()){
               return p;
            }
         }
         return null;
      }

      getRandomEnemy():GameEntityObject {
         var players:GameEntityObject[] = _.shuffle(this.enemies);
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


   // Combat States
   //--------------------------------------------------------------------------
   export class CombatState extends State {
      enter(machine:CombatStateMachine){
         super.enter(machine);
         machine.keyListener = (e) => {
            if(machine.paused === false && this.keyPress(machine,e.keyCode) === false){
               e.preventDefault();
               return false;
            }
            return true;
         };
         $(window).on('keypress',machine.keyListener);
      }
      exit(machine:CombatStateMachine){
         $(window).off('keypress',machine.keyListener);
         machine.keyListener = null;
         super.exit(machine);
      }

      // Return false to eat the event.
      keyPress(machine:CombatStateMachine,keyCode:KeyCode):boolean {
         return true;
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
            var heroEntity:GameEntityObject = GameStateMachine.createHeroEntity(hero.attributes.name,hero);
            if(heroEntity.isDefeated()){
               return;
            } 
            heroEntity.icon = hero.get('combatSprite');
            this.machine.party.push(heroEntity);
            this.scene.addObject(heroEntity);
         });

         // Create the enemy
         var max = 6;
         var min = 2;
         var enemyCount = Math.floor(Math.random() * (max - min + 1)) + min;
         for(var i = 0; i < enemyCount; i++){
            var nme = new pow2.GameEntityObject({
               model: CreatureModel.fromLevel(1)//gameHero.get('level'))
            });
            this.scene.addObject(nme);
            nme.addComponent(new pow2.SpriteComponent({
               name:"enemy",
               icon:nme.model.get('icon')
            }));
            this.machine.enemies.push(nme);

         }

         machine.world.loader.load("/data/sounds/summon",(res) => {
            if(res.isReady()){
               res.data.play();
            }

            this.tileMap = new pow2.GameTileMap("combat");
            this.tileMap.addComponent(new pow2.CombatCameraComponent);
            this.scene.addObject(this.tileMap);

            this.scene.once('map:loaded',() => {
               // Position Party/Enemies

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
//
//               var enemy = this.tileMap.getFeature('e1');
//               this.machine.enemies[0].point = new Point(enemy.x / 16, enemy.y / 16);
               machine.trigger('combat:begin',this);
            });
         });

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
      tick(machine:IStateMachine){
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