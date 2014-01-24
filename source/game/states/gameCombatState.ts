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
/// <reference path="../models/entityModel.ts" />
/// <reference path="../models/creatureModel.ts" />


module pow2 {


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
         new CombatEndTurnState()
      ];

      party:GameEntityObject[] = [];
      enemies:GameEntityObject[] = [];

      current:TileObject;
      currentDone:boolean = false;


      isFriendlyTurn():boolean {
         return this.current && this.current.id === this.party[0].id;
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
            if(this.keyPress(machine,e.keyCode) === false){
               e.preventDefault();
               return false;
            }
            return true;
         };
         $(window).on('keypress',machine.keyListener);
      }
      exit(machine:CombatStateMachine){
         $(window).off('keypress',machine.keyListener);
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
            this.machine.party.push(heroEntity);
            this.scene.addObject(heroEntity);
         });

         // Create the enemy
         // TODO: Enemies (plural)
         this.machine.enemies.push(new pow2.GameEntityObject({
            model: CreatureModel.fromLevel(1)//gameHero.get('level'))
         }));
         this.scene.addObject(this.machine.enemies[0]);
         this.machine.enemies[0].addComponent(new pow2.SpriteComponent({
            name:"enemy",
            icon:this.machine.enemies[0].model.get('icon')
         }));

         machine.world.loader.load("/data/sounds/summon",(res) => {
            if(res.isReady()){
               res.data.play();
            }

            this.tileMap = new pow2.GameTileMap("combat");
            this.scene.addObject(this.tileMap);
            this.tileMap.addComponent(new pow2.TileMapCameraComponent);

            this.scene.once('map:loaded',() => {
               // Build party
               _.each(this.machine.party,(heroEntity:GameEntityObject,index:number) => {
                  var battleSpawn = this.tileMap.getFeature('p' + (index + 1));
                  heroEntity.setPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
               });

               var enemy = this.tileMap.getFeature('e1');
               this.machine.enemies[0].point = new Point(enemy.x / 16, enemy.y / 16);
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