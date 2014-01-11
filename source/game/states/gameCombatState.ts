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

/// <reference path="../gameStateMachine.ts" />
/// <reference path="./gameMapState.ts" />
/// <reference path="./combat/combatStateMachine.ts" />

module pow2 {

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

         this.scene = <Scene>machine.world.setService('scene',new Scene());
         this.scene.once('map:loaded',() => {
            this.machine = new CombatStateMachine(machine);

            var friendly = this.tileMap.getFeature('friendly');
            var enemy = this.tileMap.getFeature('enemy');

            // Create the hero facing his enemy
            this.machine.friendly = new pow2.TileObject({
               point: new Point(friendly.x / 16, friendly.y / 16),
               icon:"warrior.png"
            });
            this.machine.friendly.addComponent(new pow2.PlayerRenderComponent);
            this.scene.addObject(this.machine.friendly);


            // Create the enemy
            this.machine.enemy = new pow2.TileObject({
               point: new Point(enemy.x / 16, enemy.y / 16),
               icon:machine.combatant.icon,
               components: [
                  new pow2.PlayerRenderComponent
               ]
            });
            this.machine.enemy.addComponent(new pow2.PlayerRenderComponent);
            this.scene.addObject(this.machine.enemy);

            machine.view.setScene(this.scene);
            machine.view.setTileMap(this.tileMap);
         });
         this.tileMap = new pow2.GameTileMap("combat");
         this.tileMap.addComponent(new pow2.TileMapCameraComponent);
         this.scene.addObject(this.tileMap);
         console.log("FIGHT!!!");
      }
      exit(machine:GameStateMachine){
         machine.world.setService('scene',this.saveScene);
         machine.view.setScene(this.saveScene);
         machine.view.setTileMap(this.saveTileMap);
         machine.updatePlayer();
         this.machine = null;
         this.saveScene.paused = false;
         this.scene.destroy();
         this.finished = false;
         machine.combatant.destroy();
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