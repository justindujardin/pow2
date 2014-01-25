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

/// <reference path="../../tile/tileObject.ts" />
/// <reference path="../gameTileMap.ts" />
/// <reference path="../models/entityModel.ts" />
/// <reference path="../../tile/components/spriteComponent.ts" />

module pow2 {
   export class GameEntityObject extends TileObject {
      tileMap:GameTileMap;
      model:EntityModel;
      feature:any; // TODO: Feature Interface
      type: string; // TODO: enum?
      groups:any;
      constructor(options:any) {
         super(_.omit(options || {},["x","y","type"]));
         this.feature = options;
         this.type = options.type || "player";
         this.groups = typeof options.groups === 'string' ? JSON.parse(options.groups) : options.groups;
         this.model = options.model || new EntityModel(options);
      }

      isDefeated():boolean {
         return this.model.isDefeated();
      }

      getIcon() {
         if(this.icon){
            return this.icon;
         }
         var spriteComponent = <SpriteComponent>this.findComponent(SpriteComponent);
         if(spriteComponent){
            return spriteComponent.icon;
         }
         return null;
      }
   }
}