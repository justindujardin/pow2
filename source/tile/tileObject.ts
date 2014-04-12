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
/// <reference path="../../lib/pow2.d.ts"/>
/// <reference path="./tileMap.ts" />

module pow2 {
   export interface TileObjectOptions {
      point?: pow2.Point;
      renderPoint?:pow2.Point;
      image?: HTMLImageElement;
      scale?:number;
      visible?:boolean;
      enabled?:boolean;
      tileMap:TileMap;

      // Game Sprite support.
      // ----------------------------------------------------------------------
      // The sprite name, e.g. "party.png" or "knight.png"
      icon?:string;
      // The sprite sheet source information
      meta?:any;
      // The sprite sheet frame (if applicable)
      frame?:number;
   }

   var DEFAULTS:TileObjectOptions = {
      visible:true,
      enabled:true,
      icon: "",
      iconCoords: null,
      scale:1,
      image: null,
      tileMap: null
   };

   export class TileObject extends SceneObject implements TileObjectOptions {
      point: pow2.Point;
      renderPoint:pow2.Point;
      image: HTMLImageElement;
      visible:boolean;
      enabled:boolean;
      tileMap:TileMap;
      scale:number;
      icon:string;
      meta:any;
      frame:number;

      constructor(options:TileObjectOptions=DEFAULTS) {
         super(options);
         _.extend(this, _.defaults(options || {}, DEFAULTS));
         return this;
      }

      setPoint(point:Point) {
         point.round();
         if(this.renderPoint){
            this.renderPoint = point.clone();
         }
         this.point = point.clone();
         var moveComponent = <MovableComponent>this.findComponent(MovableComponent);
         if(moveComponent){
            moveComponent.targetPoint.set(point);
            moveComponent.path.length = 0;
         }
      }

      /**
       * When added to a scene, resolve a feature icon to a renderable sprite.
       */
         onAddToScene() {
         if(this.icon){
            this.setSprite(this.icon);
         }
         if(!this.tileMap){
            this.tileMap = <TileMap>this.scene.objectByType(TileMap);
         }
      }

      /**
       * Set the current sprite name.  Returns the previous sprite name.
       */
         setSprite(name:string,frame:number = 0):string {
         var oldSprite:string = this.icon;
         if (!name) {
            this.meta = null;
         }
         else{
            var meta = this.world.sprites.getSpriteMeta(name);
            this.world.sprites.getSpriteSheet(meta.source, (image:ImageResource) => {
               this.meta = meta;
               return this.image = image.data;
            });
         }
         this.icon = name;
         return oldSprite;
      }
   }
}
