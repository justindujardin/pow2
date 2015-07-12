/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
///<reference path="../../types/pow-core/pow-core.d.ts"/>
var pow2;
(function (pow2) {
    /**
     * The Google Spreadsheet ID to load game data from.  This must be a published
     * google spreadsheet key.
     * @type {string} The google spreadsheet ID
     */
    pow2.SPREADSHEET_ID = "1IAQbt_-Zq1BUwRNiJorvt4iPEYb5HmZrpyMOkb-OuJo";
    pow2.NAME = "pow2.core";
    /**
     * Specified root path.  Used when loading game asset files, to support cross-domain usage.
     */
    pow2.GAME_ROOT = '';
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
     * Resolve a map name to a valid url in the expected location.
     */
    function getMapUrl(name) {
        if (name.indexOf('.tmx') === -1) {
            return pow2.GAME_ROOT + 'web/maps/' + name + '.tmx';
        }
        return name;
    }
    pow2.getMapUrl = getMapUrl;
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
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
            if (this.sourceMeta) {
                this.sourceAnims = this.sourceMeta.animations;
                this.setAnimation('down');
            }
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
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
            this._pendingState = null;
            this._asyncProcessing = 0;
            this._asyncCurrentCallback = null;
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
            var _this = this;
            var state = typeof newState === 'string' ? this.getState(newState) : newState;
            if (!state) {
                console.error("STATE NOT FOUND: " + newState);
                return false;
            }
            if (this._pendingState !== null && this._pendingState.name !== state.name) {
                console.log("Overwriting pending state (" + this._pendingState.name + ") with (" + state.name + ")");
                this._pendingState = state;
            }
            else if (!this._pendingState) {
                this._pendingState = state;
                _.defer(function () {
                    state = _this._pendingState;
                    _this._pendingState = null;
                    if (!_this._setCurrentState(state)) {
                        console.error("Failed to set state: " + state.name);
                    }
                });
            }
            return true;
        };
        StateMachine.prototype._setCurrentState = function (state) {
            if (!state) {
                return false;
            }
            var oldState = this._currentState;
            // Already in the desired state.
            if (this._currentState && state.name === this._currentState.name) {
                console.warn(this._currentState.name + ": Attempting to set current state to already active state");
                return true;
            }
            this._newState = true;
            this._previousState = this._currentState;
            this._currentState = state;
            // DEBUG:
            if (StateMachine.DEBUG_STATES) {
                console.log("STATE: " + (oldState ? oldState.name : "NULL") + " -> " + this._currentState.name);
            }
            if (oldState) {
                this.trigger(pow2.StateMachine.Events.EXIT, oldState, state);
                oldState.exit(this);
            }
            state.enter(this);
            this.trigger(pow2.StateMachine.Events.ENTER, state, oldState);
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
        /**
         * Notify the game UI of an event, and wait for it to be handled,
         * if there is a handler.
         */
        StateMachine.prototype.notify = function (msg, data, callback) {
            var _this = this;
            if (this._asyncProcessing > 0) {
                throw new Error("TODO: StateMachine cannot handle multiple async UI waits");
            }
            this._asyncCurrentCallback = function () {
                _this._asyncProcessing--;
                if (_this._asyncProcessing <= 0) {
                    callback && callback();
                    _this._asyncProcessing = 0;
                }
            };
            this._asyncProcessing = 0;
            this.trigger(msg, data);
            if (this._asyncProcessing === 0) {
                callback && callback();
            }
        };
        StateMachine.prototype.notifyWait = function () {
            if (!this._asyncCurrentCallback) {
                throw new Error("No valid async callback set!  Perhaps you called this outside of a notify event handler?");
            }
            this._asyncProcessing++;
            return this._asyncCurrentCallback;
        };
        StateMachine.DEBUG_STATES = false;
        StateMachine.Events = {
            ENTER: "enter",
            EXIT: "exit"
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
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
        SpriteRender.getSpriteSheetUrl = function (name) {
            return "images/" + name + ".png";
        };
        SpriteRender.prototype.onAddToWorld = function (world) {
        };
        SpriteRender.prototype.onRemoveFromWorld = function (world) {
        };
        SpriteRender.prototype.sizeCanvas = function (width, height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.context = this.canvas.getContext('2d');
            this.context.msImageSmoothingEnabled = false;
            this.context.imageSmoothingEnabled = false;
            this.context.webkitImageSmoothingEnabled = false;
            this.context.mozImageSmoothingEnabled = false;
        };
        SpriteRender.prototype.getSpriteSheet = function (name, done) {
            if (this.world) {
                return this.world.loader.load(SpriteRender.getSpriteSheetUrl(name), done);
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
            return desc;
        };
        SpriteRender.SIZE = 16;
        return SpriteRender;
    })();
    pow2.SpriteRender = SpriteRender;
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../core/api.ts" />
/// <reference path="../core/input.ts" />
/// <reference path="../core/stateMachine.ts" />
/// <reference path="../core/spriteRender.ts" />
var pow2;
(function (pow2) {
    var scene;
    (function (scene) {
        var SceneWorld = (function (_super) {
            __extends(SceneWorld, _super);
            function SceneWorld(services) {
                services = _.defaults(services || {}, {
                    loader: pow2.ResourceLoader.get()
                });
                _super.call(this, services);
                this.setService('input', new pow2.Input());
                this.setService('sprites', new pow2.SpriteRender());
            }
            return SceneWorld;
        })(pow2.World);
        scene.SceneWorld = SceneWorld;
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
///<reference path="../../types/pow-core/pow-core.d.ts"/>
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../core/api.ts" />
/// <reference path="../interfaces/IScene.ts" />
// Very, very simple spatial database.  Because all the game objects have
// an extent of 1 unit, we can just do a point in rect to determine object hits.
var pow2;
(function (pow2) {
    var scene;
    (function (scene) {
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
        scene.SceneSpatialDatabase = SceneSpatialDatabase;
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../core/api.ts"/>
/// <reference path="./sceneWorld.ts"/>
/// <reference path="./sceneSpatialDatabase.ts"/>
var pow2;
(function (pow2) {
    var scene;
    (function (scene) {
        var Scene = (function (_super) {
            __extends(Scene, _super);
            function Scene(options) {
                if (options === void 0) { options = {}; }
                _super.call(this);
                this.id = _.uniqueId('scene');
                this.db = new scene.SceneSpatialDatabase;
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
            Scene.prototype.getViewOfType = function (type) {
                return _.find(this._views, function (v) {
                    return v instanceof type;
                });
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
        scene.Scene = Scene;
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../core/api.ts" />
/// <reference path="./scene.ts" />
// An object that may exist in a `Scene`, has a unique `id` and receives ticked updates.
var pow2;
(function (pow2) {
    var scene;
    (function (scene_1) {
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
                    if (!values[i]) {
                        throw new Error("Component deleted during tick, use _.defer to delay removal until the callstack unwinds");
                    }
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
                    if (!values[i]) {
                        throw new Error("Component deleted during interpolateTick, use _.defer to delay removal until the callstack unwinds");
                    }
                    values[i].interpolateTick && values[i].interpolateTick(elapsed);
                }
            };
            SceneObject.prototype.destroy = function () {
                _.each(this._components, function (o) {
                    o.disconnectComponent();
                });
                this._components.length = 0;
                if (this.scene) {
                    this.scene.removeObject(this, false);
                }
            };
            SceneObject.prototype.onAddToScene = function (scene) {
                this.syncComponents();
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
            SceneObject.prototype.findComponentByName = function (name) {
                var values = this._components;
                var l = this._components.length;
                for (var i = 0; i < l; i++) {
                    var o = values[i];
                    if (o.name === name) {
                        return o;
                    }
                }
                return null;
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
        scene_1.SceneObject = SceneObject;
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../../types/jquery/jquery.d.ts" />
/// <reference path="../core/api.ts" />
/// <reference path="./sceneObject.ts" />
var pow2;
(function (pow2) {
    var scene;
    (function (scene_2) {
        /**
         * A view that renders a `Scene`.
         *
         * You should probably only have one of these per Canvas that you render to.
         */
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
                var _this = this;
                _.each(this._components, function (o) {
                    o instanceof scene_2.SceneViewComponent && o.renderFrame(_this, elapsed);
                });
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
                var _this = this;
                this.processCamera();
                this.setRenderState();
                _.each(this._components, function (o) {
                    o instanceof scene_2.SceneViewComponent && o.beforeFrame(_this, elapsed);
                });
                this.renderFrame(elapsed);
                this.renderAnimations();
                this.renderPost();
                _.each(this._components, function (o) {
                    o instanceof scene_2.SceneViewComponent && o.afterFrame(_this, elapsed);
                });
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
        })(scene_2.SceneObject);
        scene_2.SceneView = SceneView;
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../scene/sceneView.ts"/>
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
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../core/api.ts" />
/// <reference path="./scene.ts" />
var pow2;
(function (pow2) {
    var scene;
    (function (scene) {
        /**
         * Simplest ISceneComponent implementation.  Because Typescript interfaces are compile
         * time constructs, we have to have an actual implementation to instanceof.  For that
         * reason, all SceneComponents should derive this class.
         */
        var SceneComponent = (function (_super) {
            __extends(SceneComponent, _super);
            function SceneComponent() {
                _super.apply(this, arguments);
                this.id = _.uniqueId('sc');
            }
            SceneComponent.prototype.connectComponent = function () {
                return true;
            };
            SceneComponent.prototype.disconnectComponent = function () {
                return true;
            };
            SceneComponent.prototype.syncComponent = function () {
                return true;
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
        scene.SceneComponent = SceneComponent;
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="./sceneObject.ts" />
/// <reference path="./sceneView.ts" />
var pow2;
(function (pow2) {
    var scene;
    (function (scene) {
        var SceneObjectRenderer = (function () {
            function SceneObjectRenderer() {
            }
            SceneObjectRenderer.prototype.render = function (object, data, view) {
            };
            return SceneObjectRenderer;
        })();
        scene.SceneObjectRenderer = SceneObjectRenderer;
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="./sceneComponent.ts"/>
var pow2;
(function (pow2) {
    var scene;
    (function (scene) {
        /**
         * A component that can be added to a [[SceneView]] to add additional
         * rendering to it.
         */
        var SceneViewComponent = (function (_super) {
            __extends(SceneViewComponent, _super);
            function SceneViewComponent() {
                _super.apply(this, arguments);
            }
            SceneViewComponent.prototype.beforeFrame = function (view, elapsed) {
            };
            SceneViewComponent.prototype.renderFrame = function (view, elapsed) {
            };
            SceneViewComponent.prototype.afterFrame = function (view, elapsed) {
            };
            return SceneViewComponent;
        })(scene.SceneComponent);
        scene.SceneViewComponent = SceneViewComponent;
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
    var scene;
    (function (scene) {
        var components;
        (function (components) {
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
            })(scene.SceneComponent);
            components.CameraComponent = CameraComponent;
        })(components = scene.components || (scene.components = {}));
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../sceneComponent.ts" />
var pow2;
(function (pow2) {
    var scene;
    (function (scene) {
        var components;
        (function (components) {
            var CollisionComponent = (function (_super) {
                __extends(CollisionComponent, _super);
                function CollisionComponent() {
                    _super.apply(this, arguments);
                    this.collideBox = new pow2.Rect(0, 0, 1, 1);
                    this.resultsArray = [];
                }
                CollisionComponent.prototype.collide = function (x, y, type, results) {
                    if (type === void 0) { type = scene.SceneObject; }
                    if (results === void 0) { results = []; }
                    if (!this.host || !this.host.scene) {
                        return false;
                    }
                    this.collideBox.point.x = x;
                    this.collideBox.point.y = y;
                    return this.host.scene.db.queryRect(this.collideBox, type, results);
                };
                CollisionComponent.prototype.collideFirst = function (x, y, type) {
                    if (type === void 0) { type = scene.SceneObject; }
                    if (!this.host || !this.host.scene) {
                        return null;
                    }
                    this.collideBox.point.x = x;
                    this.collideBox.point.y = y;
                    this.resultsArray.length = 0;
                    var hit = this.host.scene.db.queryRect(this.collideBox, type, this.resultsArray);
                    return hit ? this.resultsArray[0] : null;
                };
                return CollisionComponent;
            })(scene.SceneComponent);
            components.CollisionComponent = CollisionComponent;
        })(components = scene.components || (scene.components = {}));
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
    var scene;
    (function (scene) {
        var components;
        (function (components) {
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
            })(scene.SceneComponent);
            components.TickedComponent = TickedComponent;
        })(components = scene.components || (scene.components = {}));
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="./tickedComponent.ts" />
/// <reference path="./collisionComponent.ts" />
var pow2;
(function (pow2) {
    var scene;
    (function (scene) {
        var components;
        (function (components) {
            var MovableComponent = (function (_super) {
                __extends(MovableComponent, _super);
                function MovableComponent() {
                    _super.apply(this, arguments);
                    this._elapsed = 0;
                    this.path = [];
                    this.tickRateMS = 250;
                    this.velocity = new pow2.Point(0, 0);
                    this.workPoint = new pow2.Point(0, 0);
                    this.currentMove = null;
                }
                MovableComponent.prototype.connectComponent = function () {
                    this.host.point.round();
                    this.targetPoint = this.host.point.clone();
                    this.host.renderPoint = this.targetPoint.clone();
                    return _super.prototype.connectComponent.call(this);
                };
                MovableComponent.prototype.syncComponent = function () {
                    this.collider = this.host.findComponent(components.CollisionComponent);
                    return _super.prototype.syncComponent.call(this);
                };
                /**
                 * Called when a new tick of movement begins.
                 * @param move The move that is beginning
                 */
                MovableComponent.prototype.beginMove = function (move) {
                };
                /**
                 * Called when a complete tick of movement occurs.
                 * @param move The move that is now completed.
                 */
                MovableComponent.prototype.completeMove = function (move) {
                };
                MovableComponent.prototype.collideMove = function (x, y, results) {
                    if (results === void 0) { results = []; }
                    if (!this.collider) {
                        return false;
                    }
                    return this.collider.collide(x, y, scene.SceneObject, results);
                };
                MovableComponent.prototype.updateVelocity = function () {
                    if (!this.host.scene || !this.host.scene.world || !this.host.scene.world.input) {
                        return;
                    }
                    var worldInput = this.host.scene.world.input;
                    // Keyboard input
                    this.velocity.x = 0;
                    if (worldInput.keyDown(pow2.KeyCode.LEFT)) {
                        this.velocity.x -= 1;
                    }
                    if (worldInput.keyDown(pow2.KeyCode.RIGHT)) {
                        this.velocity.x += 1;
                    }
                    this.velocity.y = 0;
                    if (worldInput.keyDown(pow2.KeyCode.UP)) {
                        this.velocity.y -= 1;
                    }
                    if (worldInput.keyDown(pow2.KeyCode.DOWN)) {
                        this.velocity.y += 1;
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
                        // Target point is not the current point and there is no collision.
                        this.workPoint.set(this.host.point);
                        this.host.point.set(this.targetPoint);
                        //
                        this.completeMove(this.currentMove);
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
                    this.currentMove = {
                        from: this.host.point.clone(),
                        to: this.targetPoint.clone()
                    };
                    this.beginMove(this.currentMove);
                };
                return MovableComponent;
            })(components.TickedComponent);
            components.MovableComponent = MovableComponent;
        })(components = scene.components || (scene.components = {}));
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
    var scene;
    (function (scene) {
        var components;
        (function (components) {
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
                    this.audio = pow2.ResourceLoader.get().load(this.url, function () {
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
            })(scene.SceneComponent);
            components.SoundComponent = SoundComponent;
        })(components = scene.components || (scene.components = {}));
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../../core/state.ts" />
/// <reference path="../sceneComponent.ts" />
var pow2;
(function (pow2) {
    var scene;
    (function (scene) {
        var components;
        (function (components) {
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
            })(components.TickedComponent);
            components.StateMachineComponent = StateMachineComponent;
        })(components = scene.components || (scene.components = {}));
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../scene/sceneObject.ts" />
var pow2;
(function (pow2) {
    var tile;
    (function (tile) {
        // TODO: TileMap isn't getting added to Spatial DB properly.  Can't query for it!
        // Scene assuming something about the spatial properties on objects?
        var TileMap = (function (_super) {
            __extends(TileMap, _super);
            function TileMap(map) {
                _super.call(this);
                this.tiles = []; // TODO: TilesetProperties
                this.dirtyLayers = false;
                this._loaded = false;
                this.bounds = new pow2.Rect(0, 0, 10, 10);
                this.setMap(map);
            }
            TileMap.prototype.isLoaded = function () {
                return this._loaded;
            };
            TileMap.prototype.loaded = function () {
                this.trigger(pow2.tile.TileMap.Events.LOADED, this);
                if (this.scene) {
                    this.scene.trigger(pow2.tile.TileMap.Events.MAP_LOADED, this);
                }
                this._loaded = true;
            };
            TileMap.prototype.unloaded = function () {
                this.trigger(pow2.tile.TileMap.Events.UNLOADED, this);
                if (this.scene) {
                    this.scene.trigger(pow2.tile.TileMap.Events.MAP_UNLOADED, this);
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
            TileMap.Events = {
                LOADED: "loaded",
                UNLOADED: "unloaded",
                MAP_LOADED: "map:loaded",
                MAP_UNLOADED: "map:unloaded"
            };
            return TileMap;
        })(pow2.scene.SceneObject);
        tile.TileMap = TileMap;
    })(tile = pow2.tile || (pow2.tile = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="./tileMap.ts" />
/// <reference path="../scene/sceneObject.ts" />
/// <reference path="../scene/components/movableComponent.ts" />
var pow2;
(function (pow2) {
    var tile;
    (function (tile) {
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
                var moveComponent = this.findComponent(pow2.scene.components.MovableComponent);
                if (moveComponent) {
                    moveComponent.targetPoint.set(point);
                    moveComponent.path.length = 0;
                }
            };
            /**
             * When added to a scene, resolve a feature icon to a renderable sprite.
             */
            TileObject.prototype.onAddToScene = function (scene) {
                _super.prototype.onAddToScene.call(this, scene);
                if (this.icon) {
                    this.setSprite(this.icon);
                }
                if (!this.tileMap) {
                    this.tileMap = this.scene.objectByType(pow2.tile.TileMap);
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
            TileObject.prototype.getIcon = function () {
                if (this.icon) {
                    return this.icon;
                }
                var spriteComponent = this.findComponent(pow2.tile.components.SpriteComponent);
                if (spriteComponent) {
                    return spriteComponent.icon;
                }
                return null;
            };
            return TileObject;
        })(pow2.scene.SceneObject);
        tile.TileObject = TileObject;
    })(tile = pow2.tile || (pow2.tile = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="./tileObject.ts" />
/// <reference path="./tileMap.ts" />
var pow2;
(function (pow2) {
    var tile;
    (function (tile) {
        var TileComponent = (function (_super) {
            __extends(TileComponent, _super);
            function TileComponent() {
                _super.apply(this, arguments);
            }
            TileComponent.prototype.syncComponent = function () {
                return !!this.host.tileMap && this.host.tileMap instanceof tile.TileMap;
            };
            TileComponent.prototype.disconnectComponent = function () {
                return true;
            };
            TileComponent.prototype.enter = function (object) {
                return true;
            };
            TileComponent.prototype.entered = function (object) {
                this.host.trigger(TileComponent.Events.ENTERED, this);
                this.isEntered = true;
                return true;
            };
            TileComponent.prototype.exit = function (object) {
                return true;
            };
            TileComponent.prototype.exited = function (object) {
                this.host.trigger(TileComponent.Events.EXITED, this);
                this.isEntered = false;
                return true;
            };
            /**
             * Events triggered on host object for enter/exit of
             * tiles.
             */
            TileComponent.Events = {
                ENTERED: "tile:entered",
                EXITED: "tile:exited"
            };
            return TileComponent;
        })(pow2.scene.SceneComponent);
        tile.TileComponent = TileComponent;
    })(tile = pow2.tile || (pow2.tile = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../tileMap.ts" />
/// <reference path="../../scene/components/cameraComponent.ts" />
var pow2;
(function (pow2) {
    var TileMapCameraComponent = (function (_super) {
        __extends(TileMapCameraComponent, _super);
        function TileMapCameraComponent() {
            _super.apply(this, arguments);
        }
        TileMapCameraComponent.prototype.connectComponent = function () {
            return _super.prototype.connectComponent.call(this) && this.host instanceof pow2.tile.TileMap;
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
    })(pow2.scene.components.CameraComponent);
    pow2.TileMapCameraComponent = TileMapCameraComponent;
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../tileMap.ts"/>
/// <reference path="../../scene/sceneObjectRenderer.ts"/>
var pow2;
(function (pow2) {
    var tile;
    (function (tile) {
        var render;
        (function (render) {
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
            })(pow2.scene.SceneObjectRenderer);
            render.TileObjectRenderer = TileObjectRenderer;
        })(render = tile.render || (tile.render = {}));
    })(tile = pow2.tile || (pow2.tile = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../tileObject.ts" />
/// <reference path="../tileMapView.ts" />
/// <reference path="../tileMap.ts" />
var pow2;
(function (pow2) {
    var tile;
    (function (tile) {
        var render;
        (function (render) {
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
                // TODO: only render tiles that are in the clipRect.  This can be expensive at initial
                // load for expansive maps like the Browser Quest tmx.
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
                    if (!this.bufferComplete || this.buffer === null || this.bufferMapName === null || this.bufferMapName !== object.map.url) {
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
                        this.bufferMapName = object.map.url;
                    }
                    var squareScreen = view.fastWorldToScreenNumber(squareUnits);
                    view.fastWorldToScreenRect(view.getCameraClip(), this._clipRect);
                    var cols = this.buffer.length;
                    var rows = this.buffer[0].length;
                    // Unit size is 16px, so rows/columns should be 16*16 for 256px each.
                    for (var col = 0; col < cols; col++) {
                        for (var row = 0; row < rows; row++) {
                            this._renderRect.set(col * squareUnits - 0.5, row * squareUnits - 0.5, squareUnits, squareUnits);
                            view.fastWorldToScreenRect(this._renderRect, this._renderRect);
                            if (!this._renderRect.intersect(this._clipRect)) {
                                continue;
                            }
                            //console.log("Tile " + renderRect.toString())
                            view.context.drawImage(this.buffer[col][row], 
                            // From source
                            0, 0, squareSize, squareSize, 
                            // Scaled to camera
                            this._renderRect.point.x, this._renderRect.point.y, squareScreen, squareScreen);
                        }
                    }
                };
                return TileMapRenderer;
            })(pow2.scene.SceneObjectRenderer);
            render.TileMapRenderer = TileMapRenderer;
        })(render = tile.render || (tile.render = {}));
    })(tile = pow2.tile || (pow2.tile = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="./tileObject.ts"/>
/// <reference path="./tileMap.ts"/>
/// <reference path="./components/tileMapCameraComponent.ts"/>
/// <reference path="./render/tileObjectRenderer.ts"/>
/// <reference path="./render/tileMapRenderer.ts"/>
var pow2;
(function (pow2) {
    var tile;
    (function (tile) {
        var TileMapView = (function (_super) {
            __extends(TileMapView, _super);
            function TileMapView() {
                _super.apply(this, arguments);
                this.objectRenderer = new pow2.tile.render.TileObjectRenderer;
                this.mapRenderer = new pow2.tile.render.TileMapRenderer;
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
             * Update the camera for this frame.
             */
            TileMapView.prototype.processCamera = function () {
                this.cameraComponent = this.findComponent(pow2.scene.components.CameraComponent);
                if (!this.cameraComponent && this.tileMap) {
                    this.cameraComponent = this.tileMap.findComponent(pow2.scene.components.CameraComponent);
                }
                if (!this.cameraComponent) {
                    this.cameraComponent = this.scene.componentByType(pow2.scene.components.CameraComponent);
                }
                _super.prototype.processCamera.call(this);
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
            };
            return TileMapView;
        })(pow2.scene.SceneView);
        tile.TileMapView = TileMapView;
    })(tile = pow2.tile || (pow2.tile = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../tileObject.ts" />
var pow2;
(function (pow2) {
    var tile;
    (function (tile) {
        var components;
        (function (components) {
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
                SpriteComponent.prototype.syncComponent = function () {
                    if (this.host.world) {
                        this.setSprite(this.icon, this.frame);
                    }
                    return _super.prototype.syncComponent.call(this);
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
            })(pow2.scene.SceneComponent);
            components.SpriteComponent = SpriteComponent;
        })(components = tile.components || (tile.components = {}));
    })(tile = pow2.tile || (pow2.tile = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="./spriteComponent.ts" />
var pow2;
(function (pow2) {
    var tile;
    (function (tile) {
        var components;
        (function (components) {
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
                    var sprites = this.host.findComponents(components.SpriteComponent);
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
            })(pow2.scene.components.TickedComponent);
            components.AnimatedSpriteComponent = AnimatedSpriteComponent;
        })(components = tile.components || (tile.components = {}));
    })(tile = pow2.tile || (pow2.tile = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../tileComponent.ts" />
var pow2;
(function (pow2) {
    var tile;
    (function (tile) {
        var components;
        (function (components) {
            /**
             * A component that can calculate A-star paths.
             */
            var PathComponent = (function (_super) {
                __extends(PathComponent, _super);
                function PathComponent(tileMap) {
                    _super.call(this);
                    this.tileMap = tileMap;
                    this._graph = null; // Astar graph object
                }
                PathComponent.prototype.connectComponent = function () {
                    return _super.prototype.connectComponent.call(this) && !!this.tileMap;
                };
                PathComponent.prototype.syncComponent = function () {
                    this.tileMap.off(pow2.tile.TileMap.Events.LOADED, this._updateGraph, this);
                    this.tileMap.on(pow2.tile.TileMap.Events.LOADED, this._updateGraph, this);
                    return _super.prototype.syncComponent.call(this);
                };
                PathComponent.prototype.disconnectComponent = function () {
                    this.tileMap.off(pow2.tile.TileMap.Events.LOADED, this._updateGraph, this);
                    this._graph = null;
                    return _super.prototype.disconnectComponent.call(this);
                };
                PathComponent.prototype._updateGraph = function () {
                    this._graph = new Graph(this.buildWeightedGraph());
                };
                /**
                 * Build a two-dimensional graph of numbers that represent the map
                 * to find paths on.  The higher the value at an index, the more
                 * difficult it is to traverse.
                 *
                 * A grid might look like this:
                 *
                 *     [5,5,1,5]
                 *     [1,1,1,5]
                 *     [5,5,5,5]
                 *
                 */
                PathComponent.prototype.buildWeightedGraph = function () {
                    return [[]];
                };
                /**
                 * Calculate the best path from one point to another in the current
                 * A* graph.
                 */
                PathComponent.prototype.calculatePath = function (from, to) {
                    if (!this._graph) {
                        this._updateGraph();
                    }
                    if (!this._graph || !this._graph.nodes) {
                        throw new Error("Invalid AStar graph");
                    }
                    // Treat out of range errors as non-critical, and just
                    // return an empty array.
                    if (from.x >= this._graph.nodes.length || from.x < 0) {
                        return [];
                    }
                    if (from.y >= this._graph.nodes[from.x].length) {
                        return [];
                    }
                    if (to.x >= this._graph.nodes.length || to.x < 0) {
                        return [];
                    }
                    if (to.y >= this._graph.nodes[to.x].length) {
                        return [];
                    }
                    var start = this._graph.nodes[from.x][from.y];
                    var end = this._graph.nodes[to.x][to.y];
                    var result = astar.search(this._graph.nodes, start, end);
                    return _.map(result, function (graphNode) {
                        return new pow2.Point(graphNode.pos.x, graphNode.pos.y);
                    });
                };
                return PathComponent;
            })(pow2.tile.TileComponent);
            components.PathComponent = PathComponent;
        })(components = tile.components || (tile.components = {}));
    })(tile = pow2.tile || (pow2.tile = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../tile/tileMapView.ts" />
var pow2;
(function (pow2) {
    var game;
    (function (game) {
        var GameMapView = (function (_super) {
            __extends(GameMapView, _super);
            function GameMapView(canvas, loader) {
                _super.call(this, canvas, loader);
                this.objectRenderer = new pow2.tile.render.TileObjectRenderer;
                this.mouse = null;
                /**
                 * The fill color to use when rendering a path target.
                 */
                this.targetFill = "rgba(10,255,10,0.3)";
                /**
                 * The stroke to use when outlining path target.
                 */
                this.targetStroke = "rgba(10,255,10,0.3)";
                /**
                 * Line width for the path target stroke.
                 */
                this.targetStrokeWidth = 1.5;
                this._players = null;
                this._playerRenders = null;
                this._sprites = null;
                this._movers = null;
                this._renderables = [];
                this.mouseClick = _.bind(this.mouseClick, this);
            }
            GameMapView.prototype.onAddToScene = function (scene) {
                this.clearCache();
                _super.prototype.onAddToScene.call(this, scene);
                this.mouse = scene.world.input.mouseHook(this, "world");
                // TODO: Move this elsewhere.
                this.$el.on('click touchstart', this.mouseClick);
                this.scene.on(pow2.tile.TileMap.Events.MAP_LOADED, this.syncComponents, this);
            };
            GameMapView.prototype.onRemoveFromScene = function (scene) {
                this.clearCache();
                scene.world.input.mouseUnhook("world");
                this.$el.off('click', this.mouseClick);
                this.scene.off(pow2.tile.TileMap.Events.MAP_LOADED, this.syncComponents, this);
            };
            /*
             * Mouse input
             */
            GameMapView.prototype.mouseClick = function (e) {
                var pathComponent = this.scene.componentByType(pow2.tile.components.PathComponent);
                var playerComponent = this.scene.componentByType(pow2.scene.components.PlayerComponent);
                if (pathComponent && playerComponent) {
                    pow2.Input.mouseOnView(e.originalEvent, this.mouse.view, this.mouse);
                    playerComponent.path = pathComponent.calculatePath(playerComponent.targetPoint, this.mouse.world);
                    e.preventDefault();
                    return false;
                }
            };
            GameMapView.prototype.syncComponents = function () {
                _super.prototype.syncComponents.call(this);
                this.clearCache();
            };
            GameMapView.prototype.clearCache = function () {
                this._players = null;
                this._playerRenders = null;
                this._sprites = null;
                this._movers = null;
                this._renderables = [];
            };
            /*
             * Render the tile map, and any features it has.
             */
            GameMapView.prototype.renderFrame = function (elapsed) {
                _super.prototype.renderFrame.call(this, elapsed);
                if (!this._playerRenders) {
                    this._playerRenders = this.scene.objectsByComponent(pow2.game.components.PlayerRenderComponent);
                    this._renderables = this._renderables.concat(this._playerRenders);
                }
                if (!this._players) {
                    this._players = this.scene.objectsByComponent(pow2.scene.components.PlayerComponent);
                    this._renderables = this._renderables.concat(this._players);
                }
                if (!this._sprites) {
                    this._sprites = this.scene.componentsByType(pow2.tile.components.SpriteComponent);
                    this._renderables = this._renderables.concat(this._sprites);
                }
                var l = this._renderables.length;
                for (var i = 0; i < l; i++) {
                    var renderObj = this._renderables[i];
                    this.objectRenderer.render(renderObj, renderObj, this);
                }
                if (!this._movers) {
                    this._movers = this.scene.componentsByType(pow2.scene.components.MovableComponent);
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
                        this.context.fillStyle = this.targetFill;
                        this.context.fillRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);
                        this.context.strokeStyle = this.targetStroke;
                        this.context.lineWidth = this.targetStrokeWidth;
                        this.context.strokeRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);
                        this.context.restore();
                    }
                }
                return this;
            };
            return GameMapView;
        })(pow2.tile.TileMapView);
        game.GameMapView = GameMapView;
    })(game = pow2.game || (pow2.game = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
var pow2;
(function (pow2) {
    var game;
    (function (game) {
        var components;
        (function (components) {
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
            })(pow2.scene.components.TickedComponent);
            components.AnimatedComponent = AnimatedComponent;
        })(components = game.components || (game.components = {}));
    })(game = pow2.game || (pow2.game = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../../tile/components/pathComponent.ts" />
var pow2;
(function (pow2) {
    var game;
    (function (game) {
        var components;
        (function (components) {
            /**
             * Build Astar paths with GameFeatureObject tilemaps.
             */
            var GameMapPathComponent = (function (_super) {
                __extends(GameMapPathComponent, _super);
                function GameMapPathComponent() {
                    _super.apply(this, arguments);
                }
                GameMapPathComponent.prototype.buildWeightedGraph = function () {
                    var _this = this;
                    var layers = this.tileMap.getLayers();
                    var l = layers.length;
                    var grid = new Array(this.tileMap.bounds.extent.x);
                    for (var x = 0; x < this.tileMap.bounds.extent.x; x++) {
                        grid[x] = new Array(this.tileMap.bounds.extent.y);
                    }
                    for (var x = 0; x < this.tileMap.bounds.extent.x; x++) {
                        for (var y = 0; y < this.tileMap.bounds.extent.y; y++) {
                            // Tile Weights, the higher the value the more avoided the
                            // tile will be in output paths.
                            // 10   - neutral path, can walk, don't particularly care for it.
                            // 1    - desired path, can walk and tend toward it over netural.
                            // 1000 - blocked path, can't walk, avoid at all costs.
                            var weight = 10;
                            var blocked = false;
                            for (var i = 0; i < l; i++) {
                                // If there is no metadata continue
                                var terrain = this.tileMap.getTileData(layers[i], x, y);
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
                    _.each(this.tileMap.features.objects, function (o) {
                        var obj = o.properties;
                        if (!obj) {
                            return;
                        }
                        var collideTypes = pow2.scene.components.PlayerComponent.COLLIDE_TYPES;
                        if (obj.passable === true || !obj.type) {
                            return;
                        }
                        if (_.indexOf(collideTypes, obj.type) !== -1) {
                            var x = o.x / o.width | 0;
                            var y = o.y / o.height | 0;
                            if (!obj.passable && _this.tileMap.bounds.pointInRect(x, y)) {
                                grid[x][y] = 100;
                            }
                        }
                    });
                    return grid;
                };
                return GameMapPathComponent;
            })(pow2.tile.components.PathComponent);
            components.GameMapPathComponent = GameMapPathComponent;
        })(components = game.components || (game.components = {}));
    })(game = pow2.game || (pow2.game = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
var pow2;
(function (pow2) {
    var game;
    (function (game) {
        var components;
        (function (components) {
            (function (MoveFrames) {
                MoveFrames[MoveFrames["LEFT"] = 10] = "LEFT";
                MoveFrames[MoveFrames["RIGHT"] = 4] = "RIGHT";
                MoveFrames[MoveFrames["DOWN"] = 7] = "DOWN";
                MoveFrames[MoveFrames["UP"] = 1] = "UP";
                MoveFrames[MoveFrames["LEFTALT"] = 11] = "LEFTALT";
                MoveFrames[MoveFrames["RIGHTALT"] = 5] = "RIGHTALT";
                MoveFrames[MoveFrames["DOWNALT"] = 8] = "DOWNALT";
                MoveFrames[MoveFrames["UPALT"] = 2] = "UPALT";
            })(components.MoveFrames || (components.MoveFrames = {}));
            var MoveFrames = components.MoveFrames;
            // The order here maps to the first four frames in MoveFrames above.
            // It matters, don't change without care.
            (function (Headings) {
                Headings[Headings["WEST"] = 0] = "WEST";
                Headings[Headings["EAST"] = 1] = "EAST";
                Headings[Headings["SOUTH"] = 2] = "SOUTH";
                Headings[Headings["NORTH"] = 3] = "NORTH";
            })(components.Headings || (components.Headings = {}));
            var Headings = components.Headings;
            var PlayerRenderComponent = (function (_super) {
                __extends(PlayerRenderComponent, _super);
                function PlayerRenderComponent() {
                    _super.apply(this, arguments);
                    this._animator = new pow2.Animator();
                    this.heading = Headings.WEST;
                    this.animating = false;
                }
                PlayerRenderComponent.prototype.setHeading = function (direction, animating) {
                    if (!this._animator.sourceAnims) {
                        this._animator.setAnimationSource(this.host.icon);
                    }
                    this.heading = direction;
                    switch (this.heading) {
                        case Headings.SOUTH:
                            this._animator.setAnimation('down');
                            break;
                        case Headings.NORTH:
                            this._animator.setAnimation('up');
                            break;
                        case Headings.EAST:
                            this._animator.setAnimation('right');
                            break;
                        case Headings.WEST:
                            this._animator.setAnimation('left');
                            break;
                    }
                    this._animator.updateTime(0);
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
            })(pow2.scene.components.TickedComponent);
            components.PlayerRenderComponent = PlayerRenderComponent;
        })(components = game.components || (game.components = {}));
    })(game = pow2.game || (pow2.game = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="./playerRenderComponent.ts" />
var pow2;
(function (pow2) {
    var scene;
    (function (scene) {
        var components;
        (function (components) {
            var PlayerComponent = (function (_super) {
                __extends(PlayerComponent, _super);
                function PlayerComponent() {
                    _super.apply(this, arguments);
                    this.passableKeys = ['passable'];
                    this._lastFrame = 3;
                    this._renderFrame = 3;
                    this.heading = new pow2.Point(0, -1);
                    this.sprite = null;
                    this.collideComponentType = pow2.tile.TileComponent;
                }
                PlayerComponent.prototype.syncComponent = function () {
                    this.sprite = this.host.findComponent(pow2.game.components.PlayerRenderComponent);
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
                        this.sprite.setHeading(pow2.game.components.Headings.SOUTH, yMove);
                        this.heading.set(0, 1);
                    }
                    else if (this.velocity.y < 0 && yMove) {
                        this.sprite.setHeading(pow2.game.components.Headings.NORTH, yMove);
                        this.heading.set(0, -1);
                    }
                    else if (this.velocity.x < 0 && xMove) {
                        this.sprite.setHeading(pow2.game.components.Headings.WEST, xMove);
                        this.heading.set(-1, 0);
                    }
                    else if (this.velocity.x > 0 && xMove) {
                        this.sprite.setHeading(pow2.game.components.Headings.EAST, xMove);
                        this.heading.set(1, 0);
                    }
                    else {
                        if (this.velocity.y > 0) {
                            this.sprite.setHeading(pow2.game.components.Headings.SOUTH, false);
                            this.heading.set(0, 1);
                        }
                        else if (this.velocity.y < 0) {
                            this.sprite.setHeading(pow2.game.components.Headings.NORTH, false);
                            this.heading.set(0, -1);
                        }
                        else if (this.velocity.x < 0) {
                            this.sprite.setHeading(pow2.game.components.Headings.WEST, false);
                            this.heading.set(-1, 0);
                        }
                        else if (this.velocity.x > 0) {
                            this.sprite.setHeading(pow2.game.components.Headings.EAST, false);
                            this.heading.set(1, 0);
                        }
                        else {
                            this.sprite.setMoving(false);
                        }
                    }
                };
                /**
                 * Determine if a point on the map collides with a given terrain
                 * attribute.  If the attribute is set to false, a collision occurs.
                 *
                 * @param at {pow2.Point} The point to check.
                 * @param passableAttribute {string} The attribute to check.
                 * @returns {boolean} True if the passable attribute was found and set to false.
                 */
                PlayerComponent.prototype.collideWithMap = function (at, passableAttribute) {
                    var map = this.host.scene.objectByType(pow2.tile.TileMap);
                    if (map) {
                        var layers = map.getLayers();
                        for (var i = 0; i < layers.length; i++) {
                            var terrain = map.getTileData(layers[i], at.x, at.y);
                            if (!terrain) {
                                continue;
                            }
                            if (terrain[passableAttribute] === false) {
                                return true;
                            }
                        }
                    }
                    return false;
                };
                PlayerComponent.prototype.collideMove = function (x, y, results) {
                    if (results === void 0) { results = []; }
                    return false;
                };
                PlayerComponent.prototype.beginMove = function (move) {
                    this.host.trigger(PlayerComponent.Events.MOVE_BEGIN, this, move.from, move.to);
                    if (!this.collider) {
                        return;
                    }
                    var results = [];
                    this.collider.collide(move.from.x, move.from.y, pow2.tile.TileObject, results);
                    for (var i = 0; i < results.length; i++) {
                        var o = results[i];
                        var comp = o.findComponent(this.collideComponentType);
                        if (!comp || !comp.enter) {
                            continue;
                        }
                        if (comp.exit(this.host) === false) {
                            return;
                        }
                    }
                    results.length = 0;
                    this.collider.collide(move.to.x, move.to.y, pow2.tile.TileObject, results);
                    for (var i = 0; i < results.length; i++) {
                        var o = results[i];
                        var comp = o.findComponent(this.collideComponentType);
                        if (!comp || !comp.enter) {
                            continue;
                        }
                        if (comp.enter(this.host) === false) {
                            return;
                        }
                    }
                };
                PlayerComponent.prototype.completeMove = function (move) {
                    var _this = this;
                    this.host.trigger(PlayerComponent.Events.MOVE_END, this, move.from, move.to);
                    if (!this.collider) {
                        return;
                    }
                    // Trigger exit on previous components
                    var hits = [];
                    this.collider.collide(move.from.x, move.from.y, pow2.tile.TileObject, hits);
                    var fromObject = _.find(hits, function (o) {
                        return o._uid !== _this.host._uid;
                    });
                    if (fromObject) {
                        var comp = fromObject.findComponent(this.collideComponentType);
                        if (comp && comp.host._uid !== this.host._uid) {
                            comp.exited(this.host);
                        }
                    }
                    // Trigger enter on new components
                    hits.length = 0;
                    this.collider.collide(move.to.x, move.to.y, pow2.tile.TileObject, hits);
                    var toObject = _.find(hits, function (o) {
                        return o._uid !== _this.host._uid;
                    });
                    if (toObject) {
                        var comp = toObject.findComponent(this.collideComponentType);
                        if (comp && comp.host._uid !== this.host._uid) {
                            comp.entered(this.host);
                        }
                    }
                };
                // TODO: Pass in collide types during entity creation, and assert on invalid types.
                PlayerComponent.COLLIDE_TYPES = [
                    'rpg.components.features.TempleFeatureComponent',
                    'rpg.components.features.StoreFeatureComponent',
                    'rpg.components.features.DialogFeatureComponent',
                    'sign'
                ];
                PlayerComponent.Events = {
                    MOVE_BEGIN: 'move:begin',
                    MOVE_END: 'move:end'
                };
                return PlayerComponent;
            })(pow2.scene.components.MovableComponent);
            components.PlayerComponent = PlayerComponent;
        })(components = scene.components || (scene.components = {}));
    })(scene = pow2.scene || (pow2.scene = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="./playerComponent.ts" />
var pow2;
(function (pow2) {
    var game;
    (function (game) {
        var components;
        (function (components) {
            var PlayerCameraComponent = (function (_super) {
                __extends(PlayerCameraComponent, _super);
                function PlayerCameraComponent() {
                    _super.apply(this, arguments);
                }
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
            })(pow2.scene.components.CameraComponent);
            components.PlayerCameraComponent = PlayerCameraComponent;
        })(components = game.components || (game.components = {}));
    })(game = pow2.game || (pow2.game = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
/// <reference path="../components/animatedComponent.ts" />
var pow2;
(function (pow2) {
    var game;
    (function (game) {
        var components;
        (function (components) {
            (function (StateFrames) {
                StateFrames[StateFrames["DEFAULT"] = 10] = "DEFAULT";
                StateFrames[StateFrames["SWING"] = 1] = "SWING";
                StateFrames[StateFrames["INJURED"] = 2] = "INJURED";
                StateFrames[StateFrames["WALK"] = 3] = "WALK";
                StateFrames[StateFrames["STRIKE"] = 3] = "STRIKE";
                StateFrames[StateFrames["CELEBRATE"] = 4] = "CELEBRATE";
                StateFrames[StateFrames["DEAD"] = 5] = "DEAD";
            })(components.StateFrames || (components.StateFrames = {}));
            var StateFrames = components.StateFrames;
            var PlayerCombatRenderComponent = (function (_super) {
                __extends(PlayerCombatRenderComponent, _super);
                function PlayerCombatRenderComponent() {
                    _super.apply(this, arguments);
                    this._elapsed = 0;
                    this._renderFrame = 3;
                    this.state = "";
                    this.animating = false;
                    this.animator = null;
                    this.attackDirection = pow2.game.components.Headings.WEST;
                }
                PlayerCombatRenderComponent.prototype.syncComponent = function () {
                    this.animator = this.host.findComponent(components.AnimatedComponent);
                    return _super.prototype.syncComponent.call(this);
                };
                PlayerCombatRenderComponent.prototype.setState = function (name) {
                    if (name === void 0) { name = "Default"; }
                    this.state = name;
                };
                PlayerCombatRenderComponent.prototype.attack = function (attackCb, cb) {
                    this._attack(cb, this.getAttackAnimation(attackCb));
                };
                PlayerCombatRenderComponent.prototype.magic = function (attackCb, cb) {
                    this._attack(cb, this.getMagicAnimation(attackCb));
                };
                PlayerCombatRenderComponent.prototype.getForwardDirection = function () {
                    return this.attackDirection === pow2.game.components.Headings.WEST ? -1 : 1;
                };
                PlayerCombatRenderComponent.prototype.getBackwardDirection = function () {
                    return this.attackDirection === pow2.game.components.Headings.WEST ? 1 : -1;
                };
                PlayerCombatRenderComponent.prototype.getForwardFrames = function () {
                    return this.attackDirection === pow2.game.components.Headings.WEST ? [9, 11, 10] : [3, 5, 4];
                };
                PlayerCombatRenderComponent.prototype.getBackwardFrames = function () {
                    return this.attackDirection === pow2.game.components.Headings.WEST ? [10, 11, 9] : [4, 5, 3];
                };
                PlayerCombatRenderComponent.prototype.getAttackFrames = function () {
                    return this.attackDirection === pow2.game.components.Headings.WEST ? [12, 13, 14, 15, 14, 13, 12] : [4, 5, 6, 7, 6, 5, 4];
                };
                PlayerCombatRenderComponent.prototype.getMagicAnimation = function (strikeCb) {
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
                PlayerCombatRenderComponent.prototype.getAttackAnimation = function (strikeCb) {
                    var _this = this;
                    return [
                        {
                            name: "Move Forward for Attack",
                            repeats: 0,
                            duration: 250,
                            frames: this.getForwardFrames(),
                            move: new pow2.Point(this.getForwardDirection(), 0),
                            callback: function () {
                                var attackAnimationsSource = _this.host.icon.replace(".png", "-attack.png");
                                if (_this.host.world.sprites.getSpriteMeta(attackAnimationsSource)) {
                                    _this.host.setSprite(attackAnimationsSource, 12);
                                }
                            }
                        },
                        {
                            name: "Strike at Opponent",
                            repeats: 1,
                            duration: 100,
                            frames: this.getAttackFrames(),
                            callback: function () {
                                _this.host.setSprite(_this.host.icon.replace("-attack.png", ".png"), 10);
                                strikeCb && strikeCb();
                            }
                        },
                        {
                            name: "Return to Party",
                            duration: 250,
                            repeats: 0,
                            frames: this.getBackwardFrames(),
                            move: new pow2.Point(this.getBackwardDirection(), 0)
                        }
                    ];
                };
                PlayerCombatRenderComponent.prototype.moveForward = function (then) {
                    this._playAnimation([{
                            name: "Move Forward",
                            repeats: 0,
                            duration: 250,
                            frames: this.getForwardFrames(),
                            move: new pow2.Point(this.getForwardDirection(), 0)
                        }], then);
                };
                PlayerCombatRenderComponent.prototype.moveBackward = function (then) {
                    this._playAnimation([{
                            name: "Move Backward",
                            repeats: 0,
                            duration: 250,
                            frames: this.getBackwardFrames(),
                            move: new pow2.Point(this.getBackwardDirection(), 0)
                        }], then);
                };
                PlayerCombatRenderComponent.prototype._playAnimation = function (animation, then) {
                    var _this = this;
                    if (!this.animator || this.animating) {
                        return;
                    }
                    var animations = _.map(animation, function (anim) {
                        var result = _.extend({}, anim);
                        if (typeof result.move !== 'undefined') {
                            result.move = result.move.clone();
                        }
                        return result;
                    });
                    this.animating = true;
                    this.animator.playChain(animations, function () {
                        _this.animating = false;
                        then && then();
                    });
                };
                PlayerCombatRenderComponent.prototype._attack = function (cb, attackAnimation) {
                    var _this = this;
                    if (!this.animator || this.animating) {
                        return;
                    }
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
                        var frame = StateFrames.DEFAULT;
                        switch (this.state) {
                            case "Injured":
                                frame = StateFrames.DEFAULT;
                                break;
                            case "Dead":
                                frame = StateFrames.DEFAULT;
                                break;
                            case "Attacking":
                                frame = altFrame ? StateFrames.STRIKE : StateFrames.SWING;
                                break;
                        }
                        this.host.frame = this._renderFrame = frame;
                    }
                };
                return PlayerCombatRenderComponent;
            })(pow2.scene.components.TickedComponent);
            components.PlayerCombatRenderComponent = PlayerCombatRenderComponent;
        })(components = game.components || (game.components = {}));
    })(game = pow2.game || (pow2.game = {}));
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
    (function (EntityError) {
        EntityError[EntityError["NONE"] = 0] = "NONE";
        EntityError[EntityError["ENTITY_TYPE"] = 1] = "ENTITY_TYPE";
        EntityError[EntityError["COMPONENT_TYPE"] = 2] = "COMPONENT_TYPE";
        EntityError[EntityError["COMPONENT_NAME_DUPLICATE"] = 4] = "COMPONENT_NAME_DUPLICATE";
        EntityError[EntityError["COMPONENT_REGISTER"] = 8] = "COMPONENT_REGISTER";
        EntityError[EntityError["COMPONENT_INPUT"] = 16] = "COMPONENT_INPUT";
        EntityError[EntityError["INPUT_NAME"] = 32] = "INPUT_NAME";
        EntityError[EntityError["INPUT_TYPE"] = 64] = "INPUT_TYPE";
    })(pow2.EntityError || (pow2.EntityError = {}));
    var EntityError = pow2.EntityError;
    var EntityContainerResource = (function (_super) {
        __extends(EntityContainerResource, _super);
        function EntityContainerResource() {
            _super.apply(this, arguments);
        }
        EntityContainerResource.getClassType = function (fullTypeName) {
            if (!fullTypeName) {
                return null;
            }
            var parts = fullTypeName.split(".");
            for (var i = 0, len = parts.length, obj = window; i < len; ++i) {
                obj = obj[parts[i]];
                if (!obj) {
                    return null;
                }
            }
            // Determine if this resolves to a native browser function.
            // e.g. if given a typename of "alert" this would return that
            // function, which is not a valid type constructor.
            //
            // Ignore all native methods until there's a compelling reason
            // not to.
            if (Function.prototype.toString.call(obj).indexOf('[native code]') !== -1) {
                return null;
            }
            return obj;
        };
        /**
         * Do a case-insensitive typeof compare to allow generally simpler
         * type specifications in entity files.
         * @param type The type
         * @param expected The expected typeof result
         * @returns {boolean} True if the expected type matches the type
         */
        EntityContainerResource.prototype.typeofCompare = function (type, expected) {
            var typeString = typeof type;
            var expected = '' + expected;
            return typeString.toUpperCase() === expected.toUpperCase();
        };
        /**
         * Validate a template object's correctness, returning a string
         * error if incorrect, or null if correct.
         *
         * @param templateData The template to verify
         */
        EntityContainerResource.prototype.validateTemplate = function (templateData, inputs) {
            var _this = this;
            // Valid entity class type
            var type = EntityContainerResource.getClassType(templateData.type);
            if (!type) {
                return EntityError.ENTITY_TYPE;
            }
            var unsatisfied = EntityError.NONE;
            // Verify user supplied required input values
            if (templateData.inputs) {
                var tplInputs = _.keys(templateData.inputs);
                if (tplInputs) {
                    if (typeof inputs === 'undefined') {
                        console.error("EntityContainer: missing inputs for template that requires: " + tplInputs.join(', '));
                        return EntityError.INPUT_NAME;
                    }
                    _.each(templateData.inputs, function (type, name) {
                        // Attempt to validate inputs with two type specifications:
                        var inputType = EntityContainerResource.getClassType(type);
                        if (typeof inputs[name] === 'undefined') {
                            console.error("EntityContainer: missing input with name: " + name);
                            unsatisfied |= EntityError.INPUT_NAME;
                        }
                        else if (inputType && !(inputs[name] instanceof inputType)) {
                            console.error("EntityContainer: bad input type for input: " + name);
                            unsatisfied |= EntityError.INPUT_TYPE;
                        }
                        else if (!inputType && !_this.typeofCompare(inputs[name], type)) {
                            console.error("EntityContainer: bad input type for input (" + name + ") expected (" + type + ") but got (" + typeof inputs[name] + ")");
                            unsatisfied |= EntityError.INPUT_TYPE;
                        }
                    });
                }
                if (unsatisfied !== EntityError.NONE) {
                    return unsatisfied;
                }
            }
            if (templateData.components) {
                var keys = _.map(templateData.components, function (c) {
                    return c.name;
                });
                var unique = _.uniq(keys).length === keys.length;
                if (!unique) {
                    console.error("EntityContainer: duplicate name in template components: " + keys.join(', '));
                    return EntityError.COMPONENT_NAME_DUPLICATE;
                }
            }
            // Verify component types are known
            unsatisfied = EntityError.NONE;
            _.each(templateData.components, function (comp) {
                var compType = EntityContainerResource.getClassType(comp.type);
                if (!compType) {
                    console.error("EntityContainer: unknown component type: " + comp.type);
                    unsatisfied |= EntityError.COMPONENT_TYPE;
                }
                else if (comp.params) {
                    _.each(comp.params, function (i) {
                        if (typeof inputs[i] === 'undefined') {
                            console.error("EntityContainer: missing component param: " + i);
                            unsatisfied |= EntityError.COMPONENT_INPUT;
                        }
                    });
                }
            });
            return unsatisfied;
        };
        EntityContainerResource.prototype.getTemplate = function (templateName) {
            if (!this.isReady()) {
                return null;
            }
            // Valid template name.
            var tpl = _.where(this.data, { name: templateName })[0];
            if (!tpl) {
                return null;
            }
            return tpl;
        };
        EntityContainerResource.prototype.constructObject = function (constructor, argArray) {
            var args = [null].concat(argArray);
            var factoryFunction = constructor.bind.apply(constructor, args);
            return new factoryFunction();
        };
        /**
         * Instantiate an object and set of components from a given template.
         * @param templateName The name of the template in the resource.
         * @param inputs An object of input values to use when instantiating objects and components.
         * @returns {*} The resulting object or null
         */
        EntityContainerResource.prototype.createObject = function (templateName, inputs) {
            var _this = this;
            // Valid template name.
            var tpl = this.getTemplate(templateName);
            if (!tpl) {
                return null;
            }
            // Validate entity configuration
            if (this.validateTemplate(tpl, inputs) !== EntityError.NONE) {
                console.log("failed to validate template: " + tpl.name + ":" + tpl.type);
                return null;
            }
            var type = EntityContainerResource.getClassType(tpl.type);
            // Create entity object
            //
            // If inputs.params are specified use them explicitly, otherwise pass the inputs
            // dire
            var inputValues = tpl.params ? _.map(tpl.params, function (n) {
                return inputs[n];
            }) : [inputs];
            var object = this.constructObject(type, inputValues);
            // Create components.
            //
            // Because we called validateTemplate above the input params
            // and component types should already be resolved.  Be optimistic
            // here and don't check for errors surrounding types and input names.
            var unsatisfied = EntityError.NONE;
            _.each(tpl.components, function (comp) {
                var inputValues = _.map(comp.params || [], function (n) {
                    return inputs[n];
                });
                var ctor = EntityContainerResource.getClassType(comp.type);
                var compObject = _this.constructObject(ctor, inputValues);
                compObject.name = comp.name;
                if (!object.addComponent(compObject)) {
                    unsatisfied |= EntityError.COMPONENT_REGISTER;
                }
            });
            if (unsatisfied !== EntityError.NONE) {
                return null;
            }
            return object;
        };
        return EntityContainerResource;
    })(pow2.JSONResource);
    pow2.EntityContainerResource = EntityContainerResource;
})(pow2 || (pow2 = {}));
/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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
     * Use TableTop to load a published google spreadsheet.
     */
    var GameDataResource = (function (_super) {
        __extends(GameDataResource, _super);
        function GameDataResource() {
            _super.apply(this, arguments);
        }
        GameDataResource.prototype.load = function () {
            var _this = this;
            // Attempt to load db from save game cache to avoid hitting
            // google spreadsheets API on ever page load.
            try {
                this.data = JSON.parse(this.getCache(this.url));
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
                    _this.setCache(_this.url, JSON.stringify(data));
                    _this.ready();
                }
            });
        };
        GameDataResource.prototype.getCache = function (key) {
            return localStorage.getItem(GameDataResource.DATA_KEY + key);
        };
        GameDataResource.clearCache = function (key) {
            localStorage.removeItem(GameDataResource.DATA_KEY + key);
        };
        GameDataResource.prototype.setCache = function (key, data) {
            localStorage.setItem(GameDataResource.DATA_KEY + key, data);
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
                        else if (key === 'benefit') {
                            switch (value.toLowerCase()) {
                                case "true":
                                case "yes":
                                case "1":
                                    entry[key] = true;
                                    break;
                                case "false":
                                case "no":
                                case "0":
                                case null:
                                    entry[key] = false;
                                    break;
                                default:
                                    entry[key] = Boolean(value);
                            }
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
            name = ('' + name).toLocaleLowerCase();
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
//# sourceMappingURL=pow2.js.map