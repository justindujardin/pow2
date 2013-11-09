# -----------------------------------------------------------------------------
#
# Copyright (C) 2013 by John Watkinson
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# -----------------------------------------------------------------------------

class SplashView extends TileView

  @TYPES : ["warrior", "archer", "mage"]

  index : 0
  game : null

  constructor : (gurk) ->
    super(gurk, "splashScreen")
    @name = "Splash"
    @offsetX = -Screen.HALF_UNIT
    @offsetY = -Screen.HALF_UNIT
    @index = 0
    @tileMap = new TileMap("splashScreen")
    @tileMapView = new TileMapView gurk.screen.canvas, @tileMap

  renderFrame: () -> @tileMapView.render()

  doLayout : =>
    @setButton(1, "NEW")
    if (Device.hasSavedGame())
      @setButton(3, "LOAD")
    else
      @clearButton(3)
    @setButton(7, "OPTIONS")
    # Uncomment to have a hook to validate game data
    @setButton(9, "CHECK")

  showIntro : =>
    @gurk.pushView(new AlertView(@gurk, Data.icons.party, "Welcome", "Welcome to realm of Gurk!\n\nRoll the stats for your Warrior, Archer and Mage, then lead them on to thrilling adventure!", "CREATE"))

  command : (text) =>
    switch (text)
      when "NEW"
        if (Device.hasSavedGame())
          @gurk.pushView(new ConfirmView(@gurk, Data.icons.party, "Warning!", "Creating a new game will delete your existing game. Are you sure you want to do this?", "NEW", "CANCEL"))
        else
          # @gurk.startTestGame()
          @showIntro()
      when "LOAD"
        @gurk.startSavedGame()
      when "TEST"
        @gurk.startTestGame()
      when "OPTIONS"
        @gurk.showSettings()
      when "CHECK"
        Validate.run()
      when "FLOW"
        flow = new FlowView(@gurk, Data.icons.death, "Flow View", null)
        flow.addParagraph("Berserk", "#FFF")
        flow.addParagraph("While berserk, combatant will get an extra attack (or spell cast) each turn.", "#A0A0A0")
        flow.addGap()
        flow.addParagraph("Blinded", "#FFF")
        flow.addParagraph("When blinded, combatant's chance to hit when attack will be reduced considerably.", "#A0A0A0")
        flow.addGap()
        flow.addParagraph("Rooted", "#FFF")
        flow.addParagraph("A rooted combatant cannot move, although it may still attack and cast spells.", "#A0A0A0")
        @gurk.pushView(flow)

  processResult : (result) =>
    switch (result)
      when "NEW"
        #@gurk.startTestGame()
        @showIntro()
      when "CREATE"
        #@gurk.setView(new CreateView(@gurk))
        @game = new Game()
        @gurk.pushView(new ChooseCharacterView(@gurk, SplashView.TYPES[@index], @game))
      when "NEXT"
        @index++
        if (@index == SplashView.TYPES.length)
          @gurk.startNewGame(@game)
        else
          @gurk.pushView(new ChooseCharacterView(@gurk, SplashView.TYPES[@index], @game))
