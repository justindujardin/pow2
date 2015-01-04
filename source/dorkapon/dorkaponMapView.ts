/*
 Copyright (C) 2013-2014 by Justin DuJardin and Contributors

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

/// <reference path="./index.ts" />

module dorkapon {


   export class DorkaponMapView extends pow2.GameMapView {

      targetFill:string = "transparent";
      targetStroke:string = "white";
      targetStrokeWidth:number = 2;

      mouseClick(e:any) {
         var pathComponent = <dorkapon.components.PlayerPathComponent>this.scene.componentByType(dorkapon.components.PlayerPathComponent);
         var playerComponent = <pow2.game.components.PlayerComponent>this.scene.componentByType(pow2.game.components.PlayerComponent);
         if (pathComponent && playerComponent) {
            pow2.Input.mouseOnView(e.originalEvent,this.mouse.view,this.mouse);
            var nodes:components.INodeTile[] = pathComponent.getNodes();
            var hitNode = _.where(nodes,{
               x:this.mouse.world.x,
               y:this.mouse.world.y
            });
            if(hitNode.length){
               playerComponent.path = pathComponent.calculatePath(playerComponent.targetPoint,this.mouse.world);
            }
            e.preventDefault();
            return false;
         }

      }
   }
}
