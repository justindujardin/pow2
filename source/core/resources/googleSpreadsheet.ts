/**
 Copyright (C) 2014 by Justin DuJardin

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
   declare var Tabletop:any;
   /**
    * Use jQuery to load a published google spreadsheet as JSON.
    */
   export class GoogleSpreadsheetResource extends Resource {
      load() {
         // TODO: ERROR Condition
         Tabletop.init( {
            key: this.url,
            callback: (data, tabletop) => {
               this.data = data;
               this.ready();
            }
         });
      }

      getSheetData(name:string) {
         if(!this.isReady()){
            throw new Error("Cannot query spreadsheet before it's loaded");
         }
         if(!this.data[name] || !this.data[name].hasOwnProperty('elements')){
            throw new Error("Unable to find sheet with name: " + name);
         }
         return this.data[name].elements;
      }

   }
}