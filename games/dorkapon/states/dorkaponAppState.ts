/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

/// <reference path="../index.ts" />

module dorkapon {
  export class DorkaponAppStateMachine extends pow2.StateMachine {
    states:pow2.IState[] = [
      new states.AppMainMenuState(this),
      new states.AppMapState(this),
      new states.AppCombatState(this)
    ];
  }
}

module dorkapon.states {

  export class AppStateBase extends pow2.State {
    world:DorkaponGameWorld = pow2.getWorld<DorkaponGameWorld>(dorkapon.NAME);

    constructor(public parent:DorkaponAppStateMachine) {
      super();
    }
  }

  export class AppMainMenuState extends AppStateBase {
    static NAME:string = "app.states.mainmenu";
    name:string = AppMainMenuState.NAME;
  }


  export class AppCombatState extends AppStateBase {
    static NAME:string = "app.states.combat";
    name:string = AppCombatState.NAME;
    attacker:models.DorkaponEntity = null;
    defender:models.DorkaponEntity = null;

    map:DorkaponTileMap = null;

    machine:DorkaponCombatStateMachine;

    scene:pow2.scene.Scene = new pow2.scene.Scene();

    exit(machine:DorkaponAppStateMachine) {
      if (this.world.mapView) {
        this.scene.removeView(this.world.mapView);
      }
      this.world.combatState = this.machine = null;
      this.world.erase(this.scene);
      super.exit(machine);
    }

    enter(machine:DorkaponAppStateMachine) {
      super.enter(machine);
      if (!this.world.mapView) {
        throw new Error("Entering map state without view to render it");
      }
      this.world.mark(this.scene);
      this.scene.addView(this.world.mapView);
      this.world.mapView.setTileMap(this.map);
      this.world.mapView.camera.set(0, 0, 25, 19);

      this.world.combatState = this.machine = new DorkaponCombatStateMachine(this.attacker, this.defender, this.scene, machine);
      this.world.loader.load(pow2.getMapUrl('combat'), (map:pow2.TiledTMXResource)=> {
        this.map = this.world.factory.createObject('DorkaponMapObject', {
          resource: map
        });
        this.map.getLayer("world-plains").visible = true;
        this.world.mapView.setTileMap(this.map);
        this.scene.addObject(this.map);
        this.machine.setCurrentState(states.DorkaponCombatInit.NAME);
        this.map.loaded();
      });
    }

  }


  export class AppMapState extends AppStateBase {
    static NAME:string = "app.states.map";
    name:string = AppMapState.NAME;

    map:DorkaponTileMap = null;

    machine:DorkaponMapStateMachine = new DorkaponMapStateMachine();

    scene:pow2.scene.Scene = new pow2.scene.Scene();

    initialized:boolean = false;

    createPlayer(from:models.DorkaponPlayer, at?:pow2.Point):objects.DorkaponEntity {
      if (!from) {
        throw new Error("Cannot create player without valid model");
      }
      if (!this.world.factory.isReady()) {
        throw new Error("Cannot create player before entities container is loaded");
      }
      var sprite = <objects.DorkaponEntity>this.world.factory.createObject('DorkaponMapPlayer', {
        model: from,
        machine: this.machine,
        map: this.map
      });
      sprite.name = from.attributes.name;
      sprite.icon = from.attributes.icon;
      this.scene.addObject(sprite);
      sprite.setPoint(at);
      return sprite;
    }

    exit(machine:DorkaponAppStateMachine) {
      if (!this.world.mapView) {
        throw new Error("Entering map state without view to render it");
      }
      this.world.mapView.stateMachine = null;
      this.scene.removeView(this.world.mapView);
      this.world.erase(this.scene);
      super.exit(machine);
    }

    enter(machine:DorkaponAppStateMachine) {
      super.enter(machine);
      if (!this.world.mapView) {
        throw new Error("Entering map state without view to render it");
      }
      this.world.mark(this.scene);
      this.scene.addView(this.world.mapView);
      this.world.mapView.setTileMap(this.map);
      this.world.mapView.stateMachine = this.machine;

      if (!this.initialized) {
        this._loadMap();
      }
    }

    private _loadMap() {

      this.world.loader.load(pow2.getMapUrl('dorkapon'), (map:pow2.TiledTMXResource)=> {
        // Create a map
        this.map = this.world.factory.createObject('DorkaponMapObject', {
          resource: map
        });
        this.world.mapView.setTileMap(this.map);
        DorkaponGameWorld.getDataSource((res:pow2.GameDataResource)=> {
          var classes:any = res.getSheetData('classes');

          var players:objects.DorkaponEntity[] = [];

          // Ranger player
          var tpl:any = _.where(classes, {id: "warrior"})[0];
          tpl.icon = tpl.icon.replace("[gender]", "male");

          var model:models.DorkaponPlayer = models.DorkaponPlayer.create(tpl);
          players.push(this.createPlayer(model, new pow2.Point(3, 18)));

          // Mage player
          tpl = _.where(classes, {id: "mage"})[0];
          tpl.icon = tpl.icon.replace("[gender]", "female");
          model = models.DorkaponPlayer.create(tpl);
          players.push(this.createPlayer(model, new pow2.Point(12, 11)));

          this.scene.addObject(this.map);

          // Give the state machine our players.
          this.machine.playerPool = players;

          // Loaded!
          this.map.loaded();
          this.world.mapView.setTileMap(this.map);
          this.initialized = true;
          this.machine.setCurrentState(DorkaponInitGame.NAME);
        });
      });

    }
  }

}