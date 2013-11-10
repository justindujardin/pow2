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

class SettingsView extends SelectView

  constructor : (gurk) ->
    super(gurk, "TOGGLE", "DONE")

  doLayout : =>
    @clear()
    y = 3
    @addLabelCentered("Settings", "#FFF", 0, y, 128, Screen.FONT.fontHeight)
    y += 12
    music = if @gurk.getMusicSetting() then "ON" else "OFF"
    combatMusic = if @gurk.getCombatMusicSetting() then "ON" else "OFF"
    sound = if @gurk.getSoundSetting() then "ON" else "OFF"
    fast = if @gurk.getFastSetting() then "ON" else "OFF"
    @addOption("Music is #{music}", "#FFF", 8, y)
    y += 8
    @addOption("Combat music is #{combatMusic}", "#FFF", 8, y)
    y += 8
    @addOption("Sound FX are #{sound}", "#FFF", 8, y)
    y += 8
    @addOption("Fast combat is #{fast}", "#FFF", 8, y)
    @start()

  itemSelected: (index, item) =>
    if (index == 0)
      @gurk.setMusicSetting(!@gurk.getMusicSetting())
    else if (index == 1)
      @gurk.setCombatMusicSetting(!@gurk.getCombatMusicSetting())
    else if (index == 2)
      @gurk.setSoundSetting(!@gurk.getSoundSetting())
    else if (index == 3)
      @gurk.setFastSetting(!@gurk.getFastSetting())
    @doLayout()
    @draw()
