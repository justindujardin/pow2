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

module dorkapon {


  export class DorkaponMapView extends pow2.game.GameMapView {

    world:dorkapon.DorkaponGameWorld;
    tileMap:DorkaponTileMap;

    targetFill:string = "transparent";
    targetStroke:string = "white";
    targetStrokeWidth:number = 2;

    stateMachine:DorkaponMapStateMachine = null;

    processCamera() {
      if (this.stateMachine && this.stateMachine.currentPlayer) {
        var camera = <pow2.scene.components.CameraComponent>
            this.stateMachine.currentPlayer.findComponent(pow2.scene.components.CameraComponent);
        if (camera) {
          camera.process(this);
        }
      }
    }

    mouseClick(e:any) {
      if (this.stateMachine && this.stateMachine.currentPlayer) {
        var pathComponent = <dorkapon.components.PlayerPathComponent>this.stateMachine.currentPlayer.findComponent(dorkapon.components.PlayerPathComponent);
        var playerComponent = <pow2.scene.components.PlayerComponent>this.stateMachine.currentPlayer.findComponent(pow2.scene.components.PlayerComponent);
        if (pathComponent && playerComponent) {
          pow2.Input.mouseOnView(e.originalEvent, this.mouse.view, this.mouse);
          var nodes:INodeTile[] = pathComponent.tileMap.getNodes();
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

    }

    /*
     * Render the combat render objects.
     */
    renderFrame(elapsed:number) {
      super.renderFrame(elapsed);
      var players = this.scene.objectsByComponent(pow2.game.components.PlayerCombatRenderComponent);
      _.each(players, (player) => {
        this.objectRenderer.render(player, player, this);
      });
      return this;
    }

  }
}
