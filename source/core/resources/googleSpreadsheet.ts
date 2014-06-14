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
               this.data = this.transformTypes(data);
               this.ready();
            }
         });
      }

      // TODO: Do we need to match - and floating point?
      static NUMBER_MATCHER:RegExp = /^\d+$/;

      transformTypes(data:any):any {
         var results:any = {};
         _.each(data,(dataValue:any,dataKey)=>{
            var sheetElements = dataValue.elements.slice(0);
            var length:number = sheetElements.length;
            for (var i = 0; i < length; i++){
               var entry:any = sheetElements[i];
               for (var key in entry) {
                  if (!entry.hasOwnProperty(key) || typeof entry[key] !== 'string') {
                     continue;
                  }
                  var value = entry[key];
                  // number values
                  if(value.match(pow2.GoogleSpreadsheetResource.NUMBER_MATCHER)){
                     entry[key] = parseInt(value);
                  }
                  // pipe delimited array values
                  else if(key === 'usedby' || key === 'groups'){
                     entry[key] = value.split('|');
                  }
               }
            }
            results[dataKey.toLowerCase()] = sheetElements;
         });
         return results;
      }
      getSheetData(name:string):any {
         if(!this.isReady()){
            throw new Error("Cannot query spreadsheet before it's loaded");
         }
         if(!this.data[name]){
            return [];
         }
         return this.data[name];
      }

   }
}