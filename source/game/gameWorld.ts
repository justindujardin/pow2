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

/// <reference path="../../lib/pow2.d.ts" />
/// <reference path="./gameStateMachine.ts" />

module pow2 {
   export class GameWorld extends World {
      state:GameStateMachine;
      // TODO: Fix game loading and multiple scenes/maps state.
      // Put the game model here, and use the pow2.getWorld() api
      // for access to the game model.   Reset state methods should
      // exist there, and angular UI should listen in.
      model:GameStateModel;
   }
}