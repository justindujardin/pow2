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

/// <reference path="../../lib/pow2.d.ts" />
/// <reference path="./states/dorkaponMapState.ts" />

module dorkapon {
  export class DorkaponGameWorld extends pow2.scene.SceneWorld {

    /**
     * The main application state, e.g. Map, Combat, Menu.
     */
    state:DorkaponAppStateMachine;

    /**
     * The current combat state (if any).  The presence of this
     * state machine being valid may trigger the game UI to transition
     * to combat.
     *
     * This variable should be set to null when no combat is taking place.
     */
    combatState:DorkaponCombatStateMachine = null;


    /**
     * Dorkapon specific Google Spreadsheet data.
     */
    tables:pow2.GameDataResource;

    /**
     * Factory for creating entity objects from templates.
     */
    factory:pow2.EntityContainerResource;

    /**
     * The view used for rendering the game map.
     */
    mapView:DorkaponMapView;

    constructor(services?:any) {
      super(services);
      //pow2.GameDataResource.clearCache();
      this.loader.registerType('powEntities', pow2.EntityContainerResource);
      this.tables = <pow2.GameDataResource>this.loader.loadAsType(dorkapon.SPREADSHEET_ID, pow2.GameDataResource);
      this.factory = <pow2.EntityContainerResource>this.loader.load(pow2.GAME_ROOT + dorkapon.ENTITIES_CONTAINER);
    }


    /**
     * Get the game data sheets from google and callback when they're loaded.
     * @param then The function to call when spreadsheet data has been fetched
     */
    static getDataSource(then?:(data:pow2.GameDataResource)=>any):pow2.GameDataResource {
      var world = <DorkaponGameWorld>pow2.getWorld(dorkapon.NAME);
      if (world.tables.isReady()) {
        then(world.tables);
      }
      else {
        world.tables.once(pow2.Resource.READY, ()=> {
          then(world.tables);
        });
      }
      return world.tables;
    }

  }
}