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

/// <reference path="../tileComponent.ts" />
module eburp {
   export class TileStoreComponent extends TileComponent {
      name:string;
      constructor(name:string){
         super();
         this.name = name;
      }
      entered(object:TileObject):boolean {
         var items = _.where(eburp.data.items,{level:1,type:"weapon"});
         this.host.scene.trigger('store:entered',this);
         return true;
      }
      exited(object:TileObject):boolean {
         this.host.scene.trigger('store:exited',this);
         return true;
      }

   }

}