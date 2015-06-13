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
/// <reference path="../../lib/pow2.ui.d.ts"/>
var rpg;
(function (rpg) {
    rpg.app = angular.module('rpg', [
        'ngAnimate',
        'pow2',
        'templates-rpg',
        'ngSanitize',
        'ngTouch'
    ]);
    // HeroView directive
    // ----------------------------------------------------------------------------
    rpg.app.directive('heroCard', function () {
        return {
            restrict: 'E',
            scope: true,
            templateUrl: 'games/rpg/directives/heroCard.html',
            link: function ($scope, element, attrs) {
                $scope.hero = attrs.hero;
                $scope.$watch(attrs.hero, function (hero) {
                    $scope.hero = hero;
                });
            }
        };
    });
})(rpg || (rpg = {}));
//
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
var rpg;
(function (rpg) {
    rpg.COMBAT_ENCOUNTERS = {
        FIXED: "fixed",
        RANDOM: "random"
    };
})(rpg || (rpg = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
var rpg;
(function (rpg) {
    var models;
    (function (models) {
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
                amount = Math.ceil(amount);
                this.set({ hp: Math.min(this.attributes.maxHP, Math.max(0, this.attributes.hp - amount)) });
                if (this.attributes.hp <= 0) {
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
        models.EntityModel = EntityModel;
    })(models = rpg.models || (rpg.models = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../models/entityModel.ts" />
var rpg;
(function (rpg) {
    var objects;
    (function (objects) {
        var GameEntityObject = (function (_super) {
            __extends(GameEntityObject, _super);
            function GameEntityObject(options) {
                _super.call(this, _.omit(options || {}, ["x", "y", "type"]));
                this.world = pow2.getWorld('pow2');
                this.type = options.type || "player";
                this.groups = typeof options.groups === 'string' ? JSON.parse(options.groups) : options.groups;
                this.model = options.model || new rpg.models.EntityModel(options);
            }
            GameEntityObject.prototype.isDefeated = function () {
                return this.model.isDefeated();
            };
            GameEntityObject.prototype.getSpells = function () {
                var spells = this.world.spreadsheet.getSheetData('magic');
                var userLevel = this.model.get('level');
                var userClass = this.model.get('type');
                return _.filter(spells, function (spell) {
                    return spell.level <= userLevel && _.indexOf(spell.usedby, userClass) !== -1;
                });
            };
            return GameEntityObject;
        })(pow2.tile.TileObject);
        objects.GameEntityObject = GameEntityObject;
    })(objects = rpg.objects || (rpg.objects = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../../objects/gameEntityObject.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var combat;
        (function (combat_1) {
            var CombatActionComponent = (function (_super) {
                __extends(CombatActionComponent, _super);
                function CombatActionComponent(combat) {
                    _super.call(this);
                    this.combat = combat;
                    this.name = "default";
                    this.from = null;
                    this.to = null;
                    this.spell = null; //TODO: spell type
                }
                CombatActionComponent.prototype.getActionName = function () {
                    return this.name;
                };
                CombatActionComponent.prototype.isCurrentTurn = function () {
                    return this.combat.machine.current === this.from;
                };
                CombatActionComponent.prototype.canTarget = function () {
                    return true;
                };
                CombatActionComponent.prototype.canTargetMultiple = function () {
                    return this.canTarget();
                };
                /**
                 * Method used to determine if this action is usable by a given
                 * [GameEntityObject].  This may be subclassed in an action to
                 * select the types of entities that may use the action.
                 * @param entity The object that would use the action.
                 * @returns {boolean} True if the entity may use this action.
                 */
                CombatActionComponent.prototype.canBeUsedBy = function (entity) {
                    return entity.model && entity.model instanceof rpg.models.EntityModel;
                };
                /**
                 * Base class invokes the then callback and returns true.
                 * @returns {boolean} Whether the act was successful or not.
                 */
                CombatActionComponent.prototype.act = function (then) {
                    then && then(this, null);
                    return true;
                };
                /**
                 * The action has been selected for the current turn.
                 */
                CombatActionComponent.prototype.select = function () {
                };
                return CombatActionComponent;
            })(pow2.scene.SceneComponent);
            combat_1.CombatActionComponent = CombatActionComponent;
        })(combat = components.combat || (components.combat = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../combatActionComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components_1) {
        var combat;
        (function (combat) {
            var actions;
            (function (actions) {
                /**
                 * Attack another entity in combat.
                 */
                var CombatAttackComponent = (function (_super) {
                    __extends(CombatAttackComponent, _super);
                    function CombatAttackComponent() {
                        _super.apply(this, arguments);
                        this.name = "attack";
                    }
                    CombatAttackComponent.prototype.canBeUsedBy = function (entity) {
                        // Exclude magic casters from physical attacks
                        var excludedTypes = [
                            rpg.models.HeroTypes.LifeMage,
                            rpg.models.HeroTypes.Necromancer
                        ];
                        return _super.prototype.canBeUsedBy.call(this, entity) && _.indexOf(excludedTypes, entity.model.get('type')) === -1;
                    };
                    CombatAttackComponent.prototype.act = function (then) {
                        var _this = this;
                        if (!this.isCurrentTurn()) {
                            return false;
                        }
                        var done = function (error) {
                            then && then(_this, error);
                            _this.combat.machine.setCurrentState(rpg.states.combat.CombatEndTurnState.NAME);
                        };
                        //
                        var attacker = this.from;
                        var defender = this.to;
                        var attackerPlayer = attacker.findComponent(pow2.game.components.PlayerCombatRenderComponent);
                        var attack = function () {
                            var damage = attacker.model.attack(defender.model);
                            var didKill = defender.model.get('hp') <= 0;
                            var hit = damage > 0;
                            var defending = (defender.model instanceof rpg.models.HeroModel) && defender.model.defenseBuff > 0;
                            var hitSound = "/data/sounds/" + (didKill ? "killed" : (hit ? (defending ? "miss" : "hit") : "miss"));
                            var components = {
                                animation: new pow2.tile.components.AnimatedSpriteComponent({
                                    spriteName: "attack",
                                    lengthMS: 350
                                }),
                                sprite: new pow2.tile.components.SpriteComponent({
                                    name: "attack",
                                    icon: hit ? (defending ? "animSmoke.png" : "animHit.png") : "animMiss.png"
                                }),
                                damage: new rpg.components.DamageComponent(),
                                sound: new pow2.scene.components.SoundComponent({
                                    url: hitSound,
                                    volume: 0.3
                                })
                            };
                            if (!!attackerPlayer) {
                                attackerPlayer.setState("Moving");
                            }
                            defender.addComponentDictionary(components);
                            components.damage.once('damage:done', function () {
                                if (!!attackerPlayer) {
                                    attackerPlayer.setState();
                                }
                                if (didKill && defender.model instanceof rpg.models.CreatureModel) {
                                    _.defer(function () {
                                        defender.destroy();
                                    });
                                }
                                defender.removeComponentDictionary(components);
                            });
                            var data = {
                                damage: damage,
                                attacker: attacker,
                                defender: defender
                            };
                            _this.combat.machine.notify("combat:attack", data, done);
                        };
                        // TODO: Shouldn't be here.  This mess is currently to delay NPC attacks.
                        if (!!attackerPlayer) {
                            attackerPlayer.attack(attack);
                        }
                        else {
                            _.delay(function () {
                                attack();
                            }, 1000);
                        }
                        return true;
                    };
                    return CombatAttackComponent;
                })(combat.CombatActionComponent);
                actions.CombatAttackComponent = CombatAttackComponent;
            })(actions = combat.actions || (combat.actions = {}));
        })(combat = components_1.combat || (components_1.combat = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../combatActionComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var combat;
        (function (combat) {
            var actions;
            (function (actions) {
                var CombatGuardComponent = (function (_super) {
                    __extends(CombatGuardComponent, _super);
                    function CombatGuardComponent() {
                        _super.apply(this, arguments);
                        this.name = "guard";
                    }
                    CombatGuardComponent.prototype.canTarget = function () {
                        return false;
                    };
                    CombatGuardComponent.prototype.act = function (then) {
                        this.combat.machine.setCurrentState(rpg.states.combat.CombatEndTurnState.NAME);
                        return _super.prototype.act.call(this, then);
                    };
                    /**
                     * Until the end of the next turn, or combat end, increase the
                     * current players defense.
                     */
                    CombatGuardComponent.prototype.select = function () {
                        this.combat.machine.on(rpg.states.CombatStateMachine.Events.ENTER, this.enterState, this);
                        console.info("Adding guard defense buff to player: " + this.from.model.get('name'));
                        if (!(this.from.model instanceof rpg.models.HeroModel)) {
                            throw new Error("This action is not currently applicable to non hero characters.");
                        }
                        var heroModel = this.from.model;
                        var multiplier = heroModel.get('level') < 10 ? 2 : 0.5;
                        heroModel.defenseBuff += (heroModel.getDefense(true) * multiplier);
                    };
                    CombatGuardComponent.prototype.enterState = function (newState, oldState) {
                        var exitStates = [
                            rpg.states.combat.CombatChooseActionState.NAME,
                            rpg.states.combat.CombatVictoryState.NAME,
                            rpg.states.combat.CombatDefeatState.NAME,
                            rpg.states.combat.CombatEscapeState.NAME
                        ];
                        if (_.indexOf(exitStates, newState.name) !== -1) {
                            console.info("Removing guard defense buff from player: " + this.from.model.get('name'));
                            this.combat.machine.off(rpg.states.CombatStateMachine.Events.ENTER, this.enterState, this);
                            var heroModel = this.from.model;
                            heroModel.defenseBuff = 0;
                        }
                    };
                    return CombatGuardComponent;
                })(combat.CombatActionComponent);
                actions.CombatGuardComponent = CombatGuardComponent;
            })(actions = combat.actions || (combat.actions = {}));
        })(combat = components.combat || (components.combat = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../combatActionComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components_2) {
        var combat;
        (function (combat) {
            var actions;
            (function (actions) {
                /**
                 * Use magic in combat.
                 */
                var CombatMagicComponent = (function (_super) {
                    __extends(CombatMagicComponent, _super);
                    function CombatMagicComponent() {
                        _super.apply(this, arguments);
                        this.name = "magic";
                    }
                    CombatMagicComponent.prototype.canBeUsedBy = function (entity) {
                        // Include only magic casters
                        var supportedTypes = [
                            rpg.models.HeroTypes.LifeMage,
                            rpg.models.HeroTypes.Necromancer
                        ];
                        return _super.prototype.canBeUsedBy.call(this, entity) && _.indexOf(supportedTypes, entity.model.get('type')) !== -1;
                    };
                    CombatMagicComponent.prototype.act = function (then) {
                        var _this = this;
                        if (!this.isCurrentTurn()) {
                            return false;
                        }
                        var done = function (error) {
                            then && then(_this, error);
                            _this.combat.machine.setCurrentState(rpg.states.combat.CombatEndTurnState.NAME);
                        };
                        if (!this.spell) {
                            console.error("null spell to cast");
                            return false;
                        }
                        switch (this.spell.id) {
                            case "heal":
                                return this.healSpell(done);
                                break;
                            case "push":
                                return this.hurtSpell(done);
                                break;
                        }
                        return true;
                    };
                    CombatMagicComponent.prototype.healSpell = function (done) {
                        var _this = this;
                        //
                        var caster = this.from;
                        var target = this.to;
                        var attackerPlayer = caster.findComponent(pow2.game.components.PlayerCombatRenderComponent);
                        attackerPlayer.magic(function () {
                            var level = target.model.get('level');
                            var healAmount = -_this.spell.value;
                            target.model.damage(healAmount);
                            var hitSound = "/data/sounds/heal";
                            var components = {
                                animation: new pow2.tile.components.AnimatedSpriteComponent({
                                    spriteName: "heal",
                                    lengthMS: 550
                                }),
                                sprite: new pow2.tile.components.SpriteComponent({
                                    name: "heal",
                                    icon: "animSpellCast.png"
                                }),
                                sound: new pow2.scene.components.SoundComponent({
                                    url: hitSound,
                                    volume: 0.3
                                })
                            };
                            target.addComponentDictionary(components);
                            components.animation.once('animation:done', function () {
                                target.removeComponentDictionary(components);
                                var data = {
                                    damage: healAmount,
                                    attacker: caster,
                                    defender: target
                                };
                                _this.combat.machine.notify("combat:attack", data, done);
                            });
                        });
                        return true;
                    };
                    CombatMagicComponent.prototype.hurtSpell = function (done) {
                        var _this = this;
                        //
                        var attacker = this.from;
                        var defender = this.to;
                        var attackerPlayer = attacker.findComponent(pow2.game.components.PlayerCombatRenderComponent);
                        attackerPlayer.magic(function () {
                            var damage = defender.model.damage(_this.spell.value);
                            var didKill = defender.model.get('hp') <= 0;
                            var hit = damage > 0;
                            var hitSound = "/data/sounds/" + (didKill ? "killed" : (hit ? "spell" : "miss"));
                            var components = {
                                animation: new pow2.tile.components.AnimatedSpriteComponent({
                                    spriteName: "attack",
                                    lengthMS: 550
                                }),
                                sprite: new pow2.tile.components.SpriteComponent({
                                    name: "attack",
                                    icon: hit ? "animHitSpell.png" : "animMiss.png"
                                }),
                                damage: new rpg.components.DamageComponent(),
                                sound: new pow2.scene.components.SoundComponent({
                                    url: hitSound,
                                    volume: 0.3
                                })
                            };
                            defender.addComponentDictionary(components);
                            components.damage.once('damage:done', function () {
                                if (didKill && defender.model instanceof rpg.models.CreatureModel) {
                                    _.defer(function () {
                                        defender.destroy();
                                    });
                                }
                                defender.removeComponentDictionary(components);
                            });
                            var data = {
                                damage: damage,
                                attacker: attacker,
                                defender: defender
                            };
                            _this.combat.machine.notify("combat:attack", data, done);
                        });
                        return true;
                    };
                    return CombatMagicComponent;
                })(combat.CombatActionComponent);
                actions.CombatMagicComponent = CombatMagicComponent;
            })(actions = combat.actions || (combat.actions = {}));
        })(combat = components_2.combat || (components_2.combat = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../combatActionComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var combat;
        (function (combat) {
            var actions;
            (function (actions) {
                var CombatRunComponent = (function (_super) {
                    __extends(CombatRunComponent, _super);
                    function CombatRunComponent() {
                        _super.apply(this, arguments);
                        this.name = "run";
                    }
                    CombatRunComponent.prototype.canTarget = function () {
                        return false;
                    };
                    CombatRunComponent.prototype.act = function (then) {
                        var _this = this;
                        if (!this.isCurrentTurn()) {
                            return false;
                        }
                        var success = this._rollEscape();
                        var data = {
                            success: success,
                            player: this.combat.machine.current
                        };
                        this.combat.machine.notify("combat:run", data, function () {
                            if (success) {
                                _this.combat.machine.setCurrentState(rpg.states.combat.CombatEscapeState.NAME);
                            }
                            else {
                                _this.combat.machine.setCurrentState(rpg.states.combat.CombatEndTurnState.NAME);
                            }
                            then && then(_this);
                        });
                        return true;
                    };
                    /**
                     * Determine if a run action results in a successful escape from
                     * combat.
                     *
                     * TODO: This should really consider character attributes.
                     *
                     * @returns {boolean} If the escape will succeed.
                     * @private
                     */
                    CombatRunComponent.prototype._rollEscape = function () {
                        var roll = _.random(0, 200);
                        var chance = 100;
                        if (roll === 200) {
                            return false;
                        }
                        if (roll === 0) {
                            return true;
                        }
                        return roll <= chance;
                    };
                    return CombatRunComponent;
                })(combat.CombatActionComponent);
                actions.CombatRunComponent = CombatRunComponent;
            })(actions = combat.actions || (combat.actions = {}));
        })(combat = components.combat || (components.combat = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
/*
 Copyright (C) 2013-2014 by Justin DuJardin

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
/// <reference path="./index.ts"/>
var rpg;
(function (rpg) {
    var _sharedGameWorld = null;
    var GameWorld = (function (_super) {
        __extends(GameWorld, _super);
        function GameWorld(services) {
            var _this = this;
            _super.call(this, services);
            // TODO: More than two scenes?  Scene managers?  ugh.  If we need them.
            this.combatScene = null;
            /**
             * Access to the game's Google Doc spreadsheet configuration.  For more
             * information, see [GameDataResource].
             */
            this.spreadsheet = null;
            this._encounterCallback = null;
            if (!this.scene) {
                this.setService('scene', new pow2.scene.Scene());
            }
            this.loader.registerType('powEntities', pow2.EntityContainerResource);
            rpg.models.GameStateModel.getDataSource(function (gsr) {
                _this.spreadsheet = gsr;
            });
        }
        GameWorld.get = function () {
            if (!_sharedGameWorld) {
                _sharedGameWorld = new rpg.GameWorld();
            }
            return _sharedGameWorld;
        };
        GameWorld.prototype.reportEncounterResult = function (victory) {
            if (this._encounterCallback) {
                this._encounterCallback(victory);
                this._encounterCallback = null;
            }
        };
        GameWorld.prototype.randomEncounter = function (zone, then) {
            var _this = this;
            rpg.models.GameStateModel.getDataSource(function (gsr) {
                var encountersData = gsr.getSheetData("encounters");
                var encounters = _.filter(encountersData, function (enc) {
                    return _.indexOf(enc.zones, zone.map) !== -1 || _.indexOf(enc.zones, zone.target) !== -1;
                });
                if (encounters.length === 0) {
                    then && then(true);
                    return;
                }
                var max = encounters.length - 1;
                var min = 0;
                var encounter = encounters[Math.floor(Math.random() * (max - min + 1)) + min];
                _this._encounter(zone, encounter, then);
            });
        };
        GameWorld.prototype.fixedEncounter = function (zone, encounterId, then) {
            var _this = this;
            rpg.models.GameStateModel.getDataSource(function (gsr) {
                var encounters = _.where(gsr.getSheetData("encounters"), {
                    id: encounterId
                });
                if (encounters.length === 0) {
                    throw new Error("No encounter found with id: " + encounterId);
                }
                _this._encounter(zone, encounters[0], then);
            });
        };
        GameWorld.prototype._encounter = function (zoneInfo, encounter, then) {
            this.scene.trigger('combat:encounter', this);
            this.state.encounter = encounter;
            this.state.encounterInfo = zoneInfo;
            this.state.setCurrentState(rpg.states.GameCombatState.NAME);
            this._encounterCallback = then;
        };
        return GameWorld;
    })(pow2.scene.SceneWorld);
    rpg.GameWorld = GameWorld;
})(rpg || (rpg = {}));
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
/// <reference path="./gameWorld.ts" />
/// <reference path="./index.ts"/>
var rpg;
(function (rpg) {
    /**
     * A tile map that supports game feature objects and components.
     */
    var GameTileMap = (function (_super) {
        __extends(GameTileMap, _super);
        function GameTileMap() {
            _super.apply(this, arguments);
        }
        GameTileMap.prototype.loaded = function () {
            _super.prototype.loaded.call(this);
            // If there are map properties, take them into account.
            if (this.map.properties && this.map.properties.music) {
                this.addComponent(new pow2.scene.components.SoundComponent({
                    url: this.map.properties.music,
                    volume: 0.1,
                    loop: true
                }));
            }
            this.buildFeatures();
        };
        GameTileMap.prototype.destroy = function () {
            this.unloaded();
            return _super.prototype.destroy.call(this);
        };
        GameTileMap.prototype.unloaded = function () {
            this.removeComponentByType(pow2.scene.components.SoundComponent);
            this.removeFeaturesFromScene();
            _super.prototype.unloaded.call(this);
        };
        GameTileMap.prototype.getFeature = function (name) {
            return _.find(this.features.objects, function (feature) {
                return feature.name === name;
            });
        };
        // Construct
        GameTileMap.prototype.addFeaturesToScene = function () {
            var _this = this;
            _.each(this.features.objects, function (obj) {
                obj._object = _this.createFeatureObject(obj);
                if (obj._object) {
                    _this.scene.addObject(obj._object);
                }
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
            this.removeFeaturesFromScene();
            if (this.scene) {
                this.addFeaturesToScene();
            }
            return true;
        };
        GameTileMap.prototype.createFeatureObject = function (tiledObject) {
            var options = _.extend({}, tiledObject.properties || {}, {
                tileMap: this,
                type: tiledObject.type,
                x: Math.round(tiledObject.x / this.map.tilewidth),
                y: Math.round(tiledObject.y / this.map.tileheight)
            });
            var object = new rpg.objects.GameFeatureObject(options);
            this.world.mark(object);
            var componentType = pow2.EntityContainerResource.getClassType(tiledObject.type);
            if (tiledObject.type && componentType) {
                var component = (new componentType());
                if (!object.addComponent(component)) {
                    throw new Error("Component " + component.name + " failed to connect to host " + this.name);
                }
            }
            return object;
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
    })(pow2.tile.TileMap);
    rpg.GameTileMap = GameTileMap;
})(rpg || (rpg = {}));
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
/// <reference path="../../../../lib/pow2.d.ts" />
/// <reference path="../../gameTileMap.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var combat;
        (function (combat) {
            var CombatCameraComponent = (function (_super) {
                __extends(CombatCameraComponent, _super);
                function CombatCameraComponent() {
                    _super.apply(this, arguments);
                }
                CombatCameraComponent.prototype.connectComponent = function () {
                    return _super.prototype.connectComponent.call(this) && this.host instanceof rpg.GameTileMap;
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
            })(pow2.scene.components.CameraComponent);
            combat.CombatCameraComponent = CombatCameraComponent;
        })(combat = components.combat || (components.combat = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../../objects/gameEntityObject.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var combat;
        (function (combat) {
            /**
             * A component that when added to a GameTileMap listens
             * to the player moves and after a random number of them forces
             * an encounter with a group of creatures from the current combat
             * zone.
             */
            var CombatEncounterComponent = (function (_super) {
                __extends(CombatEncounterComponent, _super);
                function CombatEncounterComponent() {
                    _super.apply(this, arguments);
                    this.combatFlag = false;
                    this.combatZone = 'default';
                    this.isDangerous = false;
                    this.enabled = false;
                    this.world = pow2.getWorld('pow2');
                    this.player = null;
                }
                CombatEncounterComponent.prototype.connectComponent = function () {
                    if (!_super.prototype.connectComponent.call(this) || !(this.host instanceof rpg.GameTileMap)) {
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
                    // Determine if the map wants this component to be enabled.
                    this.enabled = this.host.map && this.host.map.properties && this.host.map.properties.combat;
                    if (this.player) {
                        this.player.off(null, null, this);
                        this.player = null;
                    }
                    if (this.host.scene) {
                        this.player = this.host.scene.objectByComponent(pow2.scene.components.PlayerComponent);
                    }
                    this.listenMoves();
                    return !!this.player;
                };
                CombatEncounterComponent.prototype.listenMoves = function () {
                    this.stopListening();
                    if (this.player && this.enabled) {
                        this.player.on(pow2.scene.components.PlayerComponent.Events.MOVE_BEGIN, this.moveProcess, this);
                    }
                };
                CombatEncounterComponent.prototype.stopListening = function () {
                    if (this.player) {
                        this.player.off(null, null, this);
                    }
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
                    var _this = this;
                    var zones = this.host.getCombatZones(at);
                    this.combatZone = zones.map || zones.target;
                    console.log("Combat in zone : " + this.combatZone);
                    this.stopListening();
                    this.host.world.randomEncounter(zones, function () {
                        _this.resetBattleCounter();
                        _this.listenMoves();
                    });
                    this.combatFlag = true;
                };
                CombatEncounterComponent.prototype._setCounter = function (value) {
                    this.battleCounter = value;
                    this.world.model.setKeyData('battleCounter', this.battleCounter);
                };
                return CombatEncounterComponent;
            })(pow2.scene.SceneComponent);
            combat.CombatEncounterComponent = CombatEncounterComponent;
        })(combat = components.combat || (components.combat = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameTileMap.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var GameComponent = (function (_super) {
            __extends(GameComponent, _super);
            function GameComponent() {
                _super.apply(this, arguments);
                this.host = null;
            }
            GameComponent.prototype.syncComponent = function () {
                return _super.prototype.syncComponent.call(this) && this.host.tileMap instanceof rpg.GameTileMap;
            };
            return GameComponent;
        })(pow2.tile.TileComponent);
        components.GameComponent = GameComponent;
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="./gameComponent.ts" />
/// <reference path="../objects/gameEntityObject.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
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
                this.animation = this.host.findComponent(pow2.tile.components.AnimatedSpriteComponent);
                this.sprite = this.host.findComponent(pow2.tile.components.SpriteComponent);
                this.sound = this.host.findComponent(pow2.scene.components.SoundComponent);
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
        })(pow2.scene.SceneComponent);
        components.DamageComponent = DamageComponent;
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
var rpg;
(function (rpg) {
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
                this.map = null;
            }
            /**
             * Collide with the rpg tile map features and obstacles.
             */
            PlayerComponent.prototype.collideMove = function (x, y, results) {
                if (results === void 0) { results = []; }
                if (this.host.scene && !this.map) {
                    this.map = this.host.scene.objectByType(pow2.tile.TileMap);
                }
                var collision = this.collider && this.collider.collide(x, y, rpg.objects.GameFeatureObject, results);
                if (collision) {
                    for (var i = 0; i < results.length; i++) {
                        var o = results[i];
                        if (o.passable === true || !o.type) {
                            return false;
                        }
                        if (_.indexOf(PlayerComponent.COLLIDE_TYPES, o.type) !== -1) {
                            return true;
                        }
                    }
                }
                // Iterate over all layers of the map, check point(x,y) and see if the tile
                // has any unpassable attributes set on it.  If any unpassable attributes are
                // found, there is a collision.
                if (this.map) {
                    var layers = this.map.getLayers();
                    for (var i = 0; i < layers.length; i++) {
                        var terrain = this.map.getTileData(layers[i], x, y);
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
            return PlayerComponent;
        })(pow2.scene.components.PlayerComponent);
        components.PlayerComponent = PlayerComponent;
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        /**
         * A component that defines the functionality of a map feature.
         */
        var GameFeatureComponent = (function (_super) {
            __extends(GameFeatureComponent, _super);
            function GameFeatureComponent() {
                _super.apply(this, arguments);
            }
            GameFeatureComponent.prototype.connectComponent = function () {
                if (!_super.prototype.connectComponent.call(this)) {
                    return false;
                }
                if (!this.host.feature) {
                    console.log("Feature host missing feature data.");
                    return false;
                }
                // Inherit ID from the unique feature data's id.
                this.id = this.host.feature.id;
                return true;
            };
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
        })(pow2.tile.TileComponent);
        components.GameFeatureComponent = GameFeatureComponent;
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../playerComponent.ts" />
/// <reference path="../gameFeatureComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var features;
        (function (features) {
            /**
             * A map feature that represents a fixed combat encounter.
             *
             * When a player enters the tile of a feature with this component
             * it will trigger a combat encounter that must be defeated before
             * the tile may be passed.
             */
            var CombatFeatureComponent = (function (_super) {
                __extends(CombatFeatureComponent, _super);
                function CombatFeatureComponent() {
                    _super.apply(this, arguments);
                    this.party = null;
                }
                CombatFeatureComponent.prototype.connectComponent = function () {
                    if (typeof this.host.id === 'undefined') {
                        console.error("Fixed encounters must have a given id so they may be hidden");
                        return false;
                    }
                    return _super.prototype.connectComponent.call(this);
                };
                CombatFeatureComponent.prototype.enter = function (object) {
                    var _this = this;
                    this.party = object.findComponent(pow2.scene.components.PlayerComponent);
                    if (!this.party) {
                        return false;
                    }
                    // Stop the moving entity until it has defeated the combat encounter.
                    this.party.velocity.zero();
                    object.setPoint(object.point);
                    // Find the combat zone and launch a fixed encounter.
                    var zone = this.host.tileMap.getCombatZones(this.party.host.point);
                    this.host.world.fixedEncounter(zone, this.host.id, function (victory) {
                        if (victory) {
                            _this.setDataHidden(true);
                        }
                    });
                    return true;
                };
                return CombatFeatureComponent;
            })(components.GameFeatureComponent);
            features.CombatFeatureComponent = CombatFeatureComponent;
        })(features = components.features || (components.features = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameFeatureComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var features;
        (function (features) {
            var DialogFeatureComponent = (function (_super) {
                __extends(DialogFeatureComponent, _super);
                function DialogFeatureComponent() {
                    _super.apply(this, arguments);
                }
                DialogFeatureComponent.prototype.syncComponent = function () {
                    if (!_super.prototype.syncComponent.call(this) || !this.host.feature) {
                        return false;
                    }
                    this.title = this.host.feature.title;
                    this.text = this.host.feature.text;
                    this.icon = this.host.feature.icon;
                    return true;
                };
                DialogFeatureComponent.prototype.enter = function (object) {
                    if (this.title && this.text) {
                        object.scene.trigger('dialog:entered', this);
                    }
                    return true;
                };
                DialogFeatureComponent.prototype.exit = function (object) {
                    if (this.title && this.text) {
                        object.scene.trigger('dialog:exited', this);
                    }
                    return true;
                };
                return DialogFeatureComponent;
            })(components.GameFeatureComponent);
            features.DialogFeatureComponent = DialogFeatureComponent;
        })(features = components.features || (components.features = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameFeatureComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var features;
        (function (features) {
            var PortalFeatureComponent = (function (_super) {
                __extends(PortalFeatureComponent, _super);
                function PortalFeatureComponent() {
                    _super.apply(this, arguments);
                }
                PortalFeatureComponent.prototype.syncComponent = function () {
                    if (!_super.prototype.syncComponent.call(this)) {
                        return false;
                    }
                    this.map = this.host.feature.target;
                    this.target = new pow2.Point(this.host.feature.targetX, this.host.feature.targetY);
                    return !!this.map;
                };
                PortalFeatureComponent.prototype.entered = function (object) {
                    var _this = this;
                    if (!this.target || !this.host.tileMap) {
                        return false;
                    }
                    // TODO: What about all this map loading crap?  Have to load TMX resource
                    // in each spot and then call createObject on it with the entity container.
                    // Kind of a PITA if you ask me, and we keep duplicating the "/maps/{name}.tmx"
                    // stuff all over the place.  Maybe a wrapper function that does that?
                    this.host.world.loader.load(pow2.getMapUrl(this.map), function (map) {
                        _this.host.tileMap.setMap(map);
                        console.log("Transition to " + _this.map);
                        object.setPoint(_this.target);
                        _this.host.tileMap.syncComponents();
                    });
                    return true;
                };
                return PortalFeatureComponent;
            })(components.GameFeatureComponent);
            features.PortalFeatureComponent = PortalFeatureComponent;
        })(features = components.features || (components.features = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../playerComponent.ts" />
/// <reference path="../gameFeatureComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var features;
        (function (features) {
            var ShipFeatureComponent = (function (_super) {
                __extends(ShipFeatureComponent, _super);
                function ShipFeatureComponent() {
                    _super.apply(this, arguments);
                    this._tickInterval = -1;
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
                    // Must have a party component to board a ship.  Don't want buildings
                    // and NPCs boarding ships... or do we?  [maniacal laugh]
                    this.party = object.findComponent(pow2.scene.components.PlayerComponent);
                    if (!this.party) {
                        return false;
                    }
                    this.partySprite = object.icon;
                    this.party.passableKeys = ['shipPassable'];
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
                    object.setSprite(this.host.icon);
                    this.host.visible = false;
                    this.host.enabled = false;
                    this._tickInterval = setInterval(function () {
                        if (_this.partyObject.point.equal(_this.party.targetPoint) && !_this.party.heading.isZero()) {
                            var from = _this.partyObject.point;
                            var to = from.clone().add(_this.party.heading);
                            if (!_this.party.collideWithMap(from, 'shipPassable') && !_this.party.collideWithMap(to, 'passable')) {
                                _this.disembark(from, to, _this.party.heading.clone());
                            }
                        }
                    }, 32);
                    return true;
                };
                ShipFeatureComponent.prototype.disembark = function (from, to, heading) {
                    clearInterval(this._tickInterval);
                    this.partyObject.setSprite(this.partySprite);
                    this.party.targetPoint.set(to);
                    this.party.velocity.set(heading);
                    this.party.passableKeys = ['passable'];
                    this.host.point.set(from);
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
            })(components.GameFeatureComponent);
            features.ShipFeatureComponent = ShipFeatureComponent;
        })(features = components.features || (components.features = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameFeatureComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var features;
        (function (features) {
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
                    this.name = this.host.feature.name;
                    var weapons = _.indexOf(this.host.groups, "weapon") !== -1;
                    if (weapons) {
                        this.inventory = _.filter(pow2.data.weapons, function (item) {
                            return item.level === _this.host.feature.level;
                        });
                    }
                    else if (_.indexOf(this.host.groups, "armor") !== -1) {
                        this.inventory = _.filter(pow2.data.armor, function (item) {
                            return item.level === _this.host.feature.level;
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
            })(components.GameFeatureComponent);
            features.StoreFeatureComponent = StoreFeatureComponent;
        })(features = components.features || (components.features = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameFeatureComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var features;
        (function (features) {
            var TempleFeatureComponent = (function (_super) {
                __extends(TempleFeatureComponent, _super);
                function TempleFeatureComponent() {
                    _super.apply(this, arguments);
                }
                TempleFeatureComponent.prototype.syncComponent = function () {
                    if (!_super.prototype.syncComponent.call(this) || !this.host.feature) {
                        return false;
                    }
                    this.name = "Temple";
                    this.cost = this.host.feature.cost;
                    this.icon = this.host.feature.icon;
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
            })(components.GameFeatureComponent);
            features.TempleFeatureComponent = TempleFeatureComponent;
        })(features = components.features || (components.features = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../playerComponent.ts" />
/// <reference path="../gameFeatureComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var features;
        (function (features) {
            var TreasureFeatureComponent = (function (_super) {
                __extends(TreasureFeatureComponent, _super);
                function TreasureFeatureComponent() {
                    _super.apply(this, arguments);
                }
                TreasureFeatureComponent.prototype.connectComponent = function () {
                    if (typeof this.host.id === 'undefined') {
                        console.error("Treasure must have a given id so it may be hidden");
                        return false;
                    }
                    return _super.prototype.connectComponent.call(this);
                };
                TreasureFeatureComponent.prototype.syncComponent = function () {
                    if (!_super.prototype.syncComponent.call(this) || !this.host.feature) {
                        return false;
                    }
                    this.name = "Treasure Chest";
                    this.gold = this.host.feature.gold;
                    this.item = this.host.feature.item;
                    this.icon = this.host.feature.icon;
                    return true;
                };
                TreasureFeatureComponent.prototype.enter = function (object) {
                    object.scene.trigger('treasure:entered', this);
                    this.setDataHidden(true);
                    return true;
                };
                return TreasureFeatureComponent;
            })(components.GameFeatureComponent);
            features.TreasureFeatureComponent = TreasureFeatureComponent;
        })(features = components.features || (components.features = {}));
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
var rpg;
(function (rpg) {
    var objects;
    (function (objects) {
        var GameFeatureObject = (function (_super) {
            __extends(GameFeatureObject, _super);
            function GameFeatureObject(options) {
                _super.call(this, _.omit(options || {}, ["x", "y"]));
                this.feature = options;
                this.point.x = options.x;
                this.point.y = options.y;
                this.frame = typeof options.frame !== 'undefined' ? options.frame : 0;
                this.groups = typeof options.groups === 'string' ? options.groups.split('|') : options.groups;
            }
            return GameFeatureObject;
        })(pow2.tile.TileObject);
        objects.GameFeatureObject = GameFeatureObject;
    })(objects = rpg.objects || (rpg.objects = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../objects/gameFeatureObject.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
        var GameFeatureInputComponent = (function (_super) {
            __extends(GameFeatureInputComponent, _super);
            function GameFeatureInputComponent() {
                _super.apply(this, arguments);
                this.hitBox = new pow2.Rect(0, 0, 1, 1);
                this.hits = [];
                this.mouse = null;
            }
            GameFeatureInputComponent.prototype.syncComponent = function () {
                if (!_super.prototype.syncComponent.call(this) || !this.host.scene || !this.host.scene.world || !this.host.scene.world.input) {
                    return false;
                }
                this.mouse = this.host.scene.world.input.getMouseHook("world");
                return !!this.mouse;
            };
            GameFeatureInputComponent.prototype.tick = function (elapsed) {
                // Calculate hits in Scene for machine usage.
                if (!this.host.scene || !this.mouse) {
                    return;
                }
                _.each(this.hits, function (tile) {
                    tile.scale = 1;
                });
                // Quick array clear
                this.hits.length = 0;
                this.hitBox.point.set(this.mouse.world);
                this.host.scene.db.queryRect(this.hitBox, rpg.objects.GameFeatureObject, this.hits);
                _.each(this.hits, function (obj) {
                    obj.scale = 1.25;
                });
                _super.prototype.tick.call(this, elapsed);
            };
            return GameFeatureInputComponent;
        })(pow2.scene.components.TickedComponent);
        components.GameFeatureInputComponent = GameFeatureInputComponent;
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="./gameComponent.ts" />
var rpg;
(function (rpg) {
    var components;
    (function (components) {
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
                this.player = this.host.findComponent(pow2.scene.components.PlayerComponent);
                this.collider = this.host.findComponent(pow2.scene.components.CollisionComponent);
                return !!(this.player && this.collider);
            };
            PlayerTouchComponent.prototype.tick = function (elapsed) {
                _super.prototype.tick.call(this, elapsed);
                if (!this.player || !this.collider) {
                    return;
                }
                var results = [];
                var newTouch = this.collider.collide(this.host.point.x + this.player.heading.x, this.host.point.y + this.player.heading.y, rpg.objects.GameFeatureObject, results);
                var touched = _.find(results, function (r) {
                    return !!r.findComponent(components.GameFeatureComponent);
                });
                if (!newTouch || !touched) {
                    if (this.touchedComponent) {
                        this.touchedComponent.exit(this.host);
                        this.touchedComponent = null;
                    }
                    this.touch = null;
                }
                else {
                    var touchComponent = touched.findComponent(components.GameFeatureComponent);
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
        })(pow2.scene.components.TickedComponent);
        components.PlayerTouchComponent = PlayerTouchComponent;
    })(components = rpg.components || (rpg.components = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts"/>
/// <reference path="../../../types/angularjs/angular.d.ts"/>
/// <reference path="../index.ts"/>
var rpg;
(function (rpg) {
    var services;
    (function (services) {
        var PowGameService = (function () {
            function PowGameService(compile, scope) {
                this.compile = compile;
                this.scope = scope;
                this._canvasAcquired = false;
                this._stateKey = "_test2Pow2State";
                if (this.qs().hasOwnProperty('dev')) {
                    console.log("Clearing gameData cache and loading live from Google Spreadsheets");
                    pow2.GameDataResource.clearCache(pow2.GameDataResource.DATA_KEY);
                }
                this._renderCanvas = compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="64" height="64"></canvas>')(scope)[0];
                this.loader = new pow2.ResourceLoader();
                this.currentScene = new pow2.scene.Scene({
                    autoStart: true,
                    debugRender: false
                });
                this.world = new rpg.GameWorld({
                    scene: this.currentScene,
                    model: new rpg.models.GameStateModel(),
                    state: new rpg.states.GameStateMachine()
                });
                this.machine = this.world.state;
                pow2.registerWorld('pow2', this.world);
                // Tell the world time manager to start ticking.
                this.world.time.start();
                this.entities = this.world.loader.load(pow2.GAME_ROOT + 'games/rpg/entities/map.powEntities');
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
                if (!this.entities.isReady()) {
                    throw new Error("Cannot create player before entities container is loaded");
                }
                if (this.sprite) {
                    this.sprite.destroy();
                    this.sprite = null;
                }
                this.sprite = this.entities.createObject('GameMapPlayer', {
                    model: from,
                    map: this.tileMap
                });
                this.sprite.name = from.attributes.name;
                this.sprite.icon = from.attributes.icon;
                this.world.scene.addObject(this.sprite);
                if (typeof at === 'undefined' && this.tileMap instanceof pow2.tile.TileMap) {
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
                this.world.loader.load(pow2.getMapUrl(mapName), function (map) {
                    _this.tileMap = _this.entities.createObject('GameMapObject', {
                        resource: map
                    });
                    var model = player || _this.world.model.party[0];
                    _this.createPlayer(model, at);
                    _this.world.scene.addObject(_this.tileMap);
                    _this.tileMap.loaded();
                    then && then();
                });
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
                        this.world.model.addHero(rpg.models.HeroModel.create(rpg.models.HeroTypes.Warrior, "Warrior"));
                        this.world.model.addHero(rpg.models.HeroModel.create(rpg.models.HeroTypes.Ranger, "Ranger"));
                        this.world.model.addHero(rpg.models.HeroModel.create(rpg.models.HeroTypes.LifeMage, "Mage"));
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
        services.PowGameService = PowGameService;
        rpg.app.factory('game', [
            '$compile',
            '$rootScope',
            function ($compile, $rootScope) {
                return new PowGameService($compile, $rootScope);
            }
        ]);
    })(services = rpg.services || (rpg.services = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../../../types/angularjs/angular.d.ts"/>
/// <reference path="./gameService.ts"/>
var rpg;
(function (rpg) {
    var services;
    (function (services) {
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
                    _this.paused = true;
                    _this.scope.powAlert = _this._current;
                    _this.animate.enter(_this.element, _this.container).then(function () {
                        _this.paused = false;
                    });
                });
            };
            PowAlertService.prototype.dismiss = function () {
                var _this = this;
                if (!this._current || this.paused) {
                    return;
                }
                this.paused = true;
                this.scope.$apply(function () {
                    _this.animate.leave(_this.element).then(function () {
                        if (_this._current) {
                            // Don't let exceptions in callback mess up current = null;
                            try {
                                _this._current.done && _this._current.done(_this._current);
                            }
                            catch (e) {
                                console.log(e);
                            }
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
        services.PowAlertService = PowAlertService;
        rpg.app.factory('powAlert', [
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
    })(services = rpg.services || (rpg.services = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../services/gameService.ts"/>
/// <reference path="../services/alertService.ts"/>
var rpg;
(function (rpg) {
    var controllers;
    (function (controllers) {
        rpg.app.controller('RPGGameController', [
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
                    var party = game.currentScene.componentByType(pow2.scene.components.PlayerComponent);
                    if (party) {
                        game.world.model.setKeyData('playerPosition', party.host.point);
                    }
                    var data = JSON.stringify(game.world.model.toJSON());
                    game.saveGame(data);
                    powAlert.show("Game Saved!", null, 0);
                };
                rpg.models.GameStateModel.getDataSource(function () {
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
                        // Get items data from spreadsheet
                        rpg.models.GameStateModel.getDataSource(function (data) {
                            var item = null;
                            var desc = _.where(data.getSheetData('weapons'), { id: feature.item })[0];
                            if (desc) {
                                item = new rpg.models.WeaponModel(desc);
                            }
                            else {
                                desc = _.where(data.getSheetData('armor'), { id: feature.item })[0];
                                if (desc) {
                                    item = new rpg.models.ArmorModel(desc);
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
                game.currentScene.on(pow2.tile.TileMap.Events.MAP_LOADED, function (map) {
                    game.world.model.setKeyData('playerMap', map.map.url);
                });
                // TODO: A better system for game event handling.
                game.machine.on('enter', function (state) {
                    if (state.name === rpg.states.GameCombatState.NAME) {
                        $scope.$apply(function () {
                            $scope.combat = state.machine;
                            $scope.inCombat = true;
                            state.machine.on('combat:attack', function (data) {
                                var _done = state.machine.notifyWait();
                                var msg = '';
                                var a = data.attacker.model.get('name');
                                var b = data.defender.model.get('name');
                                if (data.damage > 0) {
                                    msg = a + " attacked " + b + " for " + data.damage + " damage!";
                                }
                                else {
                                    msg = a + " attacked " + b + ", and MISSED!";
                                }
                                powAlert.show(msg, _done);
                            });
                            state.machine.on('combat:run', function (data) {
                                var _done = state.machine.notifyWait();
                                var msg = data.player.model.get('name');
                                if (data.success) {
                                    msg += ' bravely ran away!';
                                }
                                else {
                                    msg += ' failed to escape!';
                                }
                                powAlert.show(msg, _done);
                            });
                            state.machine.on('combat:victory', function (data) {
                                var _done = state.machine.notifyWait();
                                powAlert.show("Found " + data.gold + " gold!", null, 0);
                                powAlert.show("Gained " + data.exp + " experience!", null, 0);
                                angular.forEach(data.levels, function (hero) {
                                    powAlert.show(hero.get('name') + " reached level " + hero.get('level') + "!", null, 0);
                                });
                                powAlert.show("Enemies Defeated!", _done);
                            });
                            state.machine.on('combat:defeat', function (data) {
                                powAlert.show("Your party was defeated...", function () {
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
                        if (state.name === rpg.states.GameMapState.NAME) {
                            $scope.dialog = null;
                            $scope.store = null;
                        }
                        else if (state.name === rpg.states.GameCombatState.NAME) {
                            $scope.inCombat = false;
                            $scope.combat = null;
                        }
                    });
                    console.log("UI: Exited state: " + state.name);
                });
            }
        ]);
    })(controllers = rpg.controllers || (rpg.controllers = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../../services/gameService.ts"/>
var rpg;
(function (rpg) {
    var directives;
    (function (directives) {
        var bits;
        (function (bits) {
            rpg.app.directive('healthBar', function () {
                return {
                    restrict: 'E',
                    scope: {
                        model: "="
                    },
                    templateUrl: 'games/rpg/directives/bits/healthBar.html',
                    controller: function ($scope) {
                        $scope.getProgressClass = function (model) {
                            if (!model || !model.attributes) {
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
                            if (!model || !model.attributes) {
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
        })(bits = directives.bits || (directives.bits = {}));
    })(directives = rpg.directives || (rpg.directives = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../../services/gameService.ts"/>
var rpg;
(function (rpg) {
    var directives;
    (function (directives) {
        var combat;
        (function (combat) {
            /**
             * A state machine to represent the various UI states involved in
             * choosing a combat action.
             *
             * ```
             *
             *     +------+   +--------+   +--------+
             *     | type |-->| target |-->| submit |
             *     +------+   +--------+   +--------+
             *
             * ```
             *
             * When the user properly selects an action type (Attack, Magic, Item)
             * and a target to apply the action to (Hero, All Enemies, etc.) the
             * submit state will apply the selection to the state machine at which
             * point the implementation may do whatever it wants.
             */
            var ChooseActionStateMachine = (function (_super) {
                __extends(ChooseActionStateMachine, _super);
                function ChooseActionStateMachine(controller, data, submit) {
                    _super.call(this);
                    this.controller = controller;
                    this.data = data;
                    this.current = null;
                    this.target = null;
                    this.player = null;
                    this.action = null;
                    this.spell = null;
                    this.world = rpg.GameWorld.get();
                    this.states = [
                        new ChooseActionTarget(),
                        new ChooseActionType(),
                        new ChooseMagicSpell(),
                        new ChooseActionSubmit(submit)
                    ];
                    this.scope = controller.$scope;
                    this.scene = data.players[0].scene;
                }
                return ChooseActionStateMachine;
            })(pow2.StateMachine);
            combat.ChooseActionStateMachine = ChooseActionStateMachine;
            /**
             * Choose a specific action type to apply in combat.
             */
            var ChooseActionType = (function (_super) {
                __extends(ChooseActionType, _super);
                function ChooseActionType() {
                    _super.apply(this, arguments);
                    this.name = ChooseActionType.NAME;
                }
                ChooseActionType.prototype.enter = function (machine) {
                    if (!machine.controller || !machine.controller.pointer) {
                        throw new Error("Requires UIAttachment");
                    }
                    if (!machine.current) {
                        throw new Error("Requires Current Player");
                    }
                    var p = machine.current;
                    machine.player = p.findComponent(pow2.game.components.PlayerCombatRenderComponent);
                    if (!machine.player) {
                        throw new Error("Requires player render component for combat animations.");
                    }
                    var pointerOffset = new pow2.Point(-1, -0.25);
                    machine.action = null;
                    machine.target = null;
                    // Enable menu selection of action type.
                    var selectAction = function (action) {
                        machine.action = action;
                        machine.scope.selectAction = null;
                        machine.scene.off('click', clickSelect);
                        if (machine.action instanceof rpg.components.combat.actions.CombatMagicComponent) {
                            if (machine.current.getSpells().length === 1) {
                                machine.spell = machine.current.getSpells()[0];
                                machine.setCurrentState(ChooseActionTarget.NAME);
                            }
                            else {
                                machine.setCurrentState(ChooseMagicSpell.NAME);
                            }
                        }
                        else if (machine.action.canTarget()) {
                            machine.setCurrentState(ChooseActionTarget.NAME);
                        }
                        else {
                            machine.setCurrentState(ChooseActionSubmit.NAME);
                        }
                    };
                    machine.scope.selectAction = selectAction;
                    var el = $(machine.controller.pointer.element);
                    if (!p) {
                        el.hide();
                        return;
                    }
                    machine.scope.$apply(function () {
                        machine.controller.choosing = p;
                    });
                    var clickSelect = function (mouse, hits) {
                        machine.scene.off('click', clickSelect);
                        machine.target = hits[0];
                        selectAction(machine.controller.getActions()[0]);
                    };
                    machine.player.moveForward(function () {
                        machine.controller.setPointerTarget(p, "right", pointerOffset);
                        el.show();
                        machine.scene.on('click', clickSelect);
                    });
                };
                ChooseActionType.prototype.exit = function (machine) {
                    machine.scope.$apply(function () {
                        machine.controller.choosing = null;
                    });
                };
                ChooseActionType.NAME = "choose-type";
                return ChooseActionType;
            })(pow2.State);
            combat.ChooseActionType = ChooseActionType;
            /**
             * Choose a magic spell to cast in combat.
             */
            var ChooseMagicSpell = (function (_super) {
                __extends(ChooseMagicSpell, _super);
                function ChooseMagicSpell() {
                    _super.apply(this, arguments);
                    this.name = ChooseMagicSpell.NAME;
                }
                ChooseMagicSpell.prototype.enter = function (machine) {
                    if (!machine.current) {
                        throw new Error("Requires Current Player");
                    }
                    // Enable menu selection of action type.
                    machine.scope.selectSpell = function (spell) {
                        machine.spell = spell;
                        machine.scope.selectSpell = null;
                        machine.target = spell.benefit ? machine.current : null;
                        switch (spell.type) {
                            case "target":
                                machine.setCurrentState(ChooseActionTarget.NAME);
                                break;
                            default:
                                console.info("Unknown spell type, submitting without target: " + spell.type);
                                machine.setCurrentState(ChooseActionSubmit.NAME);
                        }
                    };
                    machine.scope.$apply(function () {
                        machine.controller.choosingSpell = machine.player;
                    });
                };
                ChooseMagicSpell.prototype.exit = function (machine) {
                    machine.scope.$apply(function () {
                        machine.controller.choosingSpell = null;
                    });
                };
                ChooseMagicSpell.NAME = "choose-spell";
                return ChooseMagicSpell;
            })(pow2.State);
            combat.ChooseMagicSpell = ChooseMagicSpell;
            /**
             * Choose a target to apply a combat action to
             */
            var ChooseActionTarget = (function (_super) {
                __extends(ChooseActionTarget, _super);
                function ChooseActionTarget() {
                    _super.apply(this, arguments);
                    this.name = ChooseActionTarget.NAME;
                }
                ChooseActionTarget.prototype.enter = function (machine) {
                    if (!machine.controller || !machine.controller.pointer) {
                        throw new Error("Requires UIAttachment");
                    }
                    var enemies = machine.data.enemies;
                    var p = machine.target || enemies[0];
                    var el = $(machine.controller.pointer.element);
                    machine.controller.addPointerClass(machine.action.getActionName());
                    if (!p) {
                        el.hide();
                        return;
                    }
                    var selectTarget = function (target) {
                        if (machine.target && machine.target._uid === target._uid) {
                            machine.target = target;
                            machine.scope.selectTarget = null;
                            machine.scene.off('click', clickTarget);
                            machine.setCurrentState(ChooseActionSubmit.NAME);
                            machine.controller.targeting = false;
                            return;
                        }
                        machine.target = target;
                        machine.controller.setPointerTarget(target, "left", pointerOffset);
                    };
                    machine.scope.selectTarget = selectTarget;
                    var pointerOffset = new pow2.Point(0.5, -0.25);
                    var clickTarget = function (mouse, hits) {
                        selectTarget(hits[0]);
                    };
                    machine.controller.setPointerTarget(p, "left", pointerOffset);
                    machine.scene.on('click', clickTarget);
                    machine.scope.$apply(function () {
                        machine.controller.targeting = true;
                    });
                };
                ChooseActionTarget.prototype.exit = function (machine) {
                    machine.scope.$apply(function () {
                        machine.controller.targeting = false;
                    });
                };
                ChooseActionTarget.NAME = "choose-target";
                return ChooseActionTarget;
            })(pow2.State);
            combat.ChooseActionTarget = ChooseActionTarget;
            /**
             * Submit a selected action type and action target to the submit handler
             * implementation.
             */
            var ChooseActionSubmit = (function (_super) {
                __extends(ChooseActionSubmit, _super);
                function ChooseActionSubmit(submit) {
                    _super.call(this);
                    this.submit = submit;
                    this.name = ChooseActionSubmit.NAME;
                }
                ChooseActionSubmit.prototype.enter = function (machine) {
                    var _this = this;
                    if (!machine.current || !machine.action || !this.submit) {
                        throw new Error("Invalid state");
                    }
                    if (machine.action.canTarget() && !machine.target) {
                        throw new Error("Invalid target");
                    }
                    machine.player.moveBackward(function () {
                        if (machine.controller.pointer) {
                            $(machine.controller.pointer.element).hide();
                        }
                        machine.action.from = machine.current;
                        machine.action.to = machine.target;
                        machine.action.spell = machine.spell;
                        machine.action.select();
                        machine.controller.removePointerClass(machine.action.getActionName());
                        _this.submit(machine.action);
                    });
                };
                ChooseActionSubmit.NAME = "choose-submit";
                return ChooseActionSubmit;
            })(pow2.State);
            combat.ChooseActionSubmit = ChooseActionSubmit;
        })(combat = directives.combat || (directives.combat = {}));
    })(directives = rpg.directives || (rpg.directives = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../services/gameService.ts"/>
var rpg;
(function (rpg) {
    var directives;
    (function (directives) {
        rpg.app.directive('combatCanvas', [
            '$compile', 'game', '$animate', '$damageValue',
            function ($compile, game, $animate, $damageValue) {
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
                        var tileView = new rpg.GameCombatView(element[0], game.loader);
                        // Support showing damage on character with fading animation.
                        game.machine.on('enter', function (state) {
                            if (state.name !== rpg.states.GameCombatState.NAME) {
                                return;
                            }
                            state.machine.on('combat:attack', function (data) {
                                $damageValue.applyDamage(data.defender, data.damage, tileView);
                            });
                        });
                        game.machine.on('combat:begin', function (state) {
                            // Scope apply?
                            // Transition canvas views, and such
                            game.world.combatScene.addView(tileView);
                            game.tileMap.scene.paused = true;
                            tileView.setTileMap(state.tileMap);
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
            }
        ]);
    })(directives = rpg.directives || (rpg.directives = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../services/gameService.ts"/>
/// <reference path="./combat/chooseActionStateMachine.ts"/>
var rpg;
(function (rpg) {
    var directives;
    (function (directives) {
        var CombatViewController = (function () {
            function CombatViewController(game, $scope) {
                var _this = this;
                this.game = game;
                this.$scope = $scope;
                this.pointer = null;
                this.combatView = null;
                this.combatData = null;
                this.stateMachine = null;
                this.choosing = null;
                this.choosingSpell = null;
                this.targeting = false;
                game.world.time.addObject(this);
                $scope.$on('$destroy', function () {
                    game.world.time.removeObject(_this);
                });
            }
            CombatViewController.prototype.tick = function (elapsed) {
                if (!this.combatView || !this.pointer || !this.pointer.object) {
                    return;
                }
                var targetPos = this.pointer.object.point.clone();
                targetPos.y = (targetPos.y - this.combatView.camera.point.y) + this.pointer.offset.y;
                targetPos.x = (targetPos.x - this.combatView.camera.point.x) + this.pointer.offset.x;
                var screenPos = this.combatView.worldToScreen(targetPos, this.combatView.cameraScale);
                var el = $(this.pointer.element);
                el.css({
                    left: screenPos.x,
                    top: screenPos.y
                });
            };
            CombatViewController.prototype.setPointerTarget = function (object, directionClass, offset) {
                if (directionClass === void 0) { directionClass = "right"; }
                if (offset === void 0) { offset = new pow2.Point(); }
                var el = $(this.pointer.element);
                el.removeClass('left right');
                el.addClass(directionClass);
                if (this.pointer) {
                    this.pointer.object = object;
                    this.pointer.offset = offset;
                }
            };
            CombatViewController.prototype.addPointerClass = function (clazz) {
                $(this.pointer.element).addClass(clazz);
            };
            CombatViewController.prototype.removePointerClass = function (clazz) {
                $(this.pointer.element).removeClass(clazz);
            };
            CombatViewController.prototype.destroy = function () {
                if (this.pointer) {
                    $(this.pointer.element).remove();
                }
                this.pointer = null;
            };
            CombatViewController.prototype.getMemberClass = function (member, focused) {
                var result = [];
                var choosing = this.choosing;
                if (choosing && choosing.model && choosing.model.get('name') === member.model.get('name')) {
                    result.push('choosing');
                }
                if (focused && focused.model && member.model.get('name') === focused.model.get('name')) {
                    result.push('focused');
                }
                return result.join(' ');
            };
            CombatViewController.prototype.getActions = function () {
                var _this = this;
                if (!this.choosing) {
                    throw new Error("cannot get actions for non-existent game entity");
                }
                var results = _.filter(this.choosing.findComponents(rpg.components.combat.CombatActionComponent), function (c) {
                    return c.canBeUsedBy(_this.choosing);
                });
                return results;
            };
            CombatViewController.prototype.getSpells = function () {
                if (!this.choosingSpell || !this.choosingSpell.host) {
                    return [];
                }
                var host = this.choosingSpell.host;
                var spells = host.getSpells();
                return spells;
            };
            CombatViewController.prototype.getTargets = function () {
                var result = [];
                var beneficial = this.stateMachine && this.stateMachine.spell && this.stateMachine.spell.benefit;
                if (this.combatData) {
                    result = (beneficial ? this.combatData.players : this.combatData.enemies);
                }
                return result;
            };
            CombatViewController.$inject = ['game', '$scope'];
            return CombatViewController;
        })();
        directives.CombatViewController = CombatViewController;
        rpg.app.directive('combatView', ['game', '$compile', '$animate', function (game, $compile, $animate) {
                var _this = this;
                return {
                    restrict: 'E',
                    replace: true,
                    templateUrl: 'games/rpg/directives/combatView.html',
                    controller: CombatViewController,
                    controllerAs: "combatCtrl",
                    link: function (scope, element, attrs, controller) {
                        controller.destroy();
                        var el = $compile('<span class="point-to-player" style="position:absolute;left:0;top:0;"></span>')(scope);
                        var chooseTurns = function (data) {
                            controller.combatData = data;
                            var combatScene = game.world.combatScene;
                            if (!combatScene) {
                                throw new Error("CombatView requires a combatScene to be present in the game world");
                            }
                            controller.combatView = combatScene.getViewOfType(rpg.GameCombatView);
                            if (!controller.combatView) {
                                throw new Error("CombatView requires a GameCombatView for coordinate conversions");
                            }
                            var chooseSubmit = function (action) {
                                inputState.data.choose(action);
                                next();
                            };
                            var inputState = new rpg.directives.combat.ChooseActionStateMachine(controller, data, chooseSubmit);
                            controller.stateMachine = inputState;
                            inputState.data = data;
                            var choices = data.players.slice();
                            var next = function () {
                                var p = choices.shift();
                                if (!p) {
                                    controller.combatData = null;
                                    controller.stateMachine = null;
                                    return;
                                }
                                inputState.current = p;
                                inputState.setCurrentState(rpg.directives.combat.ChooseActionType.NAME);
                            };
                            element.parent().append(el);
                            el.show();
                            next();
                        };
                        var turnListener = function () {
                            scope.$apply(function () {
                                scope.combat = scope.combat;
                            });
                        };
                        game.machine.on('combat:begin', function (state) {
                            state.machine.on('combat:beginTurn', turnListener);
                            state.machine.on('combat:chooseMoves', chooseTurns);
                            controller.destroy();
                            controller.pointer = {
                                element: el[0],
                                object: null,
                                offset: new pow2.Point(),
                                view: controller.combatView
                            };
                        }, _this);
                        game.machine.on('combat:end', function (state) {
                            state.machine.off('combat:beginTurn', turnListener);
                            state.machine.off('combat:chooseMoves', chooseTurns);
                            controller.destroy();
                        });
                        scope.$on('$destroy', function () {
                            game.machine && game.machine.off('combat:begin', null, _this);
                            controller.destroy();
                        });
                    }
                };
            }]);
    })(directives = rpg.directives || (rpg.directives = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../services/gameService.ts"/>
var rpg;
(function (rpg) {
    var directives;
    (function (directives) {
        // DialogBubble directive
        // ----------------------------------------------------------------------------
        rpg.app.directive('dialogView', ['game', function (game) {
                return {
                    restrict: 'E',
                    replace: true,
                    templateUrl: 'games/rpg/directives/dialogView.html',
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
    })(directives = rpg.directives || (rpg.directives = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../services/gameService.ts"/>
var rpg;
(function (rpg) {
    var directives;
    (function (directives) {
        rpg.app.directive('gameCanvas', ['$compile', 'game', function ($compile, game) {
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
                        var tileView = new rpg.RPGMapView(element[0], game.loader);
                        tileView.camera.extent.set(10, 10);
                        tileView.setTileMap(game.tileMap);
                        game.world.scene.addView(tileView);
                        onResize();
                    }
                };
            }]);
    })(directives = rpg.directives || (rpg.directives = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../services/gameService.ts"/>
var rpg;
(function (rpg) {
    var directives;
    (function (directives) {
        // Game Menu overlay directive
        // ----------------------------------------------------------------------------
        rpg.app.directive('gameMenu', [
            'game',
            function (game) {
                return {
                    restrict: 'E',
                    templateUrl: 'games/rpg/directives/gameMenu.html',
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
    })(directives = rpg.directives || (rpg.directives = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../services/gameService.ts"/>
/// <reference path="../services/alertService.ts"/>
var rpg;
(function (rpg) {
    var directives;
    (function (directives) {
        rpg.app.directive('inventoryView', ['game', 'powAlert', function (game, powAlert) {
                return {
                    restrict: 'E',
                    templateUrl: '/games/rpg/directives/inventoryView.html',
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
                            if (item instanceof rpg.models.ArmorModel) {
                                var old = hero.equipArmor(item);
                                if (old) {
                                    game.world.model.addInventory(old);
                                }
                            }
                            else if (item instanceof rpg.models.WeaponModel) {
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
                            if (item instanceof rpg.models.ArmorModel) {
                                hero.unequipArmor(item);
                            }
                            else if (item instanceof rpg.models.WeaponModel) {
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
    })(directives = rpg.directives || (rpg.directives = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../../services/gameService.ts"/>
var rpg;
(function (rpg) {
    var directives;
    (function (directives) {
        var pages;
        (function (pages) {
            var MainMenuController = (function () {
                function MainMenuController($scope) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$scope.currentClass = "warrior";
                    rpg.models.GameStateModel.getDataSource(function (res) {
                        var data = res.getSheetData('classes');
                        _this.$scope.classes = data;
                        //console.log(JSON.stringify(data,null,3));
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
            pages.MainMenuController = MainMenuController;
            rpg.app.directive('mainMenu', function () {
                return {
                    restrict: 'E',
                    scope: true,
                    templateUrl: 'games/rpg/directives/pages/mainMenu.html',
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
        })(pages = directives.pages || (directives.pages = {}));
    })(directives = rpg.directives || (rpg.directives = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../services/gameService.ts"/>
/// <reference path="../services/alertService.ts"/>
var rpg;
(function (rpg) {
    var directives;
    (function (directives) {
        var StoreViewController = (function () {
            function StoreViewController(game, powAlert, $scope) {
                var _this = this;
                this.game = game;
                this.powAlert = powAlert;
                this.$scope = $scope;
                /**
                 * The game state model to modify.
                 */
                this.gameModel = null;
                /**
                 * The selected item to purchase/sell.
                 */
                this.selected = null;
                /**
                 * Determine if the UI is in a selling state.
                 */
                this.selling = false;
                game.world.time.addObject(this);
                $scope.$on('$destroy', function () {
                    _this.destroy();
                });
                this.gameModel = game.world.model;
            }
            StoreViewController.prototype.destroy = function () {
                this.$scope.store = null;
                this.selling = false;
                this.selected = null;
            };
            StoreViewController.prototype.actionItem = function (item) {
                if (!this.$scope.store || !item) {
                    return;
                }
                var model = this.game.world.model;
                var value = parseInt(item.cost);
                if (this.selling) {
                    var itemIndex = -1;
                    for (var i = 0; i < model.inventory.length; i++) {
                        if (model.inventory[i].id === item.id) {
                            itemIndex = i;
                            break;
                        }
                    }
                    if (itemIndex !== -1) {
                        model.gold += value;
                        this.powAlert.show("Sold " + item.name + " for " + item.cost + " gold.", null, 1500);
                        model.inventory.splice(itemIndex, 1);
                    }
                }
                else {
                    if (value > model.gold) {
                        this.powAlert.show("You don't have enough money");
                        return;
                    }
                    else {
                        model.gold -= value;
                        this.powAlert.show("Purchased " + item.name + ".", null, 1500);
                        model.inventory.push(item.instanceModel.clone());
                    }
                }
                this.selected = null;
                this.selling = false;
            };
            StoreViewController.prototype.getActionVerb = function () {
                return this.selling ? "Sell" : "Buy";
            };
            StoreViewController.prototype.isBuying = function () {
                return !this.selected && !this.selling;
            };
            StoreViewController.prototype.isSelling = function () {
                return !this.selected && this.selling;
            };
            StoreViewController.prototype.toggleAction = function () {
                if (!this.selling) {
                    if (this.gameModel.inventory.length === 0) {
                        this.powAlert.show("You don't have any unequipped inventory to sell.", null, 1500);
                        this.selling = false;
                        return;
                    }
                }
                this.selling = !this.selling;
            };
            StoreViewController.prototype.selectItem = function (item) {
                if (item instanceof rpg.models.ItemModel) {
                    item = item.toJSON();
                }
                this.selected = item;
            };
            StoreViewController.prototype.initStoreFromFeature = function (feature) {
                var _this = this;
                // Get enemies data from spreadsheet
                rpg.models.GameStateModel.getDataSource(function (data) {
                    var hasCategory = typeof feature.host.category !== 'undefined';
                    var theChoices = [];
                    if (!hasCategory || feature.host.category === 'weapons') {
                        theChoices = theChoices.concat(_.map(data.getSheetData('weapons'), function (w) {
                            return _.extend({ instanceModel: new rpg.models.WeaponModel(w) }, w);
                        }));
                    }
                    if (!hasCategory || feature.host.category === 'armor') {
                        theChoices = theChoices.concat(_.map(data.getSheetData('armor'), function (a) {
                            return _.extend({ instanceModel: new rpg.models.ArmorModel(a) }, a);
                        }));
                    }
                    var items = [];
                    _.each(feature.host.groups, function (group) {
                        items = items.concat(_.filter(theChoices, function (c) {
                            return _.indexOf(c.groups, group) !== -1;
                        }));
                    });
                    feature.inventory = _.where(items, { level: feature.host.feature.level });
                    _this.$scope.$apply(function () {
                        _this.$scope.store = feature;
                    });
                });
            };
            StoreViewController.$inject = ['game', 'powAlert', '$scope'];
            return StoreViewController;
        })();
        directives.StoreViewController = StoreViewController;
        rpg.app.directive('storeView', ['game', function (game, powAlert) {
                return {
                    restrict: 'E',
                    templateUrl: 'games/rpg/directives/storeView.html',
                    controller: StoreViewController,
                    controllerAs: 'storeCtrl',
                    link: function ($scope, element, attrs, controller) {
                        // Stores
                        game.world.scene.on('store:entered', function (feature) {
                            controller.initStoreFromFeature(feature);
                        });
                        game.world.scene.on('store:exited', function () {
                            $scope.$apply(function () {
                                $scope.store = null;
                            });
                        });
                    }
                };
            }]);
    })(directives = rpg.directives || (rpg.directives = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../services/gameService.ts"/>
/// <reference path="../services/alertService.ts"/>
var rpg;
(function (rpg) {
    var directives;
    (function (directives) {
        // TempleView directive
        // ----------------------------------------------------------------------------
        rpg.app.directive('templeView', ['game', 'powAlert', function (game, powAlert) {
                return {
                    restrict: 'E',
                    templateUrl: 'games/rpg/directives/templeView.html',
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
    })(directives = rpg.directives || (rpg.directives = {}));
})(rpg || (rpg = {}));
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
/// <reference path="./index.ts"/>
/// <reference path="./components/combat/combatCameraComponent.ts"/>
var rpg;
(function (rpg) {
    var GameCombatView = (function (_super) {
        __extends(GameCombatView, _super);
        function GameCombatView(canvas, loader) {
            _super.call(this, canvas, loader);
            this.objectRenderer = new pow2.tile.render.TileObjectRenderer;
            this.mouse = null;
            this.mouseClick = _.bind(this.mouseClick, this);
        }
        GameCombatView.prototype.onAddToScene = function (scene) {
            _super.prototype.onAddToScene.call(this, scene);
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
            if (this.world.combatScene.db.queryPoint(this.mouse.world, rpg.objects.GameEntityObject, hits)) {
                this.world.combatScene.trigger('click', this.mouse, hits);
                e.stopImmediatePropagation();
                return false;
            }
        };
        /*
         * Update the camera for this frame.
         */
        GameCombatView.prototype.processCamera = function () {
            this.cameraComponent = this.scene.componentByType(rpg.components.combat.CombatCameraComponent);
            _super.prototype.processCamera.call(this);
        };
        /*
         * Render the tile map, and any features it has.
         */
        GameCombatView.prototype.renderFrame = function (elapsed) {
            var _this = this;
            _super.prototype.renderFrame.call(this, elapsed);
            var players = this.scene.objectsByComponent(pow2.game.components.PlayerCombatRenderComponent);
            _.each(players, function (player) {
                _this.objectRenderer.render(player, player, _this);
            });
            var sprites = this.scene.componentsByType(pow2.tile.components.SpriteComponent);
            _.each(sprites, function (sprite) {
                _this.objectRenderer.render(sprite.host, sprite, _this);
            });
            return this;
        };
        return GameCombatView;
    })(pow2.tile.TileMapView);
    rpg.GameCombatView = GameCombatView;
})(rpg || (rpg = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
var rpg;
(function (rpg) {
    var models;
    (function (models) {
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
        models.ItemModel = ItemModel;
    })(models = rpg.models || (rpg.models = {}));
})(rpg || (rpg = {}));
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
/// <reference path="./itemModel.ts" />
var rpg;
(function (rpg) {
    var models;
    (function (models) {
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
        })(models.ItemModel);
        models.ArmorModel = ArmorModel;
    })(models = rpg.models || (rpg.models = {}));
})(rpg || (rpg = {}));
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
/// <reference path="./entityModel.ts" />
/// <reference path="./heroModel.ts" />
/// <reference path="./itemModel.ts" />
var rpg;
(function (rpg) {
    var models;
    (function (models) {
        var _gameData = null;
        var GameStateModel = (function (_super) {
            __extends(GameStateModel, _super);
            function GameStateModel(options) {
                _super.call(this);
                this.keyData = {};
                _.defaults(this, options || {}, {
                    gold: 200,
                    playerPosition: new pow2.Point(),
                    playerMap: "",
                    combatZone: "world-plains",
                    party: [],
                    inventory: []
                });
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
                    return _gameData;
                }
                else {
                    return pow2.ResourceLoader.get().loadAsType(pow2.SPREADSHEET_ID, pow2.GameDataResource, function (resource) {
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
                    return _.extend({ instanceModel: new models.WeaponModel(w) }, w);
                }));
                theChoices = theChoices.concat(_.map(_gameData.getSheetData('armor'), function (a) {
                    return _.extend({ instanceModel: new models.ArmorModel(a) }, a);
                }));
                this.inventory = _.map(data.inventory, function (item) {
                    var choice = _.where(theChoices, { id: item.id })[0];
                    return choice.instanceModel;
                });
                this.party = _.map(data.party, function (partyMember) {
                    return new models.HeroModel(partyMember, { parse: true });
                });
                _.extend(this, _.omit(data, 'party', 'inventory', 'keyData'));
            };
            GameStateModel.prototype.toJSON = function () {
                var result = _.omit(this, 'party', 'inventory', 'keyData', 'world');
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
        models.GameStateModel = GameStateModel;
    })(models = rpg.models || (rpg.models = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="./itemModel.ts" />
var rpg;
(function (rpg) {
    var models;
    (function (models) {
        var WeaponModel = (function (_super) {
            __extends(WeaponModel, _super);
            function WeaponModel() {
                _super.apply(this, arguments);
            }
            WeaponModel.prototype.defaults = function () {
                return _.extend(_super.prototype.defaults.call(this), WeaponModel.DEFAULTS);
            };
            WeaponModel.prototype.isNoWeapon = function () {
                return this.attributes.name === WeaponModel.DEFAULTS.name &&
                    this.attributes.icon === WeaponModel.DEFAULTS.icon &&
                    this.attributes.attack === WeaponModel.DEFAULTS.attack &&
                    this.attributes.hit === WeaponModel.DEFAULTS.hit &&
                    this.attributes.cost === WeaponModel.DEFAULTS.cost;
            };
            WeaponModel.DEFAULTS = {
                name: "No Weapon",
                icon: "",
                attack: 0,
                hit: 0,
                cost: 0
            };
            return WeaponModel;
        })(models.ItemModel);
        models.WeaponModel = WeaponModel;
    })(models = rpg.models || (rpg.models = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="./entityModel.ts" />
/// <reference path="./creatureModel.ts" />
/// <reference path="./gameStateModel.ts" />
/// <reference path="./armorModel.ts" />
/// <reference path="./weaponModel.ts" />
var rpg;
(function (rpg) {
    var models;
    (function (models) {
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
        models.HeroTypes = {
            Warrior: "warrior",
            LifeMage: "mage",
            Necromancer: "necromancer",
            Ranger: "ranger"
        };
        var HeroModel = (function (_super) {
            __extends(HeroModel, _super);
            function HeroModel() {
                _super.apply(this, arguments);
                /**
                 * A constant buffer to add to defense of a player.
                 *
                 * TODO: This is probably a terrible way of buffing a character.
                 *
                 * Instead use a chain of modifiers?  e.g. PosionModifier, GuardingModifier,
                 * ParalyzedModifier, etc.
                 */
                this.defenseBuff = 0;
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
                return models.EntityModel.BASE_EVASION + this.attributes.agility + evasionPenalty;
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
            HeroModel.prototype.getDefense = function (base) {
                var _this = this;
                if (base === void 0) { base = false; }
                var baseDefense = _.reduce(HeroModel.ARMOR_TYPES, function (val, type) {
                    var item = _this[type];
                    if (!item) {
                        return val;
                    }
                    return val + item.attributes.defense;
                }, 0);
                return baseDefense + (base ? 0 : this.defenseBuff);
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
                models.GameStateModel.getDataSource(function (spreadsheet) {
                    _.each(HeroModel.ARMOR_TYPES, function (type) {
                        if (data[type]) {
                            var piece = _.where(spreadsheet.getSheetData('armor'), { name: data[type] })[0];
                            if (piece) {
                                _this[type] = new models.ArmorModel(piece);
                            }
                        }
                    });
                    if (data.weapon) {
                        var weapon = _.where(spreadsheet.getSheetData('weapons'), { name: data.weapon })[0];
                        _this.weapon = new models.WeaponModel(weapon);
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
                    case models.HeroTypes.Warrior:
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
                    case models.HeroTypes.LifeMage:
                        character = new HeroModel({
                            type: type,
                            name: name,
                            level: 0,
                            icon: "magician-female.png",
                            baseStrength: 1,
                            baseAgility: 6,
                            baseIntelligence: 9,
                            baseVitality: 4,
                            hitpercent: 5,
                            hitPercentPerLevel: 1
                        });
                        break;
                    case models.HeroTypes.Ranger:
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
                    case models.HeroTypes.DeathMage:
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
                'head', 'body', 'arms', 'feet', 'accessory'
            ];
            HeroModel.DEFAULTS = {
                name: "Hero",
                icon: "",
                combatSprite: "",
                type: models.HeroTypes.Warrior,
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
        })(models.EntityModel);
        models.HeroModel = HeroModel;
    })(models = rpg.models || (rpg.models = {}));
})(rpg || (rpg = {}));
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
/// <reference path="./entityModel.ts" />
/// <reference path="./heroModel.ts" />
var rpg;
(function (rpg) {
    var models;
    (function (models) {
        var CreatureModel = (function (_super) {
            __extends(CreatureModel, _super);
            function CreatureModel() {
                _super.apply(this, arguments);
            }
            CreatureModel.prototype.defaults = function () {
                return _.extend(_super.prototype.defaults.call(this), CreatureModel.DEFAULTS);
            };
            CreatureModel.prototype.initialize = function (attributes) {
                _super.prototype.initialize.call(this, attributes);
                // Set max values to the specified value for the creature.
                this.set({
                    maxHP: attributes.hp,
                    maxMP: attributes.mp
                });
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
        })(models.EntityModel);
        models.CreatureModel = CreatureModel;
    })(models = rpg.models || (rpg.models = {}));
})(rpg || (rpg = {}));
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
/// <reference path="./gameTileMap.ts"/>
var rpg;
(function (rpg) {
    var RPGMapView = (function (_super) {
        __extends(RPGMapView, _super);
        function RPGMapView() {
            _super.apply(this, arguments);
            this.tileMap = null;
            this._features = null;
        }
        RPGMapView.prototype.clearCache = function () {
            this._features = null;
            _super.prototype.clearCache.call(this);
        };
        /*
         * Render the tile map, and any features it has.
         */
        RPGMapView.prototype.renderFrame = function (elapsed) {
            if (!this._features) {
                this._features = this.scene.objectsByType(rpg.objects.GameFeatureObject);
                this._renderables = this._renderables.concat(this._features);
            }
            _super.prototype.renderFrame.call(this, elapsed);
            return this;
        };
        return RPGMapView;
    })(pow2.game.GameMapView);
    rpg.RPGMapView = RPGMapView;
})(rpg || (rpg = {}));
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
/// <reference path="../../../lib/pow2.d.ts"/>
var rpg;
(function (rpg) {
    var states;
    (function (states) {
        /**
         * CombatState is set when the player transitions in to a combat
         * encounter.  This can be any type of triggered encounter, from
         * the map or a feature interaction, or anything else.
         */
        var CombatState = (function (_super) {
            __extends(CombatState, _super);
            function CombatState() {
                _super.apply(this, arguments);
            }
            return CombatState;
        })(pow2.State);
        states.CombatState = CombatState;
    })(states = rpg.states || (rpg.states = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameCombatState.ts" />
var rpg;
(function (rpg) {
    var states;
    (function (states) {
        var combat;
        (function (combat) {
            // Combat Begin
            //--------------------------------------------------------------------------
            var CombatBeginTurnState = (function (_super) {
                __extends(CombatBeginTurnState, _super);
                function CombatBeginTurnState() {
                    _super.apply(this, arguments);
                    this.name = CombatBeginTurnState.NAME;
                }
                CombatBeginTurnState.prototype.enter = function (machine) {
                    _super.prototype.enter.call(this, machine);
                    this.machine = machine;
                    machine.currentDone = false;
                    machine.current.scale = 1.25;
                    this.current = machine.current;
                    if (machine.current && machine.isFriendlyTurn()) {
                        machine.focus = machine.current;
                    }
                    machine.trigger("combat:beginTurn", machine.current);
                    var choice = null;
                    if (machine.isFriendlyTurn()) {
                        console.log("TURN: " + machine.current.model.get('name'));
                        choice = machine.playerChoices[machine.current._uid];
                    }
                    else {
                        choice = machine.current.findComponent(rpg.components.combat.actions.CombatAttackComponent);
                        // TODO: This config should not be here.   Just pick a random person to attack.
                        if (choice) {
                            choice.to = machine.getRandomPartyMember();
                            choice.from = machine.current;
                        }
                    }
                    if (!choice) {
                        throw new Error("Invalid Combat Action Choice. This should not happen.");
                    }
                    if (choice.to && choice.to.isDefeated()) {
                        choice.to = machine.getRandomEnemy();
                    }
                    _.defer(function () {
                        choice.act(function (act, error) {
                            if (error) {
                                console.error(error);
                            }
                        });
                    });
                };
                CombatBeginTurnState.prototype.exit = function (machine) {
                    this.current.scale = 1;
                    _super.prototype.exit.call(this, machine);
                };
                CombatBeginTurnState.NAME = "Combat Begin Turn";
                return CombatBeginTurnState;
            })(states.CombatState);
            combat.CombatBeginTurnState = CombatBeginTurnState;
        })(combat = states.combat || (states.combat = {}));
    })(states = rpg.states || (rpg.states = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../objects/gameEntityObject.ts" />
var rpg;
(function (rpg) {
    var states;
    (function (states) {
        // Combat State Machine
        //--------------------------------------------------------------------------
        var CombatStateMachine = (function (_super) {
            __extends(CombatStateMachine, _super);
            function CombatStateMachine(parent) {
                _super.call(this);
                this.defaultState = rpg.states.combat.CombatStartState.NAME;
                this.states = [
                    new rpg.states.combat.CombatStartState(),
                    new rpg.states.combat.CombatVictoryState(),
                    new rpg.states.combat.CombatDefeatState(),
                    new rpg.states.combat.CombatBeginTurnState(),
                    new rpg.states.combat.CombatChooseActionState(),
                    new rpg.states.combat.CombatEndTurnState(),
                    new rpg.states.combat.CombatEscapeState()
                ];
                this.party = [];
                this.enemies = [];
                this.turnList = [];
                this.playerChoices = {};
                this.currentDone = false;
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
        states.CombatStateMachine = CombatStateMachine;
        // Combat Lifetime State Machine
        //--------------------------------------------------------------------------
        /**
         * Construct a combat scene with appropriate GameEntityObjects for the players
         * and enemies.
         */
        var GameCombatState = (function (_super) {
            __extends(GameCombatState, _super);
            function GameCombatState() {
                var _this = this;
                _super.call(this);
                this.name = GameCombatState.NAME;
                this.machine = null;
                this.parent = null;
                this.finished = false; // Trigger state to exit when true.
                rpg.GameWorld.get().loader.load(pow2.GAME_ROOT + 'games/rpg/entities/combat.powEntities', function (factory) {
                    _this.factory = factory;
                });
                rpg.models.GameStateModel.getDataSource(function (spreadsheet) {
                    _this.spreadsheet = spreadsheet;
                });
            }
            GameCombatState.prototype.enter = function (machine) {
                var _this = this;
                _super.prototype.enter.call(this, machine);
                this.parent = machine;
                this.machine = new CombatStateMachine(machine);
                var combatScene = machine.world.combatScene = new pow2.scene.Scene();
                machine.world.mark(combatScene);
                if (!this.factory || !this.spreadsheet) {
                    throw new Error("Invalid combat entity container or game data spreadsheet");
                }
                // Build party
                _.each(machine.model.party, function (hero, index) {
                    var heroEntity = _this.factory.createObject('CombatPlayer', {
                        model: hero,
                        combat: _this
                    });
                    if (!heroEntity) {
                        throw new Error("Entity failed to validate with given inputs");
                    }
                    if (!heroEntity.isDefeated()) {
                        heroEntity.icon = hero.get('icon');
                        _this.machine.party.push(heroEntity);
                        combatScene.addObject(heroEntity);
                    }
                });
                var mapUrl = pow2.getMapUrl('combat');
                machine.world.loader.load(mapUrl, function (map) {
                    _this.tileMap = _this.factory.createObject('GameCombatMap', {
                        resource: map
                    });
                    // Hide all layers that don't correspond to the current combat zone
                    var zone = machine.encounterInfo;
                    var visibleZone = zone.target || zone.map;
                    _.each(_this.tileMap.getLayers(), function (l) {
                        l.visible = (l.name === visibleZone);
                    });
                    _this.tileMap.dirtyLayers = true;
                    combatScene.addObject(_this.tileMap);
                    // Position Party/Enemies
                    // Get enemies data from spreadsheet
                    var enemyList = _this.spreadsheet.getSheetData("enemies");
                    var enemiesLength = machine.encounter.enemies.length;
                    for (var i = 0; i < enemiesLength; i++) {
                        var tpl = _.where(enemyList, { id: machine.encounter.enemies[i] });
                        if (tpl.length === 0) {
                            continue;
                        }
                        var nmeModel = new rpg.models.CreatureModel(tpl[0]);
                        var nme = _this.factory.createObject('CombatEnemy', {
                            model: nmeModel,
                            combat: _this,
                            sprite: {
                                name: "enemy",
                                icon: nmeModel.get('icon')
                            }
                        });
                        if (!nme) {
                            throw new Error("Entity failed to validate with given inputs");
                        }
                        combatScene.addObject(nme);
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
            };
            GameCombatState.prototype.exit = function (machine) {
                machine.trigger('combat:end', this);
                var world = this.parent.world;
                if (world && world.combatScene) {
                    world.combatScene.destroy();
                    world.combatScene = null;
                }
                this.tileMap.destroy();
                this.finished = false;
                this.machine = null;
                this.parent = null;
            };
            GameCombatState.NAME = "combat";
            return GameCombatState;
        })(pow2.State);
        states.GameCombatState = GameCombatState;
    })(states = rpg.states || (rpg.states = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameCombatStateMachine.ts" />
var rpg;
(function (rpg) {
    var states;
    (function (states) {
        var combat;
        (function (combat) {
            /**
             * Choose actions for all characters in the party.
             */
            var CombatChooseActionState = (function (_super) {
                __extends(CombatChooseActionState, _super);
                function CombatChooseActionState() {
                    _super.apply(this, arguments);
                    this.name = CombatChooseActionState.NAME;
                    this.pending = [];
                }
                CombatChooseActionState.prototype.enter = function (machine) {
                    var _this = this;
                    _super.prototype.enter.call(this, machine);
                    this.pending = machine.getLiveParty();
                    machine.playerChoices = {};
                    // Trigger an event with a list of GameEntityObject party members to
                    // choose an action for.   Provide a callback function that may be
                    // invoked while handling the event to trigger status on the choosing
                    // of moves.  Once data.choose(g,a) has been called for all party members
                    // the state will transition to begin execution of player and enemy turns.
                    machine.trigger("combat:chooseMoves", {
                        choose: function (action) {
                            machine.playerChoices[action.from._uid] = action;
                            _this.pending = _.filter(_this.pending, function (p) {
                                return action.from._uid !== p._uid;
                            });
                            console.log(action.from.model.get('name') + " chose " + action.getActionName());
                            if (_this.pending.length === 0) {
                                machine.setCurrentState(combat.CombatBeginTurnState.NAME);
                            }
                        },
                        players: this.pending,
                        enemies: machine.getLiveEnemies()
                    });
                };
                CombatChooseActionState.NAME = "Combat Choose Actions";
                return CombatChooseActionState;
            })(states.CombatState);
            combat.CombatChooseActionState = CombatChooseActionState;
        })(combat = states.combat || (states.combat = {}));
    })(states = rpg.states || (rpg.states = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameCombatStateMachine.ts" />
var rpg;
(function (rpg) {
    var states;
    (function (states) {
        var combat;
        (function (combat) {
            var CombatDefeatState = (function (_super) {
                __extends(CombatDefeatState, _super);
                function CombatDefeatState() {
                    _super.apply(this, arguments);
                    this.name = CombatDefeatState.NAME;
                }
                CombatDefeatState.prototype.enter = function (machine) {
                    _super.prototype.enter.call(this, machine);
                    var data = {
                        enemies: machine.enemies,
                        party: machine.party
                    };
                    machine.notify("combat:defeat", data, function () {
                        machine.parent.world.reportEncounterResult(false);
                        machine.parent.setCurrentState(states.GameMapState.NAME);
                    });
                };
                CombatDefeatState.NAME = "Combat Defeat";
                return CombatDefeatState;
            })(states.CombatState);
            combat.CombatDefeatState = CombatDefeatState;
        })(combat = states.combat || (states.combat = {}));
    })(states = rpg.states || (rpg.states = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameCombatStateMachine.ts" />
var rpg;
(function (rpg) {
    var states;
    (function (states) {
        var combat;
        (function (combat) {
            var CombatEndTurnState = (function (_super) {
                __extends(CombatEndTurnState, _super);
                function CombatEndTurnState() {
                    _super.apply(this, arguments);
                    this.name = CombatEndTurnState.NAME;
                }
                CombatEndTurnState.prototype.enter = function (machine) {
                    _super.prototype.enter.call(this, machine);
                    machine.current = null;
                    // Find the next turn.
                    while (machine.turnList.length > 0 && !machine.current) {
                        machine.current = machine.turnList.shift();
                        // Strip out defeated players.
                        if (machine.current && machine.current.isDefeated()) {
                            machine.current = null;
                        }
                    }
                    var targetState = machine.current ? combat.CombatBeginTurnState.NAME : combat.CombatStartState.NAME;
                    if (machine.partyDefeated()) {
                        targetState = combat.CombatDefeatState.NAME;
                    }
                    else if (machine.enemiesDefeated()) {
                        targetState = combat.CombatVictoryState.NAME;
                    }
                    if (!targetState) {
                        throw new Error("Invalid transition from end turn");
                    }
                    machine.setCurrentState(targetState);
                };
                CombatEndTurnState.NAME = "Combat End Turn";
                return CombatEndTurnState;
            })(states.CombatState);
            combat.CombatEndTurnState = CombatEndTurnState;
        })(combat = states.combat || (states.combat = {}));
    })(states = rpg.states || (rpg.states = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameCombatStateMachine.ts" />
var rpg;
(function (rpg) {
    var states;
    (function (states) {
        var combat;
        (function (combat) {
            var CombatEscapeState = (function (_super) {
                __extends(CombatEscapeState, _super);
                function CombatEscapeState() {
                    _super.apply(this, arguments);
                    this.name = CombatEscapeState.NAME;
                }
                CombatEscapeState.prototype.enter = function (machine) {
                    _super.prototype.enter.call(this, machine);
                    machine.notify("combat:escape", {
                        player: machine.current
                    }, function () {
                        machine.parent.world.reportEncounterResult(false);
                        machine.parent.setCurrentState(states.GameMapState.NAME);
                    });
                };
                CombatEscapeState.NAME = "Combat Escaped";
                return CombatEscapeState;
            })(states.CombatState);
            combat.CombatEscapeState = CombatEscapeState;
        })(combat = states.combat || (states.combat = {}));
    })(states = rpg.states || (rpg.states = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameCombatStateMachine.ts" />
var rpg;
(function (rpg) {
    var states;
    (function (states) {
        var combat;
        (function (combat) {
            // Combat Begin
            //--------------------------------------------------------------------------
            var CombatStartState = (function (_super) {
                __extends(CombatStartState, _super);
                function CombatStartState() {
                    _super.apply(this, arguments);
                    this.name = CombatStartState.NAME;
                }
                CombatStartState.prototype.enter = function (machine) {
                    _super.prototype.enter.call(this, machine);
                    machine.turnList = _.shuffle(_.union(machine.getLiveParty(), machine.getLiveEnemies()));
                    machine.current = machine.turnList.shift();
                    machine.currentDone = true;
                    machine.setCurrentState(combat.CombatChooseActionState.NAME);
                };
                CombatStartState.NAME = "Combat Started";
                return CombatStartState;
            })(states.CombatState);
            combat.CombatStartState = CombatStartState;
        })(combat = states.combat || (states.combat = {}));
    })(states = rpg.states || (rpg.states = {}));
})(rpg || (rpg = {}));
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
/// <reference path="../gameCombatStateMachine.ts" />
var rpg;
(function (rpg) {
    var states;
    (function (states) {
        var combat;
        (function (combat) {
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
                    machine.notify("combat:victory", summary, function () {
                        machine.parent.world.reportEncounterResult(true);
                        machine.parent.setCurrentState(states.GameMapState.NAME);
                    });
                };
                CombatVictoryState.NAME = "Combat Victory";
                return CombatVictoryState;
            })(states.CombatState);
            combat.CombatVictoryState = CombatVictoryState;
        })(combat = states.combat || (states.combat = {}));
    })(states = rpg.states || (rpg.states = {}));
})(rpg || (rpg = {}));
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
/// <reference path="./gameCombatStateMachine.ts"/>
var rpg;
(function (rpg) {
    var states;
    (function (states) {
        var GameDefaultState = (function (_super) {
            __extends(GameDefaultState, _super);
            function GameDefaultState() {
                _super.apply(this, arguments);
                this.name = GameDefaultState.NAME;
            }
            GameDefaultState.NAME = "default";
            return GameDefaultState;
        })(pow2.State);
        states.GameDefaultState = GameDefaultState;
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
                    new states.GameMapState(),
                    new states.GameCombatState()
                ];
            }
            GameStateMachine.prototype.onAddToWorld = function (world) {
                _super.prototype.onAddToWorld.call(this, world);
                rpg.models.GameStateModel.getDataSource();
                this.model = world.model || new rpg.models.GameStateModel();
            };
            GameStateMachine.prototype.setCurrentState = function (newState) {
                if (this.world && this.world.scene) {
                    var scene = this.world.scene;
                    this.player = scene.objectByComponent(pow2.scene.components.PlayerComponent);
                }
                return _super.prototype.setCurrentState.call(this, newState);
            };
            return GameStateMachine;
        })(pow2.StateMachine);
        states.GameStateMachine = GameStateMachine;
    })(states = rpg.states || (rpg.states = {}));
})(rpg || (rpg = {}));
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
/// <reference path="gameStateMachine.ts" />
/// <reference path="./gameCombatState.ts" />
var rpg;
(function (rpg) {
    var states;
    (function (states) {
        var GameMapState = (function (_super) {
            __extends(GameMapState, _super);
            function GameMapState() {
                _super.apply(this, arguments);
                this.name = GameMapState.NAME;
                this.mapPoint = null;
                this.map = null;
            }
            GameMapState.prototype.enter = function (machine) {
                _super.prototype.enter.call(this, machine);
                if (machine.player && this.mapPoint) {
                    machine.player.setPoint(this.mapPoint);
                    this.mapPoint = null;
                }
                console.log("MAPPPPPPP");
            };
            GameMapState.prototype.exit = function (machine) {
                if (machine.player) {
                    this.mapPoint = machine.player.point.clone();
                }
            };
            GameMapState.NAME = "map";
            return GameMapState;
        })(pow2.State);
        states.GameMapState = GameMapState;
    })(states = rpg.states || (rpg.states = {}));
})(rpg || (rpg = {}));
//# sourceMappingURL=pow2.rpg.js.map