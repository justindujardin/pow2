///<reference path="../types/node/node.d.ts"/>
///<reference path="../types/underscore/underscore.d.ts"/>

import _ = require("underscore");
module powServer {

   export class TileLayer {
      name:string;
      opacity:number = 1;
      type:string = "tilelayer";
      visible:boolean = true;
      width:number;
      height:number;
      x:number;
      y:number;
      objects:any[];
   }

   export class FeaturesLayer extends TileLayer {
      type:string = "objectlayer";
      name:string = "Features";
   }

   export class TiledMap {
      width:number = 10;
      height:number = 10;
      orientation:string="orthogonal";
      tileheight:number = 16;
      tilewidth:number = 16;
      version:number = 1;
      properties:{};
      layers:any[] =[];
   }

   export class MapLoader {

      featuresLayer(map:any):any { // todo: typedef
         var value:any = {};
         // Generate a Tiled layer called 'Features' that contains the map features.
         //
         //
         var featuresLayer = {
            "name":"Features",
            "opacity":1,
            "type":"objectgroup",
            "visible":true,
            "width":value.width,
            "height":value.height,
            "x":0,
            "y":0,
            "objects":[]
         };
         _.each(map.features,function(f:any){
            var feature = {
               "height":16,
               "name": f.name,
               "properties": _.omit(f,["x","y","name","type"]),
               "type":f.type,
               "visible":!!(f.icon),
               "width":16,
               "x": f.x * 16,
               "y": f.y * 16
            };
            featuresLayer.objects.push(feature);
         });
      }
   }
}