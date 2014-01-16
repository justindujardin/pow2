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
      friendly:GameEntityObject;
      enemy:GameEntityObject;

      current:TileObject;
      currentDone:boolean = false;


      isFriendlyTurn():boolean {
         return this.current && this.current.id === this.friendly.id;
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
      saveScene:Scene;
      saveTileMap:TileMap;
      scene:Scene;
      tileMap:GameTileMap;
      finished:boolean = false; // Trigger state to exit when true.
      enter(machine:GameStateMachine){
         super.enter(machine);
         this.machine = null;
         this.saveScene = machine.world.scene;
         this.saveTileMap = machine.player.tileMap;
         this.saveScene.paused = true;
         this.machine = new CombatStateMachine(machine);
         this.scene = <Scene>machine.world.setService('scene',new Scene());


         machine.world.loader.load("/data/sounds/summon",(res) => {
            if(res.isReady()){
               res.data.play();
            }
            this.tileMap = new pow2.GameTileMap("combat");
            this.scene.addObject(this.tileMap);
            this.tileMap.addComponent(new pow2.TileMapCameraComponent);

            // Create the hero facing his enemy
            this.machine.friendly = new pow2.GameEntityObject({
               icon:"warrior.png",
               model:friendlyPlayer(1)
            });
            this.scene.addObject(this.machine.friendly);
            this.machine.friendly.addComponent(new pow2.PlayerRenderComponent);

            // Create the enemy
            this.machine.enemy = new pow2.GameEntityObject({
               model: CreatureModel.fromLevel(1)
            });
            this.scene.addObject(this.machine.enemy);
            this.machine.enemy.addComponent(new pow2.SpriteComponent({
               name:"enemy",
               icon:this.machine.enemy.model.get('icon')
            }));

            this.scene.once('map:loaded',() => {
               var friendly = this.tileMap.getFeature('friendly');
               var enemy = this.tileMap.getFeature('enemy');
               this.machine.friendly.point = new Point(friendly.x / 16, friendly.y / 16);
               this.machine.enemy.point = new Point(enemy.x / 16, enemy.y / 16);
               machine.view.setScene(this.scene);
               machine.view.setTileMap(this.tileMap);
            });
            console.log("FIGHT!!!");
         });

      }
      exit(machine:GameStateMachine){
         machine.world.setService('scene',this.saveScene);
         machine.view.setScene(this.saveScene);
         machine.view.setTileMap(this.saveTileMap);
         machine.updatePlayer();
         this.tileMap.destroy();
         this.machine = null;
         this.saveScene.paused = false;
         this.scene.destroy();
         this.finished = false;
         if(machine.combatant){
            machine.combatant.destroy();
         }
         if(machine.player){
            machine.player.trigger('combat:end',this);
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