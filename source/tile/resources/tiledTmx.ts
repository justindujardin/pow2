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

module pow2 {
   /**
    * Use jQuery to load a TMX map file from a URL.
    */
   export class TiledTMXResource extends XMLResource {
      map:JQuery; // The <map> element
      prepare(data) {
         this.map = this.getRootNode('map');
         var tileSets = this.getChildren(this.map,'tileset');
         _.each(tileSets,(ts) => {
            var source:string = this.getElAttribute(ts,'source');
            if(source){
               this.loader.load('/maps/' + $(ts).attr('source'),(tileSetResource) => {
                  console.log(tileSetResource.data);
               });
            }


            // IF source then load file as TSX resource, otherwise create
            // a resource with the given data.

         });
         var layerData = data.find('layer > data');
         // Take CSV and convert it to JSON array, then parse.
         var tiles = '[' + $.trim(layerData.text()) + ']';
         tiles = JSON.parse(tiles);
         console.log(tiles);
         this.ready();
      }
   }
}