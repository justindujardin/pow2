///<reference path="../../types/underscore/underscore.d.ts"/>

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

// Tell the typescript compiler that mixpanel is defined elsewhere.
declare var mixpanel: any;

module pow2 {

   export interface IGameItem {
      name:string; // The item name
      cost:number; // The cost of this item
      icon:string; // Sprite icon name, e.g. LongSword.png
   }

   export interface IGameWeapon extends IGameItem {
      attack:number; // Damage value
      hit:number; // 0-100%
   }

   export interface IGameArmor extends IGameItem {
      defense:number; // Defensive value
      evade:number; // Value to add to evasion <= 0
   }


   export var data = {
      maps: {},
      sprites: {},
      items:{},
      creatures:[],
      weapons:[],
      armor:[]
   };

   /**
    * Register data on the pow2 module.
    * @param {String} key The key to store the value under
    * @param {*} value The value
    */
   export function registerData(key:string,value:any){
      data[key] = value;
   }

   export function getData(key:string):any{
      return data[key];
   }

   export function registerMap(name:string,value:Object){
      data.maps[name] = value;
   }
   export function registerSprites(name:string,value:Object){
      for(var prop in value){
         if(value.hasOwnProperty(prop)){
            data.sprites[prop] = value[prop];
         }
      }
   }
   export function registerCreatures(level,creatures){
      _.each(creatures,(c) => {
         data.creatures.push(_.extend(c,{level:level}));
      });
   }
   export function registerWeapons(level,weapons:IGameWeapon[]){
      _.each(weapons,(c) => {
         data.weapons.push(_.extend(c,{
            level:level,
            itemType:"weapon"
         }));
      });
   }
   export function registerArmor(level,items:IGameArmor[]){
      _.each(items,(c) => {
         data.armor.push(_.extend(c,{
            level:level,
            itemType:"armor"
         }));
      });
   }
   export function getMap(name:string){
      return data.maps[name];
   }
   export function getMaps(){
      return data.maps;
   }
   export function track(name:string,properties:Object){
      if(typeof mixpanel !== 'undefined'){
         mixpanel.track(name,properties);
      }
   }
}