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
///<reference path="../../web/bower/pow-core/lib/pow-core.d.ts"/>
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
///<reference path="../../web/bower/pow-core/lib/pow-core.d.ts"/>
///<reference path="../interfaces/IScene.ts"/>
var pow2;
(function (pow2) {
    /**
     * The Google Spreadsheet ID to load game data from.  This must be a published
     * google spreadsheet key.
     * @type {string} The google spreadsheet ID
     */
    pow2.SPREADSHEET_ID = "1IAQbt_-Zq1BUwRNiJorvt4iPEYb5HmZrpyMOkb-OuJo";
    pow2.data = {
        maps: {},
        sprites: {},
        items: {},
        creatures: [],
        weapons: [],
        armor: []
    };
    /**
     * Register data on the pow2 module.
     * @param {String} key The key to store the value under
     * @param {*} value The value
     */
    function registerData(key, value) {
        pow2.data[key] = value;
    }
    pow2.registerData = registerData;
    function getData(key) {
        return pow2.data[key];
    }
    pow2.getData = getData;
    function registerMap(name, value) {
        pow2.data.maps[name] = value;
    }
    pow2.registerMap = registerMap;
    /**
     * Describe a dictionary of sprites.  This can be use to
     */
    function describeSprites(value) {
        for (var prop in value) {
            if (value.hasOwnProperty(prop)) {
                pow2.data.sprites[prop] = _.extend(pow2.data.sprites[prop] || {}, value[prop]);
            }
        }
    }
    pow2.describeSprites = describeSprites;
    /**
     * Register a dictionary of sprite meta data.  This is for automatically
     * generated sprite sheets, and only defaults to setting information if
     * it has not already been set by a call to describeSprites.
     */
    function registerSprites(name, value) {
        for (var prop in value) {
            if (value.hasOwnProperty(prop)) {
                pow2.data.sprites[prop] = _.defaults(pow2.data.sprites[prop] || {}, value[prop]);
            }
        }
    }
    pow2.registerSprites = registerSprites;
    function getSpriteMeta(name) {
        return pow2.data.sprites[name];
    }
    pow2.getSpriteMeta = getSpriteMeta;
    function registerCreatures(level, creatures) {
        _.each(creatures, function (c) {
            pow2.data.creatures.push(_.extend(c, { level: level }));
        });
    }
    pow2.registerCreatures = registerCreatures;
    function getMap(name) {
        return pow2.data.maps[name];
    }
    pow2.getMap = getMap;
    function getMaps() {
        return pow2.data.maps;
    }
    pow2.getMaps = getMaps;
})(pow2 || (pow2 = {}));
///<reference path="./api.ts"/>
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
    /**
     * Really Janky class to play animations associated with a pow2 sprite.
     *
     * Give it a sprite name `setAnimationSource('ninja-female.png')` and
     * if it has `animations` associated with it from meta data, e.g. `ninja-female.json`
     * those animations will be available to play through this interface.
     *
     * The user has to call `updateTime` on the instance whenever time is
     * incremented.
     *
     * TODO: It's so ugly now.  Make it better.
     */
    var Animator = (function () {
        function Animator() {
            this.interpFrame = 0;
            this.animElapsed = 0;
            this.animDuration = 0;
            this.frames = [0];
            this.sourceMeta = null;
            this.sourceAnims = null;
        }
        Animator.prototype.setAnimationSource = function (spriteName) {
            console.log("Sprite is " + spriteName);
            this.sourceMeta = pow2.getSpriteMeta(spriteName);
            this.sourceAnims = this.sourceMeta.animations;
            this.setAnimation('down');
        };
        Animator.prototype.setAnimation = function (name) {
            if (!this.sourceAnims) {
                throw new Error("Invalid source animations");
            }
            var data = this.sourceAnims[name];
            if (!data) {
                throw new Error("Invalid animation name - " + name);
            }
            this.frames = data.frames;
            this.animDuration = data.duration;
        };
        Animator.prototype.updateTime = function (elapsedMs) {
            this.animElapsed += elapsedMs;
            var factor = this.animElapsed / this.animDuration;
            var index = Math.round(this.interpolate(0, this.frames.length - 1, factor));
            this.interpFrame = this.frames[index];
            if (this.animElapsed > this.animDuration) {
                this.animElapsed = 0;
            }
        };
        Animator.prototype.interpolate = function (from, to, factor) {
            factor = Math.min(Math.max(factor, 0), 1);
            return (from * (1.0 - factor)) + (to * factor);
        };
        Animator.prototype.getFrame = function () {
            return this.interpFrame;
        };
        return Animator;
    })();
    pow2.Animator = Animator;
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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../api.ts" />
// An object that may exist in a `Scene`, has a unique `id` and receives ticked updates.
var pow2;
(function (pow2) {
    var SceneObject = (function (_super) {
        __extends(SceneObject, _super);
        function SceneObject(options) {
            _super.call(this);
            this._uid = _.uniqueId('so');
            this._components = [];
            _.extend(this, _.defaults(options || {}), {
                point: new pow2.Point(0, 0),
                size: new pow2.Point(1, 1),
                enabled: true
            });
        }
        // Tick components.
        SceneObject.prototype.tick = function (elapsed) {
            if (!this.enabled) {
                return;
            }
            var values = this._components;
            var l = this._components.length;
            for (var i = 0; i < l; i++) {
                values[i].tick && values[i].tick(elapsed);
            }
        };
        // Interpolate components.
        SceneObject.prototype.interpolateTick = function (elapsed) {
            if (!this.enabled) {
                return;
            }
            var values = this._components;
            var l = this._components.length;
            for (var i = 0; i < l; i++) {
                values[i].interpolateTick && values[i].interpolateTick(elapsed);
            }
        };
        SceneObject.prototype.destroy = function () {
            _.each(this._components, function (o) {
                o.disconnectComponent();
            });
            if (this.scene) {
                this.scene.removeObject(this, false);
            }
        };
        // ISceneComponentHost implementation
        // -----------------------------------------------------------------------------
        SceneObject.prototype.findComponent = function (type) {
            var values = this._components;
            var l = this._components.length;
            for (var i = 0; i < l; i++) {
                var o = values[i];
                if (o instanceof type) {
                    return o;
                }
            }
            return null;
        };
        SceneObject.prototype.findComponents = function (type) {
            var values = this._components;
            var results = [];
            var l = this._components.length;
            for (var i = 0; i < l; i++) {
                var o = values[i];
                if (o instanceof type) {
                    results.push(o);
                }
            }
            return results;
        };
        SceneObject.prototype.syncComponents = function () {
            var values = this._components;
            var l = this._components.length;
            for (var i = 0; i < l; i++) {
                values[i].syncComponent();
            }
        };
        SceneObject.prototype.addComponent = function (component, silent) {
            if (silent === void 0) { silent = false; }
            if (_.where(this._components, { id: component.id }).length > 0) {
                throw new Error("Component added twice");
            }
            component.host = this;
            if (component.connectComponent() === false) {
                delete component.host;
                console.log("Component " + component.name + " failed to register.");
                return false;
            }
            this._components.push(component);
            if (silent !== true) {
                this.syncComponents();
            }
            return true;
        };
        SceneObject.prototype.addComponentDictionary = function (components, silent) {
            var _this = this;
            var failed = null;
            _.each(components, function (comp, key) {
                if (failed) {
                    return;
                }
                if (!_this.addComponent(comp, true)) {
                    failed = comp;
                }
            });
            if (failed) {
                console.log("Failed to add component set to host. Component " + failed.toString() + " failed to connect to host.");
            }
            else {
                this.syncComponents();
            }
            return !failed;
        };
        SceneObject.prototype.removeComponentDictionary = function (components, silent) {
            var previousCount = this._components.length;
            var removeIds = _.map(components, function (value) {
                return value.id;
            });
            this._components = _.filter(this._components, function (obj) {
                if (_.indexOf(removeIds, obj.id) !== -1) {
                    if (obj.disconnectComponent() === false) {
                        return true;
                    }
                    obj.host = null;
                    return false;
                }
                return true;
            });
            var change = this._components.length === previousCount;
            if (change && silent !== true) {
                this.syncComponents();
            }
            return change;
        };
        SceneObject.prototype.removeComponentByType = function (componentType, silent) {
            if (silent === void 0) { silent = false; }
            var component = this.findComponent(componentType);
            if (!component) {
                return false;
            }
            return this.removeComponent(component);
        };
        SceneObject.prototype.removeComponent = function (component, silent) {
            if (silent === void 0) { silent = false; }
            var previousCount = this._components.length;
            this._components = _.filter(this._components, function (obj) {
                if (obj.id === component.id) {
                    if (obj.disconnectComponent() === false) {
                        return true;
                    }
                    obj.host = null;
                    return false;
                }
                return true;
            });
            var change = this._components.length === previousCount;
            if (change && silent !== true) {
                this.syncComponents();
            }
            return change;
        };
        // Debugging
        // -----------------------------------------------------------------------------
        SceneObject.prototype.toString = function () {
            var ctor = this.constructor;
            var name = this.name;
            if (ctor && ctor.name != "Function") {
                name = ctor.name || (this.toString().match(/function (.+?)\(/) || [, ''])[1];
            }
            _.each(this._components, function (comp) {
                name += ', ' + comp;
            });
            return name;
        };
        return SceneObject;
    })(pow2.Events);
    pow2.SceneObject = SceneObject;
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
/// <reference path="../../../types/jquery/jquery.d.ts" />
/// <reference path="../api.ts" />
/// <reference path="./sceneObject.ts" />
// A view that renders a `Scene`.
//
// You should probably only have one of these per Canvas that you render to.
var pow2;
(function (pow2) {
    var SceneView = (function (_super) {
        __extends(SceneView, _super);
        function SceneView(canvas, loader) {
            _super.call(this);
            this.cameraComponent = null; // TODO: ICameraComponent
            this.scene = null;
            this.loader = null;
            this.animations = [];
            this.canvas = canvas;
            if (!canvas) {
                throw new Error("A Canvas is required");
            }
            this.$el = $(canvas);
            this.context = canvas.getContext("2d");
            if (!this.context) {
                throw new Error("Could not retrieve Canvas context");
            }
            var contextAny = this.context;
            contextAny.webkitImageSmoothingEnabled = false;
            contextAny.mozImageSmoothingEnabled = false;
            this.camera = new pow2.Rect(0, 0, 9, 9);
            this.cameraScale = 1.0;
            this.unitSize = SceneView.UNIT;
            this._sheets = {};
            this.loader = loader;
        }
        // IWorldObject
        // -----------------------------------------------------------------------------
        SceneView.prototype.onAddToWorld = function (world) {
        };
        SceneView.prototype.onRemoveFromWorld = function (world) {
        };
        SceneView.prototype.setScene = function (scene) {
            if (this.scene) {
                this.scene.removeView(this);
            }
            this.scene = scene;
            if (this.scene) {
                this.scene.addView(this);
            }
        };
        // Scene rendering interfaces
        // -----------------------------------------------------------------------------
        SceneView.prototype.renderToCanvas = function (width, height, renderFunction) {
            var buffer = document.createElement('canvas');
            buffer.width = width;
            buffer.height = height;
            var context = buffer.getContext('2d');
            // Disable smoothing for nearest neighbor scaling.
            context.webkitImageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            renderFunction(context);
            return buffer;
        };
        // Render a frame. Subclass this to do your specific rendering.
        SceneView.prototype.renderFrame = function (elapsed) {
        };
        // Render post effects
        SceneView.prototype.renderPost = function () {
        };
        // Set the render state for this scene view.
        SceneView.prototype.setRenderState = function () {
            if (!this.context) {
                return;
            }
            this.context.save();
            this.context.scale(this.cameraScale, this.cameraScale);
        };
        // Restore the render state to what it was before a call to setRenderState.
        SceneView.prototype.restoreRenderState = function () {
            if (!this.context) {
                return false;
            }
            this.context.restore();
            return true;
        };
        // Public render invocation.
        SceneView.prototype.render = function () {
            this._render(0);
        };
        // Render the scene
        SceneView.prototype._render = function (elapsed) {
            this.processCamera();
            this.setRenderState();
            this.renderFrame(elapsed);
            this.renderAnimations();
            this.renderPost();
            this.restoreRenderState();
        };
        // Scene Camera updates
        // -----------------------------------------------------------------------------
        SceneView.prototype.processCamera = function () {
            if (this.cameraComponent) {
                this.cameraComponent.process(this);
            }
        };
        // Scene rendering utilities
        // -----------------------------------------------------------------------------
        SceneView.prototype.clearRect = function () {
            var renderPos, x, y;
            x = y = 0;
            if (this.camera) {
                renderPos = this.worldToScreen(this.camera.point);
                x = renderPos.x;
                y = renderPos.y;
            }
            return this.context.clearRect(x, y, this.context.canvas.width, this.context.canvas.height);
        };
        SceneView.prototype.worldToScreen = function (value, scale) {
            if (scale === void 0) { scale = 1; }
            if (value instanceof pow2.Rect) {
                var result = new pow2.Rect(value);
                result.point.multiply(this.unitSize * scale);
                result.extent.multiply(this.unitSize * scale);
                return result;
            }
            else if (value instanceof pow2.Point) {
                return new pow2.Point(value).multiply(this.unitSize * scale);
            }
            return value * (this.unitSize * scale);
        };
        SceneView.prototype.screenToWorld = function (value, scale) {
            if (scale === void 0) { scale = 1; }
            if (value instanceof pow2.Rect) {
                var result = new pow2.Rect(value);
                result.point.multiply(1 / (this.unitSize * scale));
                result.extent.multiply(1 / (this.unitSize * scale));
                return result;
            }
            else if (value instanceof pow2.Point) {
                return new pow2.Point(value).multiply(1 / (this.unitSize * scale));
            }
            return value * (1 / (this.unitSize * scale));
        };
        // Fast world to screen conversion, for high-volume usage situations.
        // avoid memory allocations.
        SceneView.prototype.fastWorldToScreenPoint = function (value, to, scale) {
            if (scale === void 0) { scale = 1; }
            to.set(value);
            to.multiply(this.unitSize * scale);
            return to;
        };
        SceneView.prototype.fastWorldToScreenRect = function (value, to, scale) {
            if (scale === void 0) { scale = 1; }
            to.set(value);
            to.point.multiply(this.unitSize * scale);
            to.extent.multiply(this.unitSize * scale);
            return to;
        };
        SceneView.prototype.fastWorldToScreenNumber = function (value, scale) {
            if (scale === void 0) { scale = 1; }
            return value * (this.unitSize * scale);
        };
        // Fast screen to world conversion, for high-volume usage situations.
        // avoid memory allocations.
        SceneView.prototype.fastScreenToWorldPoint = function (value, to, scale) {
            if (scale === void 0) { scale = 1; }
            to.set(value);
            to.multiply(1 / (this.unitSize * scale));
            return to;
        };
        SceneView.prototype.fastScreenToWorldRect = function (value, to, scale) {
            if (scale === void 0) { scale = 1; }
            to.set(value);
            to.point.multiply(1 / (this.unitSize * scale));
            to.extent.multiply(1 / (this.unitSize * scale));
            return to;
        };
        SceneView.prototype.fastScreenToWorldNumber = function (value, scale) {
            if (scale === void 0) { scale = 1; }
            return value * (1 / (this.unitSize * scale));
        };
        // Animations
        // -----------------------------------------------------------------------------
        SceneView.prototype.renderAnimations = function () {
            var i, len, animation;
            for (i = 0, len = this.animations.length; i < len; i++) {
                animation = this.animations[i];
                animation.done = animation.fn(animation.frame);
                if (this.scene.time >= animation.time) {
                    animation.frame += 1;
                    animation.time = this.scene.time + animation.rate;
                }
            }
            return this.animations = _.filter(this.animations, function (a) {
                return a.done !== true;
            });
        };
        SceneView.UNIT = 16;
        return SceneView;
    })(pow2.SceneObject);
    pow2.SceneView = SceneView;
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
/// <reference path="./api.ts"/>
/// <reference path="../../types/jquery/jquery.d.ts"/>
/// <reference path="./scene/sceneView.ts"/>
var pow2;
(function (pow2) {
    (function (KeyCode) {
        KeyCode[KeyCode["UP"] = 38] = "UP";
        KeyCode[KeyCode["DOWN"] = 40] = "DOWN";
        KeyCode[KeyCode["LEFT"] = 37] = "LEFT";
        KeyCode[KeyCode["RIGHT"] = 39] = "RIGHT";
        KeyCode[KeyCode["BACKSPACE"] = 8] = "BACKSPACE";
        KeyCode[KeyCode["COMMA"] = 188] = "COMMA";
        KeyCode[KeyCode["DELETE"] = 46] = "DELETE";
        KeyCode[KeyCode["END"] = 35] = "END";
        KeyCode[KeyCode["ENTER"] = 13] = "ENTER";
        KeyCode[KeyCode["ESCAPE"] = 27] = "ESCAPE";
        KeyCode[KeyCode["HOME"] = 36] = "HOME";
        KeyCode[KeyCode["SPACE"] = 32] = "SPACE";
        KeyCode[KeyCode["TAB"] = 9] = "TAB";
    })(pow2.KeyCode || (pow2.KeyCode = {}));
    var KeyCode = pow2.KeyCode;
    var Input = (function () {
        function Input() {
            var _this = this;
            this._keysDown = {};
            this._mouseElements = [];
            window.addEventListener("keydown", function (ev) {
                _this._keysDown[ev.which] = true;
            });
            window.addEventListener('keyup', function (ev) {
                _this._keysDown[ev.which] = false;
            });
            var hooks = this._mouseElements;
            window.addEventListener('mousemove touchmove', function (ev) {
                var l = hooks.length;
                for (var i = 0; i < l; i++) {
                    var hook = hooks[i];
                    if (ev.srcElement === hook.view.canvas) {
                        Input.mouseOnView(ev, hook.view, hook);
                    }
                    else {
                        hook.point.set(-1, -1);
                        hook.world.set(-1, -1);
                    }
                }
            });
        }
        Input.mouseOnView = function (ev, view, coords) {
            var relativeElement = ev.srcElement;
            var touches = ev.touches;
            if (touches && touches.length > 0) {
                ev = touches[0];
            }
            var result = coords || {
                point: new pow2.Point(),
                world: new pow2.Point()
            };
            var canoffset = $(relativeElement).offset();
            var x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
            var y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top);
            result.point.set(x, y);
            // Generate world mouse position
            var worldMouse = view.screenToWorld(result.point, view.cameraScale).add(view.camera.point).round();
            result.world.set(worldMouse.x, worldMouse.y);
            return result;
        };
        Input.prototype.mouseHook = function (view, name) {
            var hooks = _.where(this._mouseElements, { name: name });
            if (hooks.length > 0) {
                return hooks[0];
            }
            var result = {
                name: name,
                view: view,
                point: new pow2.Point(-1, -1),
                world: new pow2.Point(-1, -1)
            };
            this._mouseElements.push(result);
            return result;
        };
        Input.prototype.mouseUnhook = function (nameOrView) {
            this._mouseElements = _.filter(this._mouseElements, function (hook) {
                return hook.name === nameOrView || hook.view._uid === nameOrView._uid;
            });
        };
        Input.prototype.getMouseHook = function (nameOrView) {
            return _.find(this._mouseElements, function (hook) {
                return hook.name === nameOrView || hook.view._uid === nameOrView._uid;
            });
        };
        Input.prototype.keyDown = function (key) {
            return !!this._keysDown[key];
        };
        return Input;
    })();
    pow2.Input = Input;
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
///<reference path="./api.ts"/>
var pow2;
(function (pow2) {
    var SpriteRender = (function () {
        function SpriteRender() {
            this.canvas = null;
            this.context = null;
            // IWorldObject implementation.
            this.world = null;
            this.canvas = document.createElement('canvas');
            this.sizeCanvas(SpriteRender.SIZE, SpriteRender.SIZE);
        }
        SpriteRender.prototype.onAddToWorld = function (world) {
        };
        SpriteRender.prototype.onRemoveFromWorld = function (world) {
        };
        SpriteRender.prototype.sizeCanvas = function (width, height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.context = this.canvas.getContext('2d');
            this.context.webkitImageSmoothingEnabled = false;
            this.context.mozImageSmoothingEnabled = false;
        };
        SpriteRender.prototype.getSpriteSheet = function (name, done) {
            if (this.world) {
                return this.world.loader.load("/images/" + name + ".png", done);
            }
            return null;
        };
        SpriteRender.prototype.getSingleSprite = function (spriteName, frame, done) {
            var _this = this;
            if (frame === void 0) { frame = 0; }
            if (done === void 0) { done = function (result) {
            }; }
            var coords = pow2.data.sprites[spriteName];
            if (!coords) {
                throw new Error("Unable to find sprite by name: " + spriteName);
            }
            return this.getSpriteSheet(coords.source, function (image) {
                var cell = _this.getSpriteRect(spriteName, frame);
                _this.sizeCanvas(cell.extent.x, cell.extent.y);
                _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                _this.context.drawImage(image.data, cell.point.x, cell.point.y, cell.extent.x, cell.extent.y, 0, 0, _this.canvas.width, _this.canvas.height);
                var src = _this.canvas.toDataURL();
                var result = new Image();
                result.src = src;
                result.onload = function () {
                    done && done(result);
                };
                result.onerror = function (err) {
                    done && done(err);
                };
            });
        };
        SpriteRender.prototype.getSpriteRect = function (name, frame) {
            if (frame === void 0) { frame = 0; }
            var c = this.getSpriteMeta(name);
            var cx = c.x;
            var cy = c.y;
            if (c.frames > 1) {
                var sourceWidth = SpriteRender.SIZE;
                var sourceHeight = SpriteRender.SIZE;
                if (c && typeof c.cellWidth !== 'undefined' && typeof c.cellHeight !== 'undefined') {
                    sourceWidth = c.cellWidth;
                    sourceHeight = c.cellHeight;
                }
                var cwidth = c.width / sourceWidth;
                var fx = (frame % (cwidth));
                var fy = Math.floor((frame - fx) / cwidth);
                cx += fx * sourceWidth;
                cy += fy * sourceHeight;
            }
            else {
                sourceWidth = c.width;
                sourceHeight = c.height;
            }
            return new pow2.Rect(cx, cy, sourceWidth, sourceHeight);
        };
        SpriteRender.prototype.getSpriteMeta = function (name) {
            var desc = pow2.data.sprites[name];
            if (!desc) {
                throw new Error("Missing sprite data for: " + name);
            }
            return desc;
        };
        SpriteRender.SIZE = 16;
        return SpriteRender;
    })();
    pow2.SpriteRender = SpriteRender;
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
/// <reference path="./api.ts"/>
/// <reference path="./state.ts" />
var pow2;
(function (pow2) {
    // Implementation
    // -------------------------------------------------------------------------
    var StateMachine = (function (_super) {
        __extends(StateMachine, _super);
        function StateMachine() {
            _super.apply(this, arguments);
            this.defaultState = null;
            this.states = [];
            this._currentState = null;
            this._previousState = null;
            this._newState = false;
        }
        StateMachine.prototype.onAddToWorld = function (world) {
        };
        StateMachine.prototype.onRemoveFromWorld = function (world) {
        };
        StateMachine.prototype.update = function (data) {
            this._newState = false;
            if (this._currentState === null) {
                this.setCurrentState(this.defaultState);
            }
            if (this._currentState !== null) {
                this._currentState.update(this);
            }
            // Didn't transition, make sure previous === current for next tick.
            if (this._newState === false && this._currentState !== null) {
                this._previousState = this._currentState;
            }
        };
        StateMachine.prototype.addState = function (state) {
            this.states.push(state);
        };
        StateMachine.prototype.addStates = function (states) {
            this.states = _.unique(this.states.concat(states));
        };
        StateMachine.prototype.getCurrentState = function () {
            return this._currentState;
        };
        StateMachine.prototype.getCurrentName = function () {
            return this._currentState !== null ? this._currentState.name : null;
        };
        StateMachine.prototype.setCurrentState = function (newState) {
            var state = typeof newState === 'string' ? this.getState(newState) : newState;
            var oldState = this._currentState;
            if (!state) {
                console.error("STATE NOT FOUND: " + newState);
                return false;
            }
            // Already in the desired state.
            if (this._currentState && state.name === this._currentState.name) {
                console.warn("Attempting to set current state to already active state");
                return true;
            }
            this._newState = true;
            this._previousState = this._currentState;
            this._currentState = state;
            // DEBUG:
            //console.log("STATE: " + (!!oldState ? oldState.name : oldState) + " -> " + this._currentState.name);
            if (oldState) {
                this.trigger("exit", oldState, state);
                oldState.exit(this);
            }
            state.enter(this);
            this.trigger("enter", state, oldState);
            return true;
        };
        StateMachine.prototype.getPreviousState = function () {
            return this._previousState;
        };
        StateMachine.prototype.getState = function (name) {
            var state = _.find(this.states, function (s) {
                return s.name === name;
            });
            return state;
        };
        return StateMachine;
    })(pow2.Events);
    pow2.StateMachine = StateMachine;
    /**
     * A state machine that updates with every game tick.
     */
    var TickedStateMachine = (function (_super) {
        __extends(TickedStateMachine, _super);
        function TickedStateMachine() {
            _super.apply(this, arguments);
            this.paused = false;
        }
        TickedStateMachine.prototype.onAddToWorld = function (world) {
            world.time.addObject(this);
        };
        TickedStateMachine.prototype.onRemoveFromWorld = function (world) {
            world.time.removeObject(this);
        };
        TickedStateMachine.prototype.tick = function (elapsed) {
            this.update(elapsed);
        };
        return TickedStateMachine;
    })(StateMachine);
    pow2.TickedStateMachine = TickedStateMachine;
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
/// <reference path="./stateMachine.ts" />
var pow2;
(function (pow2) {
    // Implementation
    // -------------------------------------------------------------------------
    var State = (function () {
        function State() {
            this.transitions = [];
        }
        State.prototype.enter = function (machine) {
        };
        State.prototype.exit = function (machine) {
        };
        State.prototype.update = function (machine) {
            var l = this.transitions.length;
            for (var i = 0; i < l; i++) {
                var t = this.transitions[i];
                if (!t.evaluate(machine)) {
                    continue;
                }
                if (!machine.setCurrentState(t.targetState)) {
                    continue;
                }
                return;
            }
        };
        return State;
    })();
    pow2.State = State;
    var StateTransition = (function () {
        function StateTransition() {
        }
        StateTransition.prototype.evaluate = function (machine) {
            return true;
        };
        return StateTransition;
    })();
    pow2.StateTransition = StateTransition;
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
/// <reference path="../api.ts" />
/// <reference path="../input.ts" />
/// <reference path="../stateMachine.ts" />
/// <reference path="../spriteRender.ts" />
var pow2;
(function (pow2) {
    var SceneWorld = (function (_super) {
        __extends(SceneWorld, _super);
        function SceneWorld(services) {
            _super.call(this, services);
            this.setService('input', new pow2.Input());
            this.setService('sprites', new pow2.SpriteRender());
        }
        return SceneWorld;
    })(pow2.World);
    pow2.SceneWorld = SceneWorld;
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
/// <reference path="../api.ts" />
/// <reference path="../../interfaces/IScene.ts" />
// Very, very simple spatial database.  Because all the game objects have
// an extent of 1 unit, we can just do a point in rect to determine object hits.
var pow2;
(function (pow2) {
    var SceneSpatialDatabase = (function () {
        function SceneSpatialDatabase() {
            this._pointRect = new pow2.Rect(0, 0, 1, 1);
            this._objects = [];
        }
        SceneSpatialDatabase.prototype.addSpatialObject = function (obj) {
            if (obj && obj.point instanceof pow2.Point) {
                this._objects.push(obj);
            }
        };
        SceneSpatialDatabase.prototype.removeSpatialObject = function (obj) {
            this._objects = _.reject(this._objects, function (o) {
                return o._uid === obj._uid;
            });
        };
        SceneSpatialDatabase.prototype.queryPoint = function (point, type, results) {
            this._pointRect.point.set(point);
            return this.queryRect(this._pointRect, type, results);
        };
        SceneSpatialDatabase.prototype.queryRect = function (rect, type, results) {
            var foundAny;
            if (!results) {
                throw new Error("Results array must be provided to query scene spatial database");
            }
            foundAny = false;
            var list = this._objects;
            var i, len, o;
            for (i = 0, len = list.length; i < len; i++) {
                o = list[i];
                if (type && !(o instanceof type)) {
                    continue;
                }
                if (o.enabled === false) {
                    continue;
                }
                if (o.point && rect.pointInRect(o.point)) {
                    results.push(o);
                    foundAny = true;
                }
            }
            return foundAny;
        };
        return SceneSpatialDatabase;
    })();
    pow2.SceneSpatialDatabase = SceneSpatialDatabase;
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
/// <reference path="../api.ts"/>
/// <reference path="./sceneWorld.ts"/>
/// <reference path="./sceneSpatialDatabase.ts"/>
var pow2;
(function (pow2) {
    var Scene = (function (_super) {
        __extends(Scene, _super);
        function Scene(options) {
            if (options === void 0) { options = {}; }
            _super.call(this);
            this.id = _.uniqueId('scene');
            this.db = new pow2.SceneSpatialDatabase;
            this.options = {};
            this._objects = [];
            this._views = [];
            this.world = null;
            this.fps = 0;
            this.time = 0;
            this.paused = false;
            this.options = _.defaults(options || {}, {
                debugRender: false
            });
        }
        Scene.prototype.destroy = function () {
            if (this.world) {
                this.world.erase(this);
            }
            var l = this._objects.length;
            for (var i = 0; i < l; i++) {
                this.removeObject(this._objects[i], true);
            }
            l = this._views.length;
            for (var i = 0; i < l; i++) {
                this.removeView(this._views[i]);
            }
            this.paused = true;
        };
        // IWorldObject
        // -----------------------------------------------------------------------------
        Scene.prototype.onAddToWorld = function (world) {
            world.time.addObject(this);
        };
        Scene.prototype.onRemoveFromWorld = function (world) {
            world.time.removeObject(this);
        };
        // IProcessObject
        // -----------------------------------------------------------------------------
        Scene.prototype.tick = function (elapsed) {
            if (this.paused) {
                return;
            }
            var l = this._objects.length;
            for (var i = 0; i < l; i++) {
                this._objects[i] && this._objects[i].tick(elapsed);
            }
        };
        Scene.prototype.processFrame = function (elapsed) {
            if (this.paused) {
                return;
            }
            this.time = this.world.time.time;
            // Interpolate objects.
            var l = this._objects.length;
            for (var i = 0; i < l; i++) {
                var o = this._objects[i];
                if (o.interpolateTick) {
                    o.interpolateTick(elapsed);
                }
            }
            // Render frame.
            l = this._views.length;
            for (var i = 0; i < l; i++) {
                this._views[i].render(elapsed);
            }
            // Update FPS
            var currFPS = elapsed ? 1000 / elapsed : 0;
            this.fps += (currFPS - this.fps) / 10;
        };
        // Object add/remove helpers.
        // -----------------------------------------------------------------------------
        Scene.prototype.removeIt = function (property, object) {
            var _this = this;
            var removed = false;
            this[property] = _.filter(this[property], function (obj) {
                if (object && obj && obj._uid === object._uid) {
                    _this.db.removeSpatialObject(obj);
                    if (obj.onRemoveFromScene) {
                        obj.onRemoveFromScene(_this);
                    }
                    if (_this.world) {
                        _this.world.erase(obj);
                    }
                    delete obj.scene;
                    removed = true;
                    return false;
                }
                else if (!obj) {
                    return false;
                }
                return true;
            });
            return removed;
        };
        Scene.prototype.addIt = function (property, object) {
            // Remove object from any scene it might already be in.
            if (object.scene) {
                object.scene.removeIt(property, object);
            }
            // Check that we're not adding this twice (though, I suspect the above
            // should make that pretty unlikely)
            if (_.where(this[property], { _uid: object._uid }).length > 0) {
                throw new Error("Object added to scene twice");
            }
            this[property].push(object);
            // Mark it in the scene's world.
            if (this.world) {
                this.world.mark(object);
            }
            // Add to the scene's spatial database
            this.db.addSpatialObject(object);
            // Mark it in this scene, and trigger the onAdd
            object.scene = this;
            if (object.onAddToScene) {
                object.onAddToScene(this);
            }
            return true;
        };
        Scene.prototype.findIt = function (property, object) {
            return _.where(this[property], { _uid: object._uid });
        };
        // View management
        // -----------------------------------------------------------------------------
        Scene.prototype.addView = function (view) {
            return this.addIt('_views', view);
        };
        Scene.prototype.removeView = function (view) {
            return this.removeIt('_views', view);
        };
        Scene.prototype.findView = function (view) {
            return !!this.findIt('_views', view);
        };
        // SceneObject management
        // -----------------------------------------------------------------------------
        Scene.prototype.addObject = function (object) {
            return this.addIt('_objects', object);
        };
        Scene.prototype.removeObject = function (object, destroy) {
            destroy = typeof destroy === 'undefined' ? true : !!destroy;
            var o = object;
            var removed = this.removeIt('_objects', object);
            if (o && destroy && o.destroy) {
                o.destroy();
            }
            return removed;
        };
        Scene.prototype.findObject = function (object) {
            return !!this.findIt('_objects', object);
        };
        Scene.prototype.componentByType = function (type) {
            var values = this._objects;
            var l = this._objects.length;
            for (var i = 0; i < l; i++) {
                var o = values[i];
                var c = o.findComponent(type);
                if (c) {
                    return c;
                }
            }
            return null;
        };
        Scene.prototype.componentsByType = function (type) {
            var values = this._objects;
            var l = this._objects.length;
            var results = [];
            for (var i = 0; i < l; i++) {
                var o = values[i];
                var c = o.findComponents(type);
                if (c) {
                    results = results.concat(c);
                }
            }
            return results;
        };
        Scene.prototype.objectsByName = function (name) {
            var values = this._objects;
            var l = this._objects.length;
            var results = [];
            for (var i = 0; i < l; i++) {
                var o = values[i];
                if (o.name === name) {
                    results.push(o);
                }
            }
            return results;
        };
        Scene.prototype.objectByName = function (name) {
            var values = this._objects;
            var l = this._objects.length;
            for (var i = 0; i < l; i++) {
                var o = values[i];
                if (o.name === name) {
                    return o;
                }
            }
            return null;
        };
        Scene.prototype.objectsByType = function (type) {
            var values = this._objects;
            var l = this._objects.length;
            var results = [];
            for (var i = 0; i < l; i++) {
                var o = values[i];
                if (o instanceof type) {
                    results.push(o);
                }
            }
            return results;
        };
        Scene.prototype.objectByType = function (type) {
            var values = this._objects;
            var l = this._objects.length;
            for (var i = 0; i < l; i++) {
                var o = values[i];
                if (o instanceof type) {
                    return o;
                }
            }
            return null;
        };
        Scene.prototype.objectsByComponent = function (type) {
            var values = this._objects;
            var l = this._objects.length;
            var results = [];
            for (var i = 0; i < l; i++) {
                var o = values[i];
                if (o.findComponent(type)) {
                    results.push(o);
                }
            }
            return results;
        };
        Scene.prototype.objectByComponent = function (type) {
            var values = this._objects;
            var l = this._objects.length;
            for (var i = 0; i < l; i++) {
                var o = values[i];
                if (o.findComponent(type)) {
                    return o;
                }
            }
            return null;
        };
        return Scene;
    })(pow2.Events);
    pow2.Scene = Scene;
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
/// <reference path="../api.ts" />
/// <reference path="./scene.ts" />
var pow2;
(function (pow2) {
    /**
     * Simplest ISceneComponent implementation.  Because Typescript interfaces are compile
     * time constructs, we have to have an actual implementation to instanceof.  For that
     * reason, all SceneComponents should derive this class.
     */
    var SceneComponent = (function (_super) {
        __extends(SceneComponent, _super);
        function SceneComponent(name) {
            if (name === void 0) { name = _.uniqueId('comp'); }
            _super.call(this);
            this.name = name;
            this.id = _.uniqueId('sc');
        }
        SceneComponent.prototype.connectComponent = function () {
            this.scene = this.host.scene;
            return true;
        };
        SceneComponent.prototype.disconnectComponent = function () {
            this.scene = null;
            return true;
        };
        SceneComponent.prototype.syncComponent = function () {
            this.scene = this.host.scene;
            return !!this.scene;
        };
        SceneComponent.prototype.toString = function () {
            var ctor = this.constructor;
            if (ctor && ctor.name != "Function") {
                return ctor.name || (this.toString().match(/function (.+?)\(/) || [, ''])[1];
            }
            else {
                return this.name;
            }
        };
        return SceneComponent;
    })(pow2.Events);
    pow2.SceneComponent = SceneComponent;
    /**
     * A component that supports tick/interpolateTick
     */
    var TickedComponent = (function (_super) {
        __extends(TickedComponent, _super);
        function TickedComponent() {
            _super.apply(this, arguments);
            this.tickRateMS = 300;
        }
        /**
         * Update the component at a tick interval.
         */
        TickedComponent.prototype.tick = function (elapsed) {
        };
        /**
         * Interpolate component state between ticks.
         */
        TickedComponent.prototype.interpolateTick = function (elapsed) {
        };
        return TickedComponent;
    })(SceneComponent);
    pow2.TickedComponent = TickedComponent;
})(pow2 || (pow2 = {}));
/// <reference path="./sceneObject.ts" />
/// <reference path="./sceneView.ts" />
var pow2;
(function (pow2) {
    var SceneObjectRenderer = (function () {
        function SceneObjectRenderer() {
        }
        SceneObjectRenderer.prototype.render = function (object, data, view) {
        };
        return SceneObjectRenderer;
    })();
    pow2.SceneObjectRenderer = SceneObjectRenderer;
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
/// <reference path="../sceneComponent.ts" />
var pow2;
(function (pow2) {
    var CameraComponent = (function (_super) {
        __extends(CameraComponent, _super);
        function CameraComponent() {
            _super.apply(this, arguments);
        }
        CameraComponent.prototype.process = function (view) {
            view.camera.point.set(this.host.point);
            view.cameraScale = view.context.canvas.width > 768 ? 4 : 2;
            var canvasSize = view.screenToWorld(new pow2.Point(view.context.canvas.width, view.context.canvas.height), view.cameraScale);
            view.camera.extent.set(canvasSize);
        };
        return CameraComponent;
    })(pow2.SceneComponent);
    pow2.CameraComponent = CameraComponent;
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
/// <reference path="../sceneObject.ts" />
/// <reference path="../../scene/sceneComponent.ts" />
var pow2;
(function (pow2) {
    var CollisionComponent = (function (_super) {
        __extends(CollisionComponent, _super);
        function CollisionComponent() {
            _super.apply(this, arguments);
            this.collideBox = new pow2.Rect(0, 0, 1, 1);
            this.resultsArray = [];
        }
        CollisionComponent.prototype.collide = function (x, y, type, results) {
            if (type === void 0) { type = pow2.SceneObject; }
            if (results === void 0) { results = []; }
            this.collideBox.point.x = x;
            this.collideBox.point.y = y;
            return this.scene.db.queryRect(this.collideBox, type, results);
        };
        CollisionComponent.prototype.collideFirst = function (x, y, type) {
            if (type === void 0) { type = pow2.SceneObject; }
            this.collideBox.point.x = x;
            this.collideBox.point.y = y;
            this.resultsArray.length = 0;
            var hit = this.scene.db.queryRect(this.collideBox, type, this.resultsArray);
            return hit ? this.resultsArray[0] : null;
        };
        return CollisionComponent;
    })(pow2.SceneComponent);
    pow2.CollisionComponent = CollisionComponent;
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
/// <reference path="./collisionComponent.ts" />
var pow2;
(function (pow2) {
    var MovableComponent = (function (_super) {
        __extends(MovableComponent, _super);
        function MovableComponent() {
            _super.apply(this, arguments);
            this._elapsed = 0;
            this.path = [];
            this.tickRateMS = 250;
            this.velocity = new pow2.Point(0, 0);
            this.workPoint = new pow2.Point(0, 0);
        }
        MovableComponent.prototype.connectComponent = function () {
            this.host.point.round();
            this.targetPoint = this.host.point.clone();
            this.host.renderPoint = this.targetPoint.clone();
            return _super.prototype.connectComponent.call(this);
        };
        MovableComponent.prototype.syncComponent = function () {
            this.collider = this.host.findComponent(pow2.CollisionComponent);
            return _super.prototype.syncComponent.call(this);
        };
        /**
         * Move from one point to another.  Do any custom processing of moves here.
         */
        MovableComponent.prototype.beginMove = function (from, to) {
        };
        MovableComponent.prototype.endMove = function (from, to) {
        };
        MovableComponent.prototype.collideMove = function (x, y, results) {
            if (results === void 0) { results = []; }
            if (!this.collider) {
                return false;
            }
            return this.collider.collide(x, y, pow2.SceneObject, results);
        };
        /**
         * Support for simple movement filtering by other sources.  For example a sibling
         * component may have a different set of actions that should be evaluated when a
         * move happens.  It can use set/clearMoveFilter to accomplish this.
         *
         * TODO: Is there a better pattern I'm missing for component communication?
         */
        MovableComponent.prototype.setMoveFilter = function (filter) {
            this.moveFilter = filter;
        };
        MovableComponent.prototype.clearMoveFilter = function () {
            this.moveFilter = null;
        };
        MovableComponent.prototype.updateVelocity = function () {
            if (!this.scene.world || !this.scene.world.input) {
                return;
            }
            // Touch movement
            var hasCreateTouch = document.createTouch;
            var worldInput = this.scene.world.input;
            if (hasCreateTouch && worldInput.analogVector instanceof pow2.Point) {
                this.velocity.x = 0;
                if (worldInput.analogVector.x < -20) {
                    this.velocity.x -= 1;
                }
                else if (worldInput.analogVector.x > 20) {
                    this.velocity.x += 1;
                }
                this.velocity.y = 0;
                if (worldInput.analogVector.y < -20) {
                    this.velocity.y -= 1;
                }
                else if (worldInput.analogVector.y > 20) {
                    this.velocity.y += 1;
                }
            }
            else {
                // Keyboard input
                this.velocity.x = 0;
                if (worldInput.keyDown(37 /* LEFT */)) {
                    this.velocity.x -= 1;
                }
                if (worldInput.keyDown(39 /* RIGHT */)) {
                    this.velocity.x += 1;
                }
                this.velocity.y = 0;
                if (worldInput.keyDown(38 /* UP */)) {
                    this.velocity.y -= 1;
                }
                if (worldInput.keyDown(40 /* DOWN */)) {
                    this.velocity.y += 1;
                }
            }
        };
        MovableComponent.prototype.interpolateTick = function (elapsed) {
            // Interpolate position based on tickrate and elapsed time
            var factor;
            factor = this._elapsed / this.tickRateMS;
            this.host.renderPoint.set(this.host.point.x, this.host.point.y);
            if (this.velocity.isZero()) {
                return;
            }
            this.host.renderPoint.interpolate(this.host.point, this.targetPoint, factor);
            this.host.renderPoint.x = parseFloat(this.host.renderPoint.x.toFixed(2));
            this.host.renderPoint.y = parseFloat(this.host.renderPoint.y.toFixed(2));
            // console.log("INTERP Vel(#{@velocity.x},#{@velocity.y}) factor(#{factor})")
            // console.log("INTERP From(#{@point.x},#{@point.y}) to (#{@renderPoint.x},#{@renderPoint.y})")
        };
        MovableComponent.prototype.tick = function (elapsed) {
            this._elapsed += elapsed;
            if (this._elapsed < this.tickRateMS) {
                return;
            }
            // Don't subtract elapsed here, but take the modulus so that
            // if for some reason we get a HUGE elapsed, it just does one
            // tick and keeps the remainder toward the next.
            this._elapsed = this._elapsed % this.tickRateMS;
            // Advance the object if it can be advanced.
            //
            // Check that targetPoint != point first, because or else
            // the collision check will see be against the current position.
            if (!this.targetPoint.equal(this.host.point) && !this.collideMove(this.targetPoint.x, this.targetPoint.y)) {
                this.workPoint.set(this.host.point);
                this.host.point.set(this.targetPoint);
                this.endMove(this.workPoint, this.targetPoint);
            }
            // Update Velocity Inputs
            this.updateVelocity();
            this.targetPoint.set(this.host.point);
            var zero = this.velocity.isZero();
            if (zero && this.path.length === 0) {
                return;
            }
            // Zero and have a path, shift the next tile and move there.
            if (zero) {
                var next = this.path.shift();
                this.velocity.set(next.x - this.host.point.x, next.y - this.host.point.y);
            }
            else {
                // Clear path is moving manually.
                this.path.length = 0;
            }
            this.targetPoint.add(this.velocity);
            // Check to see if both axes can advance by simply going to the
            // target point.
            // Determine which axis we can move along
            if (this.velocity.y !== 0 && !this.collideMove(this.host.point.x, this.targetPoint.y)) {
                this.targetPoint.x = this.host.point.x;
            }
            else if (this.velocity.x !== 0 && !this.collideMove(this.targetPoint.x, this.host.point.y)) {
                this.targetPoint.y = this.host.point.y;
            }
            else {
                // Nope, collisions in all directions, just reset the target point
                this.targetPoint.set(this.host.point);
                // If there's a path, it had an invalid move, so clear it.
                this.path.length = 0;
                return;
            }
            // Successful move, do something.
            // BEGIN_MOVE
            var moveFn = this.moveFilter || this.beginMove;
            moveFn.call(this, this.host.point, this.targetPoint);
        };
        return MovableComponent;
    })(pow2.TickedComponent);
    pow2.MovableComponent = MovableComponent;
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
/// <reference path="../sceneComponent.ts" />
var pow2;
(function (pow2) {
    var DEFAULTS = {
        url: null,
        volume: 1,
        loop: false
    };
    var SoundComponent = (function (_super) {
        __extends(SoundComponent, _super);
        function SoundComponent(options) {
            if (options === void 0) { options = DEFAULTS; }
            _super.call(this);
            if (typeof options !== 'undefined') {
                _.extend(this, DEFAULTS, options);
            }
        }
        SoundComponent.prototype.disconnectComponent = function () {
            if (this.audio.isReady()) {
                this.audio.data.pause();
                this.audio.data.currentTime = 0;
            }
            return _super.prototype.disconnectComponent.call(this);
        };
        SoundComponent.prototype.connectComponent = function () {
            var _this = this;
            if (!_super.prototype.connectComponent.call(this) || !this.url) {
                return false;
            }
            if (this.audio && this.audio.isReady()) {
                this.audio.data.currentTime = 0;
                this.audio.data.volume = this.volume;
                return true;
            }
            this.audio = this.scene.world.loader.load(this.url, function () {
                if (_this.audio.isReady()) {
                    _this.audio.data.currentTime = 0;
                    _this.audio.data.volume = _this.volume;
                    _this.audio.data.loop = _this.loop;
                    _this.audio.data.play();
                    _this.audio.data.addEventListener('timeupdate', function () {
                        if (_this.audio.data.currentTime >= _this.audio.data.duration) {
                            if (!_this.loop) {
                                _this.audio.data.pause();
                                _this.trigger("audio:done", _this);
                            }
                            else {
                                _this.trigger("audio:loop", _this);
                            }
                        }
                    });
                }
            });
            return true;
        };
        return SoundComponent;
    })(pow2.SceneComponent);
    pow2.SoundComponent = SoundComponent;
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
/// <reference path="../../state.ts" />
/// <reference path="../sceneComponent.ts" />
var pow2;
(function (pow2) {
    var StateMachineComponent = (function (_super) {
        __extends(StateMachineComponent, _super);
        function StateMachineComponent() {
            _super.apply(this, arguments);
            this.machine = null;
            this.paused = false;
        }
        StateMachineComponent.prototype.tick = function (elapsed) {
            if (this.paused) {
                return;
            }
            if (this.machine) {
                this.machine.update(this);
            }
        };
        return StateMachineComponent;
    })(pow2.TickedComponent);
    pow2.StateMachineComponent = StateMachineComponent;
})(pow2 || (pow2 = {}));
//# sourceMappingURL=pow2.js.map