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

module pow2.ui.services {
  export class DamageValueService {

    constructor(public $compile:ng.ICompileService,
                public $rootScope:any,
                public $animate:any) {
    }

    applyDamage(to:pow2.scene.SceneObject, value:number, view:pow2.scene.SceneView, then?:()=>void) {
      var targetPos:pow2.Point = to.point.clone();
      targetPos.y -= (view.camera.point.y + 1.25);
      targetPos.x -= view.camera.point.x;
      var screenPos:pow2.Point = view.worldToScreen(targetPos, view.cameraScale);
      screenPos.add(view.$el[0].offsetLeft, view.$el[0].offsetTop);
      var damageValue = this.$compile([
        '<span class="damage-value',
        (value === 0 ? ' miss' : ''),
        (value < 0 ? ' heal' : ''),
        '" style="position:absolute;left:' + screenPos.x + 'px;top:' + screenPos.y + 'px;">',
        Math.abs(value),
        '</span>'
      ].join(''))(this.$rootScope);
      this.$rootScope.$apply(() => {
        this.$animate.enter(damageValue, view.$el.parent()).then(() => {
          damageValue.remove();
          then && then();
        });
      });

    }
  }
  app.factory('$damageValue', ['$compile', '$rootScope', '$animate', ($compile, $rootScope, $animate) => {
    return new DamageValueService($compile, $rootScope, $animate);
  }]);
}