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
/// <reference path="../../types/backbone/backbone.d.ts"/>
/// <reference path="../../types/angularjs/angular.d.ts"/>
/// <reference path="../../web/bower/pow-core/lib/pow-core.d.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        ui.app = angular.module('pow2', [
            'ngAnimate',
            'ngSanitize',
            'ngTouch'
        ]);
        // HeroView directive
        // ----------------------------------------------------------------------------
        ui.app.directive('heroCard', function () {
            return {
                restrict: 'E',
                scope: true,
                templateUrl: '/source/ui/directives/heroCard.html',
                link: function ($scope, element, attrs) {
                    $scope.hero = attrs.hero;
                    $scope.$watch(attrs.hero, function (hero) {
                        $scope.hero = hero;
                    });
                }
            };
        });
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts"/>
/// <reference path="../../../types/angularjs/angular.d.ts"/>
/// <reference path="../../../lib/pow2.game.d.ts"/>
/// <reference path="../index.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        var PowGameService = (function () {
            function PowGameService(compile, scope) {
                this.compile = compile;
                this.scope = scope;
                this._canvasAcquired = false;
                this._stateKey = "_test2Pow2State";
                if (this.qs().hasOwnProperty('dev')) {
                    console.log("Clearing gameData cache and loading live from Google Spreadsheets");
                    pow2.GameDataResource.clearCache();
                }
                this._renderCanvas = compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="64" height="64"></canvas>')(scope)[0];
                this.loader = new pow2.ResourceLoader();
                this.currentScene = new pow2.Scene({
                    autoStart: true,
                    debugRender: false
                });
                this.world = new pow2.GameWorld({
                    scene: this.currentScene,
                    model: new pow2.GameStateModel(),
                    state: new pow2.GameStateMachine()
                });
                this.machine = this.world.state;
                pow2.registerWorld('pow2', this.world);
                // Tell the world time manager to start ticking.
                this.world.time.start();
            }
            PowGameService.prototype.getSaveData = function () {
                return localStorage.getItem(this._stateKey);
            };
            PowGameService.prototype.resetGame = function () {
                localStorage.removeItem(this._stateKey);
            };
            PowGameService.prototype.saveGame = function (data) {
                localStorage.setItem(this._stateKey, data);
            };
            PowGameService.prototype.createPlayer = function (from, at) {
                if (!from) {
                    throw new Error("Cannot create player without valid model");
                }
                if (this.sprite) {
                    this.sprite.destroy();
                    this.sprite = null;
                }
                this.sprite = new pow2.GameEntityObject({
                    name: from.attributes.name,
                    icon: from.attributes.icon,
                    model: from
                });
                this.world.scene.addObject(this.sprite);
                this.sprite.addComponent(new pow2.PlayerRenderComponent());
                this.sprite.addComponent(new pow2.CollisionComponent());
                this.sprite.addComponent(new pow2.PlayerComponent());
                this.sprite.addComponent(new pow2.PlayerCameraComponent());
                this.sprite.addComponent(new pow2.PlayerTouchComponent());
                if (typeof at === 'undefined' && this.tileMap instanceof pow2.TileMap) {
                    at = this.tileMap.bounds.getCenter();
                }
                this.sprite.setPoint(at || new pow2.Point());
            };
            PowGameService.prototype.loadMap = function (mapName, then, player, at) {
                var _this = this;
                if (this.tileMap) {
                    this.tileMap.destroy();
                    this.tileMap = null;
                }
                this.tileMap = new pow2.GameTileMap(mapName);
                this.tileMap.once('loaded', function () {
                    // Create a movable character with basic components.
                    var model = player || _this.world.model.party[0];
                    _this.createPlayer(model, at);
                    then && then();
                });
                this.world.scene.addObject(this.tileMap);
            };
            PowGameService.prototype.newGame = function (then) {
                this.loadMap("town", then, this.world.model.party[0]);
            };
            PowGameService.prototype.loadGame = function (data, then) {
                var _this = this;
                if (data) {
                    //this.world.model.clear();
                    this.world.model.initData(function () {
                        _this.world.model.parse(data);
                        var at = _this.world.model.getKeyData('playerPosition');
                        at = at ? new pow2.Point(at.x, at.y) : undefined;
                        _this.loadMap(_this.world.model.getKeyData('playerMap') || "town", then, _this.world.model.party[0], at);
                    });
                }
                else {
                    if (this.world.model.party.length === 0) {
                        this.world.model.addHero(pow2.HeroModel.create(pow2.HeroTypes.Warrior, "Warrior"));
                        this.world.model.addHero(pow2.HeroModel.create(pow2.HeroTypes.Ranger, "Ranger"));
                        this.world.model.addHero(pow2.HeroModel.create(pow2.HeroTypes.DeathMage, "Mage"));
                    }
                    this.newGame(then);
                }
            };
            /**
             * Returns a canvas rendering context that may be drawn to.  A corresponding
             * call to releaseRenderContext will return the drawn content of the context.
             */
            PowGameService.prototype.getRenderContext = function (width, height) {
                if (this._canvasAcquired) {
                    throw new Error("Only one rendering canvas is available at a time.  Check for calls to this function without corresponding releaseCanvas() calls.");
                }
                this._canvasAcquired = true;
                this._renderCanvas.width = width;
                this._renderCanvas.height = height;
                var context = this._renderCanvas.getContext('2d');
                context.webkitImageSmoothingEnabled = false;
                context.mozImageSmoothingEnabled = false;
                return context;
            };
            /**
             * Call this after getRenderContext to finish rendering and have the source
             * of the canvas content returned as a data url string.
             */
            PowGameService.prototype.releaseRenderContext = function () {
                this._canvasAcquired = false;
                return this._renderCanvas.toDataURL();
            };
            /**
             * Extract the browser location query params
             * http://stackoverflow.com/questions/9241789/how-to-get-url-params-with-javascript
             */
            PowGameService.prototype.qs = function () {
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
            return PowGameService;
        })();
        ui.PowGameService = PowGameService;
        ui.app.factory('game', [
            '$compile',
            '$rootScope',
            function ($compile, $rootScope) {
                return new PowGameService($compile, $rootScope);
            }
        ]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="services/gameService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        ui.app.directive('combatCanvas', ['$compile', 'game', '$animate', function ($compile, game, $animate) {
            return {
                restrict: 'A',
                link: function ($scope, element, attrs) {
                    var _this = this;
                    $scope.canvas = element[0];
                    var context = $scope.canvas.getContext("2d");
                    context.webkitImageSmoothingEnabled = false;
                    context.mozImageSmoothingEnabled = false;
                    window.addEventListener('resize', onResize, false);
                    var $window = $(window);
                    function onResize() {
                        context.canvas.width = $window.width();
                        context.canvas.height = $window.height();
                        context.webkitImageSmoothingEnabled = false;
                        context.mozImageSmoothingEnabled = false;
                    }
                    var tileView = new pow2.GameCombatView(element[0], game.loader);
                    // Support showing damage on character with fading animation.
                    game.machine.on('enter', function (state) {
                        if (state.name !== pow2.GameCombatState.NAME) {
                            return;
                        }
                        state.machine.on('combat:attack', function (damage, attacker, defender) {
                            var targetPos = defender.point.clone();
                            targetPos.y -= (tileView.camera.point.y + 1.25);
                            targetPos.x -= tileView.camera.point.x;
                            var screenPos = tileView.worldToScreen(targetPos, tileView.cameraScale);
                            var damageValue = $compile('<span class="damage-value' + (damage === 0 ? ' miss' : '') + '" style="position:absolute;left:' + screenPos.x + 'px;top:' + screenPos.y + 'px;">' + damage + '</span>')($scope);
                            $scope.$apply(function () {
                                $animate.enter(damageValue, element.parent(), null, function () {
                                    damageValue.remove();
                                });
                            });
                        });
                    });
                    game.machine.on('combat:begin', function (state) {
                        // Scope apply?
                        // Transition canvas views, and such
                        game.world.combatScene.addView(tileView);
                        game.tileMap.scene.paused = true;
                        tileView.setTileMap(state.tileMap);
                        //tileView.camera.extent.set(state.tileMap.bounds.extent.x,state.tileMap.bounds.extent.y);
                        //tileView.camera.setCenter(state.tileMap.bounds.getCenter());
                        //tileView.setTileMap(<any>state.tileMap);
                        state.machine.on('combat:beginTurn', function (player) {
                            $scope.$apply(function () {
                                $scope.combat = $scope.combat;
                            });
                        });
                    });
                    game.machine.on('combat:end', function (state) {
                        game.world.combatScene.removeView(tileView);
                        game.tileMap.scene.paused = false;
                        state.machine.off('combat:beginTurn', null, _this);
                    });
                    onResize();
                }
            };
        }]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="services/gameService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        ui.app.directive('gameCanvas', ['$compile', 'game', function ($compile, game) {
            return {
                restrict: 'A',
                link: function ($scope, element, attrs) {
                    $scope.canvas = element[0];
                    var context = $scope.canvas.getContext("2d");
                    context.webkitImageSmoothingEnabled = false;
                    context.mozImageSmoothingEnabled = false;
                    window.addEventListener('resize', onResize, false);
                    var $window = $(window);
                    // Inspired by : http://seb.ly/2011/04/multi-touch-game-controller-in-javascripthtml5-for-ipad/
                    //            $scope.canvas.addEventListener('touchstart', onTouchStart, false);
                    //            $scope.canvas.addEventListener('touchmove', onTouchMove, false);
                    //            $scope.canvas.addEventListener('touchend', onTouchEnd, false);
                    window.addEventListener('resize', onResize, false);
                    /**
                     * Game analog input
                     * TODO: Move this into a touch input component.
                     */
                    var gwi = game.world.input;
                    //            gwi.touchId = -1;
                    //            gwi.touchCurrent = new Point(0, 0);
                    //            gwi.touchStart = new Point(0, 0);
                    //            gwi.analogVector = new Point(0, 0);
                    function relTouch(touch) {
                        var canoffset = $($scope.canvas).offset();
                        touch.gameX = touch.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
                        touch.gameY = touch.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
                        return touch;
                    }
                    var $window = $(window);
                    function onTouchStart(e) {
                        _.each(e.touches, function (t) {
                            relTouch(t);
                        });
                        _.each(e.changedTouches, function (t) {
                            relTouch(t);
                        });
                        for (var i = 0; i < e.changedTouches.length; i++) {
                            var touch = e.changedTouches[i];
                            if (gwi.touchId < 0) {
                                gwi.touchId = touch.identifier;
                                gwi.touchStart.set(touch.gameX, touch.gameY);
                                gwi.touchCurrent.copy(gwi.touchStart);
                                gwi.analogVector.zero();
                            }
                        }
                        gwi.touches = e.touches;
                    }
                    function onTouchMove(e) {
                        // Prevent the browser from doing its default thing (scroll, zoom)
                        e.preventDefault();
                        _.each(e.touches, function (t) {
                            relTouch(t);
                        });
                        _.each(e.changedTouches, function (t) {
                            relTouch(t);
                        });
                        for (var i = 0; i < e.changedTouches.length; i++) {
                            var touch = e.changedTouches[i];
                            if (gwi.touchId == touch.identifier) {
                                gwi.touchCurrent.set(touch.gameX, touch.gameY);
                                gwi.analogVector.copy(gwi.touchCurrent);
                                gwi.analogVector.subtract(gwi.touchStart);
                                break;
                            }
                        }
                        gwi.touches = e.touches;
                    }
                    function onTouchEnd(e) {
                        _.each(e.touches, function (t) {
                            relTouch(t);
                        });
                        _.each(e.changedTouches, function (t) {
                            relTouch(t);
                        });
                        gwi.touches = e.touches;
                        for (var i = 0; i < e.changedTouches.length; i++) {
                            var touch = e.changedTouches[i];
                            if (gwi.touchId == touch.identifier) {
                                gwi.touchId = -1;
                                gwi.analogVector.zero();
                                break;
                            }
                        }
                    }
                    function onResize() {
                        context.canvas.width = $window.width();
                        context.canvas.height = $window.height();
                        context.webkitImageSmoothingEnabled = false;
                        context.mozImageSmoothingEnabled = false;
                    }
                    var tileView = new pow2.GameMapView(element[0], game.loader);
                    tileView.camera.extent.set(10, 10);
                    tileView.setTileMap(game.tileMap);
                    game.world.scene.addView(tileView);
                    onResize();
                }
            };
        }]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../../../types/angularjs/angular.d.ts"/>
/// <reference path="../../../lib/pow2.game.d.ts"/>
/// <reference path="./gameService.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        /**
         * Provide a basic service for queuing and showing messages to the user.
         */
        var PowAlertService = (function (_super) {
            __extends(PowAlertService, _super);
            function PowAlertService(element, document, scope, timeout, game, animate) {
                var _this = this;
                _super.call(this);
                this.element = element;
                this.document = document;
                this.scope = scope;
                this.timeout = timeout;
                this.game = game;
                this.animate = animate;
                this._uid = _.uniqueId('alert');
                this.paused = false;
                this.containerSearch = '.ui-container';
                this.container = null;
                this._current = null;
                this._queue = [];
                this._dismissBinding = null;
                game.world.mark(this);
                game.world.time.addObject(this);
                this._dismissBinding = function (e) {
                    _this.dismiss();
                };
            }
            PowAlertService.prototype.onAddToWorld = function (world) {
            };
            PowAlertService.prototype.onRemoveFromWorld = function (world) {
            };
            PowAlertService.prototype.tick = function (elapsed) {
            };
            PowAlertService.prototype.destroy = function () {
                this.game.world.time.removeObject(this);
                this.game.world.erase(this);
                if (this.container) {
                    this.container.off('click', this._dismissBinding);
                }
            };
            PowAlertService.prototype.show = function (message, done, duration) {
                var obj = {
                    message: message,
                    duration: typeof duration === 'undefined' ? 1000 : duration,
                    done: done
                };
                return this.queue(obj);
            };
            PowAlertService.prototype.queue = function (config) {
                if (!this.container) {
                    this.container = this.document.find(this.containerSearch);
                    this.container.on('click', this._dismissBinding);
                }
                config.elapsed = 0;
                this._queue.push(config);
                return config;
            };
            /*
             * Update current message, and manage event generation for transitions
             * between messages.
             * @param elapsed number The elapsed time since the last invocation, in milliseconds.
             */
            PowAlertService.prototype.processFrame = function (elapsed) {
                var _this = this;
                if (this._current && this.paused !== true) {
                    var c = this._current;
                    var timeout = c.duration && c.elapsed > c.duration;
                    var dismissed = c.dismissed === true;
                    if (!timeout && !dismissed) {
                        c.elapsed += elapsed;
                        return;
                    }
                    this.dismiss();
                }
                if (this.paused || this._queue.length === 0) {
                    return;
                }
                this._current = this._queue.shift();
                this.scope.$apply(function () {
                    _this.scope.powAlert = _this._current;
                    _this.animate.enter(_this.element, _this.container, null, function () {
                        _this.paused = false;
                    });
                });
            };
            PowAlertService.prototype.dismiss = function () {
                var _this = this;
                this.paused = true;
                this.scope.$apply(function () {
                    _this.animate.leave(_this.element, function () {
                        if (_this._current) {
                            _this._current.done && _this._current.done(_this._current);
                            _this._current = null;
                        }
                        _this.scope.powAlert = null;
                        _this.paused = false;
                    });
                });
                if (this._current) {
                    this._current.dismissed = true;
                }
            };
            return PowAlertService;
        })(pow2.Events);
        ui.PowAlertService = PowAlertService;
        ui.app.factory('powAlert', [
            '$rootScope',
            '$timeout',
            'game',
            '$compile',
            '$document',
            '$animate',
            function ($rootScope, $timeout, game, $compile, $document, $animate) {
                var alertElement = $compile('<div class="drop-overlay fade"><div class="message">{{powAlert.message}}</div></div>')($rootScope);
                return new PowAlertService(alertElement, $document, $rootScope, $timeout, game, $animate);
            }
        ]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../services/gameService.ts"/>
/// <reference path="../services/alertService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        ui.app.controller('RPGGameController', [
            '$scope',
            '$timeout',
            'game',
            'powAlert',
            function ($scope, $timeout, game, powAlert) {
                $scope.loadingTitle = "Pow2!";
                $scope.loadingMessage = "Asking Google for data...";
                $scope.loading = true;
                $scope.range = function (n) {
                    return new Array(n);
                };
                $scope.resetGame = function () {
                    game.resetGame();
                    powAlert.show("Game Save Deleted.  This will take effect the next time you refresh.", null, 0);
                };
                $scope.getState = function () {
                    return game.getSaveData();
                };
                $scope.saveGame = function () {
                    var party = game.currentScene.componentByType(pow2.PlayerComponent);
                    if (party) {
                        game.world.model.setKeyData('playerPosition', party.host.point);
                    }
                    var data = JSON.stringify(game.world.model.toJSON());
                    game.saveGame(data);
                    powAlert.show("Game Saved!", null, 0);
                };
                pow2.GameStateModel.getDataSource(function () {
                    $scope.$apply(function () {
                        $scope.loadingMessage = "Loading the things...";
                    });
                    var saveData = game.getSaveData();
                    if (true || saveData) {
                        game.loadGame(game.getSaveData(), function () {
                            $scope.$apply(function () {
                                $scope.gameModel = game.world.model;
                                $scope.party = game.world.model.party;
                                $scope.inventory = game.world.model.inventory;
                                $scope.player = game.world.model.party[0];
                                $scope.loading = false;
                                $scope.loaded = true;
                            });
                        });
                    }
                    else {
                        $scope.$apply(function () {
                            $scope.menu = true;
                            $scope.loading = false;
                        });
                    }
                });
                // Dialog bubbles
                game.world.scene.on('treasure:entered', function (feature) {
                    if (typeof feature.gold !== 'undefined') {
                        game.world.model.addGold(feature.gold);
                        powAlert.show("You found " + feature.gold + " gold!", null, 0);
                    }
                    if (typeof feature.item === 'string') {
                        // Get enemies data from spreadsheet
                        pow2.GameStateModel.getDataSource(function (data) {
                            var item = null;
                            var desc = _.where(data.getSheetData('weapons'), { id: feature.item })[0];
                            if (desc) {
                                item = new pow2.WeaponModel(desc);
                            }
                            else {
                                desc = _.where(data.getSheetData('armor'), { id: feature.item })[0];
                                if (desc) {
                                    item = new pow2.ArmorModel(desc);
                                }
                            }
                            if (!item) {
                                return;
                            }
                            game.world.model.inventory.push(item);
                            powAlert.show("You found " + item.get('name') + "!", null, 0);
                        });
                    }
                });
                game.currentScene.on("map:loaded", function (map) {
                    game.world.model.setKeyData('playerMap', map.mapName);
                });
                // TODO: A better system for game event handling.
                game.machine.on('enter', function (state) {
                    if (state.name === pow2.GameCombatState.NAME) {
                        $scope.$apply(function () {
                            $scope.combat = state.machine;
                            $scope.inCombat = true;
                            state.machine.on('combat:attack', function (damage, attacker, defender) {
                                var msg = '';
                                var a = attacker.model.get('name');
                                var b = defender.model.get('name');
                                if (damage > 0) {
                                    msg = a + " attacked " + b + " for " + damage + " damage!";
                                }
                                else {
                                    msg = a + " attacked " + b + ", and MISSED!";
                                }
                                powAlert.show(msg, function () {
                                    state.machine.update(state.machine);
                                });
                            });
                            state.machine.on('combat:victory', function (data) {
                                powAlert.show("Found " + data.gold + " gold!", null, 0);
                                powAlert.show("Gained " + data.exp + " experience!", null, 0);
                                angular.forEach(data.levels, function (hero) {
                                    powAlert.show(hero.get('name') + " reached level " + hero.get('level') + "!", null, 0);
                                });
                                powAlert.show("Enemies Defeated!", function () {
                                    state.machine.update(state.machine);
                                });
                            });
                            state.machine.on('combat:defeat', function (enemies, party) {
                                powAlert.show("Your party was defeated...", function () {
                                    state.machine.update(state.machine);
                                    game.loadGame(game.getSaveData(), function () {
                                        $scope.$apply(function () {
                                            $scope.gameModel = game.world.model;
                                            $scope.party = game.world.model.party;
                                            $scope.inventory = game.world.model.inventory;
                                            $scope.player = game.world.model.party[0];
                                            $scope.combat = null;
                                            $scope.inCombat = false;
                                        });
                                    });
                                }, 0);
                            });
                        });
                    }
                });
                game.machine.on('exit', function (state) {
                    $scope.$apply(function () {
                        if (state.name === pow2.GameMapState.NAME) {
                            $scope.dialog = null;
                            $scope.store = null;
                        }
                        else if (state.name === pow2.GameCombatState.NAME) {
                            $scope.inCombat = false;
                            $scope.combat = null;
                        }
                    });
                    console.log("UI: Exited state: " + state.name);
                });
            }
        ]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../../services/gameService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        ui.app.directive('healthBar', function () {
            return {
                restrict: 'E',
                scope: {
                    model: "="
                },
                templateUrl: '/source/ui/directives/bits/healthBar.html',
                controller: function ($scope) {
                    $scope.getProgressClass = function (model) {
                        if (!model) {
                            return '';
                        }
                        var result = [];
                        var pct = Math.round(model.attributes.hp / model.attributes.maxHP * 100);
                        if (pct === 0) {
                            result.push('dead');
                        }
                        if (pct < 33) {
                            result.push("critical");
                        }
                        else if (pct < 66) {
                            result.push("hurt");
                        }
                        else {
                            result.push("fine");
                        }
                        return result.join(' ');
                    };
                    $scope.getProgressBarStyle = function (model) {
                        if (!model) {
                            return {};
                        }
                        var pct = Math.ceil(model.attributes.hp / model.attributes.maxHP * 100);
                        return {
                            width: pct + '%'
                        };
                    };
                }
            };
        });
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../../index.ts"/>
/// <reference path="../../../../lib/pow2.game.d.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        // IconRender directive
        // ----------------------------------------------------------------------------
        ui.app.directive('iconRender', ['$compile', 'game', function ($compile, game) {
            return {
                restrict: 'A',
                link: function ($scope, element, attrs) {
                    var width = parseInt(attrs.width || "64");
                    var height = parseInt(attrs.height || "64");
                    // A rendering canvas
                    var renderImage = $compile('<img src="" width="' + width + '"/>')($scope);
                    element.append(renderImage);
                    $scope.$watch(attrs.icon, function (icon) {
                        if (!icon) {
                            renderImage[0].src = '/images/blank.gif';
                            return;
                        }
                        game.world.sprites.getSingleSprite(icon, attrs.frame || 0, function (sprite) {
                            // Get the context for drawing
                            var renderContext = game.getRenderContext(width, height);
                            renderContext.clearRect(0, 0, width, height);
                            renderContext.drawImage(sprite, 0, 0, width, height);
                            var data = game.releaseRenderContext();
                            $scope.$apply(function () {
                                renderImage[0].src = data;
                            });
                        });
                    });
                }
            };
        }]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../services/gameService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        ui.app.directive('combatView', ['game', function (game) {
            var _this = this;
            return {
                restrict: 'E',
                replace: true,
                templateUrl: '/source/ui/directives/combatView.html',
                controller: function ($scope) {
                    $scope.getMemberClass = function (member, focused) {
                        var result = [];
                        if (focused && focused.model && member.model.get('name') === focused.model.get('name')) {
                            result.push("focused");
                        }
                        return result.join(' ');
                    };
                },
                link: function (scope, element, attrs) {
                    var turnListener = function (player) {
                        scope.$apply(function () {
                            scope.combat = scope.combat;
                        });
                    };
                    game.machine.on('combat:begin', function (state) {
                        state.machine.on('combat:beginTurn', turnListener);
                    }, _this);
                    game.machine.on('combat:end', function (state) {
                        state.machine.off('combat:beginTurn', turnListener);
                    });
                    scope.$on('$destroy', function () {
                        game.machine && game.machine.off('combat:begin', null, _this);
                    });
                }
            };
        }]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../services/gameService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        // DialogBubble directive
        // ----------------------------------------------------------------------------
        ui.app.directive('dialogView', ['game', function (game) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: '/source/ui/directives/dialogView.html',
                link: function ($scope) {
                    // Dialog bubbles
                    game.world.scene.on('dialog:entered', function (feature) {
                        $scope.$apply(function () {
                            $scope.dialog = feature;
                        });
                    });
                    game.world.scene.on('dialog:exited', function () {
                        $scope.$apply(function () {
                            $scope.dialog = null;
                        });
                    });
                }
            };
        }]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../services/gameService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        var EditorCameraComponent = (function (_super) {
            __extends(EditorCameraComponent, _super);
            function EditorCameraComponent() {
                _super.apply(this, arguments);
            }
            EditorCameraComponent.prototype.process = function (view) {
                view.camera.point.set(this.host.point);
                view.cameraScale = Math.max(0.2, Math.min(32, view.cameraScale));
                var canvasSize = view.screenToWorld(new pow2.Point(view.context.canvas.width, view.context.canvas.height), view.cameraScale);
                view.camera.extent.set(canvasSize);
            };
            return EditorCameraComponent;
        })(pow2.CameraComponent);
        ui.EditorCameraComponent = EditorCameraComponent;
        ui.app.directive('editorCanvas', ['$compile', 'game', '$animate', function ($compile, game, $animate) {
            return {
                restrict: 'A',
                scope: {
                    map: "="
                },
                link: function ($scope, element, attrs) {
                    var canvas = $scope.canvas = element[0];
                    var context = $scope.canvas.getContext("2d");
                    context.webkitImageSmoothingEnabled = false;
                    context.mozImageSmoothingEnabled = false;
                    window.addEventListener('resize', onResize, false);
                    var $window = $(window);
                    function onResize() {
                        context.canvas.width = $window.width();
                        context.canvas.height = $window.height();
                        context.webkitImageSmoothingEnabled = false;
                        context.mozImageSmoothingEnabled = false;
                    }
                    var tileView = new pow2.GameMapView(canvas, game.loader);
                    element.on('mousemove', function (ev) {
                        var coords = pow2.Input.mouseOnView(ev.originalEvent, tileView);
                        console.log("mouse at px: " + coords.point + " - world: " + coords.world);
                    });
                    tileView.camera.extent.set(10, 10);
                    // TODO: HACKS MOVE THIS SOMEWHERE
                    var selected = null;
                    element.on("click", function (ev) {
                        var coords = pow2.Input.mouseOnView(ev.originalEvent, tileView);
                        var results = [];
                        // TODO: IMPORTANT
                        // This should be able to select TileMaps and support alternate search functions to allow
                        // for differet searches based on the context.   e.g. Selecting a TileMap in a scene vs
                        // selecting a tile within a map (if in map editing context)
                        if (game.currentScene.db.queryPoint(coords.world, pow2.SceneObject, results)) {
                            console.log(results);
                        }
                    });
                    element.on("mousewheel DOMMouseScroll MozMousePixelScroll", function (ev) {
                        var delta = (ev.originalEvent.detail ? ev.originalEvent.detail * -1 : ev.originalEvent.wheelDelta);
                        var scale = tileView.cameraScale;
                        var move = scale / 10;
                        scale += (delta > 0 ? move : -move);
                        tileView.cameraScale = scale;
                        ev.stopImmediatePropagation();
                        ev.preventDefault();
                        return false;
                    });
                    var map = attrs.map || game.tileMap;
                    var edCamera = new EditorCameraComponent();
                    tileView.addComponent(edCamera);
                    tileView.cameraComponent = edCamera;
                    tileView.setTileMap(map);
                    game.world.scene.addView(tileView);
                    onResize();
                }
            };
        }]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../services/gameService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        // Game Menu overlay directive
        // ----------------------------------------------------------------------------
        ui.app.directive('gameMenu', [
            'game',
            function (game) {
                return {
                    restrict: 'E',
                    templateUrl: '/source/ui/directives/gameMenu.html',
                    controller: function ($scope) {
                        $scope.page = 'party';
                        $scope.open = false;
                        $scope.toggle = function () {
                            $scope.open = !$scope.open;
                        };
                        $scope.showParty = function () {
                            $scope.page = 'party';
                        };
                        $scope.showSave = function () {
                            $scope.page = 'save';
                        };
                        $scope.showInventory = function () {
                            $scope.page = 'inventory';
                        };
                    }
                };
            }
        ]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../../../lib/pow2.game.d.ts"/>
/// <reference path="../services/gameService.ts"/>
/// <reference path="../services/alertService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        ui.app.directive('inventoryView', ['game', 'powAlert', function (game, powAlert) {
            return {
                restrict: 'E',
                templateUrl: '/source/ui/directives/inventoryView.html',
                controller: function ($scope, $element) {
                    var currentIndex = 0;
                    $scope.character = $scope.party[currentIndex];
                    $scope.nextCharacter = function () {
                        currentIndex++;
                        if (currentIndex >= $scope.party.length) {
                            currentIndex = 0;
                        }
                        $scope.character = $scope.party[currentIndex];
                    };
                    $scope.previousCharacter = function () {
                        currentIndex--;
                        if (currentIndex < 0) {
                            currentIndex = $scope.party.length - 1;
                        }
                        $scope.character = $scope.party[currentIndex];
                    };
                    $scope.equipItem = function (item) {
                        var hero = $scope.character;
                        if (!$scope.inventory || !item || !hero) {
                            return;
                        }
                        var users = item.get('usedby');
                        if (users && _.indexOf(users, hero.get('type')) === -1) {
                            powAlert.show(hero.get('name') + " cannot equip this item");
                            return;
                        }
                        if (item instanceof pow2.ArmorModel) {
                            var old = hero.equipArmor(item);
                            if (old) {
                                game.world.model.addInventory(old);
                            }
                        }
                        else if (item instanceof pow2.WeaponModel) {
                            // Remove any existing weapon first
                            if (hero.weapon) {
                                game.world.model.addInventory(hero.weapon);
                            }
                            hero.weapon = item;
                        }
                        game.world.model.removeInventory(item);
                        //powAlert.show("Equipped " + item.attributes.name + " to " + hero.attributes.name);
                    };
                    $scope.unequipItem = function (item) {
                        var hero = $scope.character;
                        if (!$scope.inventory || !item || !hero) {
                            return;
                        }
                        if (item instanceof pow2.ArmorModel) {
                            hero.unequipArmor(item);
                        }
                        else if (item instanceof pow2.WeaponModel) {
                            var weapon = item;
                            if (weapon.isNoWeapon()) {
                                return;
                            }
                            hero.weapon = null;
                        }
                        game.world.model.addInventory(item);
                        //powAlert.show("Unequipped " + item.attributes.name + " from " + hero.attributes.name);
                    };
                }
            };
        }]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../../services/gameService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        var MainMenuController = (function () {
            function MainMenuController($scope) {
                var _this = this;
                this.$scope = $scope;
                this.$scope.currentClass = "warrior";
                pow2.GameStateModel.getDataSource(function (res) {
                    var data = res.getSheetData('classes');
                    _this.$scope.$apply(function () {
                        _this.$scope.classes = data;
                    });
                    console.log(JSON.stringify(data, null, 3));
                });
            }
            MainMenuController.prototype.getClassIcon = function (classData) {
                return classData.icon.replace(/\[gender\]/i, "male");
            };
            MainMenuController.prototype.getItemClass = function (classData) {
                return classData.id === this.$scope.currentClass ? "active" : "";
            };
            MainMenuController.prototype.previousClass = function () {
                var newClass = this.$scope.currentClass === "mage" ? "warrior" : "mage";
                this.$scope.currentClass = newClass;
            };
            MainMenuController.prototype.nextClass = function () {
                var newClass = this.$scope.currentClass === "warrior" ? "mage" : "warrior";
                this.$scope.currentClass = newClass;
            };
            MainMenuController.$inject = ['$scope'];
            return MainMenuController;
        })();
        ui.MainMenuController = MainMenuController;
        ui.app.directive('mainMenu', function () {
            return {
                restrict: 'E',
                scope: true,
                templateUrl: '/source/ui/directives/pages/mainMenu.html',
                controllerAs: 'mainMenu',
                controller: MainMenuController,
                link: function ($scope, element, attrs) {
                    $scope.hero = attrs.hero;
                    $scope.$watch(attrs.hero, function (hero) {
                        $scope.hero = hero;
                    });
                }
            };
        });
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../services/gameService.ts"/>
/// <reference path="../services/alertService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        // StoreBubble directive
        // ----------------------------------------------------------------------------
        ui.app.directive('storeView', ['game', 'powAlert', function (game, powAlert) {
            return {
                restrict: 'E',
                templateUrl: '/source/ui/directives/storeView.html',
                controller: function ($scope, $element) {
                    $scope.buyItem = function (item) {
                        if (!$scope.store || !item) {
                            return;
                        }
                        var model = game.world.model;
                        var cost = parseInt(item.cost);
                        if (cost > model.gold) {
                            powAlert.show("You don't have enough money");
                        }
                        else {
                            model.gold -= cost;
                            powAlert.show("Purchased " + item.name + ".", null, 1500);
                            model.inventory.push(item.instanceModel.clone());
                        }
                    };
                    $scope.initStoreFromFeature = function (feature) {
                        // Get enemies data from spreadsheet
                        pow2.GameStateModel.getDataSource(function (data) {
                            var hasCategory = typeof feature.host.category !== 'undefined';
                            var theChoices = [];
                            if (!hasCategory || feature.host.category === 'weapons') {
                                theChoices = theChoices.concat(_.map(data.getSheetData('weapons'), function (w) {
                                    return _.extend({ instanceModel: new pow2.WeaponModel(w) }, w);
                                }));
                            }
                            if (!hasCategory || feature.host.category === 'armor') {
                                theChoices = theChoices.concat(_.map(data.getSheetData('armor'), function (a) {
                                    return _.extend({ instanceModel: new pow2.ArmorModel(a) }, a);
                                }));
                            }
                            var items = [];
                            _.each(feature.host.groups, function (group) {
                                items = items.concat(_.filter(theChoices, function (c) {
                                    return _.indexOf(c.groups, group) !== -1;
                                }));
                            });
                            feature.inventory = _.where(items, { level: feature.feature.level });
                            $scope.$apply(function () {
                                $scope.store = feature;
                            });
                        });
                    };
                },
                link: function ($scope) {
                    // Stores
                    game.world.scene.on('store:entered', function (feature) {
                        $scope.initStoreFromFeature(feature);
                    });
                    game.world.scene.on('store:exited', function () {
                        $scope.$apply(function () {
                            $scope.store = null;
                        });
                    });
                }
            };
        }]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../services/gameService.ts"/>
/// <reference path="../services/alertService.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        // TempleView directive
        // ----------------------------------------------------------------------------
        ui.app.directive('templeView', ['game', 'powAlert', function (game, powAlert) {
            return {
                restrict: 'E',
                templateUrl: '/source/ui/directives/templeView.html',
                controller: function ($scope) {
                    $scope.heal = function () {
                        if (!$scope.temple) {
                            return;
                        }
                        var model = game.world.model;
                        var money = model.gold;
                        var cost = parseInt($scope.temple.cost);
                        var alreadyHealed = !_.find(model.party, function (hero) {
                            return hero.get('hp') !== hero.get('maxHP');
                        });
                        if (cost > money) {
                            powAlert.show("You don't have enough money");
                        }
                        else if (alreadyHealed) {
                            powAlert.show("Keep your monies.\nYour party is already fully healed.");
                        }
                        else {
                            //console.log("You have (" + money + ") monies.  Spending (" + cost + ") on temple");
                            model.gold -= cost;
                            _.each(model.party, function (hero) {
                                hero.set({ hp: hero.get('maxHP') });
                            });
                            powAlert.show("Your party has been healed! \nYou now have (" + model.gold + ") monies.", null, 2500);
                        }
                        $scope.temple = null;
                    };
                    $scope.cancel = function () {
                        $scope.temple = null;
                    };
                },
                link: function ($scope) {
                    game.world.scene.on('temple:entered', function (feature) {
                        $scope.$apply(function () {
                            $scope.temple = feature;
                        });
                    });
                    game.world.scene.on('temple:exited', function () {
                        $scope.$apply(function () {
                            $scope.temple = null;
                        });
                    });
                }
            };
        }]);
    })(ui = pow2.ui || (pow2.ui = {}));
})(pow2 || (pow2 = {}));
//# sourceMappingURL=pow2.ui.js.map