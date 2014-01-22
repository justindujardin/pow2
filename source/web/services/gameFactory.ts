/// <reference path="../../../source/game/gameStateMachine.ts"/>
/// <reference path="../../../source/game/gameWorld.ts"/>
/// <reference path="../../../source/game/models/heroModel.ts"/>
/// <reference path="../../../types/underscore/underscore.d.ts"/>
/// <reference path="../../../types/backbone/backbone.d.ts"/>
/// <reference path="../../../types/angularjs/angular.d.ts"/>
/// <reference path="../index.ts"/>
module pow2.ui {
   export class AngularGameFactory {
      loader:ResourceLoader;
      world:GameWorld;
      tileMap:GameTileMap;
      sprite:GameEntityObject;
      constructor(){
         this.loader = new ResourceLoader();
         this.world = new GameWorld({
            scene:new Scene({
               autoStart: true,
               debugRender:false
            }),
            state:new GameStateMachine()
         });
         this.world.scene.once('map:loaded',() => {
            // Create a movable character with basic components.
            this.sprite = GameStateMachine.createHeroEntity("Hero!", this.world.state.model.party[0]);
            this.sprite.setPoint(this.tileMap.bounds.getCenter());
            this.sprite.addComponent(new CollisionComponent());
            this.sprite.addComponent(new PlayerComponent());
            this.sprite.addComponent(new PlayerCameraComponent());
            this.sprite.addComponent(new PlayerTouchComponent());
            this.world.scene.addObject(this.sprite);
         });
         this.tileMap = new GameTileMap("town");
         this.world.scene.addObject(this.tileMap);
      }

      loadGame(data:any){
         if(this.world.state.model){
            this.world.state.model.destroy();
         }
         this.world.state.model = new GameStateModel(data, {parse: true});
         // Only add a hero if none exists.
         // TODO: This init stuff should go in a 'newGame' method or something.
         if(this.world.state.model.party.length === 0){
            var heroModel:HeroModel = HeroModel.create(HeroType.Warrior);
            this.world.state.model.addHero(heroModel);
            var heroModel:HeroModel = HeroModel.create(HeroType.Wizard);
            this.world.state.model.addHero(heroModel);
         }

      }
   }
   app.factory('game', () => {
      return new AngularGameFactory();
   });
}