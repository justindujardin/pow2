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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../tileMap.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
var pow2;
(function (pow2) {
    var TileMapCameraComponent = (function (_super) {
        __extends(TileMapCameraComponent, _super);
        function TileMapCameraComponent() {
            _super.apply(this, arguments);
        }
        TileMapCameraComponent.prototype.connectComponent = function () {
            return _super.prototype.connectComponent.call(this) && this.host instanceof pow2.TileMap;
        };
        TileMapCameraComponent.prototype.process = function (view) {
            view.camera.point.set(this.host.bounds.point);
            view.cameraScale = Math.min(6, Math.round(view.screenToWorld(view.context.canvas.width) / view.camera.extent.x));
            // Clamp to tile map if it is present.
            if (this.host) {
                view.camera.point.x = Math.max(0, view.camera.point.x);
                view.camera.point.y = Math.max(0, view.camera.point.y);
                view.camera.point.x = Math.min(view.camera.point.x, this.host.bounds.extent.x - view.camera.extent.x);
                view.camera.point.y = Math.min(view.camera.point.y, this.host.bounds.extent.y - view.camera.extent.y);
                // Center in viewport if tilemap is smaller than camera.
                if (this.host.bounds.extent.x < view.camera.extent.x) {
                    view.camera.point.x = (this.host.bounds.extent.x - view.camera.extent.x) / 2;
                }
                if (this.host.bounds.extent.y < view.camera.extent.y) {
                    view.camera.point.y = (this.host.bounds.extent.y - view.camera.extent.y) / 2;
                }
            }
        };
        return TileMapCameraComponent;
    })(pow2.CameraComponent);
    pow2.TileMapCameraComponent = TileMapCameraComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../lib/pow2.d.ts"/>
/// <reference path="./tileObject.ts" />
/// <reference path="./components/tileMapCameraComponent.ts" />
var pow2;
(function (pow2) {
    // TODO: TileMap isn't getting added to Spatial DB properly.  Can't query for it!
    // Scene assuming something about the spatial properties on objects?
    var TileMap = (function (_super) {
        __extends(TileMap, _super);
        function TileMap(mapName) {
            _super.call(this);
            //      tileSet:any; // TODO: Tileset
            this.tiles = []; // TODO: TilesetProperties
            this.dirtyLayers = false;
            this._loaded = false;
            this.bounds = new pow2.Rect(0, 0, 10, 10);
            this.mapName = mapName;
        }
        //
        // Scene Object Lifetime
        //
        TileMap.prototype.onAddToScene = function (scene) {
            // If there is no camera, create a basic one.
            if (!this.findComponent(pow2.CameraComponent)) {
                this.addComponent(new pow2.TileMapCameraComponent());
            }
            this.load();
        };
        TileMap.prototype.load = function (mapName) {
            var _this = this;
            if (mapName === void 0) { mapName = this.mapName; }
            var loader = pow2.ResourceLoader.get();
            loader.load("/maps/" + mapName + ".tmx", function (mapResource) {
                _this.mapName = mapName;
                _this.setMap(mapResource);
            });
        };
        TileMap.prototype.isLoaded = function () {
            return this._loaded;
        };
        TileMap.prototype.loaded = function () {
            this.trigger('loaded', this);
            if (this.scene) {
                this.scene.trigger("map:loaded", this);
            }
            this._loaded = true;
        };
        TileMap.prototype.unloaded = function () {
            this.trigger('unloaded', this);
            if (this.scene) {
                this.scene.trigger("map:unloaded", this);
            }
            this._loaded = false;
        };
        TileMap.prototype.setMap = function (map) {
            var _this = this;
            if (!map || !map.isReady()) {
                return false;
            }
            if (this.map) {
                this.unloaded();
            }
            this.map = map;
            this.bounds = new pow2.Rect(0, 0, this.map.width, this.map.height);
            var idSortedSets = _.sortBy(this.map.tilesets, function (o) {
                return o.firstgid;
            });
            this.tiles.length = 0;
            _.each(idSortedSets, function (tiles) {
                while (_this.tiles.length < tiles.firstgid) {
                    _this.tiles.push(null);
                }
                _this.tiles = _this.tiles.concat(tiles.tiles);
            });
            this.features = _.where(this.map.layers, { name: "Features" })[0] || [];
            this.zones = _.where(this.map.layers, { name: "Zones" })[0] || [];
            this.loaded();
            return true;
        };
        TileMap.prototype.getLayers = function () {
            return this.map ? this.map.layers : [];
        };
        TileMap.prototype.getLayer = function (name) {
            return _.where(this.map.layers, { name: name })[0];
        };
        TileMap.prototype.getTerrain = function (layer, x, y) {
            return this.getTileData(this.getLayer(layer), x, y);
        };
        TileMap.prototype.getTileData = function (layer, x, y) {
            if (!this.map || !layer || !layer.data || !this.bounds.pointInRect(x, y)) {
                return null;
            }
            var terrainIndex = y * this.map.width + x;
            var tileIndex = layer.data[terrainIndex];
            return this.tiles[tileIndex];
        };
        TileMap.prototype.getTileGid = function (layer, x, y) {
            var terrain = this.getLayer(layer);
            if (!this.map || !terrain || !terrain.data || !this.bounds.pointInRect(x, y)) {
                return null;
            }
            var terrainIndex = y * this.map.width + x;
            return terrain.data[terrainIndex];
        };
        TileMap.prototype.getTileMeta = function (gid) {
            if (this.tiles.length <= gid) {
                return null;
            }
            var source = _.find(this.map.tilesets, function (t) {
                return t.hasGid(gid);
            });
            if (!source) {
                return null;
            }
            return source.getTileMeta(gid);
        };
        // TODO: Calculate texture with two array index lookups like in getTerrain.  No need for FN call here.
        TileMap.prototype.getTerrainTexture = function (x, y) {
            var terrain = this.getTerrain("Terrain", x, y);
            if (terrain) {
                return terrain.icon;
            }
            else {
                return null;
            }
        };
        return TileMap;
    })(pow2.SceneObject);
    pow2.TileMap = TileMap;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../lib/pow2.d.ts"/>
/// <reference path="./tileMap.ts" />
var pow2;
(function (pow2) {
    var DEFAULTS = {
        visible: true,
        enabled: true,
        icon: "",
        iconCoords: null,
        scale: 1,
        image: null,
        tileMap: null
    };
    var TileObject = (function (_super) {
        __extends(TileObject, _super);
        function TileObject(options) {
            if (options === void 0) { options = DEFAULTS; }
            _super.call(this, options);
            _.extend(this, _.defaults(options || {}, DEFAULTS));
            return this;
        }
        TileObject.prototype.setPoint = function (point) {
            point.round();
            if (this.renderPoint) {
                this.renderPoint = point.clone();
            }
            this.point = point.clone();
            var moveComponent = this.findComponent(pow2.MovableComponent);
            if (moveComponent) {
                moveComponent.targetPoint.set(point);
                moveComponent.path.length = 0;
            }
        };
        /**
         * When added to a scene, resolve a feature icon to a renderable sprite.
         */
        TileObject.prototype.onAddToScene = function () {
            if (this.icon) {
                this.setSprite(this.icon);
            }
            if (!this.tileMap) {
                this.tileMap = this.scene.objectByType(pow2.TileMap);
            }
        };
        /**
         * Set the current sprite name.  Returns the previous sprite name.
         */
        TileObject.prototype.setSprite = function (name, frame) {
            var _this = this;
            if (frame === void 0) { frame = 0; }
            var oldSprite = this.icon;
            if (!name) {
                this.meta = null;
            }
            else {
                var meta = this.world.sprites.getSpriteMeta(name);
                this.world.sprites.getSpriteSheet(meta.source, function (image) {
                    _this.meta = meta;
                    return _this.image = image.data;
                });
            }
            this.icon = name;
            return oldSprite;
        };
        return TileObject;
    })(pow2.SceneObject);
    pow2.TileObject = TileObject;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../lib/pow2.d.ts"/>
/// <reference path="./tileObject.ts" />
/// <reference path="./tileMap.ts" />
var pow2;
(function (pow2) {
    var TileComponent = (function (_super) {
        __extends(TileComponent, _super);
        function TileComponent() {
            _super.apply(this, arguments);
        }
        TileComponent.prototype.syncComponent = function () {
            this.tileMap = this.host.tileMap;
            return !!this.tileMap && this.tileMap instanceof pow2.TileMap;
        };
        TileComponent.prototype.disconnectComponent = function () {
            this.tileMap = null;
            return true;
        };
        TileComponent.prototype.enter = function (object) {
            return true;
        };
        TileComponent.prototype.entered = function (object) {
            this.isEntered = true;
            return true;
        };
        TileComponent.prototype.exit = function (object) {
            return true;
        };
        TileComponent.prototype.exited = function (object) {
            this.isEntered = false;
            return true;
        };
        return TileComponent;
    })(pow2.SceneComponent);
    pow2.TileComponent = TileComponent;
})(pow2 || (pow2 = {}));
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
var pow2;
(function (pow2) {
    var TileObjectRenderer = (function (_super) {
        __extends(TileObjectRenderer, _super);
        function TileObjectRenderer() {
            _super.apply(this, arguments);
            this._renderPoint = new pow2.Point();
        }
        TileObjectRenderer.prototype.render = function (object, data, view) {
            if (!data.image || !object.visible) {
                return;
            }
            // Build render data.
            this._renderPoint.set(object.renderPoint || object.point);
            var point = this._renderPoint;
            var c = data.meta; // TODO: interface this
            var sourceWidth = view.unitSize;
            var sourceHeight = view.unitSize;
            if (c && typeof c.cellWidth !== 'undefined' && typeof c.cellHeight !== 'undefined') {
                sourceWidth = c.cellWidth;
                sourceHeight = c.cellHeight;
            }
            var objWidth = view.fastScreenToWorldNumber(sourceWidth);
            var objHeight = view.fastScreenToWorldNumber(sourceHeight);
            point.x -= objWidth * object.scale / 2;
            point.y -= objHeight * object.scale / 2;
            view.fastWorldToScreenPoint(point, point);
            if (data.icon && data.meta) {
                var cx = c.x;
                var cy = c.y;
                if (data.meta.frames > 1) {
                    if (data.frame > 4) {
                        var bar = "baz";
                    }
                    var cwidth = c.width / sourceWidth;
                    var fx = (data.frame % (cwidth));
                    var fy = Math.floor((data.frame - fx) / cwidth);
                    cx += fx * sourceWidth;
                    cy += fy * sourceHeight;
                }
                view.context.drawImage(data.image, cx, cy, sourceWidth, sourceHeight, point.x, point.y, sourceWidth * object.scale, sourceHeight * object.scale);
            }
            else {
                view.context.drawImage(data.image, point.x, point.y, sourceWidth * object.scale, sourceHeight * object.scale);
            }
        };
        return TileObjectRenderer;
    })(pow2.SceneObjectRenderer);
    pow2.TileObjectRenderer = TileObjectRenderer;
})(pow2 || (pow2 = {}));
/*
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
/// <reference path="../../../lib/pow2.d.ts"/>
/// <reference path="../tileObject.ts" />
/// <reference path="../tileMapView.ts" />
/// <reference path="../tileMap.ts" />
var pow2;
(function (pow2) {
    var TileMapRenderer = (function (_super) {
        __extends(TileMapRenderer, _super);
        function TileMapRenderer() {
            _super.apply(this, arguments);
            this.buffer = null; // A 2d grid of rendered canvas textures.
            this.bufferMapName = null; // The name of the rendered map.  If the map name changes, the buffer is re-rendered.
            this.bufferComplete = false; // True if the entire map was rendered with all textures loaded and ready.
            this._clipRect = new pow2.Rect();
            this._renderRect = new pow2.Rect();
        }
        TileMapRenderer.prototype.render = function (object, view) {
            var _this = this;
            var squareUnits = 8;
            var squareSize = squareUnits * view.unitSize;
            if (!object.isLoaded()) {
                return;
            }
            if (object.dirtyLayers) {
                object.dirtyLayers = false;
                this.buffer = null;
                this.bufferComplete = false;
            }
            if (!this.bufferComplete || this.buffer === null || this.bufferMapName === null || this.bufferMapName !== object.mapName) {
                var tileUnitSize = squareSize / view.unitSize;
                // Unit size is 16px, so rows/columns should be 16*16 for 256px each.
                var columns = Math.ceil(object.bounds.extent.x / squareUnits);
                var rows = Math.ceil(object.bounds.extent.y / squareUnits);
                this.buffer = new Array(columns);
                for (var col = 0; col < columns; col++) {
                    this.buffer[col] = new Array(rows);
                }
                this.bufferComplete = true;
                var layers = object.getLayers();
                for (var col = 0; col < columns; col++) {
                    for (var row = 0; row < rows; row++) {
                        var xOffset = col * tileUnitSize;
                        var xEnd = xOffset + tileUnitSize;
                        var yOffset = row * tileUnitSize;
                        var yEnd = yOffset + tileUnitSize;
                        this.buffer[col][row] = view.renderToCanvas(squareSize, squareSize, function (ctx) {
                            for (var x = xOffset; x < xEnd; x++) {
                                for (var y = yOffset; y < yEnd; y++) {
                                    // Each layer
                                    _.each(layers, function (l) {
                                        if (!l.visible) {
                                            return;
                                        }
                                        var gid = object.getTileGid(l.name, x, y);
                                        var meta = object.getTileMeta(gid);
                                        if (meta) {
                                            var image = meta.image.data;
                                            // Keep this inline to avoid more function calls.
                                            var dstH, dstW, dstX, dstY, srcH, srcW, srcX, srcY;
                                            if (!image || !image.complete) {
                                                _this.bufferComplete = false;
                                                return;
                                            }
                                            srcX = meta.x;
                                            srcY = meta.y;
                                            srcW = meta.width;
                                            srcH = meta.height;
                                            dstX = (x - xOffset) * view.unitSize;
                                            dstY = (y - yOffset) * view.unitSize;
                                            dstW = dstH = view.unitSize;
                                            ctx.drawImage(image, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
                                        }
                                    });
                                }
                            }
                            // Append chunks to body (DEBUG HACKS)
                            // var dataImage = new Image();
                            // dataImage.src = ctx.canvas.toDataURL();
                            // $('body').append(dataImage);
                        });
                    }
                }
                this.bufferMapName = object.mapName;
            }
            var squareScreen = view.fastWorldToScreenNumber(squareUnits);
            view.fastWorldToScreenRect(view.getCameraClip(), this._clipRect);
            var cols = this.buffer.length;
            var rows = this.buffer[0].length;
            for (var col = 0; col < cols; col++) {
                for (var row = 0; row < rows; row++) {
                    this._renderRect.set(col * squareUnits - 0.5, row * squareUnits - 0.5, squareUnits, squareUnits);
                    view.fastWorldToScreenRect(this._renderRect, this._renderRect);
                    if (!this._renderRect.intersect(this._clipRect)) {
                        continue;
                    }
                    //console.log("Tile " + renderRect.toString())
                    view.context.drawImage(this.buffer[col][row], 0, 0, squareSize, squareSize, this._renderRect.point.x, this._renderRect.point.y, squareScreen, squareScreen);
                }
            }
        };
        return TileMapRenderer;
    })(pow2.SceneObjectRenderer);
    pow2.TileMapRenderer = TileMapRenderer;
})(pow2 || (pow2 = {}));
/*
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
/// <reference path="../../lib/pow2.d.ts"/>
/// <reference path="./tileObject.ts"/>
/// <reference path="./tileMap.ts"/>
/// <reference path="./components/tileMapCameraComponent.ts"/>
/// <reference path="./render/tileObjectRenderer.ts"/>
/// <reference path="./render/tileMapRenderer.ts"/>
var pow2;
(function (pow2) {
    var TileMapView = (function (_super) {
        __extends(TileMapView, _super);
        function TileMapView() {
            _super.apply(this, arguments);
            this.objectRenderer = new pow2.TileObjectRenderer;
            this.mapRenderer = new pow2.TileMapRenderer;
            this.tileMap = null;
        }
        TileMapView.prototype.setTileMap = function (tileMap) {
            this.tileMap = tileMap;
        };
        TileMapView.prototype.setScene = function (scene) {
            if (scene === this.scene) {
                return;
            }
            this.cameraComponent = null;
            _super.prototype.setScene.call(this, scene);
        };
        /*
         * Get the camera clip rectangle.
         * @returns {pow2.Rect}
         */
        TileMapView.prototype.getCameraClip = function () {
            if (!this.tileMap) {
                return this.camera;
            }
            var clipGrow = this.camera.clone();
            clipGrow.point.round();
            clipGrow.extent.round();
            // Clamp to tilemap bounds.
            var rect = this.tileMap.bounds;
            if (clipGrow.point.x < rect.point.x) {
                clipGrow.point.x += rect.point.x - clipGrow.point.x;
            }
            if (clipGrow.point.y < rect.point.y) {
                clipGrow.point.y += rect.point.y - clipGrow.point.y;
            }
            if (clipGrow.point.x + clipGrow.extent.x > rect.point.x + rect.extent.x) {
                clipGrow.point.x -= ((clipGrow.point.x + clipGrow.extent.x) - (rect.point.x + rect.extent.x));
            }
            if (clipGrow.point.y + clipGrow.extent.y > rect.point.y + rect.extent.y) {
                clipGrow.point.y -= ((clipGrow.point.y + clipGrow.extent.y) - (rect.point.y + rect.extent.y));
            }
            return clipGrow;
        };
        /*
         * Set the pre-render canvas state.
         */
        TileMapView.prototype.setRenderState = function () {
            var worldCameraPos, worldTilePos;
            _super.prototype.setRenderState.call(this);
            if (!this.camera || !this.context || !this.tileMap) {
                return;
            }
            worldTilePos = this.worldToScreen(this.tileMap.bounds.point);
            worldTilePos.x = parseFloat(worldTilePos.x.toFixed(2));
            worldTilePos.y = parseFloat(worldTilePos.y.toFixed(2));
            worldCameraPos = this.worldToScreen(this.camera.point);
            worldCameraPos.x = parseFloat(worldCameraPos.x.toFixed(2));
            worldCameraPos.y = parseFloat(worldCameraPos.y.toFixed(2));
            this.context.translate(worldTilePos.x - worldCameraPos.x, worldTilePos.y - worldCameraPos.y);
        };
        /*
         * Render the tile $map, and any features it has.
         */
        TileMapView.prototype.renderFrame = function (elapsed) {
            this.clearRect();
            if (!this.tileMap) {
                return;
            }
            this.mapRenderer.render(this.tileMap, this);
            return this;
        };
        /*
         * Draw any post-rendering effects.
         */
        TileMapView.prototype.renderPost = function () {
            if (!this.camera || !this.context || !this.tileMap) {
                return;
            }
            this.renderAnalog();
        };
        /*
         * Render the analog joystick for touch inputs.
         */
        TileMapView.prototype.renderAnalog = function () {
            var screenCamera, touch, touchCurrent, touchStart, _i, _len, _ref;
            if (!this.world || !this.world.input) {
                return;
            }
            var inputAny = this.world.input;
            if (typeof inputAny.touches !== 'undefined') {
                screenCamera = this.worldToScreen(this.camera.point);
                touchStart = inputAny.touchStart.clone().add(screenCamera);
                touchCurrent = inputAny.touchCurrent.clone().add(screenCamera);
                this.context.save();
                _ref = inputAny.touches;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    touch = _ref[_i];
                    if (touch.identifier === inputAny.touchId) {
                        this.context.beginPath();
                        this.context.strokeStyle = "cyan";
                        this.context.lineWidth = 6;
                        this.context.arc(touchStart.x, touchStart.y, 40, 0, Math.PI * 2, true);
                        this.context.stroke();
                        this.context.beginPath();
                        this.context.strokeStyle = "cyan";
                        this.context.lineWidth = 2;
                        this.context.arc(touchStart.x, touchStart.y, 60, 0, Math.PI * 2, true);
                        this.context.stroke();
                        this.context.beginPath();
                        this.context.strokeStyle = "cyan";
                        this.context.arc(touchCurrent.x, touchCurrent.y, 40, 0, Math.PI * 2, true);
                        this.context.stroke();
                        this.context.fillStyle = "white";
                    }
                }
                this.context.restore();
            }
            return this;
        };
        return TileMapView;
    })(pow2.SceneView);
    pow2.TileMapView = TileMapView;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../tileObject.ts" />
var pow2;
(function (pow2) {
    var SpriteComponent = (function (_super) {
        __extends(SpriteComponent, _super);
        function SpriteComponent(options) {
            _super.call(this);
            // The sprite frame (if applicable)
            this.frame = 0;
            if (typeof options !== 'undefined') {
                _.extend(this, options);
            }
        }
        SpriteComponent.prototype.connectComponent = function () {
            this.setSprite(this.icon, this.frame);
            return _super.prototype.connectComponent.call(this);
        };
        /**
         * Set the current sprite name.  Returns the previous sprite name.
         */
        SpriteComponent.prototype.setSprite = function (name, frame) {
            var _this = this;
            if (frame === void 0) { frame = 0; }
            var oldSprite = this.icon;
            if (!name) {
                this.meta = null;
            }
            else {
                this.meta = this.host.world.sprites.getSpriteMeta(name);
                this.host.world.sprites.getSpriteSheet(this.meta.source, function (image) {
                    return _this.image = image.data;
                });
            }
            this.icon = name;
            return oldSprite;
        };
        return SpriteComponent;
    })(pow2.SceneComponent);
    pow2.SpriteComponent = SpriteComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../../tile/tileObject.ts" />
/// <reference path="./spriteComponent.ts" />
var pow2;
(function (pow2) {
    var AnimatedSpriteComponent = (function (_super) {
        __extends(AnimatedSpriteComponent, _super);
        function AnimatedSpriteComponent(options) {
            if (options === void 0) { options = {
                lengthMS: 500,
                spriteName: null
            }; }
            _super.call(this);
            this._elapsed = 0;
            this._renderFrame = 3;
            this.lengthMS = 500;
            if (typeof options !== 'undefined') {
                _.extend(this, options);
            }
        }
        AnimatedSpriteComponent.prototype.connectComponent = function () {
            this._renderFrame = 0;
            this._elapsed = 0;
            return _super.prototype.connectComponent.call(this);
        };
        AnimatedSpriteComponent.prototype.syncComponent = function () {
            if (!_super.prototype.syncComponent.call(this)) {
                return false;
            }
            var sprites = this.host.findComponents(pow2.SpriteComponent);
            this.spriteComponent = _.where(sprites, { name: this.spriteName })[0];
            return !!this.spriteComponent;
        };
        AnimatedSpriteComponent.prototype.tick = function (elapsed) {
            this._elapsed += elapsed;
            if (this._elapsed >= this.lengthMS) {
                this.trigger('animation:done', this);
                this._elapsed = this._elapsed % this.lengthMS;
            }
            _super.prototype.tick.call(this, elapsed);
        };
        AnimatedSpriteComponent.prototype.interpolateTick = function (elapsed) {
            if (this.spriteComponent) {
                // Choose frame for interpolated position
                var factor = this._elapsed / this.lengthMS;
                this.spriteComponent.frame = (factor * this.spriteComponent.meta.frames) | 0;
            }
            _super.prototype.interpolateTick.call(this, elapsed);
        };
        return AnimatedSpriteComponent;
    })(pow2.TickedComponent);
    pow2.AnimatedSpriteComponent = AnimatedSpriteComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
var pow2;
(function (pow2) {
    var maxLevel = 50;
    var EntityModel = (function (_super) {
        __extends(EntityModel, _super);
        function EntityModel() {
            _super.apply(this, arguments);
        }
        EntityModel.prototype.defaults = function () {
            return _.extend({}, EntityModel.DEFAULTS);
        };
        // Chance to hit = (BASE_CHANCE_TO_HIT + PLAYER_HIT_PERCENT) - EVASION
        EntityModel.prototype.rollHit = function (defender) {
            // TODO: Fix this calculation, which is producing too many misses
            // and causing the combat to feel too random and arbitrary.
            return true;
            var roll = _.random(0, 200);
            var evasion = defender.getEvasion();
            var chance = EntityModel.BASE_CHANCE_TO_HIT + this.attributes.hitpercent - evasion;
            if (roll === 200) {
                return false;
            }
            if (roll === 0) {
                return true;
            }
            return roll <= chance;
        };
        EntityModel.prototype.damage = function (amount) {
            if (amount < 0) {
                return 0;
            }
            amount = Math.ceil(amount);
            this.set({ hp: Math.max(0, this.attributes.hp - amount) });
            if (this.attributes.hp < 0) {
                this.set({ dead: true });
            }
            return amount;
        };
        EntityModel.prototype.getEvasion = function () {
            return 0;
        };
        EntityModel.prototype.isDefeated = function () {
            return this.attributes.hp <= 0;
        };
        EntityModel.prototype.attack = function (defender) {
            var halfStrength = this.attributes.strength / 2;
            return defender.damage(halfStrength);
            ;
        };
        // Base chance to hit number.
        EntityModel.BASE_CHANCE_TO_HIT = 168;
        EntityModel.BASE_EVASION = 48;
        // Evasion = BASE_EVASION + AGL - SUM(ArmorEvasionPenalty)
        // Hit% = WeaponAccuracy + Char Hit%
        EntityModel.DEFAULTS = {
            name: "Nothing",
            icon: "",
            level: 1,
            hp: 0,
            maxHP: 0,
            strength: 5,
            vitality: 4,
            intelligence: 1,
            agility: 1,
            dead: false,
            evade: 0,
            hitpercent: 1
        };
        return EntityModel;
    })(Backbone.Model);
    pow2.EntityModel = EntityModel;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../tile/tileObject.ts" />
/// <reference path="../gameTileMap.ts" />
/// <reference path="../models/entityModel.ts" />
/// <reference path="../../tile/components/spriteComponent.ts" />
var pow2;
(function (pow2) {
    var GameEntityObject = (function (_super) {
        __extends(GameEntityObject, _super);
        function GameEntityObject(options) {
            _super.call(this, _.omit(options || {}, ["x", "y", "type"]));
            this.feature = options;
            this.type = options.type || "player";
            this.groups = typeof options.groups === 'string' ? JSON.parse(options.groups) : options.groups;
            this.model = options.model || new pow2.EntityModel(options);
        }
        GameEntityObject.prototype.isDefeated = function () {
            return this.model.isDefeated();
        };
        GameEntityObject.prototype.getIcon = function () {
            if (this.icon) {
                return this.icon;
            }
            var spriteComponent = this.findComponent(pow2.SpriteComponent);
            if (spriteComponent) {
                return spriteComponent.icon;
            }
            return null;
        };
        return GameEntityObject;
    })(pow2.TileObject);
    pow2.GameEntityObject = GameEntityObject;
})(pow2 || (pow2 = {}));
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
/// <reference path="../game/objects/gameEntityObject.ts" />
var pow2;
(function (pow2) {
    // Combat State Machine
    //--------------------------------------------------------------------------
    var CombatStateMachine = (function (_super) {
        __extends(CombatStateMachine, _super);
        function CombatStateMachine(parent) {
            _super.call(this);
            this.defaultState = pow2.CombatStartState.NAME;
            this.states = [
                new pow2.CombatStartState(),
                new pow2.CombatVictoryState(),
                new pow2.CombatDefeatState(),
                new pow2.CombatBeginTurnState(),
                new pow2.CombatEndTurnState()
            ];
            this.party = [];
            this.enemies = [];
            this.turnList = [];
            this.currentDone = false;
            this.keyListener = null;
            this.parent = parent;
        }
        CombatStateMachine.prototype.isFriendlyTurn = function () {
            var _this = this;
            return this.current && !!_.find(this.party, function (h) {
                return h._uid === _this.current._uid;
            });
        };
        CombatStateMachine.prototype.getLiveParty = function () {
            return _.reject(this.party, function (obj) {
                return obj.isDefeated();
            });
        };
        CombatStateMachine.prototype.getLiveEnemies = function () {
            return _.reject(this.enemies, function (obj) {
                return obj.isDefeated();
            });
        };
        CombatStateMachine.prototype.getRandomPartyMember = function () {
            var players = _.shuffle(this.party);
            while (players.length > 0) {
                var p = players.shift();
                if (!p.isDefeated()) {
                    return p;
                }
            }
            return null;
        };
        CombatStateMachine.prototype.getRandomEnemy = function () {
            var players = _.shuffle(this.enemies);
            while (players.length > 0) {
                var p = players.shift();
                if (!p.isDefeated()) {
                    return p;
                }
            }
            return null;
        };
        CombatStateMachine.prototype.partyDefeated = function () {
            var deadList = _.reject(this.party, function (obj) {
                return obj.model.attributes.hp <= 0;
            });
            return deadList.length === 0;
        };
        CombatStateMachine.prototype.enemiesDefeated = function () {
            return _.reject(this.enemies, function (obj) {
                return obj.model.attributes.hp <= 0;
            }).length === 0;
        };
        return CombatStateMachine;
    })(pow2.StateMachine);
    pow2.CombatStateMachine = CombatStateMachine;
    // Combat Lifetime State Machine
    //--------------------------------------------------------------------------
    var GameCombatState = (function (_super) {
        __extends(GameCombatState, _super);
        function GameCombatState() {
            _super.apply(this, arguments);
            this.name = GameCombatState.NAME;
            this.machine = null;
            this.parent = null;
            this.finished = false; // Trigger state to exit when true.
        }
        GameCombatState.prototype.enter = function (machine) {
            var _this = this;
            _super.prototype.enter.call(this, machine);
            this.parent = machine;
            this.machine = new CombatStateMachine(machine);
            var combatScene = machine.world.combatScene = new pow2.Scene();
            machine.world.mark(combatScene);
            // Build party
            _.each(machine.model.party, function (hero, index) {
                var heroEntity = new pow2.GameEntityObject({
                    name: hero.attributes.name,
                    icon: hero.attributes.icon,
                    model: hero
                });
                // Instantiate a [Class]CombatRenderComponent implementation for the
                // hero type, if available.
                var playerType = hero.attributes.type[0].toUpperCase() + hero.attributes.type.substr(1);
                var playerRender = pow2.combat[playerType + 'CombatRenderComponent'];
                if (typeof playerRender === 'undefined') {
                    playerRender = new pow2.combat.PlayerCombatRenderComponent();
                }
                else {
                    playerRender = new playerRender();
                }
                heroEntity.addComponent(playerRender);
                heroEntity.addComponent(new pow2.AnimatedComponent());
                if (heroEntity.isDefeated()) {
                    return;
                }
                heroEntity.icon = hero.get('icon');
                _this.machine.party.push(heroEntity);
                combatScene.addObject(heroEntity);
            });
            this.tileMap = new pow2.GameTileMap("combat");
            this.tileMap.once('loaded', function () {
                // Hide all layers that don't correspond to the current combat zone
                var zone = machine.encounterInfo;
                var visibleZone = zone.target || zone.map;
                _.each(_this.tileMap.getLayers(), function (l) {
                    l.visible = (l.name === visibleZone);
                });
                _this.tileMap.dirtyLayers = true;
                _this.tileMap.addComponent(new pow2.CombatCameraComponent);
                combatScene.addObject(_this.tileMap);
                // Position Party/Enemies
                // Get enemies data from spreadsheet
                pow2.GameStateModel.getDataSource(function (enemiesSpreadsheet) {
                    var enemyList = enemiesSpreadsheet.getSheetData("enemies");
                    var enemiesLength = machine.encounter.enemies.length;
                    for (var i = 0; i < enemiesLength; i++) {
                        var tpl = _.where(enemyList, { id: machine.encounter.enemies[i] });
                        if (tpl.length === 0) {
                            continue;
                        }
                        var nmeModel = new pow2.CreatureModel(tpl[0]);
                        var nme = new pow2.GameEntityObject({
                            model: nmeModel
                        });
                        combatScene.addObject(nme);
                        nme.addComponent(new pow2.SpriteComponent({
                            name: "enemy",
                            icon: nme.model.get('icon')
                        }));
                        _this.machine.enemies.push(nme);
                    }
                    if (_this.machine.enemies.length) {
                        _.each(_this.machine.party, function (heroEntity, index) {
                            var battleSpawn = _this.tileMap.getFeature('p' + (index + 1));
                            heroEntity.setPoint(new pow2.Point(battleSpawn.x / 16, battleSpawn.y / 16));
                        });
                        _.each(_this.machine.enemies, function (enemyEntity, index) {
                            var battleSpawn = _this.tileMap.getFeature('e' + (index + 1));
                            if (battleSpawn) {
                                enemyEntity.setPoint(new pow2.Point(battleSpawn.x / 16, battleSpawn.y / 16));
                            }
                        });
                        machine.trigger('combat:begin', _this);
                        _this.machine.update(_this);
                    }
                    else {
                        // TODO: This is an error, I think.  Player entered combat with no valid enemies.
                        machine.trigger('combat:end', _this);
                    }
                });
            });
            this.tileMap.load();
        };
        GameCombatState.prototype.exit = function (machine) {
            machine.trigger('combat:end', this);
            var world = this.parent.world;
            if (world && world.combatScene) {
                world.combatScene.destroy();
                world.combatScene = null;
            }
            this.tileMap.destroy();
            machine.update(this);
            this.finished = false;
            this.machine = null;
            this.parent = null;
        };
        GameCombatState.NAME = "combat";
        return GameCombatState;
    })(pow2.State);
    pow2.GameCombatState = GameCombatState;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../lib/pow2.d.ts" />
/// <reference path="../combat/gameCombatStateMachine.ts"/>
var pow2;
(function (pow2) {
    var GameDefaultState = (function (_super) {
        __extends(GameDefaultState, _super);
        function GameDefaultState() {
            _super.apply(this, arguments);
            this.name = GameDefaultState.NAME;
        }
        GameDefaultState.NAME = "default";
        return GameDefaultState;
    })(pow2.State);
    pow2.GameDefaultState = GameDefaultState;
    // -------------------------------------------------------------------------
    // TODO: This does not need to be time ticked.   Manual evaluation and state
    // changing would be more appropriate.
    var GameStateMachine = (function (_super) {
        __extends(GameStateMachine, _super);
        function GameStateMachine() {
            _super.apply(this, arguments);
            this.model = null;
            this.defaultState = GameDefaultState.NAME;
            this.player = null;
            this.encounterInfo = null;
            this.encounter = null;
            this.states = [
                new GameDefaultState(),
                new pow2.GameMapState(''),
                new pow2.GameCombatState()
            ];
        }
        GameStateMachine.prototype.onAddToWorld = function (world) {
            _super.prototype.onAddToWorld.call(this, world);
            pow2.GameStateModel.getDataSource();
            this.model = world.model || new pow2.GameStateModel();
        };
        GameStateMachine.prototype.setCurrentState = function (newState) {
            if (_super.prototype.setCurrentState.call(this, newState)) {
                this.update(this);
                return true;
            }
            return false;
        };
        GameStateMachine.prototype.update = function (data) {
            if (this.world && this.world.scene) {
                var scene = this.world.scene;
                this.player = scene.objectByComponent(pow2.PlayerComponent);
            }
            _super.prototype.update.call(this, data);
        };
        return GameStateMachine;
    })(pow2.StateMachine);
    pow2.GameStateMachine = GameStateMachine;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
var pow2;
(function (pow2) {
    /**
     * Use TableTop to load a published google spreadsheet.
     */
    var GameDataResource = (function (_super) {
        __extends(GameDataResource, _super);
        function GameDataResource() {
            _super.apply(this, arguments);
        }
        GameDataResource.prototype.load = function () {
            var _this = this;
            try {
                this.data = JSON.parse(this.getCache());
                if (this.data) {
                    _.defer(function () {
                        _this.ready();
                    });
                }
            }
            catch (e) {
            }
            // TODO: ERROR Condition
            Tabletop.init({
                key: this.url,
                callback: function (data, tabletop) {
                    data = _this.data = _this.transformTypes(data);
                    _this.setCache(JSON.stringify(data));
                    _this.ready();
                }
            });
        };
        GameDataResource.prototype.getCache = function () {
            return localStorage.getItem(GameDataResource.DATA_KEY);
        };
        GameDataResource.clearCache = function () {
            localStorage.removeItem(GameDataResource.DATA_KEY);
        };
        GameDataResource.prototype.setCache = function (data) {
            localStorage.setItem(GameDataResource.DATA_KEY, data);
        };
        // TODO: More sophisticated deserializing of types, removing hardcoded keys.
        GameDataResource.prototype.transformTypes = function (data) {
            var results = {};
            _.each(data, function (dataValue, dataKey) {
                var sheetElements = dataValue.elements.slice(0);
                var length = sheetElements.length;
                for (var i = 0; i < length; i++) {
                    var entry = sheetElements[i];
                    for (var key in entry) {
                        if (!entry.hasOwnProperty(key) || typeof entry[key] !== 'string') {
                            continue;
                        }
                        var value = entry[key];
                        // number values
                        if (value.match(pow2.GameDataResource.NUMBER_MATCHER)) {
                            entry[key] = parseInt(value);
                        }
                        else if (key === 'usedby' || key === 'groups' || key === 'zones' || key === 'enemies') {
                            if (/^\s*$/.test(value)) {
                                entry[key] = null;
                            }
                            else {
                                entry[key] = value.split('|');
                            }
                        }
                    }
                }
                results[dataKey.toLowerCase()] = sheetElements;
            });
            return results;
        };
        GameDataResource.prototype.getSheetData = function (name) {
            if (!this.isReady()) {
                throw new Error("Cannot query spreadsheet before it's loaded");
            }
            if (!this.data[name]) {
                return [];
            }
            return this.data[name];
        };
        GameDataResource.DATA_KEY = '__db';
        // TODO: Do we need to match - and floating point?
        GameDataResource.NUMBER_MATCHER = /^-?\d+$/;
        return GameDataResource;
    })(pow2.Resource);
    pow2.GameDataResource = GameDataResource;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../lib/pow2.d.ts" />
/// <reference path="./gameStateMachine.ts" />
/// <reference path="./resources/gameData.ts" />
var pow2;
(function (pow2) {
    var GameWorld = (function (_super) {
        __extends(GameWorld, _super);
        function GameWorld(services) {
            _super.call(this, services);
            // TODO: More than two scenes?  Scene managers?  ugh.  If we need them.
            this.combatScene = null;
            if (!this.scene) {
                this.setService('scene', new pow2.Scene());
            }
        }
        GameWorld.prototype.randomEncounter = function (zone) {
            var _this = this;
            pow2.GameStateModel.getDataSource(function (gsr) {
                var encounters = _.filter(gsr.getSheetData("encounters"), function (enc) {
                    return _.indexOf(enc.zones, zone.map) !== -1 || _.indexOf(enc.zones, zone.target) !== -1;
                });
                if (encounters.length === 0) {
                    throw new Error("No valid encounters for this zone");
                }
                var max = encounters.length - 1;
                var min = 0;
                var encounter = encounters[Math.floor(Math.random() * (max - min + 1)) + min];
                _this._encounter(zone, encounter);
            });
        };
        GameWorld.prototype.fixedEncounter = function (zone, encounterId) {
            var _this = this;
            pow2.GameStateModel.getDataSource(function (gsr) {
                var encounters = _.where(gsr.getSheetData("encounters"), {
                    id: encounterId
                });
                if (encounters.length === 0) {
                    throw new Error("No encounter found with id: " + encounterId);
                }
                _this._encounter(zone, encounters[0]);
            });
        };
        GameWorld.prototype._encounter = function (zoneInfo, encounter) {
            this.scene.trigger('combat:encounter', this);
            this.state.encounter = encounter;
            this.state.encounterInfo = zoneInfo;
            this.state.setCurrentState("combat");
        };
        return GameWorld;
    })(pow2.SceneWorld);
    pow2.GameWorld = GameWorld;
})(pow2 || (pow2 = {}));
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
/// <reference path="./gameWorld.ts" />
/// <reference path="../../lib/pow2.d.ts" />
var pow2;
(function (pow2) {
    var GameTileMap = (function (_super) {
        __extends(GameTileMap, _super);
        function GameTileMap() {
            _super.apply(this, arguments);
            this.featureHash = {};
        }
        GameTileMap.prototype.loaded = function () {
            _super.prototype.loaded.call(this);
            this.buildAStarGraph();
            this.addComponent(new pow2.GameFeatureInputComponent());
            // If there are map properties, take them into account.
            if (this.map.properties) {
                var props = this.map.properties;
                // Does this map have random encounters?
                if (props.combat === true) {
                    this.addComponent(new pow2.CombatEncounterComponent());
                }
                // Does it have a music track?
                if (typeof props.music === 'string') {
                    this.addComponent(new pow2.SoundComponent({
                        url: props.music,
                        volume: 0.1,
                        loop: true
                    }));
                }
            }
            this.buildFeatures();
        };
        GameTileMap.prototype.destroy = function () {
            this.unloaded();
            return _super.prototype.destroy.call(this);
        };
        GameTileMap.prototype.unloaded = function () {
            this.removeComponentByType(pow2.GameFeatureInputComponent);
            this.removeComponentByType(pow2.CombatEncounterComponent);
            this.removeComponentByType(pow2.SoundComponent);
            this.removeFeaturesFromScene();
            _super.prototype.unloaded.call(this);
        };
        GameTileMap.prototype.featureKey = function (x, y) {
            return "" + x + "_" + y;
        };
        GameTileMap.prototype.getFeature = function (name) {
            return _.find(this.features.objects, function (feature) {
                return feature.name === name;
            });
        };
        GameTileMap.prototype.addFeature = function (feature) {
            feature._object = this.createFeatureObject(feature);
            this.scene.addObject(feature._object);
            this.indexFeature(feature._object);
        };
        GameTileMap.prototype.indexFeature = function (obj) {
            var key = this.featureKey(obj.point.x, obj.point.y);
            var object = this.featureHash[key];
            if (!object) {
                object = this.featureHash[key] = {};
            }
            object[obj.type] = obj.feature.properties;
        };
        // Construct
        GameTileMap.prototype.addFeaturesToScene = function () {
            var _this = this;
            _.each(this.features.objects, function (obj) {
                obj._object = _this.createFeatureObject(obj);
                _this.scene.addObject(obj._object);
            });
        };
        GameTileMap.prototype.removeFeaturesFromScene = function () {
            _.each(this.features.objects, function (obj) {
                var featureObject = obj._object;
                delete obj._object;
                if (featureObject) {
                    featureObject.destroy();
                }
            });
        };
        GameTileMap.prototype.buildFeatures = function () {
            var _this = this;
            this.removeFeaturesFromScene();
            _.each(this.features.objects, function (obj) {
                var key = _this.featureKey(obj.x, obj.y);
                var object = _this.featureHash[key];
                if (!object) {
                    object = _this.featureHash[key] = {};
                }
                object[obj.type] = obj.properties;
            });
            if (this.scene) {
                this.addFeaturesToScene();
            }
            return true;
        };
        GameTileMap.prototype.createFeatureObject = function (tiledObject) {
            var feature = typeof tiledObject.properties !== 'undefined' ? tiledObject.properties : tiledObject;
            var options = _.extend({}, feature, {
                tileMap: this,
                x: Math.round(tiledObject.x / this.map.tilewidth),
                y: Math.round(tiledObject.y / this.map.tileheight)
            });
            var object = new pow2.GameFeatureObject(options);
            this.world.mark(object);
            var componentType = null;
            var type = (feature && feature.type) ? feature.type : tiledObject.type;
            switch (type) {
                case 'transition':
                    componentType = pow2.PortalFeatureComponent;
                    break;
                case 'treasure':
                    componentType = pow2.TreasureFeatureComponent;
                    if (typeof options.id === 'undefined') {
                        console.error("Treasure must have a given id so it may be hidden");
                    }
                    break;
                case 'ship':
                    componentType = pow2.ShipFeatureComponent;
                    break;
                case 'store':
                    componentType = pow2.StoreFeatureComponent;
                    break;
                case 'encounter':
                    componentType = pow2.CombatFeatureComponent;
                    if (typeof options.id === 'undefined') {
                        console.error("Fixed encounters must have a given id so they may be hidden");
                    }
                    break;
                case 'temple':
                    componentType = pow2.TempleFeatureComponent;
                    break;
                default:
                    if (feature && feature.action === 'TALK') {
                        componentType = pow2.DialogFeatureComponent;
                    }
                    break;
            }
            if (componentType !== null) {
                var component = (new componentType());
                if (!object.addComponent(component)) {
                    throw new Error("Component " + component.name + " failed to connect to host " + this.name);
                }
            }
            return object;
        };
        // Path Finding (astar.js)
        GameTileMap.prototype.buildAStarGraph = function () {
            var _this = this;
            var layers = this.getLayers();
            var l = layers.length;
            var grid = new Array(this.bounds.extent.x);
            for (var x = 0; x < this.bounds.extent.x; x++) {
                grid[x] = new Array(this.bounds.extent.y);
            }
            for (var x = 0; x < this.bounds.extent.x; x++) {
                for (var y = 0; y < this.bounds.extent.y; y++) {
                    // Tile Weights, the higher the value the more avoided the
                    // tile will be in output paths.
                    // 10   - neutral path, can walk, don't particularly care for it.
                    // 1    - desired path, can walk and tend toward it over netural.
                    // 1000 - blocked path, can't walk, avoid at all costs.
                    var weight = 10;
                    var blocked = false;
                    for (var i = 0; i < l; i++) {
                        // If there is no metadata continue
                        var terrain = this.getTileData(layers[i], x, y);
                        if (!terrain) {
                            continue;
                        }
                        // Check to see if any layer has a passable attribute set to false,
                        // if so block the path.
                        if (terrain.passable === false) {
                            weight = 1000;
                            blocked = true;
                        }
                        else if (terrain.isPath === true) {
                            weight = 1;
                        }
                    }
                    grid[x][y] = weight;
                }
            }
            // TOOD: Tiled Editor format is KILLIN' me.
            _.each(this.features.objects, function (o) {
                var obj = o.properties;
                if (!obj) {
                    return;
                }
                var collideTypes = ['temple', 'store', 'sign'];
                if (obj.passable === true || !obj.type) {
                    return;
                }
                if (_.indexOf(collideTypes, obj.type.toLowerCase()) !== -1) {
                    var x = o.x / o.width | 0;
                    var y = o.y / o.height | 0;
                    if (!obj.passable && _this.bounds.pointInRect(x, y)) {
                        grid[x][y] = 100;
                    }
                }
            });
            this.graph = new Graph(grid);
        };
        GameTileMap.prototype.calculatePath = function (from, to) {
            if (!this.graph || !this.graph.nodes) {
                return [];
            }
            // Treat out of range errors as non-critical, and just
            // return an empty array.
            if (from.x >= this.graph.nodes.length || from.x < 0) {
                return [];
            }
            if (from.y >= this.graph.nodes[from.x].length) {
                return [];
            }
            if (to.x >= this.graph.nodes.length || to.x < 0) {
                return [];
            }
            if (to.y >= this.graph.nodes[to.x].length) {
                return [];
            }
            var start = this.graph.nodes[from.x][from.y];
            var end = this.graph.nodes[to.x][to.y];
            var result = astar.search(this.graph.nodes, start, end);
            return _.map(result, function (graphNode) {
                return new pow2.Point(graphNode.pos.x, graphNode.pos.y);
            });
        };
        /**
         * Enumerate the map and target combat zones for a given position on this map.
         * @param at The position to check for a sub-zone in the map
         * @returns {IZoneMatch} The map and target zones that are null if they don't exist
         */
        GameTileMap.prototype.getCombatZones = function (at) {
            var result = {
                map: null,
                target: null,
                targetPoint: at
            };
            if (this.map && this.map.properties && this.map.properties) {
                if (typeof this.map.properties.combatZone !== 'undefined') {
                    result.map = this.map.properties.combatZone;
                }
            }
            // Determine which zone and combat type
            var invTileSize = 1 / this.map.tilewidth;
            var zones = _.map(this.zones.objects, function (z) {
                var x = z.x * invTileSize;
                var y = z.y * invTileSize;
                var w = z.width * invTileSize;
                var h = z.height * invTileSize;
                return {
                    bounds: new pow2.Rect(x, y, w, h),
                    name: z.name
                };
            });
            // TODO: This will always get the first zone.  What about overlapping zones?
            var zone = _.find(zones, function (z) {
                return z.bounds.pointInRect(at) && z.name;
            });
            if (zone) {
                result.target = zone.name;
            }
            return result;
        };
        return GameTileMap;
    })(pow2.TileMap);
    pow2.GameTileMap = GameTileMap;
})(pow2 || (pow2 = {}));
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
/// <reference path="../tile/tileComponent.ts" />
/// <reference path="./gameTileMap.ts" />
var pow2;
(function (pow2) {
    var GameComponent = (function (_super) {
        __extends(GameComponent, _super);
        function GameComponent() {
            _super.apply(this, arguments);
            this.feature = null;
            this.host = null;
        }
        GameComponent.prototype.syncComponent = function () {
            this.tileMap = this.host.tileMap;
            if (!_super.prototype.syncComponent.call(this) || !(this.tileMap instanceof pow2.GameTileMap)) {
                return false;
            }
            this.feature = this.host.feature;
            return !!this.feature;
        };
        GameComponent.prototype.disconnectComponent = function () {
            this.feature = null;
            return _super.prototype.disconnectComponent.call(this);
        };
        return GameComponent;
    })(pow2.TileComponent);
    pow2.GameComponent = GameComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../lib/pow2.d.ts" />
/// <reference path="./gameTileMap.ts"/>
var pow2;
(function (pow2) {
    var GameMapView = (function (_super) {
        __extends(GameMapView, _super);
        function GameMapView(canvas, loader) {
            _super.call(this, canvas, loader);
            this.objectRenderer = new pow2.TileObjectRenderer;
            this.tileMap = null;
            this.mouse = null;
            this._features = null;
            this._players = null;
            this._playerRenders = null;
            this._sprites = null;
            this._movers = null;
            this.mouseClick = _.bind(this.mouseClick, this);
        }
        GameMapView.prototype.onAddToScene = function (scene) {
            this.mouse = scene.world.input.mouseHook(this, "world");
            // TODO: Move this elsewhere.
            this.$el.on('click touchstart', this.mouseClick);
            this.scene.on("map:loaded", this.syncComponents, this);
        };
        GameMapView.prototype.onRemoveFromScene = function (scene) {
            scene.world.input.mouseUnhook("world");
            this.$el.off('click', this.mouseClick);
            this.scene.off("map:loaded", this.syncComponents, this);
        };
        /*
         * Mouse input
         */
        GameMapView.prototype.mouseClick = function (e) {
            var party = this.scene.componentByType(pow2.PlayerComponent);
            if (party) {
                pow2.Input.mouseOnView(e.originalEvent, this.mouse.view, this.mouse);
                party.path = this.tileMap.calculatePath(party.targetPoint, this.mouse.world);
                e.preventDefault();
                return false;
            }
        };
        /*
         * Update the camera for this frame.
         */
        GameMapView.prototype.processCamera = function () {
            this.cameraComponent = this.findComponent(pow2.CameraComponent);
            if (!this.cameraComponent) {
                this.cameraComponent = this.scene.componentByType(pow2.PlayerCameraComponent);
            }
            _super.prototype.processCamera.call(this);
        };
        GameMapView.prototype.syncComponents = function () {
            _super.prototype.syncComponents.call(this);
            this._features = null;
            this._players = null;
            this._playerRenders = null;
            this._sprites = null;
            this._movers = null;
        };
        /*
         * Render the tile map, and any features it has.
         */
        GameMapView.prototype.renderFrame = function (elapsed) {
            _super.prototype.renderFrame.call(this, elapsed);
            if (!this._features) {
                this._features = this.scene.objectsByType(pow2.GameFeatureObject);
            }
            var l = this._features.length;
            for (var i = 0; i < l; i++) {
                this.objectRenderer.render(this._features[i], this._features[i], this);
            }
            if (!this._playerRenders) {
                this._playerRenders = this.scene.objectsByComponent(pow2.PlayerRenderComponent);
            }
            l = this._playerRenders.length;
            for (var i = 0; i < l; i++) {
                var renderObj = this._playerRenders[i];
                this.objectRenderer.render(renderObj, renderObj, this);
            }
            if (!this._players) {
                this._players = this.scene.objectsByComponent(pow2.PlayerComponent);
            }
            l = this._players.length;
            for (var i = 0; i < l; i++) {
                var renderObj = this._players[i];
                this.objectRenderer.render(renderObj, renderObj, this);
            }
            if (!this._sprites) {
                this._sprites = this.scene.componentsByType(pow2.SpriteComponent);
            }
            l = this._sprites.length;
            for (var i = 0; i < l; i++) {
                var sprite = this._sprites[i];
                this.objectRenderer.render(sprite.host, sprite, this);
            }
            if (!this._movers) {
                this._movers = this.scene.componentsByType(pow2.MovableComponent);
            }
            l = this._movers.length;
            for (var i = 0; i < l; i++) {
                var target = this._movers[i];
                if (target.path.length > 0) {
                    this.context.save();
                    var destination = target.path[target.path.length - 1].clone();
                    destination.x -= 0.5;
                    destination.y -= 0.5;
                    var screenTile = this.worldToScreen(new pow2.Rect(destination, new pow2.Point(1, 1)));
                    this.context.fillStyle = "rgba(10,255,10,0.3)";
                    this.context.fillRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);
                    this.context.strokeStyle = "rgba(10,255,10,0.9)";
                    this.context.lineWidth = 1.5;
                    this.context.strokeRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);
                    this.context.restore();
                }
            }
            return this;
        };
        GameMapView.prototype.debugRender = function (debugStrings) {
            if (debugStrings === void 0) { debugStrings = []; }
            var party = this.scene.objectByComponent(pow2.PlayerComponent);
            if (party) {
                debugStrings.push("Party: (" + party.point.x + "," + party.point.y + ")");
            }
            if (this.mouse) {
                var worldMouse = this.screenToWorld(this.mouse.point, this.cameraScale).add(this.camera.point).round();
                debugStrings.push("Mouse: " + this.mouse.point + ", World: " + worldMouse);
                var tileRect = new pow2.Rect(worldMouse, new pow2.Point(1, 1));
                var half = tileRect.getHalfSize();
                tileRect.point.x -= half.x;
                tileRect.point.y -= half.y;
                var screenTile = this.worldToScreen(tileRect, 1);
                var results = [];
                var hit = this.scene.db.queryRect(tileRect, pow2.SceneObject, results);
                if (hit) {
                    _.each(results, function (obj) {
                        debugStrings.push("Hit: " + obj);
                    });
                    this.context.fillStyle = "rgba(10,255,10,0.3)";
                    this.context.fillRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);
                }
                this.context.strokeStyle = hit ? "rgba(10,255,10,0.9)" : "rgba(255,255,255,0.9)";
                this.context.lineWidth = 1.5;
                this.context.strokeRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);
            }
            //super.debugRender(debugStrings);
        };
        return GameMapView;
    })(pow2.TileMapView);
    pow2.GameMapView = GameMapView;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
var pow2;
(function (pow2) {
    var ItemModel = (function (_super) {
        __extends(ItemModel, _super);
        function ItemModel() {
            _super.apply(this, arguments);
        }
        ItemModel.prototype.defaults = function () {
            return _.extend({}, ItemModel.DEFAULTS);
        };
        ItemModel.DEFAULTS = {
            name: "",
            icon: "",
            cost: 0,
            hero: null,
            usedby: null
        };
        return ItemModel;
    })(Backbone.Model);
    pow2.ItemModel = ItemModel;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="./itemModel.ts" />
var pow2;
(function (pow2) {
    var ArmorModel = (function (_super) {
        __extends(ArmorModel, _super);
        function ArmorModel() {
            _super.apply(this, arguments);
        }
        ArmorModel.prototype.defaults = function () {
            return _.extend(_super.prototype.defaults.call(this), ArmorModel.DEFAULTS);
        };
        ArmorModel.DEFAULTS = {
            name: "No Armor",
            icon: "",
            defense: 0,
            evade: 0,
            cost: 0
        };
        return ArmorModel;
    })(pow2.ItemModel);
    pow2.ArmorModel = ArmorModel;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="./entityModel.ts" />
/// <reference path="./heroModel.ts" />
/// <reference path="./itemModel.ts" />
var pow2;
(function (pow2) {
    var _gameData = null;
    var GameStateModel = (function (_super) {
        __extends(GameStateModel, _super);
        function GameStateModel(options) {
            _super.call(this);
            this.keyData = {};
            _.extend(this, {
                gold: 200,
                playerPosition: new pow2.Point(),
                playerMap: "",
                combatZone: "world-plains",
                party: [],
                inventory: []
            }, options || {});
        }
        GameStateModel.prototype.initData = function (then) {
            GameStateModel.getDataSource(then);
        };
        /**
         * Get the game data sheets from google and callback when they're loaded.
         * @param then The function to call when spreadsheet data has been fetched
         */
        GameStateModel.getDataSource = function (then) {
            if (_gameData) {
                then && then(_gameData);
            }
            else {
                pow2.ResourceLoader.get().loadAsType(pow2.SPREADSHEET_ID, pow2.GameDataResource, function (resource) {
                    _gameData = resource;
                    then && then(resource);
                });
            }
        };
        GameStateModel.prototype.setKeyData = function (key, data) {
            this.keyData[key] = data;
        };
        GameStateModel.prototype.getKeyData = function (key) {
            return this.keyData[key];
        };
        GameStateModel.prototype.addInventory = function (item) {
            this.inventory.push(item);
            return item;
        };
        // Remove an inventory item.  Return true if the item was removed, or false
        // if it was not found.
        GameStateModel.prototype.removeInventory = function (item) {
            for (var i = 0; i < this.inventory.length; i++) {
                if (this.inventory[i].cid === item.cid) {
                    this.inventory.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        GameStateModel.prototype.addHero = function (model) {
            this.party.push(model);
            model.game = this;
        };
        GameStateModel.prototype.addGold = function (amount) {
            this.gold += amount;
        };
        GameStateModel.prototype.parse = function (data, options) {
            if (!_gameData) {
                throw new Error("cannot instantiate inventory without valid data source.\nCall model.initData(loader) first.");
            }
            try {
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }
            }
            catch (e) {
                console.log("Failed to load save game.");
                return;
            }
            if (typeof data.keyData !== 'undefined') {
                try {
                    this.keyData = JSON.parse(data.keyData);
                }
                catch (e) {
                    console.error("Failed to parse keyData");
                    this.keyData = data.keyData;
                }
            }
            var theChoices = [];
            theChoices = theChoices.concat(_.map(_gameData.getSheetData('weapons'), function (w) {
                return _.extend({ instanceModel: new pow2.WeaponModel(w) }, w);
            }));
            theChoices = theChoices.concat(_.map(_gameData.getSheetData('armor'), function (a) {
                return _.extend({ instanceModel: new pow2.ArmorModel(a) }, a);
            }));
            this.inventory = _.map(data.inventory, function (item) {
                var choice = _.where(theChoices, { id: item.id })[0];
                return choice.instanceModel;
            });
            this.party = _.map(data.party, function (partyMember) {
                return new pow2.HeroModel(partyMember, { parse: true });
            });
            _.extend(this, _.omit(data, 'party', 'inventory', 'keyData'));
        };
        GameStateModel.prototype.toJSON = function () {
            var result = _.omit(pow2.data, 'party', 'inventory', 'keyData', 'world');
            result.party = _.map(this.party, function (p) {
                return p.toJSON();
            });
            result.inventory = _.map(this.inventory, function (p) {
                return _.pick(p.attributes, 'id');
            });
            try {
                result.keyData = JSON.stringify(this.keyData);
            }
            catch (e) {
                console.error("Failed to stringify keyData");
                result.keyData = {};
            }
            return result;
        };
        return GameStateModel;
    })(pow2.Events);
    pow2.GameStateModel = GameStateModel;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="./itemModel.ts" />
var pow2;
(function (pow2) {
    var WeaponModel = (function (_super) {
        __extends(WeaponModel, _super);
        function WeaponModel() {
            _super.apply(this, arguments);
        }
        WeaponModel.prototype.defaults = function () {
            return _.extend(_super.prototype.defaults.call(this), WeaponModel.DEFAULTS);
        };
        WeaponModel.prototype.isNoWeapon = function () {
            return this.attributes.name === WeaponModel.DEFAULTS.name && this.attributes.icon === WeaponModel.DEFAULTS.icon && this.attributes.attack === WeaponModel.DEFAULTS.attack && this.attributes.hit === WeaponModel.DEFAULTS.hit && this.attributes.cost === WeaponModel.DEFAULTS.cost;
        };
        WeaponModel.DEFAULTS = {
            name: "No Weapon",
            icon: "",
            attack: 0,
            hit: 0,
            cost: 0
        };
        return WeaponModel;
    })(pow2.ItemModel);
    pow2.WeaponModel = WeaponModel;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="./entityModel.ts" />
/// <reference path="./creatureModel.ts" />
/// <reference path="./gameStateModel.ts" />
/// <reference path="./armorModel.ts" />
/// <reference path="./weaponModel.ts" />
var pow2;
(function (pow2) {
    var levelExpChart = [
        0,
        32,
        96,
        208,
        400,
        672,
        1056,
        1552,
        2184,
        2976
    ];
    pow2.HeroTypes = {
        Warrior: "warrior",
        LifeMage: "mage",
        DeathMage: "necromancer",
        Ranger: "ranger"
    };
    var HeroModel = (function (_super) {
        __extends(HeroModel, _super);
        function HeroModel() {
            _super.apply(this, arguments);
        }
        HeroModel.prototype.defaults = function () {
            return _.extend(_super.prototype.defaults.call(this), HeroModel.DEFAULTS);
        };
        // Equip a new piece of armor, and return any existing armor
        // that has been replaced by it.
        HeroModel.prototype.equipArmor = function (item) {
            var slot = item.get('type');
            var oldArmor;
            if (_.indexOf(HeroModel.ARMOR_TYPES, slot) !== -1) {
                oldArmor = this[slot];
                this[slot] = item;
            }
            return oldArmor;
        };
        // Remove a piece of armor.  Returns false if the armor is not equipped.
        HeroModel.prototype.unequipArmor = function (item) {
            var slot = item.get('type');
            var oldArmor = this[slot];
            if (!oldArmor || !slot) {
                return false;
            }
            this[slot] = null;
            return true;
        };
        HeroModel.prototype.getEvasion = function () {
            var _this = this;
            var evasionPenalty = _.reduce(HeroModel.ARMOR_TYPES, function (val, type) {
                var item = _this[type];
                if (!item) {
                    return val;
                }
                return val + item.attributes.evade;
            }, 0);
            return pow2.EntityModel.BASE_EVASION + this.attributes.agility + evasionPenalty;
        };
        HeroModel.prototype.attack = function (defender) {
            var halfStrength = this.attributes.strength / 2;
            var weaponAttack = this.weapon ? this.weapon.attributes.attack : 0;
            var amount = halfStrength + weaponAttack;
            var max = amount * 1.2;
            var min = amount * 0.8;
            var damage = Math.max(1, Math.floor(Math.random() * (max - min + 1)) + min);
            if (this.rollHit(defender)) {
                return defender.damage(damage);
            }
            return 0;
        };
        HeroModel.prototype.getXPForLevel = function (level) {
            if (level === void 0) { level = this.attributes.level; }
            if (level == 0) {
                return 0;
            }
            return levelExpChart[level - 1];
        };
        HeroModel.prototype.getDefense = function () {
            var _this = this;
            return _.reduce(HeroModel.ARMOR_TYPES, function (val, type) {
                var item = _this[type];
                if (!item) {
                    return val;
                }
                return val + item.attributes.defense;
            }, 0);
        };
        HeroModel.prototype.getDamage = function () {
            return ((this.weapon ? this.weapon.attributes.attack : 0) + this.attributes.strength / 2) | 0;
        };
        HeroModel.prototype.awardExperience = function (exp) {
            var newExp = this.attributes.exp + exp;
            this.set({
                exp: newExp
            });
            if (newExp >= this.attributes.nextLevelExp) {
                this.awardLevelUp();
                return true;
            }
            return false;
        };
        HeroModel.prototype.awardLevelUp = function () {
            var nextLevel = this.attributes.level + 1;
            var newHP = this.getHPForLevel(nextLevel);
            this.set({
                level: nextLevel,
                maxHP: newHP,
                strength: this.getStrengthForLevel(nextLevel),
                agility: this.getAgilityForLevel(nextLevel),
                vitality: this.getVitalityForLevel(nextLevel),
                intelligence: this.getIntelligenceForLevel(nextLevel),
                nextLevelExp: this.getXPForLevel(nextLevel + 1),
                prevLevelExp: this.getXPForLevel(nextLevel)
            });
            this.trigger('levelUp', this);
        };
        HeroModel.prototype.parse = function (data, options) {
            var _this = this;
            try {
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }
            }
            catch (e) {
                console.log("Failed to load save game.");
                return {};
            }
            if (!data) {
                return {};
            }
            pow2.GameStateModel.getDataSource(function (spreadsheet) {
                _.each(HeroModel.ARMOR_TYPES, function (type) {
                    if (data[type]) {
                        var piece = _.where(spreadsheet.getSheetData('armor'), { name: data[type] })[0];
                        if (piece) {
                            _this[type] = new pow2.ArmorModel(piece);
                        }
                    }
                });
                if (data.weapon) {
                    var weapon = _.where(spreadsheet.getSheetData('weapons'), { name: data.weapon })[0];
                    _this.weapon = new pow2.WeaponModel(weapon);
                }
            });
            return _.omit(data, _.flatten(['weapon', HeroModel.ARMOR_TYPES]));
        };
        HeroModel.prototype.toJSON = function () {
            var _this = this;
            var result = _super.prototype.toJSON.call(this);
            if (this.weapon) {
                result.weapon = this.weapon.get('name');
            }
            _.each(HeroModel.ARMOR_TYPES, function (type) {
                if (_this[type]) {
                    result[type] = _this[type].get('name');
                }
            });
            return result;
        };
        HeroModel.prototype.getHPForLevel = function (level) {
            if (level === void 0) { level = this.attributes.level; }
            return Math.floor(this.attributes.vitality * Math.pow(level, 1.1)) + (this.attributes.baseVitality * 2);
        };
        HeroModel.prototype.getStrengthForLevel = function (level) {
            if (level === void 0) { level = this.attributes.level; }
            return Math.floor(this.attributes.baseStrength * Math.pow(level, 0.65));
        };
        HeroModel.prototype.getAgilityForLevel = function (level) {
            if (level === void 0) { level = this.attributes.level; }
            return Math.floor(this.attributes.baseAgility * Math.pow(level, 0.95));
        };
        HeroModel.prototype.getVitalityForLevel = function (level) {
            if (level === void 0) { level = this.attributes.level; }
            return Math.floor(this.attributes.baseVitality * Math.pow(level, 0.95));
        };
        HeroModel.prototype.getIntelligenceForLevel = function (level) {
            if (level === void 0) { level = this.attributes.level; }
            return Math.floor(this.attributes.baseIntelligence * Math.pow(level, 0.95));
        };
        HeroModel.create = function (type, name) {
            var character = null;
            switch (type) {
                case pow2.HeroTypes.Warrior:
                    character = new HeroModel({
                        type: type,
                        level: 0,
                        name: name,
                        icon: "warrior-male.png",
                        baseStrength: 10,
                        baseAgility: 2,
                        baseIntelligence: 1,
                        baseVitality: 7,
                        hitpercent: 10,
                        hitPercentPerLevel: 3
                    });
                    break;
                case pow2.HeroTypes.LifeMage:
                    character = new HeroModel({
                        type: type,
                        name: name,
                        level: 0,
                        icon: "healer-female.png",
                        baseStrength: 1,
                        baseAgility: 6,
                        baseIntelligence: 9,
                        baseVitality: 4,
                        hitpercent: 5,
                        hitPercentPerLevel: 1
                    });
                    break;
                case pow2.HeroTypes.Ranger:
                    character = new HeroModel({
                        type: type,
                        name: name,
                        level: 0,
                        icon: "ranger-female.png",
                        baseStrength: 3,
                        baseAgility: 10,
                        baseIntelligence: 2,
                        baseVitality: 5,
                        hitpercent: 7,
                        hitPercentPerLevel: 2
                    });
                    break;
                case pow2.HeroTypes.DeathMage:
                    character = new HeroModel({
                        type: type,
                        name: name,
                        level: 0,
                        icon: "magician-male.png",
                        baseStrength: 2,
                        baseAgility: 10,
                        baseIntelligence: 4,
                        baseVitality: 4,
                        hitpercent: 5,
                        hitPercentPerLevel: 2
                    });
                    break;
                default:
                    throw new Error("Unknown character class: " + type);
            }
            character.awardLevelUp();
            character.set({
                hp: character.get('maxHP')
            });
            return character;
        };
        HeroModel.MAX_LEVEL = 50;
        HeroModel.MAX_ATTR = 50;
        HeroModel.ARMOR_TYPES = [
            'head',
            'body',
            'arms',
            'feet',
            'accessory'
        ];
        HeroModel.DEFAULTS = {
            name: "Hero",
            icon: "",
            combatSprite: "",
            type: pow2.HeroTypes.Warrior,
            level: 1,
            exp: 0,
            nextLevelExp: 0,
            prevLevelExp: 0,
            hp: 0,
            maxHP: 6,
            description: "",
            // Hidden attributes.
            baseStrength: 0,
            baseAgility: 0,
            baseIntelligence: 0,
            baseVitality: 0,
            hitpercent: 5,
            hitPercentPerLevel: 1,
            evade: 0
        };
        return HeroModel;
    })(pow2.EntityModel);
    pow2.HeroModel = HeroModel;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="./entityModel.ts" />
/// <reference path="./heroModel.ts" />
var pow2;
(function (pow2) {
    var CreatureModel = (function (_super) {
        __extends(CreatureModel, _super);
        function CreatureModel() {
            _super.apply(this, arguments);
        }
        CreatureModel.prototype.defaults = function () {
            return _.extend(_super.prototype.defaults.call(this), CreatureModel.DEFAULTS);
        };
        CreatureModel.prototype.attack = function (defender) {
            var hero = defender;
            var defense = hero.getDefense();
            var min = this.attributes.attacklow;
            var max = this.attributes.attackhigh;
            var damage = Math.floor(Math.random() * (max - min + 1)) + min;
            if (this.rollHit(defender)) {
                return defender.damage(Math.max(1, damage - defense));
            }
            return 0;
        };
        CreatureModel.fromName = function (name) {
            var creatures = pow2.getData('creatures');
            var cData = _.where(creatures, { name: name })[0];
            return new CreatureModel(cData);
        };
        CreatureModel.fromLevel = function (level) {
            var creatures = pow2.getData('creatures');
            if (!creatures) {
                throw new Error("Creature data set is missing.");
            }
            var templates = _.where(creatures, { level: level });
            var cData = templates[Math.floor(Math.random() * templates.length)];
            return new CreatureModel(cData);
        };
        CreatureModel.DEFAULTS = {
            name: "Unnamed Creature",
            icon: "noIcon.png",
            groups: [],
            level: 0,
            hp: 0,
            exp: 0,
            strength: 0,
            numAttacks: 0,
            armorClass: 0,
            description: "",
            evade: 0,
            hitpercent: 1
        };
        return CreatureModel;
    })(pow2.EntityModel);
    pow2.CreatureModel = CreatureModel;
})(pow2 || (pow2 = {}));
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
var pow2;
(function (pow2) {
    // Combat States
    //--------------------------------------------------------------------------
    var CombatState = (function (_super) {
        __extends(CombatState, _super);
        function CombatState() {
            _super.apply(this, arguments);
        }
        CombatState.prototype.enter = function (machine) {
            var _this = this;
            _super.prototype.enter.call(this, machine);
            machine.keyListener = function (e) {
                if (_this.keyPress(machine, e.keyCode) === false) {
                    e.preventDefault();
                    return false;
                }
                return true;
            };
            $(window).on('keypress', machine.keyListener);
        };
        CombatState.prototype.exit = function (machine) {
            $(window).off('keypress', machine.keyListener);
            machine.keyListener = null;
            _super.prototype.exit.call(this, machine);
        };
        // Return false to eat the event.
        CombatState.prototype.keyPress = function (machine, keyCode) {
            return true;
        };
        return CombatState;
    })(pow2.State);
    pow2.CombatState = CombatState;
})(pow2 || (pow2 = {}));
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
/// <reference path="../gameStateMachine.ts" />
/// <reference path="./gameCombatState.ts" />
var pow2;
(function (pow2) {
    var GameMapState = (function (_super) {
        __extends(GameMapState, _super);
        function GameMapState(name) {
            _super.call(this);
            this.name = GameMapState.NAME;
            this.mapName = name;
        }
        GameMapState.prototype.enter = function (machine) {
            var _this = this;
            _super.prototype.enter.call(this, machine);
            if (this.mapName && machine.player) {
                machine.player.scene.once("map:loaded", function (map) {
                    if (_this.mapPoint) {
                        machine.player.setPoint(_this.mapPoint);
                    }
                });
                machine.player.tileMap.load(this.mapName);
            }
            console.log("MAPPPPPPP");
        };
        GameMapState.prototype.exit = function (machine) {
            if (!machine.player) {
                throw new Error("Defensive exception: I _think_ this state needs a player.");
            }
            if (!machine.player.tileMap) {
                throw new Error("Defensive exception: The player must have a tileMap.");
            }
            this.mapName = machine.player.tileMap.mapName;
            this.mapPoint = machine.player.point.clone();
        };
        GameMapState.NAME = "map";
        return GameMapState;
    })(pow2.State);
    pow2.GameMapState = GameMapState;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../tile/tileObject.ts" />
/// <reference path="../gameTileMap.ts" />
var pow2;
(function (pow2) {
    var GameFeatureObject = (function (_super) {
        __extends(GameFeatureObject, _super);
        function GameFeatureObject(options) {
            _super.call(this, _.omit(options || {}, ["x", "y", "type"]));
            this.feature = options;
            this.point.x = options.x;
            this.point.y = options.y;
            this.type = options.type;
            this.frame = typeof options.frame !== 'undefined' ? options.frame : 0;
            this.groups = typeof options.groups === 'string' ? options.groups.split('|') : options.groups;
            this.category = options.category;
        }
        return GameFeatureObject;
    })(pow2.TileObject);
    pow2.GameFeatureObject = GameFeatureObject;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../../tile/tileObject.ts" />
var pow2;
(function (pow2) {
    // Implementation
    // -------------------------------------------------------------------------
    var AnimatedComponent = (function (_super) {
        __extends(AnimatedComponent, _super);
        function AnimatedComponent() {
            _super.apply(this, arguments);
            this._tasks = [];
            this._animationKeys = [];
            this._currentAnim = null;
        }
        AnimatedComponent.prototype.play = function (config) {
            var task = config;
            task.elapsed = 0;
            if (task.move) {
                task.startFrame = this.host.frame;
                task.start = this.host.point.clone();
                task.target = this.host.point.clone().add(task.move);
                task.value = this.host.point.clone();
            }
            if (typeof task.duration === 'undefined') {
                task.duration = 0;
            }
            this._tasks.push(task);
        };
        AnimatedComponent.prototype.stop = function (config) {
            for (var i = 0; i < this._tasks.length; i++) {
                var task = this._tasks[i];
                if (task.name === config.name) {
                    task.complete = true;
                }
            }
        };
        AnimatedComponent.prototype.removeCompleteTasks = function () {
            for (var i = 0; i < this._tasks.length; i++) {
                var task = this._tasks[i];
                if (task.complete === true) {
                    this._tasks.splice(i, 1);
                    task.done && task.done(task);
                    task.callback && task.callback(task);
                    //this.host.frame = task.startFrame;
                    this.trigger(AnimatedComponent.EVENTS.Stopped, {
                        task: task,
                        component: this
                    });
                    i--;
                }
            }
        };
        AnimatedComponent.prototype.interpolateTick = function (elapsed) {
            _super.prototype.interpolateTick.call(this, elapsed);
            this.update(elapsed);
            this.removeCompleteTasks();
        };
        AnimatedComponent.prototype.update = function (elapsed) {
            var _this = this;
            if (this._tasks.length === 0) {
                return;
            }
            // Interp each task and fire events where necessary.
            _.each(this._tasks, function (task) {
                if (task.elapsed > task.duration) {
                    task.complete = true;
                    task.elapsed = task.duration;
                }
                if (task.duration > 0) {
                    var factor = task.elapsed / task.duration;
                    // Interp point
                    //console.log("Interp from " + task.start + " to " + task.target );
                    if (task.move && task.move instanceof pow2.Point) {
                        _this.host.point.set(task.value.interpolate(task.start, task.target, factor));
                    }
                    if (task.frames && task.frames.length) {
                        var index = Math.round(_this.interpolate(0, task.frames.length - 1, factor));
                        var frame = task.frames[index];
                        //console.log("Interp frame = " + frame);
                        _this.host.frame = frame;
                    }
                }
                if (!task.complete) {
                    task.elapsed += elapsed;
                }
            });
        };
        AnimatedComponent.prototype.interpolate = function (from, to, factor) {
            factor = Math.min(Math.max(factor, 0), 1);
            return (from * (1.0 - factor)) + (to * factor);
        };
        AnimatedComponent.prototype.playChain = function (animations, cb) {
            // Inject a 0 duration animation on the end of the list
            // if a callback is desired.  This is a convenience for
            // certain coding styles, and you could easily add your
            // own animation as a callback before invoking this.
            if (typeof cb !== 'undefined') {
                animations.push({
                    name: "Chain Callback",
                    duration: 0,
                    callback: cb
                });
            }
            // TODO: Need a list of these for multiple animations on
            // the same component. !!!!!!!!!!!!!!!!!!!!
            this._animationKeys = animations;
            this._animateNext();
        };
        AnimatedComponent.prototype._animateNext = function () {
            var _this = this;
            if (this._animationKeys.length === 0) {
                return;
            }
            this._currentAnim = this._animationKeys.shift();
            this._currentAnim.done = function () {
                _.defer(function () {
                    _this._animateNext();
                });
            };
            this.play(this._currentAnim);
        };
        AnimatedComponent.EVENTS = {
            Started: "start",
            Stopped: "stop",
            Repeated: "repeat"
        };
        return AnimatedComponent;
    })(pow2.TickedComponent);
    pow2.AnimatedComponent = AnimatedComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../../tile/tileObject.ts" />
var pow2;
(function (pow2) {
    (function (MoveFrames) {
        MoveFrames[MoveFrames["LEFT"] = 10] = "LEFT";
        MoveFrames[MoveFrames["RIGHT"] = 4] = "RIGHT";
        MoveFrames[MoveFrames["DOWN"] = 7] = "DOWN";
        MoveFrames[MoveFrames["UP"] = 1] = "UP";
        MoveFrames[MoveFrames["LEFTALT"] = 11] = "LEFTALT";
        MoveFrames[MoveFrames["RIGHTALT"] = 5] = "RIGHTALT";
        MoveFrames[MoveFrames["DOWNALT"] = 8] = "DOWNALT";
        MoveFrames[MoveFrames["UPALT"] = 2] = "UPALT";
    })(pow2.MoveFrames || (pow2.MoveFrames = {}));
    var MoveFrames = pow2.MoveFrames;
    // The order here maps to the first four frames in MoveFrames above.
    // It matters, don't change without care.
    (function (Headings) {
        Headings[Headings["WEST"] = 0] = "WEST";
        Headings[Headings["EAST"] = 1] = "EAST";
        Headings[Headings["SOUTH"] = 2] = "SOUTH";
        Headings[Headings["NORTH"] = 3] = "NORTH";
    })(pow2.Headings || (pow2.Headings = {}));
    var Headings = pow2.Headings;
    var PlayerRenderComponent = (function (_super) {
        __extends(PlayerRenderComponent, _super);
        function PlayerRenderComponent() {
            _super.apply(this, arguments);
            this._animator = new pow2.Animator();
            this.heading = 0 /* WEST */;
            this.animating = false;
        }
        PlayerRenderComponent.prototype.connectComponent = function () {
            if (!_super.prototype.connectComponent.call(this)) {
                return false;
            }
            this._animator.setAnimationSource(this.host.icon);
            return true;
        };
        PlayerRenderComponent.prototype.setHeading = function (direction, animating) {
            this.heading = direction;
            switch (this.heading) {
                case 2 /* SOUTH */:
                    this._animator.setAnimation('down');
                    break;
                case 3 /* NORTH */:
                    this._animator.setAnimation('up');
                    break;
                case 1 /* EAST */:
                    this._animator.setAnimation('right');
                    break;
                case 0 /* WEST */:
                    this._animator.setAnimation('left');
                    break;
            }
            this.animating = animating;
        };
        PlayerRenderComponent.prototype.setMoving = function (moving) {
            this.animating = moving;
        };
        PlayerRenderComponent.prototype.interpolateTick = function (elapsed) {
            _super.prototype.interpolateTick.call(this, elapsed);
            if (this.animating) {
                this._animator.updateTime(elapsed);
            }
            this.host.frame = this._animator.getFrame();
        };
        return PlayerRenderComponent;
    })(pow2.TickedComponent);
    pow2.PlayerRenderComponent = PlayerRenderComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="./playerRenderComponent.ts" />
/// <reference path="../objects/gameFeatureObject.ts" />
var pow2;
(function (pow2) {
    var PlayerComponent = (function (_super) {
        __extends(PlayerComponent, _super);
        function PlayerComponent() {
            _super.apply(this, arguments);
            this.passableKeys = ['passable'];
            this.collideTypes = ['temple', 'store', 'sign'];
            this._lastFrame = 3;
            this._renderFrame = 3;
            this.heading = new pow2.Point(0, -1);
            this.sprite = null;
        }
        PlayerComponent.prototype.syncComponent = function () {
            this.sprite = this.host.findComponent(pow2.PlayerRenderComponent);
            return _super.prototype.syncComponent.call(this);
        };
        PlayerComponent.prototype.tick = function (elapsed) {
            // There are four states and two rows.  The second row is all alt states, so mod it out
            // when a move ends.
            this._lastFrame = this._renderFrame > 3 ? this._renderFrame - 4 : this._renderFrame;
            _super.prototype.tick.call(this, elapsed);
        };
        PlayerComponent.prototype.interpolateTick = function (elapsed) {
            _super.prototype.interpolateTick.call(this, elapsed);
            if (!this.sprite) {
                return;
            }
            var xMove = this.targetPoint.x !== this.host.renderPoint.x;
            var yMove = this.targetPoint.y !== this.host.renderPoint.y;
            if (this.velocity.y > 0 && yMove) {
                this.sprite.setHeading(2 /* SOUTH */, yMove);
                this.heading.set(0, 1);
            }
            else if (this.velocity.y < 0 && yMove) {
                this.sprite.setHeading(3 /* NORTH */, yMove);
                this.heading.set(0, -1);
            }
            else if (this.velocity.x < 0 && xMove) {
                this.sprite.setHeading(0 /* WEST */, xMove);
                this.heading.set(-1, 0);
            }
            else if (this.velocity.x > 0 && xMove) {
                this.sprite.setHeading(1 /* EAST */, xMove);
                this.heading.set(1, 0);
            }
            else {
                if (this.velocity.y > 0) {
                    this.sprite.setHeading(2 /* SOUTH */, false);
                    this.heading.set(0, 1);
                }
                else if (this.velocity.y < 0) {
                    this.sprite.setHeading(3 /* NORTH */, false);
                    this.heading.set(0, -1);
                }
                else if (this.velocity.x < 0) {
                    this.sprite.setHeading(0 /* WEST */, false);
                    this.heading.set(-1, 0);
                }
                else if (this.velocity.x > 0) {
                    this.sprite.setHeading(1 /* EAST */, false);
                    this.heading.set(1, 0);
                }
                else {
                    this.sprite.setMoving(false);
                }
            }
        };
        PlayerComponent.prototype.collideMove = function (x, y, results) {
            if (results === void 0) { results = []; }
            var collision = this.collider.collide(x, y, pow2.GameFeatureObject, results);
            if (collision) {
                for (var i = 0; i < results.length; i++) {
                    var o = results[i];
                    if (o.passable === true || !o.type) {
                        return false;
                    }
                    if (_.indexOf(this.collideTypes, o.type.toLowerCase()) !== -1) {
                        return true;
                    }
                }
            }
            // Iterate over all layers of the map, check point(x,y) and see if the tile
            // has any unpassable attributes set on it.  If any unpassable attributes are
            // found, there is a collision.
            // TODO: This should probably respect layer visibility, and another flag?  collidable?
            var map = this.host.scene.objectByType(pow2.TileMap);
            if (map) {
                var layers = map.getLayers();
                for (var i = 0; i < layers.length; i++) {
                    var terrain = map.getTileData(layers[i], x, y);
                    if (!terrain) {
                        continue;
                    }
                    for (var j = 0; j < this.passableKeys.length; j++) {
                        if (terrain[this.passableKeys[j]] === false) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        PlayerComponent.prototype.beginMove = function (from, to) {
            this.host.trigger('move:begin', this, from, to);
            var results = [];
            var collision = this.collider.collide(to.x, to.y, pow2.GameFeatureObject, results);
            if (collision) {
                for (var i = 0; i < results.length; i++) {
                    var o = results[i];
                    var comp = o.findComponent(pow2.TileComponent);
                    if (!comp || !comp.enter) {
                        continue;
                    }
                    console.log("Collide -> " + o.type);
                    if (comp.enter(this.host) === false) {
                        return;
                    }
                }
            }
        };
        PlayerComponent.prototype.endMove = function (from, to) {
            if (!this.collider) {
                return;
            }
            this.host.trigger('move:end', this, from, to);
            // Successful move, collide against target point and check any new tile actions.
            var fromFeature = this.collider.collideFirst(from.x, from.y, pow2.GameFeatureObject);
            if (fromFeature) {
                var comp = fromFeature.findComponent(pow2.TileComponent);
                if (comp) {
                    comp.exited(this.host);
                }
            }
            // Successful move, collide against target point and check any new tile actions.
            var toFeature = this.collider.collideFirst(to.x, to.y, pow2.GameFeatureObject);
            if (toFeature) {
                var comp = toFeature.findComponent(pow2.TileComponent);
                if (comp) {
                    comp.entered(this.host);
                }
            }
        };
        return PlayerComponent;
    })(pow2.MovableComponent);
    pow2.PlayerComponent = PlayerComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../../tile/components/animatedSpriteComponent.ts" />
/// <reference path="../../tile/components/spriteComponent.ts" />
/// <reference path="./playerComponent.ts" />
/// <reference path="../gameComponent.ts" />
/// <reference path="../objects/gameEntityObject.ts" />
var pow2;
(function (pow2) {
    var DamageComponent = (function (_super) {
        __extends(DamageComponent, _super);
        function DamageComponent() {
            _super.apply(this, arguments);
            this.started = false;
        }
        DamageComponent.prototype.syncComponent = function () {
            var _this = this;
            if (!_super.prototype.syncComponent.call(this)) {
                return false;
            }
            this.animation = this.host.findComponent(pow2.AnimatedSpriteComponent);
            this.sprite = this.host.findComponent(pow2.SpriteComponent);
            this.sound = this.host.findComponent(pow2.SoundComponent);
            var ok = !!(this.animation && this.sprite);
            if (!this.started && ok) {
                this.started = true;
                this.animation.once('animation:done', function () {
                    _this.trigger('damage:done', _this);
                });
            }
            return ok;
        };
        return DamageComponent;
    })(pow2.SceneComponent);
    pow2.DamageComponent = DamageComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../gameComponent.ts" />
var pow2;
(function (pow2) {
    /**
     * A component that defines the functionality of a map feature.
     */
    var GameFeatureComponent = (function (_super) {
        __extends(GameFeatureComponent, _super);
        function GameFeatureComponent() {
            _super.apply(this, arguments);
        }
        GameFeatureComponent.prototype.syncComponent = function () {
            if (!_super.prototype.syncComponent.call(this)) {
                return false;
            }
            this.host.visible = this.host.enabled = !this.getDataHidden();
            return true;
        };
        /**
         * Hide and disable a feature object in a persistent manner.
         * @param hidden Whether to hide or unhide the object.
         */
        GameFeatureComponent.prototype.setDataHidden = function (hidden) {
            if (hidden === void 0) { hidden = true; }
            if (this.host && this.host.world && this.host.world.model && this.host.id) {
                this.host.world.model.setKeyData('' + this.host.id, {
                    hidden: hidden
                });
                this.syncComponent();
            }
        };
        /**
         * Determine if a feature has been persistently hidden by a call
         * to `hideFeature`.
         */
        GameFeatureComponent.prototype.getDataHidden = function () {
            if (this.host && this.host.world && this.host.world.model && this.host.id) {
                var data = this.host.world.model.getKeyData('' + this.host.id);
                if (data && data.hidden) {
                    return true;
                }
            }
            return false;
        };
        return GameFeatureComponent;
    })(pow2.GameComponent);
    pow2.GameFeatureComponent = GameFeatureComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../../tile/tileObject.ts" />
/// <reference path="../objects/gameFeatureObject.ts" />
var pow2;
(function (pow2) {
    var GameFeatureInputComponent = (function (_super) {
        __extends(GameFeatureInputComponent, _super);
        function GameFeatureInputComponent() {
            _super.apply(this, arguments);
            this.hitBox = new pow2.Rect(0, 0, 1, 1);
            this.hits = [];
            this.mouse = null;
        }
        GameFeatureInputComponent.prototype.syncComponent = function () {
            if (!_super.prototype.syncComponent.call(this) || !this.scene || !this.scene.world || !this.scene.world.input) {
                return false;
            }
            this.mouse = this.scene.world.input.getMouseHook("world");
            return !!this.mouse;
        };
        GameFeatureInputComponent.prototype.tick = function (elapsed) {
            // Calculate hits in Scene for machine usage.
            if (!this.scene || !this.mouse) {
                return;
            }
            _.each(this.hits, function (tile) {
                tile.scale = 1;
            });
            // Quick array clear
            this.hits.length = 0;
            this.hitBox.point.set(this.mouse.world);
            this.scene.db.queryRect(this.hitBox, pow2.GameFeatureObject, this.hits);
            _.each(this.hits, function (obj) {
                obj.scale = 1.25;
            });
            _super.prototype.tick.call(this, elapsed);
        };
        return GameFeatureInputComponent;
    })(pow2.TickedComponent);
    pow2.GameFeatureInputComponent = GameFeatureInputComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../tile/tileObject.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="./playerComponent.ts" />
var pow2;
(function (pow2) {
    var PlayerCameraComponent = (function (_super) {
        __extends(PlayerCameraComponent, _super);
        function PlayerCameraComponent() {
            _super.apply(this, arguments);
        }
        PlayerCameraComponent.prototype.connectComponent = function () {
            return _super.prototype.connectComponent.call(this) && !!this.host.findComponent(pow2.PlayerComponent);
        };
        PlayerCameraComponent.prototype.process = function (view) {
            _super.prototype.process.call(this, view);
            // Center on player object
            view.camera.setCenter(this.host.renderPoint || this.host.point);
            // Clamp to tile map if it is present.
            if (this.host.tileMap) {
                view.camera.point.x = Math.min(view.camera.point.x, this.host.tileMap.bounds.extent.x - view.camera.extent.x);
                view.camera.point.y = Math.min(view.camera.point.y, this.host.tileMap.bounds.extent.y - view.camera.extent.y);
                view.camera.point.x = Math.max(0, view.camera.point.x);
                view.camera.point.y = Math.max(0, view.camera.point.y);
                // Center in viewport if tilemap is smaller than camera.
                if (this.host.tileMap.bounds.extent.x < view.camera.extent.x) {
                    view.camera.point.x = (this.host.tileMap.bounds.extent.x - view.camera.extent.x) / 2;
                }
                if (this.host.tileMap.bounds.extent.y < view.camera.extent.y) {
                    view.camera.point.y = (this.host.tileMap.bounds.extent.y - view.camera.extent.y) / 2;
                }
            }
        };
        return PlayerCameraComponent;
    })(pow2.CameraComponent);
    pow2.PlayerCameraComponent = PlayerCameraComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="./playerComponent.ts" />
/// <reference path="../gameComponent.ts" />
var pow2;
(function (pow2) {
    /**
     * A Component that collides with features that are directly in front
     * of a player, that the player is 'touching' by facing them.
     */
    var PlayerTouchComponent = (function (_super) {
        __extends(PlayerTouchComponent, _super);
        function PlayerTouchComponent() {
            _super.apply(this, arguments);
            this.collider = null;
            this.player = null;
            this.touch = null;
            this.touchedComponent = null;
        }
        PlayerTouchComponent.prototype.syncComponent = function () {
            _super.prototype.syncComponent.call(this);
            this.player = this.host.findComponent(pow2.PlayerComponent);
            this.collider = this.host.findComponent(pow2.CollisionComponent);
            return !!(this.player && this.collider);
        };
        PlayerTouchComponent.prototype.tick = function (elapsed) {
            _super.prototype.tick.call(this, elapsed);
            if (!this.player || !this.collider) {
                return;
            }
            var results = [];
            var newTouch = this.collider.collide(this.host.point.x + this.player.heading.x, this.host.point.y + this.player.heading.y, pow2.GameFeatureObject, results);
            var touched = _.find(results, function (r) {
                return !!r.findComponent(pow2.GameFeatureComponent);
            });
            if (!newTouch || !touched) {
                if (this.touchedComponent) {
                    this.touchedComponent.exit(this.host);
                    this.touchedComponent = null;
                }
                this.touch = null;
            }
            else {
                var touchComponent = touched.findComponent(pow2.GameFeatureComponent);
                var previousTouch = this.touchedComponent ? this.touchedComponent.id : null;
                if (this.touchedComponent && this.touchedComponent.id !== touchComponent.id) {
                    this.touchedComponent.exit(this.host);
                    this.touchedComponent = null;
                }
                this.touchedComponent = touchComponent;
                if (touchComponent.id !== previousTouch) {
                    this.touchedComponent.enter(this.host);
                }
                this.touch = touched;
            }
        };
        return PlayerTouchComponent;
    })(pow2.TickedComponent);
    pow2.PlayerTouchComponent = PlayerTouchComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../playerComponent.ts" />
/// <reference path="../gameFeatureComponent.ts" />
var pow2;
(function (pow2) {
    var CombatFeatureComponent = (function (_super) {
        __extends(CombatFeatureComponent, _super);
        function CombatFeatureComponent() {
            _super.apply(this, arguments);
        }
        CombatFeatureComponent.prototype.enter = function (object) {
            this.party = object.findComponent(pow2.PlayerComponent);
            if (!this.party) {
                return false;
            }
            var zone = this.host.tileMap.getCombatZones(this.party.host.point);
            this.host.world.fixedEncounter(zone, this.host.id);
            this.setDataHidden(true);
            return true;
        };
        CombatFeatureComponent.prototype.exited = function (object) {
            return _super.prototype.exited.call(this, object);
        };
        return CombatFeatureComponent;
    })(pow2.GameFeatureComponent);
    pow2.CombatFeatureComponent = CombatFeatureComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../gameFeatureComponent.ts" />
var pow2;
(function (pow2) {
    var DialogFeatureComponent = (function (_super) {
        __extends(DialogFeatureComponent, _super);
        function DialogFeatureComponent() {
            _super.apply(this, arguments);
        }
        DialogFeatureComponent.prototype.syncComponent = function () {
            if (!_super.prototype.syncComponent.call(this)) {
                return false;
            }
            this.title = this.feature.title;
            this.text = this.feature.text;
            this.icon = this.feature.icon;
            return true;
        };
        DialogFeatureComponent.prototype.enter = function (object) {
            object.scene.trigger('dialog:entered', this);
            return true;
        };
        DialogFeatureComponent.prototype.exit = function (object) {
            object.scene.trigger('dialog:exited', this);
            return true;
        };
        return DialogFeatureComponent;
    })(pow2.GameFeatureComponent);
    pow2.DialogFeatureComponent = DialogFeatureComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../../lib/pow2.d.ts" />
/// <reference path="../../../tile/tileComponent.ts" />
/// <reference path="../gameFeatureComponent.ts" />
var pow2;
(function (pow2) {
    var PortalFeatureComponent = (function (_super) {
        __extends(PortalFeatureComponent, _super);
        function PortalFeatureComponent() {
            _super.apply(this, arguments);
        }
        PortalFeatureComponent.prototype.syncComponent = function () {
            if (!_super.prototype.syncComponent.call(this)) {
                return false;
            }
            this.map = this.feature.target;
            this.target = new pow2.Point(this.feature.targetX, this.feature.targetY);
            return !!this.map;
        };
        PortalFeatureComponent.prototype.entered = function (object) {
            var _this = this;
            if (!this.target || !this.tileMap) {
                return false;
            }
            var oldMap = this.host.tileMap.mapName;
            object.scene.once("map:loaded", function (map) {
                console.log("Transition from " + oldMap + " to " + _this.map);
                // TODO: Remove this targetX targetY feature transition crap.
                object.setPoint(_this.target);
            });
            this.tileMap.load(this.map);
            return true;
        };
        return PortalFeatureComponent;
    })(pow2.GameFeatureComponent);
    pow2.PortalFeatureComponent = PortalFeatureComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../../lib/pow2.d.ts" />
/// <reference path="../../../tile/tileObject.ts" />
/// <reference path="../playerComponent.ts" />
/// <reference path="../gameFeatureComponent.ts" />
var pow2;
(function (pow2) {
    var ShipFeatureComponent = (function (_super) {
        __extends(ShipFeatureComponent, _super);
        function ShipFeatureComponent() {
            _super.apply(this, arguments);
        }
        ShipFeatureComponent.prototype.syncComponent = function () {
            if (_super.prototype.syncComponent.call(this)) {
                var gameWorld = this.host.world;
                if (gameWorld && gameWorld.state) {
                    var gameState = gameWorld.state.model;
                    var location = gameState.getKeyData('shipPosition');
                    if (location) {
                        this.host.setPoint(new pow2.Point(location.x, location.y));
                    }
                }
            }
            return false;
        };
        ShipFeatureComponent.prototype.enter = function (object) {
            if (!this.tileMap) {
                return false;
            }
            // Must have a party component to board a ship.  Don't want buildings
            // and NPCs boarding ships... or do we?  [maniacal laugh]
            this.party = object.findComponent(pow2.PlayerComponent);
            if (!this.party) {
                return false;
            }
            this.party.passableKeys = ['shipPassable', 'passable'];
            return true;
        };
        ShipFeatureComponent.prototype.entered = function (object) {
            return this.board(object);
        };
        /**
         * Board an object onto the ship component.  This will modify the
         * @param object
         */
        ShipFeatureComponent.prototype.board = function (object) {
            var _this = this;
            if (this.partyObject || !this.party) {
                return false;
            }
            this.partyObject = object;
            this.partySprite = object.setSprite(this.host.icon);
            this.host.visible = false;
            this.host.enabled = false;
            // If we're moving from shipPassable to passable, disembark the ship.
            this.party.setMoveFilter(function (from, to) {
                var fromTerrain = _this.tileMap.getTerrain("Terrain", from.x, from.y);
                var toTerrain = _this.tileMap.getTerrain("Terrain", to.x, to.y);
                if (!fromTerrain || !toTerrain) {
                    return;
                }
                if (fromTerrain.shipPassable && toTerrain.passable) {
                    _this.disembark(from);
                }
            });
            return true;
        };
        ShipFeatureComponent.prototype.disembark = function (at) {
            this.partyObject.setSprite(this.partySprite);
            this.party.clearMoveFilter();
            this.party.passableKeys = ['passable'];
            this.host.point.set(at || this.partyObject.point);
            this.host.visible = true;
            this.host.enabled = true;
            this.partyObject = null;
            this.party = null;
            var gameWorld = this.host.world;
            if (gameWorld && gameWorld.state && gameWorld.state.model) {
                gameWorld.state.model.setKeyData('shipPosition', this.host.point);
            }
        };
        return ShipFeatureComponent;
    })(pow2.GameFeatureComponent);
    pow2.ShipFeatureComponent = ShipFeatureComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../gameFeatureComponent.ts" />
var pow2;
(function (pow2) {
    var StoreFeatureComponent = (function (_super) {
        __extends(StoreFeatureComponent, _super);
        function StoreFeatureComponent() {
            _super.apply(this, arguments);
        }
        StoreFeatureComponent.prototype.syncComponent = function () {
            var _this = this;
            if (!_super.prototype.syncComponent.call(this)) {
                return false;
            }
            this.name = this.feature.name;
            var weapons = _.indexOf(this.host.groups, "weapon") !== -1;
            if (weapons) {
                this.inventory = _.filter(pow2.data.weapons, function (item) {
                    return item.level === _this.feature.level;
                });
            }
            else if (_.indexOf(this.host.groups, "armor") !== -1) {
                this.inventory = _.filter(pow2.data.armor, function (item) {
                    return item.level === _this.feature.level;
                });
            }
            return true;
        };
        StoreFeatureComponent.prototype.disconnectComponent = function () {
            this.inventory = null;
            return _super.prototype.disconnectComponent.call(this);
        };
        StoreFeatureComponent.prototype.enter = function (object) {
            object.scene.trigger('store:entered', this);
            return true;
        };
        StoreFeatureComponent.prototype.exit = function (object) {
            object.scene.trigger('store:exited', this);
            return true;
        };
        return StoreFeatureComponent;
    })(pow2.GameFeatureComponent);
    pow2.StoreFeatureComponent = StoreFeatureComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../gameFeatureComponent.ts" />
var pow2;
(function (pow2) {
    var TempleFeatureComponent = (function (_super) {
        __extends(TempleFeatureComponent, _super);
        function TempleFeatureComponent() {
            _super.apply(this, arguments);
        }
        TempleFeatureComponent.prototype.syncComponent = function () {
            if (!_super.prototype.syncComponent.call(this)) {
                return false;
            }
            this.name = "Temple";
            this.cost = this.feature.cost;
            this.icon = this.feature.icon;
            return true;
        };
        TempleFeatureComponent.prototype.enter = function (object) {
            object.scene.trigger('temple:entered', this);
            return true;
        };
        TempleFeatureComponent.prototype.exit = function (object) {
            object.scene.trigger('temple:exited', this);
            return true;
        };
        return TempleFeatureComponent;
    })(pow2.GameFeatureComponent);
    pow2.TempleFeatureComponent = TempleFeatureComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../playerComponent.ts" />
/// <reference path="../gameFeatureComponent.ts" />
var pow2;
(function (pow2) {
    var TreasureFeatureComponent = (function (_super) {
        __extends(TreasureFeatureComponent, _super);
        function TreasureFeatureComponent() {
            _super.apply(this, arguments);
        }
        TreasureFeatureComponent.prototype.syncComponent = function () {
            if (!_super.prototype.syncComponent.call(this)) {
                return false;
            }
            this.name = "Treasure Chest";
            this.gold = this.feature.gold;
            this.item = this.feature.item;
            this.icon = this.feature.icon;
            return true;
        };
        TreasureFeatureComponent.prototype.enter = function (object) {
            object.scene.trigger('treasure:entered', this);
            this.setDataHidden(true);
            return true;
        };
        return TreasureFeatureComponent;
    })(pow2.GameFeatureComponent);
    pow2.TreasureFeatureComponent = TreasureFeatureComponent;
})(pow2 || (pow2 = {}));
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
var pow2;
(function (pow2) {
    pow2.COMBAT_ENCOUNTERS = {
        FIXED: "fixed",
        RANDOM: "random"
    };
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../../game/gameTileMap.ts" />
/// <reference path="../../game/components/playerComponent.ts" />
var pow2;
(function (pow2) {
    var CombatCameraComponent = (function (_super) {
        __extends(CombatCameraComponent, _super);
        function CombatCameraComponent() {
            _super.apply(this, arguments);
        }
        CombatCameraComponent.prototype.connectComponent = function () {
            return _super.prototype.connectComponent.call(this) && this.host instanceof pow2.GameTileMap;
        };
        CombatCameraComponent.prototype.process = function (view) {
            if (!this.host) {
                _super.prototype.process.call(this, view);
                return;
            }
            view.cameraScale = view.context.canvas.width > 768 ? 4 : 2;
            view.camera = view.screenToWorld(new pow2.Rect(0, 0, view.context.canvas.width, view.context.canvas.height), view.cameraScale);
            view.camera.point.x = (this.host.bounds.extent.x / 2) - (view.camera.extent.x / 2);
        };
        return CombatCameraComponent;
    })(pow2.CameraComponent);
    pow2.CombatCameraComponent = CombatCameraComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../../tile/tileObject.ts" />
/// <reference path="../../game/components/animatedComponent.ts" />
/// <reference path="../../game/objects/gameEntityObject.ts" />
var pow2;
(function (pow2) {
    var combat;
    (function (combat) {
        (function (StateFrames) {
            StateFrames[StateFrames["DEFAULT"] = 10] = "DEFAULT";
            StateFrames[StateFrames["SWING"] = 1] = "SWING";
            StateFrames[StateFrames["INJURED"] = 2] = "INJURED";
            StateFrames[StateFrames["WALK"] = 3] = "WALK";
            StateFrames[StateFrames["STRIKE"] = 3] = "STRIKE";
            StateFrames[StateFrames["CELEBRATE"] = 4] = "CELEBRATE";
            StateFrames[StateFrames["DEAD"] = 5] = "DEAD";
        })(combat.StateFrames || (combat.StateFrames = {}));
        var StateFrames = combat.StateFrames;
        var PlayerCombatRenderComponent = (function (_super) {
            __extends(PlayerCombatRenderComponent, _super);
            function PlayerCombatRenderComponent() {
                _super.apply(this, arguments);
                this._elapsed = 0;
                this._renderFrame = 3;
                this.state = "";
                this.animating = false;
                this.animator = null;
            }
            PlayerCombatRenderComponent.prototype.syncComponent = function () {
                this.animator = this.host.findComponent(pow2.AnimatedComponent);
                return _super.prototype.syncComponent.call(this);
            };
            PlayerCombatRenderComponent.prototype.tick = function (elapsed) {
                this._elapsed += elapsed;
                if (this._elapsed < this.tickRateMS) {
                    return;
                }
                // Don't subtract elapsed here, but take the modulus so that
                // if for some reason we get a HUGE elapsed, it just does one
                // tick and keeps the remainder toward the next.
                this._elapsed = this._elapsed % this.tickRateMS;
                if (this.host.model) {
                    var health = this.host.model.get('hp');
                    var maxHealth = Math.max(0.01, this.host.model.get('maxHP'));
                    var ratio = health / maxHealth;
                    if (ratio === 0) {
                        this.state = "Dead";
                    }
                    else if (ratio < 0.5) {
                        this.state = "Injured";
                    }
                }
                _super.prototype.tick.call(this, elapsed);
            };
            PlayerCombatRenderComponent.prototype.setState = function (name) {
                if (name === void 0) { name = "Default"; }
                this.state = name;
            };
            PlayerCombatRenderComponent.prototype.attack = function (attackCb, cb) {
                if (!this.animator || this.animating) {
                    return;
                }
                this._attack(attackCb, cb);
            };
            PlayerCombatRenderComponent.prototype.getAttackAnimation = function (strikeCb) {
                var _this = this;
                return [
                    {
                        name: "Move Forward for Attack",
                        repeats: 0,
                        duration: 250,
                        frames: [9, 11, 10],
                        move: new pow2.Point(-1, 0),
                        callback: function () {
                            _this.host.setSprite(_this.host.icon.replace(".png", "-attack.png"), 12);
                        }
                    },
                    {
                        name: "Strike at Opponent",
                        repeats: 1,
                        duration: 100,
                        frames: [12, 13, 14, 15, 14, 13, 12],
                        callback: function () {
                            _this.host.setSprite(_this.host.icon.replace("-attack.png", ".png"), 10);
                            strikeCb && strikeCb();
                        }
                    },
                    {
                        name: "Return to Party",
                        duration: 250,
                        repeats: 0,
                        frames: [10, 11, 9],
                        move: new pow2.Point(1, 0)
                    }
                ];
            };
            PlayerCombatRenderComponent.prototype._attack = function (attackCb, cb) {
                var _this = this;
                var attackAnimation = this.getAttackAnimation(attackCb);
                var animations = _.map(attackAnimation, function (anim) {
                    var result = _.extend({}, anim);
                    if (typeof result.move !== 'undefined') {
                        result.move = result.move.clone();
                    }
                    return result;
                });
                this.animating = true;
                this.animator.playChain(animations, function () {
                    _this.animating = false;
                    cb && cb();
                });
            };
            PlayerCombatRenderComponent.prototype.interpolateTick = function (elapsed) {
                _super.prototype.interpolateTick.call(this, elapsed);
                if (!this.animating) {
                    // Choose frame for interpolated position
                    var factor = this._elapsed / this.tickRateMS;
                    var altFrame = !!((factor > 0.0 && factor < 0.5));
                    var frame = 10 /* DEFAULT */;
                    switch (this.state) {
                        case "Injured":
                            frame = 10 /* DEFAULT */;
                            break;
                        case "Dead":
                            frame = 10 /* DEFAULT */;
                            break;
                        case "Attacking":
                            frame = altFrame ? 3 /* STRIKE */ : 1 /* SWING */;
                            break;
                    }
                    this.host.frame = this._renderFrame = frame;
                }
            };
            return PlayerCombatRenderComponent;
        })(pow2.TickedComponent);
        combat.PlayerCombatRenderComponent = PlayerCombatRenderComponent;
    })(combat = pow2.combat || (pow2.combat = {}));
})(pow2 || (pow2 = {}));
/*
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
/// <reference path="../tile/tileMapView.ts"/>
/// <reference path="./components/combatCameraComponent.ts"/>
/// <reference path="./components/playerCombatRenderComponent.ts"/>
var pow2;
(function (pow2) {
    var GameCombatView = (function (_super) {
        __extends(GameCombatView, _super);
        function GameCombatView(canvas, loader) {
            _super.call(this, canvas, loader);
            this.objectRenderer = new pow2.TileObjectRenderer;
            this.mouse = null;
            this.mouseClick = _.bind(this.mouseClick, this);
        }
        GameCombatView.prototype.onAddToScene = function (scene) {
            this.mouse = scene.world.input.mouseHook(this, "combat");
            this.$el.on('click touchstart', this.mouseClick);
        };
        GameCombatView.prototype.onRemoveFromScene = function (scene) {
            scene.world.input.mouseUnhook("combat");
            this.$el.off('click touchstart', this.mouseClick);
        };
        /*
         * Mouse input
         */
        GameCombatView.prototype.mouseClick = function (e) {
            //console.log("clicked at " + this.mouse.world);
            var hits = [];
            pow2.Input.mouseOnView(e.originalEvent, this.mouse.view, this.mouse);
            if (this.world.combatScene.db.queryPoint(this.mouse.world, pow2.GameEntityObject, hits)) {
                this.world.combatScene.trigger('click', this.mouse, hits);
            }
        };
        /*
         * Update the camera for this frame.
         */
        GameCombatView.prototype.processCamera = function () {
            this.cameraComponent = this.scene.componentByType(pow2.CombatCameraComponent);
            _super.prototype.processCamera.call(this);
        };
        /*
         * Render the tile map, and any features it has.
         */
        GameCombatView.prototype.renderFrame = function (elapsed) {
            var _this = this;
            _super.prototype.renderFrame.call(this, elapsed);
            var players = this.scene.objectsByComponent(pow2.combat.PlayerCombatRenderComponent);
            _.each(players, function (player) {
                _this.objectRenderer.render(player, player, _this);
            });
            var sprites = this.scene.componentsByType(pow2.SpriteComponent);
            _.each(sprites, function (sprite) {
                _this.objectRenderer.render(sprite.host, sprite, _this);
            });
            return this;
        };
        return GameCombatView;
    })(pow2.TileMapView);
    pow2.GameCombatView = GameCombatView;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../game/states/gameCombatState.ts" />
/// <reference path="../../game/components/damageComponent.ts" />
/// <reference path="../components/playerCombatRenderComponent.ts" />
/// <reference path="../gameCombatStateMachine.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
var pow2;
(function (pow2) {
    // Combat Begin
    //--------------------------------------------------------------------------
    var CombatBeginTurnState = (function (_super) {
        __extends(CombatBeginTurnState, _super);
        function CombatBeginTurnState() {
            _super.apply(this, arguments);
            this.name = CombatBeginTurnState.NAME;
            this.transitions = [
                new pow2.CombatEndTurnTransition()
            ];
            this.attacksLeft = 0;
        }
        CombatBeginTurnState.prototype.enter = function (machine) {
            _super.prototype.enter.call(this, machine);
            this.machine = machine;
            machine.currentDone = false;
            this.attacksLeft = 1;
            machine.current.scale = 1.25;
            this.current = machine.current;
            if (machine.current && machine.isFriendlyTurn()) {
                machine.focus = machine.current;
            }
            machine.current.scene.on('click', this.sceneClick, this);
            machine.trigger("combat:beginTurn", machine.current);
            if (!machine.isFriendlyTurn()) {
                this.attack(machine);
            }
        };
        CombatBeginTurnState.prototype.exit = function (machine) {
            this.current.scale = 1;
            machine.current.scene.off('click', this.sceneClick, this);
            _super.prototype.exit.call(this, machine);
        };
        CombatBeginTurnState.prototype.sceneClick = function (mouse, hits) {
            if (this.machine) {
                this.attack(this.machine, hits[0]);
            }
        };
        CombatBeginTurnState.prototype.keyPress = function (machine, keyCode) {
            if (!machine.isFriendlyTurn()) {
                return true;
            }
            switch (keyCode) {
                case 13 /* ENTER */:
                    this.attack(machine);
                    break;
                default:
                    return _super.prototype.keyPress.call(this, machine, keyCode);
            }
            return false;
        };
        CombatBeginTurnState.prototype.attack = function (machine, defender) {
            if (this.attacksLeft <= 0) {
                return;
            }
            this.attacksLeft -= 1;
            //
            var attacker = null;
            if (machine.isFriendlyTurn()) {
                attacker = machine.current;
                defender = defender || machine.getRandomEnemy();
            }
            else {
                attacker = machine.current;
                defender = defender || machine.getRandomPartyMember();
            }
            var attackerPlayer = attacker.findComponent(pow2.combat.PlayerCombatRenderComponent);
            var attack = function () {
                var damage = attacker.model.attack(defender.model);
                var didKill = defender.model.get('hp') <= 0;
                var hit = damage > 0;
                var hitSound = "/data/sounds/" + (didKill ? "killed" : (hit ? "hit" : "miss"));
                var defenderSprite = defender.findComponent(pow2.SpriteComponent);
                var components = {
                    animation: new pow2.AnimatedSpriteComponent({
                        spriteName: "attack",
                        lengthMS: 350
                    }),
                    sprite: new pow2.SpriteComponent({
                        name: "attack",
                        icon: hit ? "animHit.png" : "animMiss.png"
                    }),
                    damage: new pow2.DamageComponent(),
                    sound: new pow2.SoundComponent({
                        url: hitSound,
                        volume: 0.3
                    })
                };
                var animDamage = machine.isFriendlyTurn() && !!defenderSprite;
                if (animDamage) {
                    defenderSprite.frame = 1;
                }
                if (!!attackerPlayer) {
                    attackerPlayer.setState("Moving");
                }
                defender.addComponentDictionary(components);
                machine.currentDone = true;
                machine.trigger("combat:attack", damage, attacker, defender);
                components.damage.once('damage:done', function () {
                    if (!!attackerPlayer) {
                        attackerPlayer.setState();
                    }
                    if (didKill && defender.model instanceof pow2.CreatureModel) {
                        defender.destroy();
                    }
                    if (animDamage) {
                        _.delay(function () {
                            defenderSprite.frame = 0;
                        }, 500);
                    }
                    defender.removeComponentDictionary(components);
                });
            };
            if (!!attackerPlayer) {
                attackerPlayer.attack(attack);
            }
            else {
                _.delay(function () {
                    attack();
                }, 1000);
            }
        };
        CombatBeginTurnState.NAME = "Combat Begin Turn";
        return CombatBeginTurnState;
    })(pow2.CombatState);
    pow2.CombatBeginTurnState = CombatBeginTurnState;
    // Combat Transitions
    //--------------------------------------------------------------------------
    var CombatBeginTurnTransition = (function (_super) {
        __extends(CombatBeginTurnTransition, _super);
        function CombatBeginTurnTransition() {
            _super.apply(this, arguments);
            this.targetState = CombatBeginTurnState.NAME;
        }
        CombatBeginTurnTransition.prototype.evaluate = function (machine) {
            return _super.prototype.evaluate.call(this, machine) && machine.current !== null && machine.currentDone === true;
        };
        return CombatBeginTurnTransition;
    })(pow2.StateTransition);
    pow2.CombatBeginTurnTransition = CombatBeginTurnTransition;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../game/states/gameCombatState.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
var pow2;
(function (pow2) {
    var CombatDefeatState = (function (_super) {
        __extends(CombatDefeatState, _super);
        function CombatDefeatState() {
            _super.apply(this, arguments);
            this.name = CombatDefeatState.NAME;
        }
        CombatDefeatState.prototype.enter = function (machine) {
            _super.prototype.enter.call(this, machine);
            console.log("SORRY BRO, YOU LOSE.");
            // callback(winner,loser);
            machine.trigger("combat:defeat", machine.enemies, machine.party);
            machine.update(this);
        };
        CombatDefeatState.prototype.update = function (machine) {
            machine.parent.setCurrentState(pow2.GameMapState.NAME);
        };
        CombatDefeatState.NAME = "Combat Defeat";
        return CombatDefeatState;
    })(pow2.CombatState);
    pow2.CombatDefeatState = CombatDefeatState;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../game/states/gameCombatState.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
var pow2;
(function (pow2) {
    var CombatEndTurnState = (function (_super) {
        __extends(CombatEndTurnState, _super);
        function CombatEndTurnState() {
            _super.apply(this, arguments);
            this.name = CombatEndTurnState.NAME;
            this.transitions = [
                new pow2.CombatCompletedTransition(),
                new pow2.CombatStartTransition(),
                new pow2.CombatBeginTurnTransition()
            ];
        }
        CombatEndTurnState.prototype.enter = function (machine) {
            _super.prototype.enter.call(this, machine);
            machine.current = null;
            while (machine.turnList.length > 0 && !machine.current) {
                machine.current = machine.turnList.shift();
                // Strip out defeated players.
                if (machine.current && machine.current.isDefeated()) {
                    machine.current = null;
                }
            }
            machine.update(this);
        };
        CombatEndTurnState.NAME = "Combat End Turn";
        return CombatEndTurnState;
    })(pow2.CombatState);
    pow2.CombatEndTurnState = CombatEndTurnState;
    // Combat Transitions
    //--------------------------------------------------------------------------
    var CombatEndTurnTransition = (function (_super) {
        __extends(CombatEndTurnTransition, _super);
        function CombatEndTurnTransition() {
            _super.apply(this, arguments);
            this.targetState = CombatEndTurnState.NAME;
        }
        CombatEndTurnTransition.prototype.evaluate = function (machine) {
            return _super.prototype.evaluate.call(this, machine) && machine.currentDone === true;
        };
        return CombatEndTurnTransition;
    })(pow2.StateTransition);
    pow2.CombatEndTurnTransition = CombatEndTurnTransition;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../game/states/gameCombatState.ts" />
/// <reference path="../gameCombatStateMachine.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
var pow2;
(function (pow2) {
    // Combat Begin
    //--------------------------------------------------------------------------
    var CombatStartState = (function (_super) {
        __extends(CombatStartState, _super);
        function CombatStartState() {
            _super.apply(this, arguments);
            this.name = CombatStartState.NAME;
            this.transitions = [
                new pow2.CombatBeginTurnTransition()
            ];
        }
        CombatStartState.prototype.enter = function (machine) {
            _super.prototype.enter.call(this, machine);
            machine.turnList = _.shuffle(_.union(machine.getLiveParty(), machine.getLiveEnemies()));
            machine.current = machine.turnList.shift();
            machine.currentDone = true;
            machine.update(this);
        };
        CombatStartState.NAME = "Combat Started";
        return CombatStartState;
    })(pow2.CombatState);
    pow2.CombatStartState = CombatStartState;
    // Combat Transitions
    //--------------------------------------------------------------------------
    var CombatStartTransition = (function (_super) {
        __extends(CombatStartTransition, _super);
        function CombatStartTransition() {
            _super.apply(this, arguments);
            this.targetState = CombatStartState.NAME;
        }
        CombatStartTransition.prototype.evaluate = function (machine) {
            return _super.prototype.evaluate.call(this, machine) && machine.currentDone === true && machine.turnList.length === 0 && machine.current === null;
        };
        return CombatStartTransition;
    })(pow2.StateTransition);
    pow2.CombatStartTransition = CombatStartTransition;
    var CombatCompletedTransition = (function (_super) {
        __extends(CombatCompletedTransition, _super);
        function CombatCompletedTransition() {
            _super.apply(this, arguments);
            this.targetState = "";
        }
        CombatCompletedTransition.prototype.evaluate = function (machine) {
            if (!_super.prototype.evaluate.call(this, machine)) {
                return false;
            }
            if (machine.partyDefeated()) {
                this.targetState = pow2.CombatDefeatState.NAME;
                return true;
            }
            if (machine.enemiesDefeated()) {
                this.targetState = pow2.CombatVictoryState.NAME;
                return true;
            }
            return false;
        };
        return CombatCompletedTransition;
    })(pow2.StateTransition);
    pow2.CombatCompletedTransition = CombatCompletedTransition;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../game/states/gameCombatState.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
var pow2;
(function (pow2) {
    var CombatVictoryState = (function (_super) {
        __extends(CombatVictoryState, _super);
        function CombatVictoryState() {
            _super.apply(this, arguments);
            this.name = CombatVictoryState.NAME;
        }
        CombatVictoryState.prototype.enter = function (machine) {
            _super.prototype.enter.call(this, machine);
            var gold = 0;
            var exp = 0;
            _.each(machine.enemies, function (nme) {
                gold += nme.model.get('gold') || 0;
                exp += nme.model.get('exp') || 0;
            });
            machine.parent.model.addGold(gold);
            var players = _.reject(machine.party, function (p) {
                return p.isDefeated();
            });
            var expPerParty = Math.round(exp / players.length);
            var leveledHeros = [];
            _.each(players, function (p) {
                var heroModel = p.model;
                var leveled = heroModel.awardExperience(expPerParty);
                if (leveled) {
                    leveledHeros.push(heroModel);
                }
            });
            var summary = {
                state: this,
                party: machine.party,
                enemies: machine.enemies,
                levels: leveledHeros,
                gold: gold,
                exp: exp
            };
            machine.trigger("combat:victory", summary);
        };
        CombatVictoryState.prototype.update = function (machine) {
            machine.parent.setCurrentState(pow2.GameMapState.NAME);
        };
        CombatVictoryState.NAME = "Combat Victory";
        return CombatVictoryState;
    })(pow2.CombatState);
    pow2.CombatVictoryState = CombatVictoryState;
})(pow2 || (pow2 = {}));
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
/// <reference path="../../tile/tileComponent.ts" />
/// <reference path="../../game/objects/gameEntityObject.ts" />
var pow2;
(function (pow2) {
    /**
     * A component that defines the functionality of a map feature.
     */
    var CombatEncounterComponent = (function (_super) {
        __extends(CombatEncounterComponent, _super);
        function CombatEncounterComponent() {
            _super.apply(this, arguments);
            this.combatFlag = false;
            this.combatZone = 'default';
            this.isDangerous = false;
            this.world = pow2.getWorld('pow2');
            this.player = null;
        }
        CombatEncounterComponent.prototype.connectComponent = function () {
            if (!_super.prototype.connectComponent.call(this) || !(this.host instanceof pow2.GameTileMap)) {
                return false;
            }
            this.battleCounter = this.world.model.getKeyData('battleCounter');
            if (typeof this.battleCounter === 'undefined') {
                this.resetBattleCounter();
            }
            return true;
        };
        CombatEncounterComponent.prototype.disconnectComponent = function () {
            if (this.player) {
                this.player.off(null, null, this);
            }
            this.player = null;
            return _super.prototype.disconnectComponent.call(this);
        };
        CombatEncounterComponent.prototype.syncComponent = function () {
            _super.prototype.syncComponent.call(this);
            if (this.player) {
                this.player.off(null, null, this);
            }
            this.player = this.scene.objectByComponent(pow2.PlayerComponent);
            if (this.player) {
                this.player.on('move:begin', this.moveProcess, this);
            }
            return !!this.player;
        };
        CombatEncounterComponent.prototype.moveProcess = function (player, from, to) {
            var terrain = this.host.getTerrain("Terrain", to.x, to.y);
            this.isDangerous = terrain && terrain.isDangerous;
            var dangerValue = this.isDangerous ? 10 : 6;
            if (this.battleCounter <= 0) {
                this.triggerCombat(to);
            }
            this._setCounter(this.battleCounter - dangerValue);
            return false;
        };
        CombatEncounterComponent.prototype.resetBattleCounter = function () {
            var max = 255;
            var min = 64;
            this._setCounter(Math.floor(Math.random() * (max - min + 1)) + min);
            this.combatFlag = false;
        };
        CombatEncounterComponent.prototype.triggerCombat = function (at) {
            var zones = this.host.getCombatZones(at);
            this.combatZone = zones.map || zones.target;
            console.log("Combat in zone : " + this.combatZone);
            this.host.world.randomEncounter(zones);
            this.host.trigger('combat:encounter', this);
            this.resetBattleCounter();
            this.combatFlag = true;
        };
        CombatEncounterComponent.prototype._setCounter = function (value) {
            this.battleCounter = value;
            this.world.model.setKeyData('battleCounter', this.battleCounter);
        };
        return CombatEncounterComponent;
    })(pow2.SceneComponent);
    pow2.CombatEncounterComponent = CombatEncounterComponent;
})(pow2 || (pow2 = {}));
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
/// <reference path="../playerCombatRenderComponent.ts" />
var pow2;
(function (pow2) {
    var combat;
    (function (combat) {
        var MageCombatRenderComponent = (function (_super) {
            __extends(MageCombatRenderComponent, _super);
            function MageCombatRenderComponent() {
                _super.apply(this, arguments);
            }
            MageCombatRenderComponent.prototype.getAttackAnimation = function (strikeCb) {
                var _this = this;
                return [
                    {
                        name: "Prep Animation",
                        callback: function () {
                            _this.host.setSprite(_this.host.icon.replace(".png", "-magic.png"), 19);
                        }
                    },
                    {
                        name: "Magic cast",
                        repeats: 0,
                        duration: 1000,
                        frames: [19, 18, 17, 16, 15],
                        callback: function () {
                            strikeCb && strikeCb();
                        }
                    },
                    {
                        name: "Back to rest",
                        repeats: 0,
                        duration: 1000,
                        frames: [15, 16, 17, 18, 19],
                        callback: function () {
                            _this.host.setSprite(_this.host.icon.replace("-magic.png", ".png"), 10);
                        }
                    }
                ];
            };
            return MageCombatRenderComponent;
        })(combat.PlayerCombatRenderComponent);
        combat.MageCombatRenderComponent = MageCombatRenderComponent;
    })(combat = pow2.combat || (pow2.combat = {}));
})(pow2 || (pow2 = {}));
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
/// <reference path="../playerCombatRenderComponent.ts" />
var pow2;
(function (pow2) {
    var combat;
    (function (combat) {
        var WarriorCombatRenderComponent = (function (_super) {
            __extends(WarriorCombatRenderComponent, _super);
            function WarriorCombatRenderComponent() {
                _super.apply(this, arguments);
            }
            WarriorCombatRenderComponent.prototype.getAttackAnimation = function (strikeCb) {
                var _this = this;
                return [
                    {
                        name: "Move Forward for Attack",
                        repeats: 0,
                        duration: 250,
                        frames: [9, 11, 10],
                        move: new pow2.Point(-1, 0),
                        callback: function () {
                            _this.host.setSprite(_this.host.icon.replace(".png", "-attack.png"), 12);
                        }
                    },
                    {
                        name: "Strike at Opponent",
                        repeats: 1,
                        duration: 100,
                        frames: [12, 13, 14, 15, 14, 13, 12],
                        callback: function () {
                            _this.host.setSprite(_this.host.icon.replace("-attack.png", ".png"), 10);
                            strikeCb && strikeCb();
                        }
                    },
                    {
                        name: "Return to Party",
                        duration: 250,
                        repeats: 0,
                        frames: [10, 11, 9],
                        move: new pow2.Point(1, 0)
                    }
                ];
            };
            return WarriorCombatRenderComponent;
        })(combat.PlayerCombatRenderComponent);
        combat.WarriorCombatRenderComponent = WarriorCombatRenderComponent;
    })(combat = pow2.combat || (pow2.combat = {}));
})(pow2 || (pow2 = {}));
//# sourceMappingURL=pow2.game.js.map