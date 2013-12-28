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

/// <reference path="../../types/underscore/underscore.d.ts" />
/// <reference path="../core/point.ts" />
/// <reference path="../scene/sceneObject.ts" />
/// <reference path="../scene/components/movableComponent.ts" />
/// <reference path="./tileMap.ts" />

module pow2 {
   export class TileObject extends pow2.SceneObject {
      point: pow2.Point;
      renderPoint:pow2.Point;
      image: HTMLImageElement;
      visible:boolean;
      enabled:boolean;
      tileMap:TileMap;

      // Game Sprite support.
      // ----------------------------------------------------------------------
      // The sprite name, e.g. "party.png" or "knight.png"
      icon:string;
      // The sprite sheet source information
      iconCoords:any;

      constructor(options?: any) {
         super(options);
         _.extend(this, _.defaults(options || {}, {
            point: new pow2.Point(0, 0),
            visible:true,
            enabled:true,
            icon: "",
            iconCoords: null,
            image: null,
            tileMap: null
         }));
         return this;
      }

      setPoint(point) {
         if(this.renderPoint){
            this.renderPoint = point.clone();
         }
         this.point = point.clone();
         var moveComponent = <MovableComponent>this.findComponent(MovableComponent);
         if(moveComponent){
            moveComponent.targetPoint.set(point);
         }
      }

      /**
       * When added to a scene, resolve a feature icon to a renderable sprite.
       */
      onAddToScene() {
         if(this.icon){
            this.setSprite(this.icon);
         }
      }

      /**
       * Set the current sprite name.  Returns the previous sprite name.
       */
      setSprite(name:string):string {
         var oldSprite:string = this.icon;
         if (!name) {
            this.iconCoords = null;
         }
         else{
            this.iconCoords = this.world.sprites.getSpriteCoords(name);
            this.world.sprites.getSpriteSheet(this.iconCoords.source, (image) => {
               return this.image = image.data;
            });
         }
         this.icon = name;
         return oldSprite;
      }
   }
}
