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
/// <reference path="../../../types/underscore/underscore.d.ts"/>
/// <reference path="../../../types/backbone/backbone.d.ts"/>
/// <reference path="../../../types/angularjs/angular.d.ts"/>
/// <reference path="../../../lib/pow2.game.d.ts"/>
/// <reference path="../index.ts"/>
module pow2.ui {
   export class PowGameService {
      loader:ResourceLoader;
      world:GameWorld;
      tileMap:GameTileMap;
      sprite:GameEntityObject;
      machine:GameStateMachine;
      model:GameStateModel;
      constructor(){
         this.loader = new ResourceLoader();
         this.world = new GameWorld({
            scene:new Scene({
               autoStart: true,
               debugRender:false
            }),
            state:new GameStateMachine()
         });
         this.machine = this.world.state;
         this.model = this.world.state.model;
         this.world.scene.once('map:loaded',() => {
            // Create a movable character with basic components.

            var model:HeroModel = this.model.party[0];
            this.sprite = new GameEntityObject({
               name:"Hero!",
               icon: model.attributes.icon,
               model:model
            });
            this.sprite.addComponent(new PlayerRenderComponent());
            this.sprite.setPoint(this.tileMap.bounds.getCenter());
            this.sprite.addComponent(new CollisionComponent());
            this.sprite.addComponent(new PlayerComponent());
            this.sprite.addComponent(new PlayerCameraComponent());
            this.sprite.addComponent(new PlayerTouchComponent());
            this.world.scene.addObject(this.sprite);
         });
         this.tileMap = new GameTileMap("sewer");
         this.world.scene.addObject(this.tileMap);
      }

      loadGame(data:any){
         if(data){
            this.model.clear();
            this.model.set(this.model.parse(data));
         }
         // Only add a hero if none exists.
         // TODO: This init stuff should go in a 'newGame' method or something.
         //
         if(this.model.party.length === 0){
            this.model.addHero(HeroModel.create(HeroType.Warrior,"Warrior"));
            this.model.addHero(HeroModel.create(HeroType.DeathMage,"DeathMage"));
            this.model.addHero(HeroModel.create(HeroType.Ranger,"Ranger"));
         }

      }
   }
   app.factory('game', () => {
      return new PowGameService();
   });
}