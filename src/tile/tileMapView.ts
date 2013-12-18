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

/// <reference path="../scene/sceneObject.ts"/>
/// <reference path="./tileObject.ts"/>
/// <reference path="./tileMap.ts"/>

module eburp{
    export class TileMapView extends SceneView {
        screenOverlays:any[] = [];
        renderer:any = null;
        overlayPattern:any = null;
        tracking:any = null; // TODO: MovableTileObject
        tileMap:TileMap = null;
        constructor(canvas, loader){
            super(canvas,loader);
            this.renderer = new eburp["TileObjectRenderer"];
        }

        /**
         * Set the camera to track a given object.
         */
        trackObject(tileObject) {
            this.tracking = tileObject;
        }

        /**
         * Determine if a feature should be rendered.
         */
        featureVisible(feature) {
            return true;
        }

        /**
         * Determine if a tile should be rendered at a given point.
         */
        // TODO: Should be point
        tileVisible(x, y) {
            return true;
        }

        /**
         * Update the camera for this frame.
         */
        processCamera() {
            super.processCamera();
            this.cameraScale = Math.round(this.cameraScale);
            if (this.tracking && this.tracking instanceof eburp.TileObject) {
                this.camera.setCenter(this.tracking.renderPoint || this.tracking.point);
            }
            return this;
        }

        /**
         * Get the camera clip rectangle.
         * @returns {eburp.Rect}
         */
        getCameraClip() {
            var clipGrow, clipRect;
            if (!this.tileMap) {
                return this.camera;
            }
            clipGrow = this.camera.clone().round();
            clipRect = clipGrow.clip(this.tileMap.bounds);
            clipRect.round();
            return clipRect;
        }

        /**
         * Set the pre-render canvas state.
         */
        setRenderState() {
            var worldCameraPos, worldTilePos;
            super.setRenderState();
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
        }

        /**
         * Render the tile map, and any features it has.
         */
        renderFrame(elapsed) {
            var clipRect, tile, x, y, _i, _j, _ref, _ref1, _ref2, _ref3;
            this.fillColor();
            if (!this.tileMap) {
                return;
            }
            clipRect = this.getCameraClip();
            for (x = _i = _ref = clipRect.point.x, _ref1 = clipRect.getRight(); _ref <= _ref1 ? _i < _ref1 : _i > _ref1; x = _ref <= _ref1 ? ++_i : --_i) {
                for (y = _j = _ref2 = clipRect.point.y, _ref3 = clipRect.getBottom(); _ref2 <= _ref3 ? _j < _ref3 : _j > _ref3; y = _ref2 <= _ref3 ? ++_j : --_j) {
                    tile = this.tileMap.getTerrainIcon(x, y);
                    if (tile && this.tileVisible(x, y)) {
                        this.drawTile(tile, x, y);
                    }
                }
            }
            this.renderFeatures(clipRect);
            this.renderObjects(clipRect, elapsed);
            return this;
        }

        /**
         * Render the TileObjects in the scene.
         */
        renderObjects(clipRect, elapsed) {
            var objects, player,
                _this = this;
            objects = this.scene.objectsByType(eburp.TileFeatureObject);
            _.each(objects, function(object) {
                return _this.renderer.render(object, _this);
            });
            player = this.scene.objectsByType(eburp["MovableTileObject"]); // TODO
            if (player.length > 0) {
                this.renderer.render(player[0], this);
            }
            return this;
        }

        /**
         * Render the analog joystick for touch inputs.
         */
        renderAnalog() {
            var screenCamera, touch, touchCurrent, touchStart, _i, _len, _ref;
            if (!this.world || !this.world.input) {
                return;
            }
            var inputAny:any = this.world.input;
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
        }

        /**
         * Draw any post-rendering effects.
         */
        renderPost() {
            var overlay, _ref;
            if (!this.camera || !this.context || !this.tileMap) {
                return;
            }
            this.renderAnalog();
            overlay = this.getScreenOverlay();
            if (!overlay) {
                return;
            }
            if ((_ref = this.overlayPattern) == null) {
                this.overlayPattern = this.context.createPattern(overlay, 'repeat');
            }
            return this.fillTiles(overlay, this.overlayPattern, this.getCameraClip());
        }

        /**
         * Render legacy features (supports old Gurk game usage)
         * TODO: Remove.
         */
        renderFeatures(clipRect) {
            var feature, _i, _len, _ref;
            if (window["App"] && this.tileMap.map.features) {
                _ref = this.tileMap.map.features;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    feature = _ref[_i];
                    if (!clipRect.pointInRect(feature.x, feature.y)) {
                        continue;
                    }
                    if (!this.featureVisible(feature)) {
                        continue;
                    }
                    if (feature.icon) {
                        this.drawTile(feature.icon, feature.x, feature.y);
                    }
                    if (feature.image) {
                        this.drawImage(feature.image, feature.x, feature.y);
                    }
                }
            }
            return this;
        }

        /**
         * Render Tile debug information.
         */
        debugRender(debugStrings: string[] = []) {
            var clipRect, player, screenClip, tile, tiles, x, y, _i, _j, _ref, _ref1, _ref2, _ref3,
                _this = this;
            if (debugStrings == null) {
                debugStrings = [];
            }
            debugStrings.push("Camera: (" + this.camera.point.x + "," + this.camera.point.y + ")");
            player = this.scene.objectsByType(eburp["MovableTileObject"]);
            if (player.length > 0) {
                debugStrings.push("Player: (" + player[0].point.x + "," + player[0].point.y + ")");
            }
            clipRect = this.getCameraClip();
            debugStrings.push("Clip: (" + clipRect.point.x + "," + clipRect.point.y + ") (" + clipRect.extent.x + "," + clipRect.extent.y + ")");
            this.context.strokeStyle = "#FF2222";
            screenClip = this.worldToScreen(clipRect);
            this.context.strokeRect(screenClip.point.x, screenClip.point.y, screenClip.extent.x, screenClip.extent.y);
            for (x = _i = _ref = clipRect.point.x, _ref1 = clipRect.getRight(); _ref <= _ref1 ? _i < _ref1 : _i > _ref1; x = _ref <= _ref1 ? ++_i : --_i) {
                for (y = _j = _ref2 = clipRect.point.y, _ref3 = clipRect.getBottom(); _ref2 <= _ref3 ? _j < _ref3 : _j > _ref3; y = _ref2 <= _ref3 ? ++_j : --_j) {
                    tile = this.tileMap.getTerrain(x, y);
                    if (tile && !tile.passable) {
                        this.context.strokeStyle = "#FF2222";
                        this.context.strokeRect(x * this.unitSize * this.cameraScale, y * this.unitSize * this.cameraScale, this.cameraScale * this.unitSize, this.cameraScale * this.unitSize);
                    }
                }
            }
            tiles = this.scene.objectsByType(eburp.TileObject);
            _.each(tiles, function(object:any) {
                var point;
                _this.context.strokeStyle = "#2222FF";
                point = object.renderPoint || object.point;
                return _this.context.strokeRect(point.x * _this.unitSize * _this.cameraScale, point.y * _this.unitSize * _this.cameraScale, _this.cameraScale * _this.unitSize, _this.cameraScale * _this.unitSize);
            });
            return super.debugRender(debugStrings);
        }

        /**
         * Get the screen overlay texture that is desired.
         */
        getScreenOverlay():HTMLImageElement {
            var i, _i;
            if (this.world.sprites && this.screenOverlays.length === 0) {
                for (i = _i = 1; _i <= 5; i = ++_i) {
                    // TODO: Sanity check this
                    var overlay = this.world.sprites.getSingleSprite("screen" + i + ".png").data;
                    this.screenOverlays.push(overlay);
                }
            }
            return this.screenOverlays[3];
        }

        /**
         * Asynchronous sprite resource validation.
         */
        private _validateImage(name) {
            var desc, image;
            desc = eburp.data.sprites[name];
            if (!desc) {
                throw new Error("Missing sprite data for: " + name);
            }
            image = this.getSpriteSheet(desc.source);
            if (!image) {
                throw new Error("Missing image from source: " + desc.source);
            }
            return image.isReady();
        }


        // Tile Rendering Utilities
        // -----------------------------------------------------------------------------
        // These utilities are for the old game rendering flow, and should probably
        // be deprecated in favor of SceneObjectRender subclasses that render objects
        // of a given type in a self-contained manner.

        drawTile(icon, pointOrX, yOrScale?, scale?) {
            var desc, dstH, dstW, dstX, dstY, image, srcH, srcW, srcX, srcY, x, y;
            if (scale == null) {
                scale = 1.0;
            }
            if (!this._validateImage(icon)) {
                return;
            }
            if (pointOrX instanceof eburp.Point) {
                x = pointOrX.x;
                y = pointOrX.y;
                scale = yOrScale || 1.0;
            } else {
                x = pointOrX;
                y = yOrScale;
            }
            desc = eburp.data.sprites[icon];
            image = this.getSpriteSheet(desc.source);
            if (!image || !image.isReady()) {
                return;
            }
            srcX = desc.x;
            srcY = desc.y;
            srcW = srcH = this.unitSize;
            dstX = x * this.unitSize * this.cameraScale * scale;
            dstY = y * this.unitSize * this.cameraScale * scale;
            dstW = dstH = this.unitSize * this.cameraScale * scale;
            if (scale !== 1.0) {
                dstX += (dstW * scale) / 4;
                dstY += (dstH * scale) / 4;
            }
            this.context.drawImage(image.data, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
        }

        /**
         * Draw a `@unitSize` sized sprite, but stretched to fill a custom
         * destination width and height.
         */
        drawTileStretch(icon, x, y, width, height) {
            var desc, dstH, dstW, dstX, dstY, image;
            if (!this._validateImage(icon)) {
                return;
            }
            desc = eburp.data.sprites[icon];
            image = this.getSpriteSheet(desc.source);
            if (!image || !image.isReady()) {
                return;
            }
            dstX = x * this.unitSize * this.cameraScale;
            dstY = y * this.unitSize * this.cameraScale;
            dstW = width * this.unitSize * this.cameraScale;
            dstH = height * this.unitSize * this.cameraScale;
            this.context.drawImage(image.data, desc.x, desc.y, this.unitSize, this.unitSize, dstX, dstY, dstW, dstH);
        }

        drawImage(image, x, y, width?, height?) {
            var dstH, dstW, dstX, dstY;
            if (width == null) {
                width = this.unitSize;
            }
            if (height == null) {
                height = this.unitSize;
            }
            dstX = x * this.unitSize * this.cameraScale;
            dstY = y * this.unitSize * this.cameraScale;
            dstW = dstH = this.unitSize * this.cameraScale;
            this.context.drawImage(image, 0, 0, width, height, dstX, dstY, dstW, dstH);
        }

        /**
         * Draw an image that has been altered by the `eburp.ImageProcessor` class.
         *
         * The ImageProcessor pads out images by 2 pixels on all sides, for a
         * total of 4 along x and y axes.  Because of this we render the image
         * 2 pixels to the up and left and an extra 4 on the extents.
         */
        drawCustom(image, x, y) {
            var dstH, dstW, dstX, dstY, shift;
            dstX = x * this.unitSize * this.cameraScale;
            dstY = y * this.unitSize * this.cameraScale;
            dstW = dstH = (this.unitSize + 4) * this.cameraScale;
            shift = 2 * this.cameraScale;
            this.context.drawImage(image, 0, 0, this.unitSize + 4, this.unitSize + 4, dstX - shift, dstY - shift, dstW, dstH);
        }

        drawPixel(color, x, y) {
            if (!this.context) {
                return;
            }
            this.context.fillStyle = color;
            this.context.fillRect(x * this.cameraScale, y * this.cameraScale, this.cameraScale, this.cameraScale);
        }

        fillImage(image) {
            var renderPos;
            renderPos = this.worldToScreen(this.camera.point, this.cameraScale);
            return this.context.drawImage(image, renderPos.x, renderPos.y, this.$el.width(), this.$el.height());
        }

        fillTiles(image, pattern, rect) {
            var fillSave, renderPos;
            if (rect == null) {
                rect = this.camera;
            }
            renderPos = this.worldToScreen(rect, this.cameraScale);
            fillSave = this.context.fillStyle;
            this.context.fillStyle = pattern;
            this.context.fillRect(renderPos.point.x, renderPos.point.y, renderPos.extent.x, renderPos.extent.y);
            return this.context.fillStyle = fillSave;
        }

        drawAnim(anim, x, y, frame) {
            var desc, dstH, dstW, dstX, dstY, image, srcX, srcY;
            if (!this._validateImage(anim)) {
                return;
            }
            desc = eburp.data.sprites[anim];
            image = this.getSpriteSheet(desc.source);
            srcX = desc.x + (frame * this.unitSize);
            srcY = desc.y;
            dstX = x * this.unitSize * this.cameraScale;
            dstY = y * this.unitSize * this.cameraScale;
            dstW = dstH = this.unitSize * this.cameraScale;
            this.context.drawImage(image.data, srcX, srcY, this.unitSize, this.unitSize, dstX, dstY, dstW, dstH);
        }

        drawCustomAnim(custom, x, y) {
            this.context.drawImage(custom, (x - 2) * this.cameraScale, (y - 2) * this.cameraScale);
        }

    }
}
