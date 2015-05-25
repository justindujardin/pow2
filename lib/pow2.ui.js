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
/// <reference path="../../types/angularjs/angular.d.ts"/>
/// <reference path="../../lib/pow2.d.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        ui.app = angular.module('pow2', [
            'ngAnimate'
        ]);
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="./../pow2.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        var directives;
        (function (directives) {
            var IconRenderController = (function () {
                function IconRenderController($compile, $scope) {
                    this.$compile = $compile;
                    this.$scope = $scope;
                    this._canvasAcquired = false;
                    this.renderer = new pow2.SpriteRender();
                    this.world = new pow2.World();
                    this.renderer = new pow2.SpriteRender();
                    this.world = pow2.getWorld(IconRenderController.WORLD_NAME);
                    if (!this.world) {
                        this.world = new pow2.World();
                        pow2.registerWorld(IconRenderController.WORLD_NAME, this.world);
                    }
                    this.world.mark(this.renderer);
                    this._renderCanvas = this.$compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="64" height="64"></canvas>')($scope)[0];
                }
                /**
                 * Returns a canvas rendering context that may be drawn to.  A corresponding
                 * call to releaseRenderContext will return the drawn content of the context.
                 */
                IconRenderController.prototype.getRenderContext = function (width, height) {
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
                IconRenderController.prototype.releaseRenderContext = function () {
                    this._canvasAcquired = false;
                    return this._renderCanvas.toDataURL();
                };
                IconRenderController.WORLD_NAME = "icon-render-world";
                IconRenderController.$inject = [
                    '$compile',
                    '$scope'
                ];
                return IconRenderController;
            })();
            directives.IconRenderController = IconRenderController;
            ui.app.directive('iconRender', ['$compile', function ($compile) {
                    return {
                        restrict: 'A',
                        controller: IconRenderController,
                        link: function ($scope, element, attrs, controller) {
                            var width = parseInt(attrs.width || "64");
                            var height = parseInt(attrs.height || "64");
                            // A rendering canvas
                            var renderImage = $compile('<img src="" width="' + width + '"/>')($scope);
                            element.append(renderImage);
                            $scope.$watch(attrs.icon, function (icon) {
                                if (!icon) {
                                    renderImage[0].src = '/images/a/blank.gif';
                                    return;
                                }
                                controller.renderer.getSingleSprite(icon, attrs.frame || 0, function (sprite) {
                                    // Get the context for drawing
                                    var renderContext = controller.getRenderContext(width, height);
                                    renderContext.clearRect(0, 0, width, height);
                                    renderContext.drawImage(sprite, 0, 0, width, height);
                                    var data = controller.releaseRenderContext();
                                    $scope.$apply(function () {
                                        renderImage[0].src = data;
                                    });
                                });
                            });
                        }
                    };
                }]);
        })(directives = ui.directives || (ui.directives = {}));
    })(ui = pow2.ui || (pow2.ui = {}));
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
/// <reference path="../../../types/angularjs/angular.d.ts"/>
var pow2;
(function (pow2) {
    var ui;
    (function (ui) {
        var services;
        (function (services) {
            var DamageValueService = (function () {
                function DamageValueService($compile, $rootScope, $animate) {
                    this.$compile = $compile;
                    this.$rootScope = $rootScope;
                    this.$animate = $animate;
                }
                DamageValueService.prototype.applyDamage = function (to, value, view, then) {
                    var _this = this;
                    var targetPos = to.point.clone();
                    targetPos.y -= (view.camera.point.y + 1.25);
                    targetPos.x -= view.camera.point.x;
                    var screenPos = view.worldToScreen(targetPos, view.cameraScale);
                    screenPos.add(view.$el[0].offsetLeft, view.$el[0].offsetTop);
                    var damageValue = this.$compile([
                        '<span class="damage-value',
                        (value === 0 ? ' miss' : ''),
                        (value < 0 ? ' heal' : ''),
                        '" style="position:absolute;left:' + screenPos.x + 'px;top:' + screenPos.y + 'px;">',
                        Math.abs(value),
                        '</span>'
                    ].join(''))(this.$rootScope);
                    this.$rootScope.$apply(function () {
                        _this.$animate.enter(damageValue, view.$el.parent()).then(function () {
                            damageValue.remove();
                            then && then();
                        });
                    });
                };
                return DamageValueService;
            })();
            services.DamageValueService = DamageValueService;
            ui.app.factory('$damageValue', ['$compile', '$rootScope', '$animate', function ($compile, $rootScope, $animate) {
                    return new DamageValueService($compile, $rootScope, $animate);
                }]);
        })(services = ui.services || (ui.services = {}));
    })(ui = pow2.ui || (pow2.ui = {}));
})(pow2 || (pow2 = {}));
//# sourceMappingURL=pow2.ui.js.map