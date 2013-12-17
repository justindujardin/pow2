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
/// <reference path="../typedef/jquery/jquery.d.ts" />
/// <reference path="../core/rect.ts" />
/// <reference path="../core/point.ts" />

// A view that renders a `Scene`.
//
// You should probably only have one of these per Canvas that you render to.
module eburp {
    export class SceneView {
        static UNIT: number = 16;

        animations: any[];
        id: string;
        $el: JQuery;
        canvas:HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        camera: eburp.Rect;
        cameraScale: number;
        unitSize: number;
        _sheets: any;
        scene: any; // TODO: typedef
        loader: any; // TODO: typedef

        constructor(canvas: HTMLCanvasElement, loader: any) {
            this.animations = [];
            this.id = _.uniqueId('view');
            this.canvas = canvas;
            if (!canvas) {
                throw new Error("A Canvas is required");
            }
            this.$el = $(canvas);
            this.context = canvas.getContext("2d");
            if (!this.context) {
                throw new Error("Could not retrieve Canvas context");
            }
            var contextAny: any = this.context;
            contextAny.webkitImageSmoothingEnabled = false;
            contextAny.mozImageSmoothingEnabled = false;
            this.camera = new eburp.Rect(0, 0, 9, 9);
            this.cameraScale = 1.0;
            this.unitSize = SceneView.UNIT;
            this._sheets = {};
            this.loader = loader;
        }

        // Scene rendering interfaces
        // -----------------------------------------------------------------------------

        // Render a frame. Subclass this to do your specific rendering.
        renderFrame(elapsed: number) {
        }

        // Render post effects
        renderPost() {
        }

        // Set the render state for this scene view.
        setRenderState(): boolean {
            if (!this.context) {
                return false;
            }
            this.context.save();
            return true;
        }

        // Restore the render state to what it was before a call to setRenderState.
        restoreRenderState(): boolean {
            if (!this.context) {
                return false;
            }
            this.context.restore();
            return true;
        }

        // Public render invocation.
        render() {
            this._render(0);
        }

        // Render the scene
        _render(elapsed: number) {
            this.processCamera();
            this.setRenderState();
            this.renderFrame(elapsed);
            this.renderAnimations();
            this.renderPost();
            if (this.scene && this.scene.options.debugRender) {
                this.debugRender();
            }
            return this.restoreRenderState();
        }

        // Do any debug rendering for this view.
        debugRender(debugStrings: string[] = []): boolean {
            if (!this.context) {
                return false;
            }
            var fontSize = 16;
            debugStrings.push("MSPF: " + this.scene.mspf);
            debugStrings.push("FPS:  " + this.scene.fps.toFixed(0));
            // MSPF/FPS Counter debug
            this.context.save();
            this.context.font = "bold " + fontSize + "px Arial";
            var renderPos = this.worldToScreen(this.camera.point);
            var x = renderPos.x + 20;
            var y = renderPos.y + 40;
            var i:number;
            for (i = 0; i < debugStrings.length; ++i) {
                this.context.fillStyle = "rgba(0,0,0,0.8)";
                this.context.fillText(<string>debugStrings[i], x + 2, y + 2);
                this.context.fillStyle = "rgba(255,255,255,1)";
                this.context.fillText(<string>debugStrings[i], x, y);
                y += fontSize;
            }
            this.context.restore();

            return true;
        }

        getSpriteSheet(name: string, done) { // TODO: typedef (callback)
            if (!this._sheets[name]) {
                this._sheets[name] = this.loader.load("/images/" + name + ".png", done);
            }
            return this._sheets[name];
        }

        // Scene Camera updates
        // -----------------------------------------------------------------------------
        processCamera() {
            this.cameraScale = this.screenToWorld(this.context.canvas.width) / this.camera.extent.x;
            return this;
        }

        // Scene rendering utilities
        // -----------------------------------------------------------------------------

        // Clear the canvas context with a color
        fillColor(color: string = "rgb(0,0,0)"): boolean {
            if (!this.context || !this.context.canvas) {
                return false;
            }
            this.context.fillStyle = color;
            var x, y, renderPos;
            x = y = 0;
            if (this.camera) {
                renderPos = this.worldToScreen(this.camera.point);
                x = renderPos.x;
                y = renderPos.y;
            }
            this.context.fillRect(x, y, this.context.canvas.width, this.context.canvas.height);
            return true;
        }

        clearRect() {
            var renderPos, x, y;
            x = y = 0;
            if (this.camera) {
                renderPos = this.worldToScreen(this.camera.point);
                x = renderPos.x;
                y = renderPos.y;
            }
            return this.context.clearRect(x, y, this.context.canvas.width, this.context.canvas.height);
        }

        // Coordinate Conversions (World/Screen)
        // -----------------------------------------------------------------------------

        // Convert a Rect/Point/Number from world coordinates (game units) to
        // screen coordinates (pixels)
        worldToScreen(value: eburp.Point, scale?): eburp.Point;

        worldToScreen(value: eburp.Rect, scale?): eburp.Rect;

        worldToScreen(value: number, scale?): number;

        worldToScreen(value: any, scale = this.cameraScale): any {
            if (value instanceof eburp.Rect) {
                return new eburp.Rect(value).scale(this.unitSize * scale);
            } else if (value instanceof eburp.Point) {
                return new eburp.Point(value).multiply(this.unitSize * scale);
            }
            return value * (this.unitSize * scale);
        }

        // Convert a Rect/Point/Number from screen coordinates (pixels) to
        // game world coordinates (game unit sizes)
        screenToWorld(value: eburp.Point, scale?): eburp.Point;

        screenToWorld(value: eburp.Rect, scale?): eburp.Rect;

        screenToWorld(value: number, scale?): number;

        screenToWorld(value: any, scale = 1): any {
            if (value instanceof eburp.Rect) {
                return new eburp.Rect(value).scale(1 / (this.unitSize * scale));
            } else if (value instanceof eburp.Point) {
                return new eburp.Point(value).multiply(1 / (this.unitSize * scale));
            }
            return value * (1 / (this.unitSize * scale));
        }

        // Convert a mouse event on the canvas into coordinates that are relative
        // to it, rather than to the DOM.
        canvasMousePosition(event: MouseEvent): eburp.Point {
            var canoffset, x, y;
            canoffset = $(event.currentTarget).offset();
            x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
            y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top);
            return new eburp.Point(x, y);
        }

        // Animations
        // -----------------------------------------------------------------------------
        renderAnimations() {
            var i, len, animation;
            for (i = 0, len = this.animations.length; i < len; i++) {
                animation = this.animations[i];
                animation.done = animation.fn(animation.frame);
                if (this.scene.time >= animation.time) {
                    animation.frame += 1;
                    animation.time = this.scene.time + animation.rate;
                }
            }
            return this.animations = _.filter(this.animations, (a) => {
                return a.done !== true;
            });
        }

        playAnimation(tickRate, animFn) { // TODO: typedef
            if (!this.scene) {
                throw new Error("Cannot queue an animation for a view that has no scene");
            }
            return this.animations.push({
                frame: 0,
                time: this.scene.time + tickRate,
                rate: tickRate,
                fn: animFn
            });
        }
    }
}

