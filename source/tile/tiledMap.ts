///<reference path="../../types/underscore/underscore.d.ts"/>

/**
 * Support loading JSON exported Tiled Map Editor maps.
 */
module tiled {

   /**
    * A Tiled map layer.
    */
   export class TileLayer {
      name:string;
      opacity:number;
      type:string = "tilelayer";
      visible:boolean;
      width:number;
      height:number;
      x:number;
      y:number;
      data:number[];
      constructor(data:any){
         this.name = data.name;
         this.type = data.type;
         this.opacity = data.opacity;
         this.visible = data.visible;
         this.width = data.width;
         this.height = data.height;
         this.x = data.x;
         this.y = data.y;
         this.data = data.data;
      }
   }

   /**
    * Game features layer
    */
   export class FeaturesLayer extends TileLayer {
      type:string;
      name:string = "Features";
      objects:any[];
      constructor(data:any) {
         super(data);
         this.objects = data.objects;
      }
   }

   /**
    * Tiled map object.
    */
   export class TiledMap {
      width:number;
      height:number;
      orientation:string;
      tileheight:number;
      tilewidth:number;
      version:number;
      properties:{};
      tilesets:any[];
      layers:any[];

      constructor(json:any){
         if(!json || json.version !== 1){
            throw new Error("Unsupported map data type.  Expected Tiled Map Editor JSON format version 1.");
         }
         this.version = json.version;
         this.width = json.width;
         this.height = json.height;
         this.orientation = json.orientation;
         this.tileheight = json.tileheight;
         this.tilewidth = json.tilewidth;
         this.properties = json.properties;
         this.layers = [];
         _.each(json.layers,(layer:any) => {
            var l:TileLayer = null;
            switch(layer.type){
               case "objectgroup":
                  l = new FeaturesLayer(layer);
                  break;
               default:
                  l = new TileLayer(layer);
                  break;
            }
            this.layers.push(l);
         });
         this.tilesets = json.tilesets;
      }
   }
}