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

module dorkapon.controllers {
  export class MapHudController {
    static $inject:string[] = [
      '$scope',
      '$dorkapon',
      '$mdDialog'
    ];

    constructor(public $scope:any,
                public $dorkapon:services.DorkaponService,
                public $mdDialog:any) {
      var changeHandler:any = () => {
        this.$scope.$$phase || this.$scope.$digest();
      };
      $dorkapon.machine.on(pow2.StateMachine.Events.ENTER, (newState:pow2.IState)=> {
        if (newState.name === states.AppMapState.NAME) {
          var mapState:states.AppMapState = <states.AppMapState>newState;
          mapState.machine.on(states.DorkaponPlayerTurn.EVENT, (e:states.IPlayerTurnEvent)=> {
            this.$scope.$apply(()=> {
              this.turn = e;
            });
            e.player.model.on('change', changeHandler);
          }, this);
          mapState.machine.on(states.DorkaponPlayerTurnEnd.EVENT, (e:states.IPlayerTurnEvent)=> {
            e.player.model.off('change', changeHandler);
            this.$scope.$apply(()=> {
              this.turn = null;
            });
          }, this);
        }
      });
      $dorkapon.machine.on(pow2.StateMachine.Events.EXIT, (oldState:pow2.IState)=> {
        if (oldState.name === states.AppMapState.NAME) {
          var mapState:states.AppMapState = <states.AppMapState>oldState;
          mapState.machine.off(states.DorkaponPlayerTurn.EVENT, null, this);
          mapState.machine.off(states.DorkaponPlayerTurnEnd.EVENT, null, this);
        }
      });
      this.$scope.$on('$destroy', ()=> {
        if ($dorkapon.machine) {
          $dorkapon.machine.off(pow2.StateMachine.Events.ENTER, null, this);
          $dorkapon.machine.off(pow2.StateMachine.Events.EXIT, null, this);
        }
      });
      return this;
    }

    /**
     * The current player turn.
     */
    turn:dorkapon.states.IPlayerTurnEvent = null;

    showPlayerCard(player:objects.DorkaponEntity) {
      this.$mdDialog.show({
        controller: CharacterCardController,
        controllerAs: 'character',
        templateUrl: 'games/dorkapon/controllers/characterCard.html',
        locals: {
          model: player.model
        },
        bindToController: true
      });
    }

  }

  app.controller('MapHudController', MapHudController);
}
