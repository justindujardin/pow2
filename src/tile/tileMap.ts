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
/// <reference path="../core/point.ts" />
/// <reference path="../core/rect.ts" />
/// <reference path="../scene/sceneObject.ts" />
/// <reference path="./objects/tileFeatureObject.ts" />

module eburp {
    export class TileMap extends eburp.SceneObject {
        tiles: any; // TODO typedef
        features: any; // TODO typedef
        map: any;
        mapName: string;
        bounds: eburp.Rect;


        constructor(mapName: string) {
            super();
            this.tiles = eburp.getData("tiles");
            this.setMap(mapName);
        }

        //
        // Scene Object Lifetime
        //
        onAddToScene(scene) {
            return this.addFeaturesToScene();
        }

        onRemoveFromScene(scene) {
            return this.removeFeaturesFromScene();
        }

        getObjectForFeature(feature) {
            var instanceType, name, options, typeName;
            options = _.extend({}, feature, {
                tileMap: this
            });
            name = feature.type;
            name = name.charAt(0).toUpperCase() + name.slice(1);
            instanceType = eburp.TileFeatureObject;
            typeName = "Tile" + name + "Feature";
            if (typeof eburp[typeName] !== 'undefined') {
                instanceType = eburp[typeName];
            }
            return new instanceType(options);
        }

        // Construct
        addFeaturesToScene() {
            // This is to prevent the old game from constructing TileFeatureObjects
            // and adding them to the scene.  It doesn't interact with them, so don't
            // bother.
            var f, k, v, _ref;
            if (!this.world) {
                return;
            }
            if (!this.scene) {
                return;
            }
            _ref = this.features;
            for (k in _ref) {
                v = _ref[k];
                for (k in v) {
                    f = v[k];
                    f.object = this.getObjectForFeature(f);
                    this.scene.addObject(f.object);
                }
            }
            return this;
        }

        removeFeaturesFromScene() {
            var f, k, v, _ref;
            _ref = this.features;
            for (k in _ref) {
                v = _ref[k];
                for (k in v) {
                    f = v[k];
                    if (!f.object) {
                        continue;
                    }
                    f.object.destroy();
                    delete f.object;
                }
            }
            return this.features = {};
        }

        setMap(mapName) {
            var newMap;
            newMap = eburp.getMap(mapName);
            if (!newMap) {
                return false;
            }
            this.map = newMap;
            this.mapName = mapName;
            this.bounds = new eburp.Rect(0, 0, this.map.width, this.map.height);
            return this.buildFeatures();
        }

        getTerrain(x, y) {
            var c, index;
            if (!this.bounds.pointInRect(x, y)) {
                return null;
            }
            index = y * this.map.width + x;
            c = this.map.map.charAt(index);
            return this.tiles[c];
        }

        getTerrainIcon(x, y) {
            var terrain;
            terrain = this.getTerrain(x, y);
            if (terrain) {
                return terrain.icon;
            } else {
                return null;
            }
        }

        featureKey(x, y) {
            return "" + x + "_" + y;
        }

        buildFeatures():boolean {
            var feature, key, list, object, x, y, _i, _len;
            this.removeFeaturesFromScene();
            if (!this.map) {
                return false;
            }
            list = this.map.features;
            if (!list) {
                return false;
            }
            for (_i = 0, _len = list.length; _i < _len; _i++) {
                feature = list[_i];
                x = feature.x;
                y = feature.y;
                key = this.featureKey(x, y);
                object = this.features[key];
                if (!object) {
                    object = {};
                    this.features[key] = object;
                }
                object[feature.type] = feature;
            }
            if (this.scene) {
                this.addFeaturesToScene();
            }
            return true;
        }

        getFeature(x, y) {
            if (!this.features) {
                return {};
            }
            return this.features[this.featureKey(x, y)];
        }

        getFeatures() {
            return this.features;
        }
    }
}