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

///<reference path='./point.ts' />

module eburp{
   export class Rect {
      point: Point;
      extent: Point;
      constructor(rect:Rect);
      constructor(point:Point,extent:Point);
      constructor(x:number,y:number,width:number,height:number);
      constructor(rectOrPointOrX:any,extentOrY?:any,width?:number,height?:number) {
         if(rectOrPointOrX instanceof Rect){
            this.point = new Point(rectOrPointOrX.point);
            this.extent = new Point(rectOrPointOrX.extent);
         }
         else if(width && height){
            this.point = new Point(rectOrPointOrX,extentOrY);
            this.extent = new Point(width,height);
         }
         else if(rectOrPointOrX instanceof Point && extentOrY instanceof Point){
            this.point = new Point(rectOrPointOrX);
            this.extent = new Point(extentOrY);
         }
         else {
            this.point = new Point(0,0);
            this.extent = new Point(1,1);
         }
         return this;
      }

      set(rect:Rect):Rect;
      set(point:Point,extent:Point):Rect;
      set(x:number,y:number,width:number,height:number);
      set(rectOrPointOrX:any,extentOrY?:any,width?:number,height?:number):Rect {
         if(rectOrPointOrX instanceof Rect){
            this.point.set(rectOrPointOrX.point);
            this.extent.set(rectOrPointOrX.extent);
         }
         else if(width && height){
            this.point.set(rectOrPointOrX,extentOrY);
            this.extent.set(width,height);
         }
         else if(rectOrPointOrX instanceof Point && extentOrY instanceof Point){
            this.point.set(rectOrPointOrX);
            this.extent.set(extentOrY);
         }
         else {
            throw new Error("Unsupported arguments to Rect.set");
         }
         return this;
      }

      clone():Rect {
         return new Rect(this.point.clone(),this.extent.clone());
      }

      clamp(rect:Rect):Rect {
         if(this.point.x < rect.point.x){
            this.point.x += rect.point.x - this.point.x;
         }
         if(this.point.y < rect.point.y){
            this.point.y += rect.point.y - this.point.y;
         }
         if(this.point.x + this.extent.x > rect.point.x + rect.extent.x){
            this.point.x -= ((this.point.x + this.extent.x) - (rect.point.x + rect.extent.x));
         }
         if(this.point.y + this.extent.y > rect.point.y + rect.extent.y){
            this.point.y -= ((this.point.y + this.extent.y) - (rect.point.y + rect.extent.y));
         }

         return this;
      }


      clip(clipRect:Rect):Rect{
         var right:number = this.point.x + this.extent.x;
         var bottom:number = this.point.y + this.extent.y;
         this.point.x = Math.max(clipRect.point.x, this.point.x);
         this.extent.x = Math.min(clipRect.point.x + clipRect.extent.x,right) - this.point.x;
         this.point.y = Math.max(clipRect.point.y, this.point.y);
         this.extent.x = Math.min(clipRect.point.y + clipRect.extent.y,bottom) - this.point.y;
         return this;
      }
      isValid():boolean {
         return this.extent.x > 0 && this.extent.y > 0;
      }
      intersect(clipRect:Rect):boolean {
         var bottomLX:number = Math.min(this.point.x+this.extent.x,clipRect.point.x+clipRect.extent.x);
         var bottomLY:number = Math.min(this.point.y+this.extent.y,clipRect.point.y+clipRect.extent.y);
         this.point.x = Math.max(this.point.x,this.extent.x);
         this.point.y = Math.max(this.point.y,this.extent.y);
         this.extent.x = bottomLX - this.point.x;
         this.extent.y = bottomLY - this.point.y;
         return this.isValid();
      }

      pointInRect(point:Point):boolean;
      pointInRect(x:number,y:number):boolean;
      pointInRect(pointOrX:any,y?:number){
         var x:number = 0;
         if(pointOrX instanceof Point){
            x = pointOrX.x;
            y = pointOrX.y;
         }
         else {
            x = pointOrX;
         }
         if(x >= this.point.x + this.extent.x || y >= this.point.y + this.extent.y){
            return false;
         }
         return !(x < this.point.x || y < this.point.y);
      }

      getCenter():Point {
         var x = parseFloat((this.point.x + this.extent.x * 0.5).toFixed(2));
         var y = parseFloat((this.point.y + this.extent.y * 0.5).toFixed(2));
         return new Point(x,y);
      }

      setCenter(point:Point):Rect;
      setCenter(x:number,y:number):Rect;
      setCenter(pointOrX:any,y?:number):Rect {
         var x:number;
         if(pointOrX instanceof Point){
            x = pointOrX.x;
            y = pointOrX.y;
         }
         else {
            x = pointOrX;
         }
         this.point.x = parseFloat((x - this.extent.x * 0.5).toFixed(2));
         this.point.y = parseFloat((y - this.extent.y * 0.5).toFixed(2));
         return this;
      }

      scale(value:number):Rect {
         this.point.multiply(value);
         this.extent.multiply(value);
         return this;
      }

      round():Rect {
         this.point.round();
         this.extent.set(Math.ceil(this.extent.x),Math.ceil(this.extent.y));
         return this;
      }

      getLeft():number { return this.point.x; }
      getTop():number { return this.point.y; }
      getRight():number { return this.point.x + this.extent.x; }
      getBottom():number { return this.point.y + this.extent.y; }

      inflate(x:number=1,y:number=1):Rect {
         this.point.x -= x;
         this.extent.x += 2 * x;
         this.point.y -= y;
         this.extent.y += 2 * y;
         return this;
      }
   }
}
