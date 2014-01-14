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

/// <reference path="../../core/resources/image.ts"/>
/// <reference path="../../core/resources/xml.ts"/>
/// <reference path="./tiled.ts"/>
module pow2 {

   export class TilesetTile {
      id:number;
      properties:any = {};
      constructor(id:number){
         this.id = id;
      }
   }
   /**
    * A Tiled TSX tileset resource
    */
   export class TiledTSXResource extends XMLResource {
      name:string = null;
      tilewidth:number = 16;
      tileheight:number = 16;
      imageWidth:number = 0;
      imageHeight:number = 0;
      image:ImageResource = null;
      tiles:any[] = [];
      prepare(data) {
         var tileSet = this.getRootNode('tileset');
         this.name = this.getElAttribute(tileSet,'name');
         this.tilewidth = parseInt(this.getElAttribute(tileSet,'tilewidth'));
         this.tileheight = parseInt(this.getElAttribute(tileSet,'tileheight'));

         // Load tiles and custom properties.
         var tiles = this.getChildren(tileSet,'tile');
         _.each(tiles, (ts:any) => {
            var id:number = parseInt(this.getElAttribute(ts,'id'));
            var tile: TilesetTile = new TilesetTile(id);
            tile.properties = tiled.readTiledProperties(ts);
            this.tiles.push(tile);
         });

         var image = this.getChild(tileSet,'img');
         if(image && image.length > 0){
            var source = this.getElAttribute(image,'source');
            this.imageWidth = parseInt(this.getElAttribute(image,'width') || "0");
            this.imageHeight = parseInt(this.getElAttribute(image,'height') || "0");
            console.log("Tileset source: " + source);
            this.image = this.loader.load('/maps/' + source,() => {
               this.imageWidth = this.image.data.width;
               this.imageHeight = this.image.data.height;

               // Finally, build an expanded tileset from the known image w/h and the
               // tiles with properties that are specified in the form of <tile> objects.
               var xUnits = this.imageWidth / this.tilewidth;
               var yUnits = this.imageHeight / this.tileheight;
               var tileCount = xUnits * yUnits;
               var tileLookup = new Array(tileCount);
               for(var i = 0; i < tileCount; i++){
                  tileLookup[i] = false;
               }
               _.each(this.tiles,(tile) => {
                  tileLookup[tile.id] = tile.properties;
               });
               // TODO: uh-oh overwriting tiles....
               this.tiles = tileLookup;

               this.ready();
               //console.log(this);
            });
         }
         else {
            this.ready();
         }
      }
   }
}