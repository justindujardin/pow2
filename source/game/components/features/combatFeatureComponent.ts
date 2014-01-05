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

/// <reference path="./../gamePartyComponent.ts" />
/// <reference path="../../gameComponent.ts" />

module pow2 {
   export class CombatFeatureComponent extends GameComponent {
      party:GamePartyComponent;
      enter(object:GameFeatureObject):boolean {
         this.party = <GamePartyComponent>object.findComponent(GamePartyComponent);
         return !!this.party;
      }
      reset() {
         if(this.isEntered){
            this.party.host.enabled = true;
            this.party.host.removeComponent(this);
         }
      }
      entered(object:GameFeatureObject):boolean {
         if(!super.entered(object)){
            return false;
         }
         this.party.host.enabled = false;
         _.delay(()=>{
            this.host.destroy();
         },500);
         return true;
      }
      exited(object:GameFeatureObject):boolean {
         this.reset();
         return super.exited(object);
      }
      disconnectComponent():boolean{
         this.reset();
         return super.disconnectComponent();
      }
  }
}