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

/// <reference path="../../../lib/pow2.d.ts"/>
/// <reference path="./tiled.ts"/>
/// <reference path="./tiledTsx.ts"/>

module pow2 {
   /**
    * Use jQuery to load a TMX $map file from a URL.
    */
   export class TiledTMXResource extends XMLResource {
      $map:JQuery; // The <map> element
      width:number = 0;
      height:number = 0;
      orientation:string = "orthogonal";
      tileheight:number = 16;
      tilewidth:number = 16;
      version:number = 1;
      properties:any = {};
      tilesets:any = {};
      layers:any[] = [];
      objectGroups:any[] = [];

      prepare(data) {
         this.$map = this.getRootNode('map');
         this.version = parseInt(this.getElAttribute(this.$map,'version'));
         this.width = parseInt(this.getElAttribute(this.$map,'width'));
         this.height = parseInt(this.getElAttribute(this.$map,'height'));
         this.orientation = this.getElAttribute(this.$map,'orientation');
         this.tileheight = parseInt(this.getElAttribute(this.$map,'tileheight'));
         this.tilewidth = parseInt(this.getElAttribute(this.$map,'tilewidth'));
         this.properties = tiled.readTiledProperties(this.$map);
         var tileSetDeps = [];
         var tileSets = this.getChildren(this.$map,'tileset');
         _.each(tileSets,(ts) => {
            var source:string = this.getElAttribute(ts,'source');
            if(source){
               tileSetDeps.push('/maps/' + source);
            }
            // TODO: IF no source then create a resource with the given data.
         });

         // Extract tile <layer>s
         var layers = this.getChildren(this.$map,'layer');
         _.each(layers,(layer) => {
            var tileLayer = <tiled.ITiledLayer>tiled.readITiledLayerBase(layer);
            this.layers.push(tileLayer);

            // Take CSV and convert it to JSON array, then parse.
            var data:any = this.getChild(layer,'data');
            if(data){
               var encoding:string = this.getElAttribute(data,'encoding');
               if(!encoding || encoding.toLowerCase() !== 'csv'){
                  throw new Error("Pow2 only supports CSV maps.  Edit the Map Properties (for:" + this.url +  ") in Tiled to use the CSV option when saving.");
               }
               tileLayer.data = JSON.parse('[' + $.trim(data.text()) + ']');
            }
         });

         // Extract tile <objectgroup>s
         var objectGroups = this.getChildren(this.$map,'objectgroup');
         _.each(objectGroups,($group) => {

            // Base layer properties.
            var objectGroup = <tiled.ITiledObjectGroup>tiled.readITiledLayerBase($group);
            objectGroup.objects = [];
            var color:string = this.getElAttribute($group,'color');
            if(color){
               objectGroup.color = color;
            }
            // Read any objects
            var objects = this.getChildren($group,'object');
            _.each(objects,(object) => {
               objectGroup.objects.push(<tiled.ITiledObject>tiled.readITiledLayerBase(object));
            });
            this.objectGroups.push(objectGroup);
         });


         // Load any source references.
         var _next = ():any => {
            if(tileSetDeps.length <= 0){
               return this.ready();
            }
            var dep = tileSetDeps.shift();
            return this.loader.load(dep,(tsr:TiledTSXResource) => {
               this.tilesets[tsr.name] = tsr;
               _next();
            });
         };
         _next();
      }
   }
}