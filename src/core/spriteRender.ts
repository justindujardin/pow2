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

///<reference path="../typedef/underscore/underscore.d.ts"/>
///<reference path="./api.ts"/>
///<reference path="../resources/image.ts"/>
///<reference path="./resourceLoader.ts"/>
///<reference path="./world.ts"/>
module eburp {
    export class SpriteRender implements IWorldObject {
        canvas:HTMLCanvasElement = null;
        context:CanvasRenderingContext2D = null;

        // IWorldObject implementation.
        world:IWorld = null;
        onAddToWorld(world:IWorld){}
        onRemoveFromWorld(world:IWorld){}

        constructor() {
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.canvas.height = 16;

            this.context = this.canvas.getContext('2d');
            (<any>this.context).webkitImageSmoothingEnabled = false;
            (<any>this.context).mozImageSmoothingEnabled = false;
        }

        getSpriteSheet(name:string,done:Function=()=>{}):ImageResource{
            if(this.world){
                return this.world.loader.load("/images/" + name + ".png",done);
            }
            return null;
        }

        getSingleSprite(spriteName:string,done:Function=(result:any)=>{}):ImageResource{
            var coords:any = eburp.data.sprites[spriteName];
            return this.getSpriteSheet(coords.source,(image:ImageResource)=>{
                this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
                this.context.drawImage(image.data,coords.x,coords.y,this.canvas.width,this.canvas.height,0,0,this.canvas.width,this.canvas.height);
                var src:string = this.canvas.toDataURL();
                var result:HTMLImageElement = new Image();
                result.src = src;
                result.onload = function() {
                    done(result);
                };
                result.onerror = function(err){
                    done(err);
                };
            });
        }

        getSpriteCoords(name:string) {
            var desc = eburp.data.sprites[name];
            if(!desc){
                throw new Error("Missing sprite data for: " + name);
            }
            return desc;
        }
    }

}