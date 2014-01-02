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

/// <reference path="../../core/resources/xml.ts"/>

module pow2.tiled {

   export interface ITiledBase {
      name:string;
      x:number;
      y:number;
      width:number;
      height:number;
      visible:boolean;
   }

   // <layer>, <objectgroup>
   export interface ITiledLayerBase extends ITiledBase {
      opacity:number; // 0-1
      properties?:any;
   }
   export interface ITiledLayer extends ITiledLayerBase {
      data?:any;
   }

   // <object>
   export interface ITiledObject extends ITiledBase {
      rotation?:number;
      gid?:number;
   }

   // <objectgroup>
   export interface ITiledObjectGroup extends ITiledLayerBase {
      color:string;
      objects:ITiledObject[];
   }

   // Tiled object XML reading utilities.
   export function readITiledBase(el:JQuery):ITiledBase{
      return {
         name:getElAttribute(el,'name'),
         x:parseInt(getElAttribute(el,'x') || "0"),
         y:parseInt(getElAttribute(el,'y') || "0"),
         width:parseInt(getElAttribute(el,'width') || "0"),
         height:parseInt(getElAttribute(el,'height') || "0"),
         visible:parseInt(getElAttribute(el, 'visible') || "1") === 1 // 0 or 1
      };
   }

   export function readITiledLayerBase(el:JQuery) {
      // Base layer properties
      var result:ITiledLayerBase = <ITiledLayerBase>readITiledBase(el);
      // Layer opacity is 0-1
      result.opacity = parseInt(getElAttribute(el,'opacity') || "1");
      // Custom properties
      var props = readTiledProperties(el);
      if(props){
         result.properties = props;
      }
      return result;
   }

   export function readTiledProperties(el:JQuery){
      var propsObject:JQuery = getChild(el,'properties');
      if(propsObject && propsObject.length > 0){
         var properties = {};
         var props = getChildren(propsObject,'property');
         _.each(props,(p) => {
            var key = getElAttribute(p,'name');
            var value:any = getElAttribute(p,'value');

            // Do some horrible type guessing.
            if(typeof value === 'string'){
               var checkValue:any = value.toLowerCase();
               if(checkValue === 'true' || checkValue === 'false'){
                  value = checkValue === 'true';
               }
               else if(!isNaN((checkValue = parseFloat(value)))){
                  value = checkValue
               }
            }
            properties[key] = value;
         });
         return properties;
      }
      return null;
   }

   // XML Utilities

   export function getChildren(el:JQuery,tag:string):JQuery[] {
      var list = el.find(tag);
      return _.compact(_.map(list,function(c){
         var child:JQuery = $(c);
         return child.parent()[0] !== el[0] ? null : child;
      }));
   }

   export function getChild(el:JQuery,tag:string):JQuery {
      return getChildren(el,tag)[0];
   }

   export function getElAttribute(el:JQuery, name:string){
      if(el){
         var attr = el.attr(name);
         if(attr){
            return attr;
         }
      }
      return null;
   }

}