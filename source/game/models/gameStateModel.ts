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

/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../types/underscore/underscore.d.ts" />
/// <reference path="../../core/api.ts" />
/// <reference path="./entityModel.ts" />
module pow2 {

   export interface GameStateModelOptions {
      party:EntityModel[]; // The player's party
      inventory:any[]; // The inventory of items owned by the player.
      gold:number;
   }

   export class GameStateModel extends Backbone.Model {
      static DEFAULTS:GameStateModelOptions = {
         party: [],
         inventory: [],
         gold: 0
      };
      defaults():any {
         return _.extend({}, GameStateModel.DEFAULTS);
      }

      addHero(model:EntityModel){
         this.attributes.party.push(model);
      }

      private _isSerializing:boolean = false;
      toJSON() {
         if (this._isSerializing) {
            return this.id || this.cid;
         }
         this._isSerializing = true;
         var json = _.clone(this.attributes);
         _.each(json, function(value:any, name) {
            _.isFunction(value.toJSON) && (json[name] = value.toJSON());
         });
         this._isSerializing = false;
         return json;
      }
   }
}