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
module pow2 {
   export class TileStoreComponent extends TileComponent {
      name:string;
      inventory:any[];
      groups:string[];
      constructor(feature:any){
         super(feature);
         this.name = feature.name;
         this.groups = feature.groups;
         this.inventory = _.filter(pow2.data.items,(item:any) => {
            if(item.level !== feature.level){
               return false;
            }
            var matchGroup:boolean = false;
            _.each(this.groups,function(group:string){
               if(_.indexOf(item.groups,group) !== -1){
                  matchGroup = true;
               }
            });
            return matchGroup;
         });
      }
      entered(object:TileObject):boolean {
         this.host.scene.trigger('store:entered',this);
         return true;
      }
      exited(object:TileObject):boolean {
         this.host.scene.trigger('store:exited',this);
         return true;
      }

   }

}