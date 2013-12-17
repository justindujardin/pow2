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

/// <reference path="../typedef/underscore/underscore.d.ts" />
/// <reference path="../core/rect.ts" />
/// <reference path="./sceneObject.ts" />

module eburp {
    export class SceneSpatialDatabase {
        _objects:SceneObject[] = [];
        addSpatialObject(object:any){
            if(object.point instanceof Point){
                this._objects.push(object);
            }
        }
        removeSpatialObject(object:SceneObject){
            this._objects = _.filter(this._objects, (o) => {
                return o.id !== object.id;
            });
        }
        queryRect(rect:Rect,type,results:SceneObject[]){
            if(!results){
                throw new Error("Results array must be provided to query scene spatial database");
            }
            var foundAny:boolean = false;
            _.each(this._objects,function(object){
                var o:any = object; //TODO: point on SceneObject?
                if(!(o instanceof type)){
                    return;
                }
                // Point in rect check
                if(o.point.x < rect.point.x || o.point.y < rect.point.y){
                    return;
                }
                if(o.point.x >= rect.point.x + rect.extent.x || o.point.y >= rect.point.y + rect.extent.y){
                    return;
                }
                results.push(o);
                foundAny = true;
            });
            return foundAny;
        }
    }

}