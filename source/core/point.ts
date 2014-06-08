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
module pow2{
   export class Point {
      x:number;
      y:number;
      constructor();
      constructor(point:Point);
      constructor(x:number,y:number);
      constructor(x:string,y:string);
      constructor(pointOrX?:any,y?:any){
         if(pointOrX instanceof Point){
            this.set(pointOrX.x,pointOrX.y);
         }
         else if(typeof pointOrX === 'string' && typeof y === 'string'){
            this.set(parseFloat(pointOrX),parseFloat(y));
         }
         else if(typeof pointOrX == 'number' && typeof y === 'number') {
            this.set(pointOrX,y);
         }
         else {
            this.zero();
         }
      }

      toString():string {
         return "" + this.x + "," + this.y;
      }

      set(point:Point):Point;
      set(x:number,y:number):Point;
      set(pointOrX:any,y?:any):Point{
         if(pointOrX instanceof Point){
            this.x = pointOrX.x;
            this.y = pointOrX.y;
         }
         else {
            this.x = typeof pointOrX !== 'undefined' ? pointOrX : 0;
            this.y = typeof y !== 'undefined' ? y : 0;
         }
         return this;
      }

      clone():Point {
         return new Point(this.x,this.y);
      }

      copy(from:Point):Point{
         this.x = from.x;
         this.y = from.y;
         return this;
      }

      truncate():Point {
         this.x = Math.floor(this.x);
         this.y = Math.floor(this.y);
         return this;
      }

      // TODO: Remove this or truncate.
      round():Point {
         this.x = Math.round(this.x);
         this.y = Math.round(this.y);
         return this;
      }

      add(x:number,y:number):Point;
      add(value:number):Point;
      add(point:Point):Point;
      add(pointOrXOrValue:any,y?:number){
         if(pointOrXOrValue instanceof Point){
            this.x += pointOrXOrValue.x;
            this.y += pointOrXOrValue.y;
         }
         else if(pointOrXOrValue && typeof y === 'undefined'){
            this.x += pointOrXOrValue;
            this.y += pointOrXOrValue;
         }
         else {
            this.x += pointOrXOrValue;
            this.y += y;
         }
         return this;
      }
      subtract(point:Point):Point{
         this.x -= point.x;
         this.y -= point.y;
         return this;
      }

      multiply(x:number,y:number):Point;
      multiply(value:number):Point;
      multiply(point:Point):Point;
      multiply(pointOrXOrValue:any,y?:number):Point{
         if(pointOrXOrValue instanceof Point){
            this.x *= pointOrXOrValue.x;
            this.y *= pointOrXOrValue.y;
         }
         else if(pointOrXOrValue && typeof y === 'undefined'){
            this.x *= pointOrXOrValue;
            this.y *= pointOrXOrValue;
         }
         else {
            this.x *= pointOrXOrValue;
            this.y *= y;
         }
         return this;
      }

      divide(x:number,y:number):Point;
      divide(value:number):Point;
      divide(point:Point):Point;
      divide(pointOrXOrValue:any,y?:number):Point{
         if(pointOrXOrValue instanceof Point){
            if(pointOrXOrValue.x === 0 || pointOrXOrValue.y === 0){
               throw new Error("Divide by zero");
            }
            this.x /= pointOrXOrValue.x;
            this.y /= pointOrXOrValue.y;
         }
         else if(pointOrXOrValue && typeof y === 'undefined'){
            if(pointOrXOrValue === 0){
               throw new Error("Divide by zero");
            }
            this.x /= pointOrXOrValue;
            this.y /= pointOrXOrValue;
         }
         else {
            if(pointOrXOrValue === 0 || y === 0){
               throw new Error("Divide by zero");
            }
            this.x /= pointOrXOrValue;
            this.y /= y;
         }
         return this;
      }

      inverse():Point {
         this.x *= -1;
         this.y *= -1;
         return this;
      }
      equal(point:Point){
         // TODO epsilon.
         return this.x === point.x && this.y === point.y;
      }

      isZero():boolean{
         return this.x === 0 && this.y === 0;
      }
      zero():Point{
         this.x = this.y = 0;
         return this;
      }

      interpolate(from:Point,to:Point,factor:number):Point {
         factor = Math.min(Math.max(factor,0),1);
         this.x = (from.x * (1.0 - factor)) + (to.x * factor);
         this.y = (from.y * (1.0 - factor)) + (to.y * factor);
         return this;
      }

      magnitude():number {
         return Math.sqrt(this.x * this.x + this.y * this.y);
      }

      magnitudeSquared():number {
         return this.x * this.x + this.y * this.y;
      }

      normalize():Point {
         var m:number = this.magnitude();
         if(m > 0){
            this.x /= m;
            this.y /= m;
         }
         return this;
      }
   }
}