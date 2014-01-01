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

/// <reference path="../resource.ts"/>

module pow2 {
   /**
    * Use jQuery to load an XML file from a URL.
    */
   export class XMLResource extends Resource {
      data:JQuery;
      load() {
         var request:JQueryXHR = $.get(this.url);
         request.done((object:XMLDocument) => {
            this.data = $(object);
            this.prepare(this.data);
         });
         request.fail((jqxhr,settings,exception) => {
            this.failed(exception);
         });
      }
      /*
         Do any data modification here, or just fall-through to ready.
       */
      prepare(data){
         this.ready();
      }

      getElTag(el:JQuery){
         if(el){
            var name:string = el.prop('tagName');
            if(name){
               return name.toLowerCase();
            }
         }
         return null;
      }

      getRootNode(tag:string){
         if(!this.data){
            return null;
         }
         return $(_.find(this.data,function(d:any){
            return d.tagName && d.tagName.toLowerCase() === tag;
         }));
      }

      getChildren(el:JQuery,tag:string):JQuery[] {
         var list = el.find(tag);
         return _.compact(_.map(list,function(c){
            var child:JQuery = $(c);
            return child.parent()[0] !== el[0] ? null : child;
         }));
      }

      getChild(el:JQuery,tag:string):JQuery {
         return this.getChildren(el,tag)[0];
      }

      getElAttribute(el:JQuery, name:string){
         if(el){
            var attr = el.attr(name);
            if(attr){
               return attr;
            }
         }
         return null;
      }
   }
}