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
/// <reference path="./point.ts"/>
/// <reference path="../../types/jquery/jquery.d.ts"/>
module pow2 {
   export enum KeyCode {
      UP = 38,
      DOWN = 40,
      LEFT = 37,
      RIGHT = 39,
      BACKSPACE = 8,
      COMMA = 188,
      DELETE = 46,
      END = 35,
      ENTER = 13,
      ESCAPE = 27,
      HOME = 36,
      SPACE = 32,
      TAB = 9
   }

   export interface NamedMouseElement {
      name:string;
      el:HTMLElement;
      point:Point;
   }

   export class Input {
      _keysDown:Object = {};
      _mousePosition:Point = new Point(0,0);
      _mouseElements:NamedMouseElement[] = [];

      constructor() {
         window.addEventListener(<string>"keydown", (ev:KeyboardEvent) => {
            this._keysDown[ev.which] = true;
         });
         window.addEventListener(<string>'keyup', (ev:KeyboardEvent) => {
            this._keysDown[ev.which] = false;
         });
         var hooks = this._mouseElements;
         window.addEventListener(<string>'mousemove', (ev:MouseEvent) => {
            _.find(hooks,(hook:NamedMouseElement) => {
               if(ev.srcElement === hook.el){
                  var canoffset = $(event.srcElement).offset();
                  var x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
                  var y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top);
                  hook.point.set(x,y);
                  return true;
               }
               return false;
            });
         });
      }

      mouseHook(el:HTMLElement,name:string){
         var hooks = _.where(this._mouseElements,{name:name});
         if(hooks.length > 0){
            return hooks[0];
         }
         var result:NamedMouseElement = {
            name:name,
            el:el,
            point: new Point(0,0)
         };
         this._mouseElements.push(result);
         return result;
      }
      mouseUnhook(name:string);
      mouseUnhook(el:HTMLElement);
      mouseUnhook(nameOrEl:any){
         this._mouseElements = _.filter(this._mouseElements,(hook:NamedMouseElement) => {
            return hook.name === nameOrEl || hook.el === nameOrEl;
         });
      }

      getMouseHook(name:string);
      getMouseHook(el:HTMLElement);
      getMouseHook(nameOrEl:any){
         return _.find(this._mouseElements,(hook:NamedMouseElement) => {
            return hook.name === nameOrEl || hook.el === nameOrEl;
         });
      }

      keyDown(key:number):boolean {
         return !!this._keysDown[key];
      }

      // Convert a mouse event on the canvas into coordinates that are relative
      // to it, rather than to the DOM.
      canvasMousePosition(event: MouseEvent): Point {
         var canoffset, x, y;
         canoffset = $(event.currentTarget).offset();
         x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
         y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top);
         return new Point(x, y);
      }
   }
}