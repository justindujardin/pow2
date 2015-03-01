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

module dorkapon.components {

  export interface IMapNodeComponent {
    world:DorkaponGameWorld;

    /**
     * Perform any action associated with landing on this component.
     * @param object The entity that landed on the node.
     * @param then A callback to be invoked when the action is done.
     */
    doAction(object:objects.DorkaponEntity, then:()=>any);
  }

  export class MapNodeComponent extends pow2.tile.TileComponent implements IMapNodeComponent {
    public world:DorkaponGameWorld = <DorkaponGameWorld>pow2.getWorld(dorkapon.NAME);

    /**
     * Perform any action associated with landing on this component.
     * @param object The entity that landed on the node.
     * @param then A callback to be invoked when the action is done.
     */
    doAction(object:objects.DorkaponEntity, then:()=>any) {
      console.warn("Subclass should entirely implement this functionality.");
      console.warn(" - Invoking completion callback next frame.");
      _.defer(then);
    }

    entered(object:objects.DorkaponEntity):boolean {
      var turn = <PlayerTurnComponent>object.findComponent(PlayerTurnComponent);
      if (turn && turn.isCurrentTurn()) {
        if (turn.machine) {
          turn.machine.currentNode = this;
        }
        turn.decrementMove();
      }
      return super.entered(object);
    }

  }
}