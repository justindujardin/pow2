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

/// <reference path="../index.ts"/>
/// <reference path="../states/dorkaponMapState.ts"/>
/// <reference path="../dorkaponGameWorld.ts"/>

module dorkapon.services {
  export class DorkaponService {
    loader:pow2.ResourceLoader;
    world:DorkaponGameWorld;
    machine:DorkaponAppStateMachine;

    constructor(public compile:ng.ICompileService,
                public scope:ng.IRootScopeService) {

      if (this.qs().hasOwnProperty('dev')) {
        console.log("Clearing gameData cache and loading live from Google Spreadsheets");
        pow2.GameDataResource.clearCache(SPREADSHEET_ID);
      }

      this.loader = pow2.ResourceLoader.get();
      this.world = new DorkaponGameWorld({
        scene: new pow2.scene.Scene({
          autoStart: true,
          debugRender: false
        })
      });
      pow2.registerWorld(dorkapon.NAME, this.world);
      this.machine = <DorkaponAppStateMachine>this.world.setService('state', new DorkaponAppStateMachine());
      // Tell the world time manager to start ticking.
      this.world.time.start();

    }

    /**
     * Start a new game.
     * @param then
     */
    newGame(then?:()=>any) {
      this.machine.setCurrentState(dorkapon.states.AppMapState.NAME);
      then && then();
    }

    /**
     * Extract the browser location query params
     * http://stackoverflow.com/questions/9241789/how-to-get-url-params-with-javascript
     */
    qs():any {
      if (window.location.search) {
        var query_string = {};
        (function () {
          var e,
              a = /\+/g,  // Regex for replacing addition symbol with a space
              r = /([^&=]+)=?([^&]*)/g,
              d = function (s) {
                return decodeURIComponent(s.replace(a, " "));
              },
              q = window.location.search.substring(1);

          while ((e = r.exec(q))) {
            query_string[d(e[1])] = d(e[2]);
          }
        })();
        return query_string;
      }
      return {};
    }
  }
  app.factory('$dorkapon', [
    '$compile',
    '$rootScope',
    ($compile:ng.ICompileService, $rootScope:ng.IRootScopeService) => {
      return new DorkaponService($compile, $rootScope);
    }
  ]);
}