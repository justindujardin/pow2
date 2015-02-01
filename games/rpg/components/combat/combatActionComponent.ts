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

module pow2 {

   export class CombatActionComponent extends SceneComponent implements IPlayerAction {
      name:string = "default";
      from:pow2.GameEntityObject = null;
      to:pow2.GameEntityObject = null;
      spell:any = null;//TODO: spell type

      constructor(public combat:pow2.GameCombatState){
         super();
      }
      getActionName():string {
         return this.name;
      }
      isCurrentTurn():boolean {
         return this.combat.machine.current === this.from;
      }
      canTarget():boolean {
         return true;
      }
      canTargetMultiple():boolean {
         return this.canTarget();
      }

      /**
       * Method used to determine if this action is usable by a given
       * [GameEntityObject].  This may be subclassed in an action to
       * select the types of entities that may use the action.
       * @param entity The object that would use the action.
       * @returns {boolean} True if the entity may use this action.
       */
      canBeUsedBy(entity:GameEntityObject){
         return entity.model && entity.model instanceof pow2.EntityModel;
      }

      /**
       * Base class invokes the then callback and returns true.
       * @returns {boolean} Whether the act was successful or not.
       */
      act(then?:IPlayerActionCallback):boolean {
         then && then(this,null);
         return true;
      }

      /**
       * The action has been selected for the current turn.
       */
      select() {
      }
   }
}