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
/// <reference path="../../types/backbone/backbone.d.ts"/>
/// <reference path="../../types/angularjs/angular.d.ts"/>
/// <reference path="../../lib/pow2.d.ts"/>
/**
 * Dorkapon is constructed with a set of components and state machines.
 *
 * The front-end is built using Angular.JS directives and controllers that
 * use an asynchronous state machine event handler to integrate the UI elements
 * into the underlying states.
 */
var dorkapon;
(function (dorkapon) {
    /**
     * The name of this app.  You can fetch the game world at any time using pow2.getWorld and this name.
     * @type {string}
     */
    dorkapon.NAME = "dorkapon";
    /**
     * The Google Spreadsheet ID to load game data from.  This must be a published
     * google spreadsheet key.
     * @type {string} The google spreadsheet ID
     */
    dorkapon.SPREADSHEET_ID = "1KUkfnr0ndj_hL5ZvWhmOz6pqgE2VyMCcRyZjJKhO0a0";
    /**
     * The location of the entities container for dorkapon.
     *
     * This file contains template descriptions for the various complex game objects.
     */
    dorkapon.ENTITIES_CONTAINER = "games/dorkapon/entities/dorkapon.powEntities";
    dorkapon.app = angular.module('dorkapon', [
        'ngMaterial',
        'pow2',
        'material.components.icon'
    ]).config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey')
            .accentPalette('deep-orange');
    });
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../index.ts" />
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        var MapNodeComponent = (function (_super) {
            __extends(MapNodeComponent, _super);
            function MapNodeComponent() {
                _super.apply(this, arguments);
                this.world = pow2.getWorld(dorkapon.NAME);
            }
            /**
             * Perform any action associated with landing on this component.
             * @param object The entity that landed on the node.
             * @param then A callback to be invoked when the action is done.
             */
            MapNodeComponent.prototype.doAction = function (object, then) {
                console.warn("Subclass should entirely implement this functionality.");
                console.warn(" - Invoking completion callback next frame.");
                _.defer(then);
            };
            MapNodeComponent.prototype.entered = function (object) {
                var turn = object.findComponent(components.PlayerTurnComponent);
                if (turn && turn.isCurrentTurn()) {
                    if (turn.machine) {
                        turn.machine.currentNode = this;
                    }
                    turn.decrementMove();
                }
                return _super.prototype.entered.call(this, object);
            };
            return MapNodeComponent;
        })(pow2.tile.TileComponent);
        components.MapNodeComponent = MapNodeComponent;
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="./mapNodeComponent.ts" />
/// <reference path="../index.ts" />
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        var ChoiceRollComponent = (function (_super) {
            __extends(ChoiceRollComponent, _super);
            function ChoiceRollComponent(target, choices) {
                _super.call(this);
                this.target = target;
                this.choices = choices;
                this.started = false;
                this.startAngle = 0;
                this.arc = Math.PI / 3;
                this.spinTimeout = null;
                this.spinAngleStart = 10;
                this.spinTime = 0;
                this.spinTimeTotal = 0;
                this.selection = null;
                this.ctx = null;
                this._renderPoint = new pow2.Point();
                this._iconCache = {};
                this.items = [];
                for (var i = 0; i < 6; i++) {
                    this.items.push(choices[_.random(0, choices.length - 1)]);
                }
            }
            ChoiceRollComponent.prototype.connectComponent = function () {
                return this.host instanceof dorkapon.DorkaponMapView && _super.prototype.connectComponent.call(this);
            };
            ChoiceRollComponent.prototype.disconnectComponent = function () {
                this.trigger('disconnected');
                return true;
            };
            ChoiceRollComponent.prototype.afterFrame = function (view, elapsed) {
                if (!this.started) {
                    this.spin(view);
                    this.started = true;
                }
                if (!view.context) {
                    return;
                }
                this.ctx = view.context;
                this.drawRouletteWheel(view);
            };
            ChoiceRollComponent.prototype.drawRouletteWheel = function (view) {
                var outsideRadius = 60;
                var textRadius = 45;
                var insideRadius = 35;
                this.ctx.strokeStyle = "white";
                this.ctx.lineWidth = 2;
                this.ctx.font = 'normal 8px GraphicPixel';
                var renderPoint = view.worldToScreen(view.camera.getCenter());
                for (var i = 0; i < 6; i++) {
                    var angle = this.startAngle + i * this.arc;
                    this.ctx.fillStyle = '#004c62';
                    this.ctx.beginPath();
                    this.ctx.arc(renderPoint.x, renderPoint.y, outsideRadius, angle, angle + this.arc, false);
                    this.ctx.arc(renderPoint.x, renderPoint.y, insideRadius, angle + this.arc, angle, true);
                    this.ctx.fill();
                    this.ctx.stroke();
                    this.ctx.save();
                    this.ctx.translate(renderPoint.x + Math.cos(angle + this.arc / 2) * textRadius, renderPoint.y + Math.sin(angle + this.arc / 2) * textRadius);
                    this.ctx.rotate(angle + this.arc / 2 + Math.PI / 2);
                    this.renderIcon(this.items[i].icon, new pow2.Point(), view);
                    this.ctx.restore();
                }
                if (this.selection !== null) {
                    this.ctx.save();
                    this.ctx.font = 'bold 8px GraphicPixel';
                    this.ctx.fillStyle = "black";
                    this.ctx.fillText(this.selection.name, renderPoint.x + 1 - this.ctx.measureText(this.selection.name).width / 2, renderPoint.y + 11);
                    this.ctx.fillStyle = "white";
                    this.ctx.fillText(this.selection.name, renderPoint.x - this.ctx.measureText(this.selection.name).width / 2, renderPoint.y + 10);
                    this.ctx.restore();
                }
                //Arrow
                this.ctx.fillStyle = "white";
                renderPoint.y -= 10;
                this.ctx.beginPath();
                this.ctx.moveTo(renderPoint.x - 4, renderPoint.y - (outsideRadius + 5));
                this.ctx.lineTo(renderPoint.x + 4, renderPoint.y - (outsideRadius + 5));
                this.ctx.lineTo(renderPoint.x + 4, renderPoint.y - (outsideRadius - 5));
                this.ctx.lineTo(renderPoint.x + 9, renderPoint.y - (outsideRadius - 5));
                this.ctx.lineTo(renderPoint.x + 0, renderPoint.y - (outsideRadius - 13));
                this.ctx.lineTo(renderPoint.x - 9, renderPoint.y - (outsideRadius - 5));
                this.ctx.lineTo(renderPoint.x - 4, renderPoint.y - (outsideRadius - 5));
                this.ctx.lineTo(renderPoint.x - 4, renderPoint.y - (outsideRadius + 5));
                this.ctx.fill();
            };
            ChoiceRollComponent.prototype.spin = function (view) {
                this.spinAngleStart = Math.random() * 10 + 10;
                this.spinTime = 0;
                this.selection = null;
                this.spinTimeTotal = Math.random() * 3 + 4 * 1000;
                this.rotateWheel(view);
            };
            ChoiceRollComponent.prototype.rotateWheel = function (view) {
                var _this = this;
                this.spinTime += 30;
                if (this.spinTime >= this.spinTimeTotal) {
                    this.stopRotateWheel(view);
                    return;
                }
                var spinAngle = this.spinAngleStart - this.easeOut(this.spinTime, 0, this.spinAngleStart, this.spinTimeTotal);
                this.startAngle += (spinAngle * Math.PI / 180);
                this.spinTimeout = setTimeout(function () {
                    _this.rotateWheel(view);
                }, 30);
            };
            ChoiceRollComponent.prototype.stopRotateWheel = function (view) {
                var _this = this;
                clearTimeout(this.spinTimeout);
                var degrees = this.startAngle * 180 / Math.PI + 90;
                var arcd = this.arc * 180 / Math.PI;
                var index = Math.floor((360 - degrees % 360) / arcd);
                this.selection = this.items[index];
                _.delay(function () {
                    _this.spinTimeout = null;
                    _this.host.removeComponent(_this);
                }, 1000);
            };
            ChoiceRollComponent.prototype.easeOut = function (t, b, c, d) {
                var ts = (t /= d) * t;
                var tc = ts * t;
                return b + c * (tc + -3 * ts + 3 * t);
            };
            ChoiceRollComponent.prototype.renderIcon = function (icon, at, view) {
                var c = view.world.sprites.getSpriteMeta(icon);
                if (!c) {
                    return;
                }
                if (!this._iconCache[c.source]) {
                    this._iconCache[c.source] = view.world.sprites.getSpriteSheet(c.source);
                    return;
                }
                if (!this._iconCache[c.source].isReady()) {
                    return;
                }
                var img = this._iconCache[c.source];
                // Build render data.
                this._renderPoint.set(at);
                var point = this._renderPoint;
                var scale = 1;
                var sourceWidth = view.unitSize;
                var sourceHeight = view.unitSize;
                if (typeof c.cellWidth !== 'undefined' && typeof c.cellHeight !== 'undefined') {
                    sourceWidth = c.cellWidth;
                    sourceHeight = c.cellHeight;
                }
                var objWidth = view.fastScreenToWorldNumber(sourceWidth);
                var objHeight = view.fastScreenToWorldNumber(sourceHeight);
                point.x -= objWidth * scale / 2;
                point.y -= objHeight * scale / 2;
                view.fastWorldToScreenPoint(point, point);
                if (c) {
                    var cx = c.x;
                    var cy = c.y;
                    view.context.drawImage(img.data, cx, cy, sourceWidth, sourceHeight, point.x, point.y, sourceWidth * scale, sourceHeight * scale);
                }
                else {
                    view.context.drawImage(img.data, point.x, point.y, sourceWidth * scale, sourceHeight * scale);
                }
            };
            return ChoiceRollComponent;
        })(pow2.scene.SceneViewComponent);
        components.ChoiceRollComponent = ChoiceRollComponent;
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
///<reference path="../index.ts"/>
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        /**
         * A centered camera on the host object, that is clamped
         * inside the tile map.  The result is that the player will
         * be camera center at all times except when he is near an
         * edge of the map.
         */
        var PlayerCamera = (function (_super) {
            __extends(PlayerCamera, _super);
            function PlayerCamera() {
                _super.apply(this, arguments);
                // Pre allocate spatial objects for this component because cameras are
                // updated every frame.
                this._worker = new pow2.Point();
                this._workerRect = new pow2.Rect();
            }
            PlayerCamera.prototype.process = function (view) {
                _super.prototype.process.call(this, view);
                if (view.tileMap) {
                    // Center on host object
                    view.camera.setCenter(this.host.renderPoint || this.host.point);
                    // Clamp point to lower-right.
                    view.camera.point.x = Math.min(view.camera.point.x, view.tileMap.bounds.extent.x - view.camera.extent.x);
                    view.camera.point.y = Math.min(view.camera.point.y, view.tileMap.bounds.extent.y - view.camera.extent.y);
                    // Clamp to top-left.
                    view.camera.point.x = Math.max(-0.5, view.camera.point.x);
                    view.camera.point.y = Math.max(-0.5, view.camera.point.y);
                }
            };
            return PlayerCamera;
        })(pow2.scene.components.CameraComponent);
        components.PlayerCamera = PlayerCamera;
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
///<reference path="../index.ts"/>
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        /**
         * Basic Dorkapon player that can navigate around the map
         * using the paths defined within.
         */
        var PlayerComponent = (function (_super) {
            __extends(PlayerComponent, _super);
            function PlayerComponent() {
                _super.apply(this, arguments);
                this.heading = new pow2.Point(0, 1);
                this.paths = null;
                this.map = null;
            }
            PlayerComponent.prototype.syncComponent = function () {
                this.paths = this.host.findComponent(components.PlayerPathComponent);
                return _super.prototype.syncComponent.call(this);
            };
            /**
             * Collide with the A-star graph input data generated by a path component.
             */
            PlayerComponent.prototype.collideMove = function (x, y, results) {
                if (results === void 0) { results = []; }
                if (this.host.scene && !this.map) {
                    this.map = this.host.scene.objectByType(pow2.tile.TileMap);
                }
                // If the tile is within the generated paths grid, check the
                // grid weight at the given position, and collide if it's value
                // is greater than some value.
                if (this.map && this.paths && this.map.bounds.pointInRect(x, y)) {
                    return this.paths._graph.input[x][y] >= dorkapon.PathWeights.BLOCKED;
                }
                return false;
            };
            return PlayerComponent;
        })(pow2.scene.components.PlayerComponent);
        components.PlayerComponent = PlayerComponent;
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
///<reference path="../index.ts"/>
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        /**
         * Generate an A* path given a dorkapon tile map.
         */
        var PlayerPathComponent = (function (_super) {
            __extends(PlayerPathComponent, _super);
            function PlayerPathComponent() {
                _super.apply(this, arguments);
            }
            PlayerPathComponent.prototype.buildWeightedGraph = function () {
                var horizPaths = this.tileMap.getHorizPaths();
                var vertPaths = this.tileMap.getVertPaths();
                var nodes = this.tileMap.getNodes();
                // Initialize a two dimensional array the size of the tileMap
                var grid = new Array(this.tileMap.bounds.extent.x);
                for (var x = 0; x < this.tileMap.bounds.extent.x; x++) {
                    var arr = Array.apply(null, Array(this.tileMap.bounds.extent.y));
                    // All tiles are blocked to begin with.
                    grid[x] = arr.map(function () {
                        return dorkapon.PathWeights.BLOCKED;
                    });
                }
                // Mark all the paths are walkable.
                _.each([].concat(horizPaths, vertPaths), function (p) {
                    grid[p.x][p.y] = dorkapon.PathWeights.CAN_WALK;
                });
                // Mark that the path can end at nodes.
                _.each(nodes, function (p) {
                    grid[p.x][p.y] = dorkapon.PathWeights.CAN_REST;
                });
                return grid;
            };
            return PlayerPathComponent;
        })(pow2.tile.components.PathComponent);
        components.PlayerPathComponent = PlayerPathComponent;
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
///<reference path="../index.ts"/>
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        /**
         * Knows about the dorkapon game world and state machine.  Exposes methods
         * for interacting with the state machine on a per-player basis.
         *
         * isCurrentTurn() - check host is state machine current player
         *
         */
        var PlayerTurnComponent = (function (_super) {
            __extends(PlayerTurnComponent, _super);
            /**
             * Constructs with a given state machine.
             */
            function PlayerTurnComponent(machine) {
                _super.call(this);
                this.machine = machine;
                /**
                 * The callback to signal the state machine to move on to the
                 * next player's turn.
                 */
                this.turnDone = null;
                if (!machine) {
                    throw new Error(pow2.errors.INVALID_ARGUMENTS);
                }
            }
            PlayerTurnComponent.prototype.connectComponent = function () {
                this.machine.on(dorkapon.states.DorkaponPlayerTurn.EVENT, this._machineCapture, this);
                return _super.prototype.connectComponent.call(this);
            };
            PlayerTurnComponent.prototype.disconnectComponent = function () {
                this.machine.off(dorkapon.states.DorkaponPlayerTurn.EVENT, this._machineCapture, this);
                return _super.prototype.disconnectComponent.call(this);
            };
            /**
             * Determine if the given entity is the currently active player.
             */
            PlayerTurnComponent.prototype.isCurrentTurn = function (entity) {
                if (entity === void 0) { entity = this.host; }
                return this.machine.currentPlayer._uid === entity._uid;
            };
            /**
             * Subtract one move from the current player.
             */
            PlayerTurnComponent.prototype.decrementMove = function () {
                var model = this.machine.currentPlayer.model;
                model.set({
                    moves: model.attributes.moves - 1
                });
                if (this.turnDone && model.attributes.moves <= 0) {
                    var playerComp = this.host.findComponent(dorkapon.components.PlayerComponent);
                    if (playerComp) {
                        playerComp.path.length = 0;
                    }
                    var cb = this.turnDone;
                    this.turnDone = null;
                    if (this.machine.currentNode) {
                        this.machine.currentNode.doAction(this.machine.currentPlayer, cb);
                    }
                    else {
                        _.delay(cb, 500);
                    }
                }
            };
            PlayerTurnComponent.prototype._machineCapture = function (data) {
                if (data.player._uid === this.host._uid) {
                    this.turnDone = this.machine.notifyWait();
                }
            };
            return PlayerTurnComponent;
        })(pow2.scene.SceneComponent);
        components.PlayerTurnComponent = PlayerTurnComponent;
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
var dorkapon;
(function (dorkapon) {
    var DorkaponCombatStateMachine = (function (_super) {
        __extends(DorkaponCombatStateMachine, _super);
        function DorkaponCombatStateMachine(attacker, defender, scene, parent) {
            _super.call(this);
            this.scene = scene;
            this.parent = parent;
            /**
             * The attacker's chosen action.
             */
            this.attackerMove = null;
            /**
             * The defender's chosen action.
             */
            this.defenderMove = null;
            this.states = [
                new dorkapon.states.DorkaponCombatInit(this),
                new dorkapon.states.DorkaponCombatEnded(this),
                new dorkapon.states.DorkaponCombatChooseMoves(this),
                new dorkapon.states.DorkaponCombatExecuteMoves(this)
            ];
            this.world = pow2.getWorld(dorkapon.NAME);
            this.left = this.attacker = this.createPlayer(attacker, new pow2.Point(3, 6));
            this.right = this.defender = this.createPlayer(defender, new pow2.Point(10, 6));
        }
        DorkaponCombatStateMachine.prototype.createPlayer = function (from, at) {
            var sprite = this.world.factory.createObject('DorkaponCombatPlayer', {
                model: from,
                machine: this
            });
            sprite.name = from.attributes.name;
            sprite.icon = from.attributes.icon;
            this.scene.addObject(sprite);
            sprite.setPoint(at);
            return sprite;
        };
        DorkaponCombatStateMachine.Events = {
            FINISHED: "combat:finished",
            ATTACK: "combat:attack"
        };
        return DorkaponCombatStateMachine;
    })(pow2.StateMachine);
    dorkapon.DorkaponCombatStateMachine = DorkaponCombatStateMachine;
})(dorkapon || (dorkapon = {}));
var dorkapon;
(function (dorkapon) {
    var states;
    (function (states) {
        (function (MoveChoice) {
            MoveChoice[MoveChoice["ATTACK"] = 1] = "ATTACK";
            MoveChoice[MoveChoice["ATTACK_MAGIC"] = 2] = "ATTACK_MAGIC";
            MoveChoice[MoveChoice["ATTACK_SKILL"] = 3] = "ATTACK_SKILL";
            MoveChoice[MoveChoice["STRIKE"] = 4] = "STRIKE";
            MoveChoice[MoveChoice["DEFEND"] = 5] = "DEFEND";
            MoveChoice[MoveChoice["DEFEND_MAGIC"] = 6] = "DEFEND_MAGIC";
            MoveChoice[MoveChoice["DEFEND_SKILL"] = 7] = "DEFEND_SKILL";
            MoveChoice[MoveChoice["COUNTER"] = 8] = "COUNTER";
        })(states.MoveChoice || (states.MoveChoice = {}));
        var MoveChoice = states.MoveChoice;
        var AppCombatStateBase = (function (_super) {
            __extends(AppCombatStateBase, _super);
            function AppCombatStateBase(machine) {
                _super.call(this);
                this.machine = machine;
            }
            return AppCombatStateBase;
        })(pow2.State);
        states.AppCombatStateBase = AppCombatStateBase;
        /**
         * Initialize combat between two entities, roll turns and determine
         * who attacks first.
         *
         * Transitions to [DorkaponCombatChooseMoves].
         */
        var DorkaponCombatInit = (function (_super) {
            __extends(DorkaponCombatInit, _super);
            function DorkaponCombatInit() {
                _super.apply(this, arguments);
                this.name = DorkaponCombatInit.NAME;
            }
            DorkaponCombatInit.prototype.enter = function (machine) {
                _super.prototype.enter.call(this, machine);
                console.log("Roll turns and determine who attacks first.");
                if (machine.left.model instanceof dorkapon.models.DorkaponPlayer) {
                    var render = machine.left.findComponent(pow2.game.components.PlayerRenderComponent);
                    render.setHeading(pow2.game.components.Headings.EAST, false);
                }
                else if (machine.right.model instanceof dorkapon.models.DorkaponPlayer) {
                    var render = machine.right.findComponent(pow2.game.components.PlayerRenderComponent);
                    render.setHeading(pow2.game.components.Headings.WEST, false);
                }
                var currentTurn = null;
                var nextTurn = null;
                var data = {
                    attacker: machine.attacker,
                    defender: machine.defender,
                    report: function (first, second) {
                        currentTurn = first;
                        nextTurn = second;
                    }
                };
                machine.notify(DorkaponCombatInit.EVENT, data, function () {
                    if (!currentTurn || !nextTurn) {
                        throw new Error("User did not report turn order.");
                    }
                    machine.attacker = currentTurn;
                    machine.defender = nextTurn;
                    machine.setCurrentState(DorkaponCombatChooseMoves.NAME);
                });
            };
            DorkaponCombatInit.NAME = "dorkapon-init-combat";
            DorkaponCombatInit.EVENT = DorkaponCombatInit.NAME;
            return DorkaponCombatInit;
        })(AppCombatStateBase);
        states.DorkaponCombatInit = DorkaponCombatInit;
        var DorkaponCombatEnded = (function (_super) {
            __extends(DorkaponCombatEnded, _super);
            function DorkaponCombatEnded() {
                _super.apply(this, arguments);
                this.name = DorkaponCombatEnded.NAME;
            }
            DorkaponCombatEnded.prototype.enter = function (machine) {
                _super.prototype.enter.call(this, machine);
                var data = {
                    winner: machine.attacker,
                    loser: machine.defender
                };
                machine.attacker.destroy();
                machine.defender.destroy();
                machine.notify(DorkaponCombatEnded.EVENT, data, function () {
                    console.log("Combat is done.");
                    machine.parent.setCurrentState(states.AppMapState.NAME);
                });
            };
            DorkaponCombatEnded.NAME = "dorkapon-combat-ended";
            DorkaponCombatEnded.EVENT = DorkaponCombatEnded.NAME;
            return DorkaponCombatEnded;
        })(AppCombatStateBase);
        states.DorkaponCombatEnded = DorkaponCombatEnded;
        var DorkaponCombatChooseMoves = (function (_super) {
            __extends(DorkaponCombatChooseMoves, _super);
            function DorkaponCombatChooseMoves() {
                _super.apply(this, arguments);
                this.name = DorkaponCombatChooseMoves.NAME;
            }
            DorkaponCombatChooseMoves.prototype.enter = function (machine) {
                _super.prototype.enter.call(this, machine);
                console.log("choose moves");
                machine.attackerMove = null;
                machine.defenderMove = null;
                var data = {
                    attacker: machine.attacker,
                    defender: machine.defender,
                    report: function (player, move) {
                        if (player._uid === machine.attacker._uid) {
                            machine.attackerMove = move;
                        }
                        else if (player._uid === machine.defender._uid) {
                            machine.defenderMove = move;
                        }
                    }
                };
                this.machine.notify(DorkaponCombatChooseMoves.EVENT, data, function () {
                    machine.setCurrentState(DorkaponCombatExecuteMoves.NAME);
                });
            };
            DorkaponCombatChooseMoves.prototype.exit = function (machine) {
                //if(!machine.attackerMove || !machine.defenderMove){
                //   throw new Error("Moves were not specified for attacker and defender.  State machine will not recover.");
                //}
                _super.prototype.exit.call(this, machine);
            };
            DorkaponCombatChooseMoves.NAME = "dorkapon-combat-choose-moves";
            DorkaponCombatChooseMoves.EVENT = DorkaponCombatChooseMoves.NAME;
            return DorkaponCombatChooseMoves;
        })(AppCombatStateBase);
        states.DorkaponCombatChooseMoves = DorkaponCombatChooseMoves;
        var DorkaponCombatExecuteMoves = (function (_super) {
            __extends(DorkaponCombatExecuteMoves, _super);
            function DorkaponCombatExecuteMoves() {
                _super.apply(this, arguments);
                this.name = DorkaponCombatExecuteMoves.NAME;
            }
            DorkaponCombatExecuteMoves.prototype.enter = function (machine) {
                var _this = this;
                _super.prototype.enter.call(this, machine);
                // TODO: remove this scaffolding hacks to avoid horrible looping.
                console.log("execute attack from " + machine.attacker.model.attributes.name + " to " + machine.defender.model.attributes.name);
                var done = function () {
                    var done = machine.defender.model.isDefeated() || machine.attacker.model.isDefeated();
                    // Switch turns
                    var current = machine.attacker;
                    machine.attacker = machine.defender;
                    machine.defender = current;
                    machine.setCurrentState(done ? DorkaponCombatEnded.NAME : DorkaponCombatChooseMoves.NAME);
                };
                var player = machine.attacker.findComponent(pow2.game.components.PlayerCombatRenderComponent);
                if (player) {
                    var west = machine.attacker._uid === machine.right._uid;
                    player.attackDirection = west ? pow2.game.components.Headings.WEST : pow2.game.components.Headings.EAST;
                    player.attack(function () {
                        var attackDamage = 0;
                        var defendDamage = 0;
                        switch (machine.attackerMove) {
                            case MoveChoice.ATTACK_MAGIC:
                                attackDamage = machine.attacker.model.getMagic();
                                break;
                            case MoveChoice.ATTACK:
                                attackDamage = machine.attacker.model.getAttack();
                                break;
                            case MoveChoice.ATTACK_SKILL:
                                // TODO: Attack skills.
                                break;
                            case MoveChoice.STRIKE:
                                attackDamage = machine.attacker.model.getAttack() * 2;
                                break;
                        }
                        switch (machine.defenderMove) {
                            case MoveChoice.DEFEND:
                                if (machine.attackerMove === MoveChoice.ATTACK || machine.attackerMove === MoveChoice.STRIKE) {
                                    attackDamage -= machine.defender.model.getDefense();
                                }
                                break;
                            case MoveChoice.DEFEND_MAGIC:
                                if (machine.attackerMove === MoveChoice.ATTACK_MAGIC) {
                                    attackDamage -= machine.defender.model.getMagic();
                                }
                                break;
                            case MoveChoice.DEFEND_SKILL:
                                // TODO: Defense skills.
                                break;
                            case MoveChoice.COUNTER:
                                if (machine.attackerMove === MoveChoice.STRIKE) {
                                    defendDamage = attackDamage * 2;
                                    attackDamage = 0;
                                }
                                break;
                        }
                        var data = {
                            attackerMove: machine.attackerMove,
                            defenderMove: machine.defenderMove,
                            attacker: machine.attacker,
                            defender: machine.defender,
                            attackerDamage: Math.max(Math.round(defendDamage), 0),
                            defenderDamage: Math.max(Math.round(attackDamage), 0)
                        };
                        console.log(data);
                        _this.machine.notify(dorkapon.DorkaponCombatStateMachine.Events.ATTACK, data, done);
                    });
                }
                else {
                    throw new Error("No valid attack component for player: " + machine.attacker.model.attributes.name);
                }
            };
            DorkaponCombatExecuteMoves.NAME = "dorkapon-combat-move-execute";
            DorkaponCombatExecuteMoves.EVENT = DorkaponCombatExecuteMoves.NAME;
            return DorkaponCombatExecuteMoves;
        })(AppCombatStateBase);
        states.DorkaponCombatExecuteMoves = DorkaponCombatExecuteMoves;
    })(states = dorkapon.states || (dorkapon.states = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../mapNodeComponent.ts" />
/// <reference path="../../states/dorkaponCombatState.ts" />
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        var tiles;
        (function (tiles) {
            var ArmorTile = (function (_super) {
                __extends(ArmorTile, _super);
                function ArmorTile() {
                    _super.apply(this, arguments);
                }
                /**
                 * Display the armor tile chance roll.
                 */
                ArmorTile.prototype.doAction = function (object, then) {
                    var view = object.scene.getViewOfType(dorkapon.DorkaponMapView);
                    var choices = _.where(this.world.tables.getSheetData('armor'), { zone: 1 });
                    var roller = new dorkapon.components.ChoiceRollComponent(object, choices);
                    view.addComponent(roller);
                    roller.on('disconnected', function () {
                        object.model.set('armor', roller.selection);
                        _.delay(then, 1000);
                    });
                    console.log("Roll for armor drop");
                };
                return ArmorTile;
            })(components.MapNodeComponent);
            tiles.ArmorTile = ArmorTile;
        })(tiles = components.tiles || (components.tiles = {}));
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../mapNodeComponent.ts" />
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        var tiles;
        (function (tiles) {
            var BlueTile = (function (_super) {
                __extends(BlueTile, _super);
                function BlueTile() {
                    _super.apply(this, arguments);
                }
                BlueTile.prototype.enter = function (object) {
                    _super.prototype.enter.call(this, object);
                    console.log("BLUE NODE");
                    return true;
                };
                return BlueTile;
            })(components.MapNodeComponent);
            tiles.BlueTile = BlueTile;
        })(tiles = components.tiles || (components.tiles = {}));
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../mapNodeComponent.ts" />
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        var tiles;
        (function (tiles) {
            var GreenTile = (function (_super) {
                __extends(GreenTile, _super);
                function GreenTile() {
                    _super.apply(this, arguments);
                }
                GreenTile.prototype.enter = function (object) {
                    _super.prototype.enter.call(this, object);
                    console.log("GREEN NODE");
                    return true;
                };
                return GreenTile;
            })(components.MapNodeComponent);
            tiles.GreenTile = GreenTile;
        })(tiles = components.tiles || (components.tiles = {}));
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../mapNodeComponent.ts" />
/// <reference path="../../states/dorkaponCombatState.ts" />
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        var tiles;
        (function (tiles) {
            var ItemTile = (function (_super) {
                __extends(ItemTile, _super);
                function ItemTile() {
                    _super.apply(this, arguments);
                }
                /**
                 * Display the weapon tile chance roll.
                 */
                ItemTile.prototype.doAction = function (object, then) {
                    _.defer(then);
                    console.log("Roll for item drop");
                };
                return ItemTile;
            })(components.MapNodeComponent);
            tiles.ItemTile = ItemTile;
        })(tiles = components.tiles || (components.tiles = {}));
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../mapNodeComponent.ts" />
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        var tiles;
        (function (tiles) {
            var RedTile = (function (_super) {
                __extends(RedTile, _super);
                function RedTile() {
                    _super.apply(this, arguments);
                }
                RedTile.prototype.enter = function (object) {
                    _super.prototype.enter.call(this, object);
                    console.log("RED NODE");
                    return true;
                };
                return RedTile;
            })(components.MapNodeComponent);
            tiles.RedTile = RedTile;
        })(tiles = components.tiles || (components.tiles = {}));
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../mapNodeComponent.ts" />
/// <reference path="../../states/dorkaponCombatState.ts" />
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        var tiles;
        (function (tiles) {
            var WeaponTile = (function (_super) {
                __extends(WeaponTile, _super);
                function WeaponTile() {
                    _super.apply(this, arguments);
                }
                /**
                 * Display the weapon tile chance roll.
                 */
                WeaponTile.prototype.doAction = function (object, then) {
                    var view = object.scene.getViewOfType(dorkapon.DorkaponMapView);
                    var choices = _.where(this.world.tables.getSheetData('weapons'), { zone: 1 });
                    var roller = new dorkapon.components.ChoiceRollComponent(object, choices);
                    view.addComponent(roller);
                    roller.on('disconnected', function () {
                        object.model.set('weapon', roller.selection);
                        _.delay(then, 1000);
                    });
                    console.log("Roll for weapon drop");
                };
                return WeaponTile;
            })(components.MapNodeComponent);
            tiles.WeaponTile = WeaponTile;
        })(tiles = components.tiles || (components.tiles = {}));
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../mapNodeComponent.ts" />
/// <reference path="../../states/dorkaponCombatState.ts" />
var dorkapon;
(function (dorkapon) {
    var components;
    (function (components) {
        var tiles;
        (function (tiles) {
            var YellowTile = (function (_super) {
                __extends(YellowTile, _super);
                function YellowTile() {
                    _super.apply(this, arguments);
                    this.machine = null;
                }
                /**
                 * Roll and present a random encounter with a bad guy.
                 */
                YellowTile.prototype.doAction = function (object, then) {
                    var enemies = _.where(this.world.tables.getSheetData("enemies"), { level: 1 });
                    var combatState = this.world.state.getState(dorkapon.states.AppCombatState.NAME);
                    var nmeTemplate = enemies[_.random(0, enemies.length - 1)];
                    combatState.attacker = object.model;
                    combatState.defender = dorkapon.models.DorkaponMonster.create(nmeTemplate);
                    this.world.state.setCurrentState(combatState);
                    this.world.state.on(pow2.StateMachine.Events.EXIT, function (state) {
                        if (state.name === combatState.name) {
                            _.defer(then);
                        }
                    });
                    console.log("RANDOM ENCOUNTER LIKE WHOA");
                };
                YellowTile.prototype.enter = function (object) {
                    _super.prototype.enter.call(this, object);
                    console.log("YELLOW NODE");
                    return true;
                };
                return YellowTile;
            })(components.MapNodeComponent);
            tiles.YellowTile = YellowTile;
        })(tiles = components.tiles || (components.tiles = {}));
    })(components = dorkapon.components || (dorkapon.components = {}));
})(dorkapon || (dorkapon = {}));
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
var dorkapon;
(function (dorkapon) {
    var controllers;
    (function (controllers) {
        var CharacterCardController = (function () {
            function CharacterCardController() {
            }
            return CharacterCardController;
        })();
        controllers.CharacterCardController = CharacterCardController;
        dorkapon.app.controller('CharacterCardController', CharacterCardController);
    })(controllers = dorkapon.controllers || (dorkapon.controllers = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../../../lib/pow2.ui.d.ts"/>
var dorkapon;
(function (dorkapon) {
    var controllers;
    (function (controllers) {
        var CombatHudController = (function () {
            function CombatHudController($scope, $rootScope, $timeout, $mdDialog, $dorkapon, $damageValue) {
                var _this = this;
                this.$scope = $scope;
                this.$rootScope = $rootScope;
                this.$timeout = $timeout;
                this.$mdDialog = $mdDialog;
                this.$dorkapon = $dorkapon;
                this.$damageValue = $damageValue;
                this.combat = null;
                $dorkapon.machine.on(pow2.StateMachine.Events.ENTER, function (newState) {
                    if (newState.name === dorkapon.states.AppCombatState.NAME) {
                        var combatState = newState;
                        console.log(combatState);
                        _this.$scope.$apply(function () {
                            _this.$rootScope.inCombat = true;
                            _this.combat = combatState.machine;
                        });
                        _this.listenCombatEvents(combatState);
                    }
                });
                $dorkapon.machine.on(pow2.StateMachine.Events.EXIT, function (oldState) {
                    if (oldState.name === dorkapon.states.AppCombatState.NAME) {
                        var combatState = oldState;
                        _this.stopListeningCombatEvents(combatState);
                        _this.$scope.$apply(function () {
                            _this.$rootScope.inCombat = false;
                            _this.combat = null;
                        });
                    }
                });
                this.$scope.$on('$destroy', function () {
                    if ($dorkapon.machine) {
                        $dorkapon.machine.off(pow2.StateMachine.Events.ENTER, null, _this);
                        $dorkapon.machine.off(pow2.StateMachine.Events.EXIT, null, _this);
                    }
                });
                return this;
            }
            CombatHudController.prototype.getHitPointValue = function (object) {
                if (!object) {
                    return 0;
                }
                return Math.round(object.model.attributes.hp / object.model.attributes.maxhp * 100);
            };
            /**
             * Listen to various combat events to coordinate combat action selection
             * and dynamic state embellishments.
             *
             * @param state The combat state to listen in on.
             */
            CombatHudController.prototype.listenCombatEvents = function (state) {
                var _this = this;
                // When an attack happens, display a damage value above the character taking damage.
                state.machine.on(dorkapon.DorkaponCombatStateMachine.Events.ATTACK, function (e) {
                    var done = state.machine.notifyWait();
                    if (e.attackerDamage > 0) {
                        e.attacker.model.damage(e.attackerDamage);
                        _this.$damageValue.applyDamage(e.attacker, e.attackerDamage, _this.$dorkapon.world.mapView, done);
                    }
                    else {
                        e.defender.model.damage(e.defenderDamage);
                        _this.$damageValue.applyDamage(e.defender, e.defenderDamage, _this.$dorkapon.world.mapView, done);
                    }
                });
                // When combat has ended, clear the combat HUD ui.
                state.machine.on(dorkapon.states.DorkaponCombatEnded.EVENT, function (e) {
                    _this.$scope.$apply(function () {
                        _this.combat = null;
                    });
                }, this);
                // When combat starts, display a pick card UI to determine attack order.
                state.machine.on(dorkapon.states.DorkaponCombatInit.EVENT, function (e) {
                    var done = state.machine.notifyWait();
                    _this.pickTurnOrderCard(e, done);
                }, this);
                // When it is time for a turn, pick moves.
                state.machine.on(dorkapon.states.DorkaponCombatChooseMoves.EVENT, function (e) {
                    var done = state.machine.notifyWait();
                    _this.pickMove(e, true, function () {
                        _this.pickMove(e, false, done);
                    });
                }, this);
            };
            CombatHudController.prototype.stopListeningCombatEvents = function (state) {
                state.machine.off(null, null, this);
            };
            CombatHudController.prototype.pickTurnOrderCard = function (turnOrder, then) {
                var _this = this;
                this.$mdDialog.show({
                    controller: controllers.CombatTurnOrderController,
                    templateUrl: 'games/dorkapon/dialogs/combatTurnOrder.html',
                    controllerAs: 'combat',
                    clickOutsideToClose: false,
                    escapeToClose: false
                }).then(function (correct) {
                    var first = correct ? turnOrder.attacker : turnOrder.defender;
                    var second = correct ? turnOrder.defender : turnOrder.attacker;
                    _this.$mdDialog.hide();
                    turnOrder.report(first, second);
                    then && then();
                });
            };
            /**
             * Pick what type of move to execute for a player.
             * @param chooseMove The [[ICombatChooseMove]] event with details about players.
             * @param attacker True if picking for the attacker, false if for the defender.
             * @param then The callback to invoke once a move has been chosen and reported.
             */
            CombatHudController.prototype.pickMove = function (chooseMove, attacker, then) {
                this.$mdDialog.show({
                    controller: controllers.CombatChooseMoveController,
                    templateUrl: 'games/dorkapon/dialogs/combatChooseMove.html',
                    controllerAs: 'choose',
                    clickOutsideToClose: false,
                    escapeToClose: false,
                    locals: {
                        event: chooseMove,
                        attack: attacker
                    },
                    bindToController: true
                }).then(function (move) {
                    chooseMove.report(attacker ? chooseMove.attacker : chooseMove.defender, move);
                    then && then();
                });
            };
            CombatHudController.$inject = [
                '$scope',
                '$rootScope',
                '$timeout',
                '$mdDialog',
                '$dorkapon',
                '$damageValue'
            ];
            return CombatHudController;
        })();
        controllers.CombatHudController = CombatHudController;
        dorkapon.app.controller('CombatHudController', CombatHudController);
    })(controllers = dorkapon.controllers || (dorkapon.controllers = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../../../lib/pow2.d.ts" />
var dorkapon;
(function (dorkapon) {
    var DorkaponMapStateMachine = (function (_super) {
        __extends(DorkaponMapStateMachine, _super);
        function DorkaponMapStateMachine() {
            _super.apply(this, arguments);
            this.playerPool = [];
            this.playerQueue = [];
            /**
             * The active player [DorkaponEntity] object.
             */
            this.currentPlayer = null;
            /**
             * The active player last contacted node.
             */
            this.currentNode = null;
            this.states = [
                new dorkapon.states.DorkaponInitGame(),
                new dorkapon.states.DorkaponBeginTurns(),
                new dorkapon.states.DorkaponPlayerTurn(),
                new dorkapon.states.DorkaponPlayerTurnEnd()
            ];
        }
        return DorkaponMapStateMachine;
    })(pow2.StateMachine);
    dorkapon.DorkaponMapStateMachine = DorkaponMapStateMachine;
})(dorkapon || (dorkapon = {}));
var dorkapon;
(function (dorkapon) {
    var states;
    (function (states) {
        var DorkaponInitGame = (function (_super) {
            __extends(DorkaponInitGame, _super);
            function DorkaponInitGame() {
                _super.apply(this, arguments);
                this.name = DorkaponInitGame.NAME;
            }
            DorkaponInitGame.prototype.enter = function (machine) {
                _super.prototype.enter.call(this, machine);
                machine.setCurrentState(DorkaponBeginTurns.NAME);
            };
            DorkaponInitGame.NAME = "init-game";
            return DorkaponInitGame;
        })(pow2.State);
        states.DorkaponInitGame = DorkaponInitGame;
        var DorkaponBeginTurns = (function (_super) {
            __extends(DorkaponBeginTurns, _super);
            function DorkaponBeginTurns() {
                _super.apply(this, arguments);
                this.name = DorkaponBeginTurns.NAME;
            }
            DorkaponBeginTurns.prototype.enter = function (machine) {
                _super.prototype.enter.call(this, machine);
                machine.playerQueue = machine.playerPool.slice();
                machine.currentPlayer = machine.playerQueue.shift();
                machine.setCurrentState(DorkaponPlayerTurn.NAME);
            };
            DorkaponBeginTurns.NAME = "begin-turns";
            return DorkaponBeginTurns;
        })(pow2.State);
        states.DorkaponBeginTurns = DorkaponBeginTurns;
        var DorkaponPlayerTurn = (function (_super) {
            __extends(DorkaponPlayerTurn, _super);
            function DorkaponPlayerTurn() {
                _super.apply(this, arguments);
                this.name = DorkaponPlayerTurn.NAME;
            }
            DorkaponPlayerTurn.prototype.enter = function (machine) {
                _super.prototype.enter.call(this, machine);
                var data = {
                    player: machine.currentPlayer
                };
                data.player.model.set({
                    moves: Math.floor(Math.random() * 6) + 1
                });
                machine.notify(DorkaponPlayerTurn.EVENT, data, function () {
                    machine.setCurrentState(DorkaponPlayerTurnEnd.NAME);
                });
            };
            DorkaponPlayerTurn.NAME = "player-turn";
            DorkaponPlayerTurn.EVENT = "player:turn";
            return DorkaponPlayerTurn;
        })(pow2.State);
        states.DorkaponPlayerTurn = DorkaponPlayerTurn;
        var DorkaponPlayerTurnEnd = (function (_super) {
            __extends(DorkaponPlayerTurnEnd, _super);
            function DorkaponPlayerTurnEnd() {
                _super.apply(this, arguments);
                this.name = DorkaponPlayerTurnEnd.NAME;
            }
            DorkaponPlayerTurnEnd.prototype.enter = function (machine) {
                _super.prototype.enter.call(this, machine);
                var data = {
                    player: machine.currentPlayer
                };
                machine.notify(DorkaponPlayerTurnEnd.EVENT, data, function () {
                    if (machine.playerQueue.length > 0) {
                        machine.currentPlayer = machine.playerQueue.shift();
                        console.log("Next turn is: " + machine.currentPlayer.toString());
                        machine.setCurrentState(DorkaponPlayerTurn.NAME);
                    }
                    else {
                        // TODO: Defensive aesthetic delay, remove.
                        _.delay(function () {
                            // TODO: This should probably do something more intelligent
                            machine.setCurrentState(DorkaponBeginTurns.NAME);
                        }, 500);
                    }
                });
            };
            DorkaponPlayerTurnEnd.NAME = "player-turn-end";
            DorkaponPlayerTurnEnd.EVENT = "player:turn-end";
            return DorkaponPlayerTurnEnd;
        })(pow2.State);
        states.DorkaponPlayerTurnEnd = DorkaponPlayerTurnEnd;
    })(states = dorkapon.states || (dorkapon.states = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../../lib/pow2.d.ts" />
/// <reference path="./states/dorkaponMapState.ts" />
var dorkapon;
(function (dorkapon) {
    var DorkaponGameWorld = (function (_super) {
        __extends(DorkaponGameWorld, _super);
        function DorkaponGameWorld(services) {
            _super.call(this, services);
            /**
             * The current combat state (if any).  The presence of this
             * state machine being valid may trigger the game UI to transition
             * to combat.
             *
             * This variable should be set to null when no combat is taking place.
             */
            this.combatState = null;
            //pow2.GameDataResource.clearCache();
            this.loader.registerType('powEntities', pow2.EntityContainerResource);
            this.tables = this.loader.loadAsType(dorkapon.SPREADSHEET_ID, pow2.GameDataResource);
            this.factory = this.loader.load(pow2.GAME_ROOT + dorkapon.ENTITIES_CONTAINER);
        }
        /**
         * Get the game data sheets from google and callback when they're loaded.
         * @param then The function to call when spreadsheet data has been fetched
         */
        DorkaponGameWorld.getDataSource = function (then) {
            var world = pow2.getWorld(dorkapon.NAME);
            if (world.tables.isReady()) {
                then(world.tables);
            }
            else {
                world.tables.once(pow2.Resource.READY, function () {
                    then(world.tables);
                });
            }
            return world.tables;
        };
        return DorkaponGameWorld;
    })(pow2.scene.SceneWorld);
    dorkapon.DorkaponGameWorld = DorkaponGameWorld;
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../index.ts"/>
/// <reference path="../states/dorkaponMapState.ts"/>
/// <reference path="../dorkaponGameWorld.ts"/>
var dorkapon;
(function (dorkapon) {
    var services;
    (function (services) {
        var DorkaponService = (function () {
            function DorkaponService(compile, scope) {
                this.compile = compile;
                this.scope = scope;
                if (this.qs().hasOwnProperty('dev')) {
                    console.log("Clearing gameData cache and loading live from Google Spreadsheets");
                    pow2.GameDataResource.clearCache(dorkapon.SPREADSHEET_ID);
                }
                this.loader = pow2.ResourceLoader.get();
                this.world = new dorkapon.DorkaponGameWorld({
                    scene: new pow2.scene.Scene({
                        autoStart: true,
                        debugRender: false
                    })
                });
                pow2.registerWorld(dorkapon.NAME, this.world);
                this.machine = this.world.setService('state', new dorkapon.DorkaponAppStateMachine());
                // Tell the world time manager to start ticking.
                this.world.time.start();
            }
            /**
             * Start a new game.
             * @param then
             */
            DorkaponService.prototype.newGame = function (then) {
                this.machine.setCurrentState(dorkapon.states.AppMapState.NAME);
                then && then();
            };
            /**
             * Extract the browser location query params
             * http://stackoverflow.com/questions/9241789/how-to-get-url-params-with-javascript
             */
            DorkaponService.prototype.qs = function () {
                if (window.location.search) {
                    var query_string = {};
                    (function () {
                        var e, a = /\+/g, r = /([^&=]+)=?([^&]*)/g, d = function (s) {
                            return decodeURIComponent(s.replace(a, " "));
                        }, q = window.location.search.substring(1);
                        while ((e = r.exec(q))) {
                            query_string[d(e[1])] = d(e[2]);
                        }
                    })();
                    return query_string;
                }
                return {};
            };
            return DorkaponService;
        })();
        services.DorkaponService = DorkaponService;
        dorkapon.app.factory('$dorkapon', [
            '$compile',
            '$rootScope',
            function ($compile, $rootScope) {
                return new DorkaponService($compile, $rootScope);
            }
        ]);
    })(services = dorkapon.services || (dorkapon.services = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../services/dorkaponService.ts"/>
var dorkapon;
(function (dorkapon) {
    var controllers;
    (function (controllers) {
        dorkapon.app.controller('DorkaponGameController', [
            '$scope',
            '$timeout',
            '$dorkapon',
            function ($scope, $timeout, $dorkapon) {
                $scope.loadingTitle = "Dorkapon!";
                $scope.loadingMessage = "Asking Google for data...";
                $scope.loading = true;
                $scope.range = function (n) {
                    return new Array(n);
                };
                dorkapon.DorkaponGameWorld.getDataSource(function () {
                    $scope.$apply(function () {
                        $scope.loadingMessage = "Loading the things...";
                    });
                    $dorkapon.newGame(function () {
                        $scope.$apply(function () {
                            $scope.loading = false;
                            $scope.loaded = true;
                        });
                    });
                });
            }
        ]);
    })(controllers = dorkapon.controllers || (dorkapon.controllers = {}));
})(dorkapon || (dorkapon = {}));
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
var dorkapon;
(function (dorkapon) {
    var controllers;
    (function (controllers) {
        var MapHudController = (function () {
            function MapHudController($scope, $dorkapon, $mdDialog) {
                var _this = this;
                this.$scope = $scope;
                this.$dorkapon = $dorkapon;
                this.$mdDialog = $mdDialog;
                /**
                 * The current player turn.
                 */
                this.turn = null;
                var changeHandler = function () {
                    _this.$scope.$$phase || _this.$scope.$digest();
                };
                $dorkapon.machine.on(pow2.StateMachine.Events.ENTER, function (newState) {
                    if (newState.name === dorkapon.states.AppMapState.NAME) {
                        var mapState = newState;
                        mapState.machine.on(dorkapon.states.DorkaponPlayerTurn.EVENT, function (e) {
                            _this.$scope.$apply(function () {
                                _this.turn = e;
                            });
                            e.player.model.on('change', changeHandler);
                        }, _this);
                        mapState.machine.on(dorkapon.states.DorkaponPlayerTurnEnd.EVENT, function (e) {
                            e.player.model.off('change', changeHandler);
                            _this.$scope.$apply(function () {
                                _this.turn = null;
                            });
                        }, _this);
                    }
                });
                $dorkapon.machine.on(pow2.StateMachine.Events.EXIT, function (oldState) {
                    if (oldState.name === dorkapon.states.AppMapState.NAME) {
                        var mapState = oldState;
                        mapState.machine.off(dorkapon.states.DorkaponPlayerTurn.EVENT, null, _this);
                        mapState.machine.off(dorkapon.states.DorkaponPlayerTurnEnd.EVENT, null, _this);
                    }
                });
                this.$scope.$on('$destroy', function () {
                    if ($dorkapon.machine) {
                        $dorkapon.machine.off(pow2.StateMachine.Events.ENTER, null, _this);
                        $dorkapon.machine.off(pow2.StateMachine.Events.EXIT, null, _this);
                    }
                });
                return this;
            }
            MapHudController.prototype.showPlayerCard = function (player) {
                this.$mdDialog.show({
                    controller: controllers.CharacterCardController,
                    controllerAs: 'character',
                    templateUrl: 'games/dorkapon/controllers/characterCard.html',
                    locals: {
                        model: player.model
                    },
                    bindToController: true
                });
            };
            MapHudController.$inject = [
                '$scope',
                '$dorkapon',
                '$mdDialog'
            ];
            return MapHudController;
        })();
        controllers.MapHudController = MapHudController;
        dorkapon.app.controller('MapHudController', MapHudController);
    })(controllers = dorkapon.controllers || (dorkapon.controllers = {}));
})(dorkapon || (dorkapon = {}));
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
var dorkapon;
(function (dorkapon) {
    var controllers;
    (function (controllers) {
        var CombatChooseMoveController = (function () {
            function CombatChooseMoveController($scope, $timeout, $mdDialog) {
                var _this = this;
                this.$scope = $scope;
                this.$timeout = $timeout;
                this.$mdDialog = $mdDialog;
                this.event = null;
                this.attack = null;
                this.current = null;
                this.physicalText = "";
                this.magicText = "";
                this.specialText = "";
                this.skillText = "";
                // Defer initialization until angular can bind the locals to our instance.
                $timeout(function () {
                    if (_this.event === null || _this.attack === null) {
                        throw new Error("Dialog must have event and attack bound to instance");
                    }
                    if (_this.attack) {
                        _this.physicalText = "Attack";
                        _this.magicText = "Magic";
                        _this.specialText = "Strike";
                        _this.skillText = "Skill";
                        _this.current = _this.event.attacker;
                    }
                    else {
                        _this.physicalText = "Defend";
                        _this.magicText = "M Defend";
                        _this.specialText = "Counter";
                        _this.skillText = "Skill";
                        _this.current = _this.event.defender;
                    }
                }, 0);
                return this;
            }
            /**
             * Select the desired move type.
             * @param type
             */
            CombatChooseMoveController.prototype.select = function (type) {
                switch (type) {
                    case 'physical':
                        this.$mdDialog.hide(this.attack ? dorkapon.states.MoveChoice.ATTACK : dorkapon.states.MoveChoice.DEFEND);
                        break;
                    case 'magic':
                        this.$mdDialog.hide(this.attack ? dorkapon.states.MoveChoice.ATTACK_MAGIC : dorkapon.states.MoveChoice.DEFEND_MAGIC);
                        break;
                    case 'special':
                        this.$mdDialog.hide(this.attack ? dorkapon.states.MoveChoice.STRIKE : dorkapon.states.MoveChoice.COUNTER);
                        break;
                    case 'skill':
                        this.$mdDialog.hide(this.attack ? dorkapon.states.MoveChoice.ATTACK_SKILL : dorkapon.states.MoveChoice.DEFEND_SKILL);
                        break;
                }
            };
            CombatChooseMoveController.$inject = [
                '$scope',
                '$timeout',
                '$mdDialog'
            ];
            return CombatChooseMoveController;
        })();
        controllers.CombatChooseMoveController = CombatChooseMoveController;
        dorkapon.app.controller('CombatChooseMoveController', CombatChooseMoveController);
    })(controllers = dorkapon.controllers || (dorkapon.controllers = {}));
})(dorkapon || (dorkapon = {}));
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
var dorkapon;
(function (dorkapon) {
    var controllers;
    (function (controllers) {
        var CombatTurnOrderController = (function () {
            function CombatTurnOrderController($scope, $timeout, $mdDialog) {
                var _this = this;
                this.$scope = $scope;
                this.$timeout = $timeout;
                this.$mdDialog = $mdDialog;
                this.combat = null;
                this.picking = true;
                this.left = null;
                this.right = null;
                this.leftText = "?";
                this.rightText = "?";
                this.pickCorrect = false;
                this.pick = function (left) {
                    var leftFirst = _.random(0, 100) > 50;
                    _this.leftText = leftFirst ? "✓" : "✗";
                    _this.rightText = leftFirst ? "✗" : "✓";
                    _this.pick = null;
                    _this.pickCorrect = left === leftFirst;
                    _this.$timeout(function () {
                        _this.$mdDialog.hide(_this.pickCorrect);
                    }, 2000);
                };
                return this;
            }
            CombatTurnOrderController.$inject = [
                '$scope',
                '$timeout',
                '$mdDialog'
            ];
            return CombatTurnOrderController;
        })();
        controllers.CombatTurnOrderController = CombatTurnOrderController;
        dorkapon.app.controller('CombatTurnOrderController', CombatTurnOrderController);
    })(controllers = dorkapon.controllers || (dorkapon.controllers = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../services/dorkaponService.ts"/>
var dorkapon;
(function (dorkapon) {
    var directives;
    (function (directives) {
        var DorkaponHudController = (function () {
            function DorkaponHudController($dorkapon, scope, $timeout) {
                var _this = this;
                this.$dorkapon = $dorkapon;
                this.scope = scope;
                this.$timeout = $timeout;
                $dorkapon.world.time.addObject(this);
                scope.$on('$destroy', function () {
                    $dorkapon.world.time.removeObject(_this);
                });
            }
            DorkaponHudController.$inject = ['$dorkapon', '$scope', '$timeout'];
            return DorkaponHudController;
        })();
        directives.DorkaponHudController = DorkaponHudController;
        dorkapon.app.directive('dorkaponHud', [
            '$dorkapon',
            '$compile',
            function ($dorkapon, $compile) {
                var _this = this;
                return {
                    restrict: 'E',
                    replace: true,
                    templateUrl: 'games/dorkapon/directives/dorkaponHud.html',
                    controller: DorkaponHudController,
                    controllerAs: "hud",
                    link: function (scope, element, attrs, controller) {
                        var changeHandler = function () {
                            scope.$$phase || scope.$digest();
                        };
                        scope.$on('$destroy', function () {
                            if ($dorkapon.machine) {
                                $dorkapon.machine.off(pow2.StateMachine.Events.ENTER, null, _this);
                                $dorkapon.machine.off(pow2.StateMachine.Events.EXIT, null, _this);
                            }
                        });
                    }
                };
            }]);
    })(directives = dorkapon.directives || (dorkapon.directives = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="./index.ts" />
var dorkapon;
(function (dorkapon) {
    var DorkaponMapView = (function (_super) {
        __extends(DorkaponMapView, _super);
        function DorkaponMapView() {
            _super.apply(this, arguments);
            this.targetFill = "transparent";
            this.targetStroke = "white";
            this.targetStrokeWidth = 2;
            this.stateMachine = null;
        }
        DorkaponMapView.prototype.processCamera = function () {
            if (this.stateMachine && this.stateMachine.currentPlayer) {
                var camera = this.stateMachine.currentPlayer.findComponent(pow2.scene.components.CameraComponent);
                if (camera) {
                    camera.process(this);
                }
            }
        };
        DorkaponMapView.prototype.mouseClick = function (e) {
            if (this.stateMachine && this.stateMachine.currentPlayer) {
                var pathComponent = this.stateMachine.currentPlayer.findComponent(dorkapon.components.PlayerPathComponent);
                var playerComponent = this.stateMachine.currentPlayer.findComponent(pow2.scene.components.PlayerComponent);
                if (pathComponent && playerComponent) {
                    pow2.Input.mouseOnView(e.originalEvent, this.mouse.view, this.mouse);
                    var nodes = pathComponent.tileMap.getNodes();
                    var hitNode = _.where(nodes, {
                        x: this.mouse.world.x,
                        y: this.mouse.world.y
                    });
                    if (hitNode.length) {
                        playerComponent.path = pathComponent.calculatePath(playerComponent.targetPoint, this.mouse.world);
                    }
                    e.preventDefault();
                    return false;
                }
            }
        };
        /*
         * Render the combat render objects.
         */
        DorkaponMapView.prototype.renderFrame = function (elapsed) {
            var _this = this;
            _super.prototype.renderFrame.call(this, elapsed);
            var players = this.scene.objectsByComponent(pow2.game.components.PlayerCombatRenderComponent);
            _.each(players, function (player) {
                _this.objectRenderer.render(player, player, _this);
            });
            return this;
        };
        return DorkaponMapView;
    })(pow2.game.GameMapView);
    dorkapon.DorkaponMapView = DorkaponMapView;
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../dorkaponMapView.ts"/>
var dorkapon;
(function (dorkapon) {
    var directives;
    (function (directives) {
        dorkapon.app.directive('dorkaponMap', [
            '$compile',
            '$dorkapon',
            function ($compile, $dorkapon) {
                return {
                    restrict: 'A',
                    link: function ($scope, element, attrs) {
                        $scope.canvas = element[0];
                        var context = $scope.canvas.getContext("2d");
                        context.webkitImageSmoothingEnabled = false;
                        context.mozImageSmoothingEnabled = false;
                        window.addEventListener('resize', onResize, false);
                        var firstSize = true;
                        var $window = $(window);
                        function onResize() {
                            var w = 800;
                            var h = 600;
                            if (firstSize && $window.width() < 800 || !firstSize && element.parent().width() < 800) {
                                w = 400;
                                h = 300;
                            }
                            firstSize = false;
                            context.canvas.width = element[0].width = w;
                            context.canvas.height = element[0].height = h;
                            element.css({
                                'min-width': w
                            });
                            context.webkitImageSmoothingEnabled = false;
                            context.mozImageSmoothingEnabled = false;
                        }
                        var gameView = new dorkapon.DorkaponMapView(element[0], $dorkapon.loader);
                        $dorkapon.world.setService('mapView', gameView);
                        gameView.camera.extent.set(8, 6);
                        $dorkapon.world.scene.addView(gameView);
                        onResize();
                    }
                };
            }
        ]);
    })(directives = dorkapon.directives || (dorkapon.directives = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="./dorkaponGameWorld.ts" />
var dorkapon;
(function (dorkapon) {
    /**
     * These are currently hardcoded to specific tile set GID numbers that
     * correspond to the various connector graphics used to represent horizontal
     * and vertical paths.
     *
     * These specific textures are used to dynamically build paths between nodes.
     */
    (function (PathTiles) {
        PathTiles[PathTiles["HORIZ_LEFT"] = 25] = "HORIZ_LEFT";
        PathTiles[PathTiles["HORIZ_CENTER"] = 26] = "HORIZ_CENTER";
        PathTiles[PathTiles["HORIZ_RIGHT"] = 27] = "HORIZ_RIGHT";
        PathTiles[PathTiles["VERT_TOP"] = 34] = "VERT_TOP";
        PathTiles[PathTiles["VERT_MIDDLE"] = 35] = "VERT_MIDDLE";
        PathTiles[PathTiles["VERT_BOTTOM"] = 36] = "VERT_BOTTOM";
    })(dorkapon.PathTiles || (dorkapon.PathTiles = {}));
    var PathTiles = dorkapon.PathTiles;
    /**
     * These are hardcoded to specific tile set GID numbers that correspond to
     * the various types of nodes a player may land on.
     *
     * These specific textures are used to indicate metadata about the tile.
     */
    (function (NodeTiles) {
        NodeTiles[NodeTiles["YELLOW"] = 54] = "YELLOW";
        NodeTiles[NodeTiles["ARMOR"] = 58] = "ARMOR";
        NodeTiles[NodeTiles["WEAPON"] = 59] = "WEAPON";
        NodeTiles[NodeTiles["ITEM"] = 60] = "ITEM";
        NodeTiles[NodeTiles["RED"] = 63] = "RED";
        NodeTiles[NodeTiles["BLUE"] = 72] = "BLUE";
        NodeTiles[NodeTiles["GREEN"] = 71] = "GREEN";
    })(dorkapon.NodeTiles || (dorkapon.NodeTiles = {}));
    var NodeTiles = dorkapon.NodeTiles;
    /**
     * Enumerated path weights for use in input grid creation.
     */
    (function (PathWeights) {
        PathWeights[PathWeights["CAN_REST"] = 10] = "CAN_REST";
        PathWeights[PathWeights["CAN_WALK"] = 5] = "CAN_WALK";
        PathWeights[PathWeights["BLOCKED"] = 1000] = "BLOCKED";
    })(dorkapon.PathWeights || (dorkapon.PathWeights = {}));
    var PathWeights = dorkapon.PathWeights;
    var DorkaponTileMap = (function (_super) {
        __extends(DorkaponTileMap, _super);
        function DorkaponTileMap() {
            _super.apply(this, arguments);
        }
        DorkaponTileMap.prototype.loaded = function () {
            _super.prototype.loaded.call(this);
            this.buildFeatures();
        };
        DorkaponTileMap.prototype.destroy = function () {
            this.unloaded();
            return _super.prototype.destroy.call(this);
        };
        DorkaponTileMap.prototype.unloaded = function () {
            this.removeFeaturesFromScene();
            _super.prototype.unloaded.call(this);
        };
        DorkaponTileMap.prototype.addFeaturesToScene = function () {
            var _this = this;
            var nodes = this.getNodes();
            _.each(nodes, function (obj) {
                obj._object = _this.createFeatureObject(obj);
                if (obj._object) {
                    _this.scene.addObject(obj._object);
                }
            });
        };
        DorkaponTileMap.prototype.removeFeaturesFromScene = function () {
            var nodes = this.getNodes();
            _.each(nodes, function (obj) {
                var featureObject = obj._object;
                delete obj._object;
                if (featureObject) {
                    featureObject.destroy();
                }
            });
        };
        DorkaponTileMap.prototype.buildFeatures = function () {
            this.removeFeaturesFromScene();
            if (this.scene) {
                this.addFeaturesToScene();
            }
            return true;
        };
        DorkaponTileMap.prototype.createFeatureObject = function (node) {
            var options = {
                tileMap: this,
                type: node.type,
                point: new pow2.Point(node.x, node.y)
            };
            var object = new dorkapon.objects.DorkaponEntity(options);
            this.world.mark(object);
            var className = null;
            switch (node.type) {
                case NodeTiles.ARMOR:
                    className = "dorkapon.components.tiles.ArmorTile";
                    break;
                case NodeTiles.WEAPON:
                    className = "dorkapon.components.tiles.WeaponTile";
                    break;
                case NodeTiles.ITEM:
                    className = "dorkapon.components.tiles.ItemTile";
                    break;
                case NodeTiles.BLUE:
                    className = "dorkapon.components.tiles.BlueTile";
                    break;
                case NodeTiles.YELLOW:
                    className = "dorkapon.components.tiles.YellowTile";
                    break;
                case NodeTiles.RED:
                    className = "dorkapon.components.tiles.RedTile";
                    break;
                case NodeTiles.GREEN:
                    className = "dorkapon.components.tiles.GreenTile";
                    break;
            }
            var componentType = pow2.EntityContainerResource.getClassType(className);
            if (componentType) {
                var component = (new componentType());
                if (!object.addComponent(component)) {
                    throw new Error("Component " + component.name + " failed to connect to host " + this.name);
                }
            }
            return object;
        };
        /**
         * Get a list of INodeTile objects that exist in the tile map.
         */
        DorkaponTileMap.prototype.getNodes = function () {
            var nodes = this.getLayer(DorkaponTileMap.Layers.NODES);
            if (!nodes) {
                return [];
            }
            // Build a list of INodeTile objects.
            var mapWidth = this.bounds.extent.x;
            var asNodeTile = _.map(nodes.data, function (gid, index) {
                switch (gid) {
                    case NodeTiles.ARMOR:
                    case NodeTiles.WEAPON:
                    case NodeTiles.ITEM:
                    case NodeTiles.RED:
                    case NodeTiles.GREEN:
                    case NodeTiles.BLUE:
                    case NodeTiles.YELLOW:
                        var x = index % mapWidth;
                        var y = (index - x) / mapWidth;
                        return {
                            type: gid,
                            x: x,
                            y: y,
                            _object: null
                        };
                    default:
                        // We don't care about this tile, it doesn't match a known NodeTile id.
                        return null;
                }
            });
            // Compact the list to remove null entries, and return a
            // list of just the nodes and their locations.
            return _.compact(asNodeTile);
        };
        DorkaponTileMap.prototype.getHorizPaths = function () {
            var nodes = this.getLayer(DorkaponTileMap.Layers.HORIZONTAL_PATHS);
            if (!nodes) {
                return [];
            }
            // Build a list of INodeTile objects.
            var mapWidth = this.bounds.extent.x;
            var paths = _.map(nodes.data, function (gid, index) {
                switch (gid) {
                    case PathTiles.HORIZ_LEFT:
                    case PathTiles.HORIZ_CENTER:
                    case PathTiles.HORIZ_RIGHT:
                        var x = index % mapWidth;
                        var y = (index - x) / mapWidth;
                        return {
                            type: gid,
                            x: x,
                            y: y
                        };
                    default:
                        // We don't care about this tile, it doesn't match a known PathTile id.
                        return null;
                }
            });
            // Compact the list to remove null entries, and return a
            // list of just the nodes and their locations.
            return _.compact(paths);
        };
        DorkaponTileMap.prototype.getVertPaths = function () {
            var nodes = this.getLayer(DorkaponTileMap.Layers.VERTICAL_PATHS);
            if (!nodes) {
                return [];
            }
            // Build a list of INodeTile objects.
            var mapWidth = this.bounds.extent.x;
            var paths = _.map(nodes.data, function (gid, index) {
                switch (gid) {
                    case PathTiles.VERT_TOP:
                    case PathTiles.VERT_MIDDLE:
                    case PathTiles.VERT_BOTTOM:
                        var x = index % mapWidth;
                        var y = (index - x) / mapWidth;
                        return {
                            type: gid,
                            x: x,
                            y: y
                        };
                    default:
                        // We don't care about this tile, it doesn't match a known PathTile id.
                        return null;
                }
            });
            // Compact the list to remove null entries, and return a
            // list of just the nodes and their locations.
            return _.compact(paths);
        };
        DorkaponTileMap.Layers = {
            NODES: "nodes",
            HORIZONTAL_PATHS: "paths-horizontal",
            VERTICAL_PATHS: "paths-vertical"
        };
        return DorkaponTileMap;
    })(pow2.tile.TileMap);
    dorkapon.DorkaponTileMap = DorkaponTileMap;
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../index.ts" />
var dorkapon;
(function (dorkapon) {
    var models;
    (function (models) {
        var DorkaponEntity = (function (_super) {
            __extends(DorkaponEntity, _super);
            function DorkaponEntity() {
                _super.apply(this, arguments);
            }
            DorkaponEntity.prototype.defaults = function () {
                return _.extend({}, DorkaponEntity.DEFAULTS);
            };
            /**
             * Apply a given amount of damage to this entity.  If the HP falls
             * below zero, it will be set to zero.
             *
             * @param value The amount of damage to apply.
             */
            DorkaponEntity.prototype.damage = function (value) {
                this.set('hp', this.attributes.hp - value);
                if (this.attributes.hp < 0) {
                    this.set('hp', 0);
                }
            };
            /**
             * Determine if a player is defeated.
             * @returns {boolean} True if the player's hp is 0.
             */
            DorkaponEntity.prototype.isDefeated = function () {
                return this.attributes.hp <= 0;
            };
            DorkaponEntity.prototype.getAttack = function () {
                return this.attributes.attack;
            };
            DorkaponEntity.prototype.getDefense = function () {
                return this.attributes.defense;
            };
            DorkaponEntity.prototype.getMagic = function () {
                return this.attributes.magic;
            };
            DorkaponEntity.prototype.getSpeed = function () {
                return this.attributes.speed;
            };
            DorkaponEntity.DEFAULTS = {
                name: "InvalidName",
                type: "InvalidClass",
                icon: "",
                moves: 0,
                level: 1,
                exp: 0,
                hp: 1,
                maxhp: 1,
                attack: 1,
                defense: 1,
                magic: 1,
                speed: 1
            };
            return DorkaponEntity;
        })(Backbone.Model);
        models.DorkaponEntity = DorkaponEntity;
    })(models = dorkapon.models || (dorkapon.models = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../index.ts" />
var dorkapon;
(function (dorkapon) {
    var models;
    (function (models) {
        var DorkaponMonster = (function (_super) {
            __extends(DorkaponMonster, _super);
            function DorkaponMonster() {
                _super.apply(this, arguments);
            }
            DorkaponMonster.prototype.defaults = function () {
                return _.extend(_super.prototype.defaults.call(this), DorkaponMonster.DEFAULTS);
            };
            DorkaponMonster.create = function (options) {
                var result = new DorkaponMonster(options);
                result.set({
                    hp: result.attributes.hp,
                    maxhp: result.attributes.hp
                });
                return result;
            };
            DorkaponMonster.DEFAULTS = {
                name: "InvalidName",
                type: "InvalidClass",
                icon: "",
                level: 1,
                exp: 0,
                hp: 1,
                maxhp: 1,
                attack: 1,
                defense: 1,
                magic: 1,
                speed: 1
            };
            return DorkaponMonster;
        })(models.DorkaponEntity);
        models.DorkaponMonster = DorkaponMonster;
    })(models = dorkapon.models || (dorkapon.models = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../index.ts" />
var dorkapon;
(function (dorkapon) {
    var models;
    (function (models) {
        var DorkaponPlayer = (function (_super) {
            __extends(DorkaponPlayer, _super);
            function DorkaponPlayer() {
                _super.apply(this, arguments);
            }
            DorkaponPlayer.prototype.defaults = function () {
                return _.extend(_super.prototype.defaults.call(this), DorkaponPlayer.DEFAULTS);
            };
            DorkaponPlayer.prototype.getAttack = function () {
                var base = this.attributes.attack;
                if (this.attributes.weapon) {
                    base += this.attributes.weapon.attack;
                }
                if (this.attributes.armor) {
                    base += this.attributes.armor.attack;
                }
                return base;
            };
            DorkaponPlayer.prototype.getDefense = function () {
                var base = this.attributes.defense;
                if (this.attributes.weapon) {
                    base += this.attributes.weapon.defense;
                }
                if (this.attributes.armor) {
                    base += this.attributes.armor.defense;
                }
                return base;
            };
            DorkaponPlayer.prototype.getMagic = function () {
                var base = this.attributes.magic;
                if (this.attributes.weapon) {
                    base += this.attributes.weapon.magic;
                }
                if (this.attributes.armor) {
                    base += this.attributes.armor.magic;
                }
                return base;
            };
            DorkaponPlayer.prototype.getSpeed = function () {
                var base = this.attributes.speed;
                if (this.attributes.weapon) {
                    base += this.attributes.weapon.speed;
                }
                if (this.attributes.armor) {
                    base += this.attributes.armor.speed;
                }
                return base;
            };
            DorkaponPlayer.create = function (options) {
                var result = new DorkaponPlayer(options);
                if (_.isUndefined(options.magic)) {
                    result.set({ magic: options.basemagic });
                }
                if (_.isUndefined(options.attack)) {
                    result.set({ attack: options.baseattack });
                }
                if (_.isUndefined(options.speed)) {
                    result.set({ speed: options.basespeed });
                }
                if (_.isUndefined(options.defense)) {
                    result.set({ defense: options.basedefense });
                }
                result.set({
                    hp: result.attributes.basehp,
                    maxhp: result.attributes.basehp
                });
                return result;
            };
            DorkaponPlayer.DEFAULTS = {
                basehp: 1,
                baseattack: 1,
                basedefense: 1,
                basemagic: 1,
                basespeed: 1,
                levelhp: 10,
                levelattack: 1,
                leveldefense: 1,
                levelmagic: 1,
                levelspeed: 1,
                armor: null,
                weapon: null,
                offenseMagic: null,
                defenseMagic: null
            };
            return DorkaponPlayer;
        })(models.DorkaponEntity);
        models.DorkaponPlayer = DorkaponPlayer;
    })(models = dorkapon.models || (dorkapon.models = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="./../index.ts" />
var dorkapon;
(function (dorkapon) {
    var objects;
    (function (objects) {
        var DorkaponEntity = (function (_super) {
            __extends(DorkaponEntity, _super);
            function DorkaponEntity() {
                _super.apply(this, arguments);
            }
            return DorkaponEntity;
        })(pow2.tile.TileObject);
        objects.DorkaponEntity = DorkaponEntity;
    })(objects = dorkapon.objects || (dorkapon.objects = {}));
})(dorkapon || (dorkapon = {}));
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
/// <reference path="../index.ts" />
var dorkapon;
(function (dorkapon) {
    var DorkaponAppStateMachine = (function (_super) {
        __extends(DorkaponAppStateMachine, _super);
        function DorkaponAppStateMachine() {
            _super.apply(this, arguments);
            this.states = [
                new dorkapon.states.AppMainMenuState(this),
                new dorkapon.states.AppMapState(this),
                new dorkapon.states.AppCombatState(this)
            ];
        }
        return DorkaponAppStateMachine;
    })(pow2.StateMachine);
    dorkapon.DorkaponAppStateMachine = DorkaponAppStateMachine;
})(dorkapon || (dorkapon = {}));
var dorkapon;
(function (dorkapon) {
    var states;
    (function (states) {
        var AppStateBase = (function (_super) {
            __extends(AppStateBase, _super);
            function AppStateBase(parent) {
                _super.call(this);
                this.parent = parent;
                this.world = pow2.getWorld(dorkapon.NAME);
            }
            return AppStateBase;
        })(pow2.State);
        states.AppStateBase = AppStateBase;
        var AppMainMenuState = (function (_super) {
            __extends(AppMainMenuState, _super);
            function AppMainMenuState() {
                _super.apply(this, arguments);
                this.name = AppMainMenuState.NAME;
            }
            AppMainMenuState.NAME = "app.states.mainmenu";
            return AppMainMenuState;
        })(AppStateBase);
        states.AppMainMenuState = AppMainMenuState;
        var AppCombatState = (function (_super) {
            __extends(AppCombatState, _super);
            function AppCombatState() {
                _super.apply(this, arguments);
                this.name = AppCombatState.NAME;
                this.attacker = null;
                this.defender = null;
                this.map = null;
                this.scene = new pow2.scene.Scene();
            }
            AppCombatState.prototype.exit = function (machine) {
                if (this.world.mapView) {
                    this.scene.removeView(this.world.mapView);
                }
                this.world.combatState = this.machine = null;
                this.world.erase(this.scene);
                _super.prototype.exit.call(this, machine);
            };
            AppCombatState.prototype.enter = function (machine) {
                var _this = this;
                _super.prototype.enter.call(this, machine);
                if (!this.world.mapView) {
                    throw new Error("Entering map state without view to render it");
                }
                this.world.mark(this.scene);
                this.scene.addView(this.world.mapView);
                this.world.mapView.setTileMap(this.map);
                this.world.mapView.camera.set(0, 0, 25, 19);
                this.world.combatState = this.machine = new dorkapon.DorkaponCombatStateMachine(this.attacker, this.defender, this.scene, machine);
                this.world.loader.load(pow2.getMapUrl('combat'), function (map) {
                    _this.map = _this.world.factory.createObject('DorkaponMapObject', {
                        resource: map
                    });
                    _this.map.getLayer("world-plains").visible = true;
                    _this.world.mapView.setTileMap(_this.map);
                    _this.scene.addObject(_this.map);
                    _this.machine.setCurrentState(states.DorkaponCombatInit.NAME);
                    _this.map.loaded();
                });
            };
            AppCombatState.NAME = "app.states.combat";
            return AppCombatState;
        })(AppStateBase);
        states.AppCombatState = AppCombatState;
        var AppMapState = (function (_super) {
            __extends(AppMapState, _super);
            function AppMapState() {
                _super.apply(this, arguments);
                this.name = AppMapState.NAME;
                this.map = null;
                this.machine = new dorkapon.DorkaponMapStateMachine();
                this.scene = new pow2.scene.Scene();
                this.initialized = false;
            }
            AppMapState.prototype.createPlayer = function (from, at) {
                if (!from) {
                    throw new Error("Cannot create player without valid model");
                }
                if (!this.world.factory.isReady()) {
                    throw new Error("Cannot create player before entities container is loaded");
                }
                var sprite = this.world.factory.createObject('DorkaponMapPlayer', {
                    model: from,
                    machine: this.machine,
                    map: this.map
                });
                sprite.name = from.attributes.name;
                sprite.icon = from.attributes.icon;
                this.scene.addObject(sprite);
                sprite.setPoint(at);
                return sprite;
            };
            AppMapState.prototype.exit = function (machine) {
                if (!this.world.mapView) {
                    throw new Error("Entering map state without view to render it");
                }
                this.world.mapView.stateMachine = null;
                this.scene.removeView(this.world.mapView);
                this.world.erase(this.scene);
                _super.prototype.exit.call(this, machine);
            };
            AppMapState.prototype.enter = function (machine) {
                _super.prototype.enter.call(this, machine);
                if (!this.world.mapView) {
                    throw new Error("Entering map state without view to render it");
                }
                this.world.mark(this.scene);
                this.scene.addView(this.world.mapView);
                this.world.mapView.setTileMap(this.map);
                this.world.mapView.stateMachine = this.machine;
                if (!this.initialized) {
                    this._loadMap();
                }
            };
            AppMapState.prototype._loadMap = function () {
                var _this = this;
                this.world.loader.load(pow2.getMapUrl('dorkapon'), function (map) {
                    // Create a map
                    _this.map = _this.world.factory.createObject('DorkaponMapObject', {
                        resource: map
                    });
                    _this.world.mapView.setTileMap(_this.map);
                    dorkapon.DorkaponGameWorld.getDataSource(function (res) {
                        var classes = res.getSheetData('classes');
                        var players = [];
                        // Ranger player
                        var tpl = _.where(classes, { id: "warrior" })[0];
                        tpl.icon = tpl.icon.replace("[gender]", "male");
                        var model = dorkapon.models.DorkaponPlayer.create(tpl);
                        players.push(_this.createPlayer(model, new pow2.Point(3, 18)));
                        // Mage player
                        tpl = _.where(classes, { id: "mage" })[0];
                        tpl.icon = tpl.icon.replace("[gender]", "female");
                        model = dorkapon.models.DorkaponPlayer.create(tpl);
                        players.push(_this.createPlayer(model, new pow2.Point(12, 11)));
                        _this.scene.addObject(_this.map);
                        // Give the state machine our players.
                        _this.machine.playerPool = players;
                        // Loaded!
                        _this.map.loaded();
                        _this.world.mapView.setTileMap(_this.map);
                        _this.initialized = true;
                        _this.machine.setCurrentState(states.DorkaponInitGame.NAME);
                    });
                });
            };
            AppMapState.NAME = "app.states.map";
            return AppMapState;
        })(AppStateBase);
        states.AppMapState = AppMapState;
    })(states = dorkapon.states || (dorkapon.states = {}));
})(dorkapon || (dorkapon = {}));
//# sourceMappingURL=pow2.dorkapon.js.map