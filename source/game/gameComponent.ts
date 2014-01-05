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

/// <reference path="./objects/GameFeatureObject.ts" />
/// <reference path="../tile/tileComponent.ts" />
/// <reference path="./gameTileMap.ts" />
module pow2 {
   export class GameComponent extends TileComponent {
      feature:any = null;
      host:GameFeatureObject = null;
      tileMap:GameTileMap;
      connectComponent():boolean{
         if(!super.connectComponent() || !(this.tileMap instanceof GameTileMap)){
            return false;
         }
         this.feature = this.host.feature;
         return !!this.feature;
      }
      disconnectComponent():boolean{
         this.feature = null;
         return super.disconnectComponent();
      }
   }

}