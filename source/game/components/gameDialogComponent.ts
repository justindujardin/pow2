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

/// <reference path="../../tile/tileComponent.ts" />

module pow2 {
   export class GameDialogComponent extends TileComponent {
      title:string;
      text:string;
      icon:string;
      constructor(feature:any){
         super(feature);
         this.title = feature.title;
         this.text = feature.text;
         this.icon = feature.icon;
      }
      entered(object:TileObject):boolean {
         this.host.scene.trigger('dialog:entered',this);
         return true;
      }
      exited(object:TileObject):boolean {
         this.host.scene.trigger('dialog:exited',this);
         return true;
      }

   }

}