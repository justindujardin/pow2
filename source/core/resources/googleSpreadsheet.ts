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
   /**
    * Use jQuery to load a published google spreadsheet as JSON.
    */
   export class GoogleSpreadsheetResource extends Resource {
      load() {
         // TODO: This is _really_ fragile.
         var publicSheetUrl:string = "https://spreadsheets.google.com/feeds/list/" + this.url + "/od6/public/values?alt=json";
         var request:JQueryXHR = $.getJSON(publicSheetUrl);
         request.done((object:JSON) => {
            this.data = object;
            this.ready();
         });
         request.fail((jqxhr,settings,exception) => {
            this.failed(exception);
         });
      }



   }
}