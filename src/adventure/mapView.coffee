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

class MapView extends TileView

  @MAP_ICONS = {
    "shop" : [
      ['#764F00', '#FFFF48', '#764F00'],
      ['#764F00', '#000000', '#764F00'],
      ['#764F00', '#000000', '#764F00']
    ],
    "ship" : [
      [null, '#FFFFFF', null],
      ['#FFFFFF', '#FFFFFF', null],
      ['#AF7300', '#AF7300', '#AF7300']
    ],
    "temple" : [
      ['#FFFFFF', '#FF0000', '#FFFFFF'],
      ['#FF0000', '#FF0000', '#FF0000'],
      ['#FFFFFF', '#FF0000', '#FFFFFF']
    ],
  }

  @TRANSITION_ICONS = {
    "outdoor" : [
      ['#3CF000', '#3CF000', '#3CF000'],
      ['#32C800', '#32C800', '#32C800'],
      [null, '#AF7300', null]
    ],
    "dungeon" : [
      [null, '#FFFFFF', null],
      ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
      ['#FFFFFF', '#000000', '#FFFFFF']
    ],
    "up" : [
      [null, null, '#FFFFFF'],
      [null, '#FFFFFF', '#FFFFFF'],
      ['#FFFFFF', '#FFFFFF', '#FFFFFF']
    ],
    "down" : [
      ['#FFFFFF', null, null],
      ['#FFFFFF', '#FFFFFF', null],
      ['#FFFFFF', '#FFFFFF', '#FFFFFF']
    ],
    "town" : [
      ['#FFFFFF', null, '#FFFFFF'],
      ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
      ['#FFFFFF', '#AF7300', '#FFFFFF']
    ]
  }

  @FEATURE_TYPES = [
    "block",
    "barrier",
    "encounter",
    "goal",
    "alert",
    "dispatch",
    "transition",
    "shop",
    "temple",
    "ship",
    "sign",
    "override"
  ]

  game : null
  shadows : null
  test : null
  mapMode : false
  encounter : null
  upgrades : null
  shadowOverlay : null

  constructor: (gurk) ->
    @tileMap = new TileMap(gurk.game.map)
    super(gurk, gurk.game.map)
    @name = "MapView"
    @offsetX = -Screen.HALF_UNIT
    @offsetY = -Screen.HALF_UNIT
    @game = gurk.game
    @posX = @game.x
    @posY = @game.y
    @mapMode = false
    @shadowOverlay = Preloader.getImage("images/shadow.png")
    @setButton(1, "HEROES")
    @setButton(9, "MAP")
    @setButton(3, "SAVE")
    @setButton(7, "QUESTS")
    Screen.WIN_SIZE = @camera.extent.x
    Screen.CENTER_OFFSET = Math.floor(@camera.extent.x / 2)
    @shadows = Util.create2DArray(Screen.WIN_SIZE, Screen.WIN_SIZE)
    for y in [-1 .. 1]
      for x in [-1 .. 1]
        @shadows[y + Screen.CENTER_OFFSET][x + Screen.CENTER_OFFSET] = false
    @move(0, 0)

  featureVisible: (feature) =>
    if @tileMap.map.dark
      x = feature.x - @camera.point.x
      y = feature.y - @camera.point.y
      return false if x < 0 or y < 0 or x > @camera.extent.x or y > @camera.extent.y
      return false if @shadows[y][x] == true
    if @game.getFeatures(feature.x, feature.y)
      return @getTopFeature(feature.x, feature.y)
    false

  tileVisible: (x,y) ->
    return true if not @map.dark
    x -= @camera.point.x
    y -= @camera.point.y
    return false if y >= @shadows.length or @shadows[y][x] == true
    true

  setRenderState: () ->
    @camera.setCenter @posX, @posY
    super()

  renderFrame: () ->
    super()
    partyIcon = if @game.aboard then Data.icons.ship else Data.icons.party
    @drawTile(partyIcon, @camera.getCenter())
    @fillImage(@shadowOverlay) if @tileMap.map.dark
    @drawBanner()
    @drawTopBanner()
    @renderMiniMap()

  renderFeatures:(clipRect) ->
    for x in [clipRect.point.x ... clipRect.getRight()]
      for y in [clipRect.point.y ... clipRect.getBottom()]
        continue if not @game.getFeatures(x,y)
        feature = @getTopFeature(x, y)
        @drawTile(feature.icon, x, y) if feature and feature.icon
    @

  # TODO: Fix this up.
  renderMiniMap: =>
    return if not @mapMode
    bounds = new Rect(@camera.point.x * SceneView.UNIT * @cameraScale - 128,5,128,128)
    sx = bounds.point.x
    sy = bounds.point.y
    @context.globalAlpha = 0.5
    @context.fillRect("#000", sx - 3, sy - 3, @width + 6, @height + 6)
    @context.globalAlpha = 1
    @context.fillRect("#aaa", sx - 1, sy - 1, @width + 2, @height + 2)
    for y in [0 ... @height]
      for x in [0 ... @width]
        if (@game.wasVisited(x, y))
          color = @getTerrain(x, y).color
        else
          color = "#000"
        @drawPixel(color, x + sx, y + sy)
    # Next: features
    for y in [0 ... @height]
      for x in [0 ... @width]
        if (@game.wasVisited(x, y))
          feature = @getTopFeature(x, y)
          continue if not feature
          icon = null
          switch (feature.type)
            when "shop", "ship", "temple"
              icon = MapView.MAP_ICONS[feature.type]
            when "transition"
              icon = MapView.TRANSITION_ICONS[feature.transitionType]
          continue if not icon
          for yy in [0 ... 3]
            for xx in [0 ... 3]
              color = icon[yy][xx]
              if (color)
                @drawPixel(color, sx + x + xx - 1, sy + y + yy - 1)
    # Finally, the adventurers
    @drawPixel("#F00", @posX + sx - 1, @posY + sy)
    @drawPixel("#F00", @posX + sx + 1, @posY + sy)
    @drawPixel("#F00", @posX + sx, @posY + sy + 1)
    @drawPixel("#F00", @posX + sx, @posY + sy - 1)


  toggleMap : =>
    @mapMode = !@mapMode
    if (@mapMode)
      @setButton(9, "NO MAP")
    else
      @setButton(9, "MAP")
    @draw()

  command: (text) =>
    switch text
      when View.LEFT then @move(-1, 0)
      when View.UP then @move(0, -1)
      when View.RIGHT then @move(1, 0)
      when View.DOWN then @move(0, 1)
      when "MAP", "NO MAP"
        @toggleMap()
      when "HEROES"
        @gurk.pushView(new PartyView(@gurk))
      when "QUESTS"
        @gurk.pushView(new QuestView(@gurk))
      when "SAVE"
        save = JSON.stringify(@game.saveGame())
        # console.log(save)
        Device.saveGame(save)
        @gurk.pushView(new AlertView(@gurk, Data.icons.party, "Game Saved", "Your game has been saved!", null))
      else
        @processFeature(text)

  checkVisibility: (x, y) =>
    dx = x - Screen.CENTER_OFFSET
    dy = y - Screen.CENTER_OFFSET
    mapY = dy + @posY
    mapX = dx + @posX
    if (mapY >= 0 and mapY < @height and mapX >= 0 and mapX < @width)
      nextX = if dx > 0 then -1 else 1
      nextY = if dy > 0 then -1 else 1
      if (dx == 0)
        @shadows[y][x] = @shadows[nextY+y][x] or @getTerrain(mapX, nextY+mapY).opaque
      else if (dy == 0)
        @shadows[y][x] = @shadows[y][nextX+x] or @getTerrain(nextX+mapX, mapY).opaque
      else if (dx == dy or dx == -dy)
        @shadows[y][x] = @shadows[nextY+y][nextX+x] or @getTerrain(nextX+mapX, nextY+mapY).opaque
      else
        t1 = @shadows[nextY+y][x] or @getTerrain(mapX, nextY+mapY).opaque
        t2 = @shadows[y][nextX+x] or @getTerrain(nextX+mapX, mapY).opaque
        t3 = @shadows[nextY+y][nextX+x] or @getTerrain(nextX+mapX, nextY+mapY).opaque
        @shadows[y][x] = t1 and t2 and t3
    else
      @shadows[y][x] = true
    @

  computeShadows: () =>
    # Immediate surroundings are always visible
    C = Screen.CENTER_OFFSET
    # Move in a spiral pattern, inductively computing visibility
    for y in [2 .. 4]
      for x in [0 .. y]
        checkX = x + C
        checkY = y + C
        @checkVisibility(checkX, checkY)
        checkX = x + C
        checkY = -y + C
        @checkVisibility(checkX, checkY)
        if (x < y)
          checkY = x + C
          checkX = y + C
          @checkVisibility(checkX, checkY)
          checkY = x + C
          checkX = -y + C
          @checkVisibility(checkX, checkY)
        if (x > 0)
          checkX = -x + C
          checkY = y + C
          @checkVisibility(checkX, checkY)
          checkX = -x + C
          checkY = -y + C
          @checkVisibility(checkX, checkY)
          if (x < y)
            checkY = -x + C
            checkX = y + C
            @checkVisibility(checkX, checkY)
            checkY = -x + C
            checkX = -y + C
            @checkVisibility(checkX, checkY)
    false

  trackVisited : =>
    for y in [0...Screen.WIN_SIZE]
      yy = y + @posY - Screen.CENTER_OFFSET
      if (yy >= 0 and yy < @height)
        for x in [0...Screen.WIN_SIZE]
          xx = x + @posX - Screen.CENTER_OFFSET
          if (xx >= 0 and xx < @width)
            if (!@map.dark or !@shadows[y][x])
              @game.markVisited(xx, yy)

  getTerrain : (x, y) =>
    tileCharacter = @game.getTile(x, y)
    Data.tiles[tileCharacter]

  getTopFeature : (x, y) =>
    for type in MapView.FEATURE_TYPES
      feature = @game.getFeature(x, y, type)
      if (feature)
        return feature

  move : (x, y) =>
    realMove = !(x == 0 and y == 0)
    tx = @posX + x
    ty = @posY + y
    return false if tx < 0 or tx >= @width or ty < 0 or ty >= @height
    block = @game.getFeature(tx, ty, "block")
    if (block)
      return false
    barrier = @game.getFeature(tx, ty, "barrier")
    if (barrier)
      if (!!barrier.title)
        title = barrier.title
      else
        title = "Cannot Pass"
      @gurk.pushView(new AlertView(@gurk, barrier.icon, title, barrier.text, null))
      return false
    if (@getTerrain(tx, ty).passable or @getTerrain(tx, ty).shipPassable and (@game.aboard or @game.getFeature(tx, ty, "ship")))
      @clearBanner()
      if (realMove and @game.aboard and @game.getFeature(tx, ty, "ship"))
        # Move onto the next ship
        @game.disembark()
        if (@map.music)
          @gurk.playMusic(@map.music)
      @posX = tx
      @posY = ty
      if (@game.aboard and !@getTerrain(tx, ty).shipPassable)
        @game.disembark()
        if (@map.music)
          @gurk.playMusic(@map.music)
      if (realMove)
        @gurk.game.moveTo(@posX, @posY)
        @game.moveNum++
        if (@game.moveNum % 20 == 0)
          @game.regenerateParty()
      if (@map.dark)
        @computeShadows()
      @trackVisited()
      haveFeature = false
      if (!@game.aboard and @game.getFeature(tx, ty, "ship"))
        ship = @game.getFeature(tx, ty, "ship")
        if (@game.isChartered(ship.id) or !ship.charter or ship.charter == 0)
          @clearButton(5)
          @game.boardShip(@game.getFeature(tx, ty, "ship").id)
          if (@map.boatMusic)
            @gurk.playMusic(@map.boatMusic)
          else
            @gurk.playMusic(Data.boatMusic)
        else
          @setButton(5, "CHARTER")
          haveFeature = true
      if (@game.getFeatures(@posX, @posY))
        feature = @getTopFeature(@posX, @posY)
        if (feature)
          if (feature.type != "ship") # already handled
            haveFeature = true
            switch feature.type
              when "encounter"
                @encounter = @gurk.game.getEncounter(feature)
                if (@encounter.creatures.length == 0)
                  @game.setMarkers(feature.id)
                  @game.setMarkers(feature.sets)
                  gold = @encounter.gold ? 0
                  text = feature.text
                  if (gold > 0)
                    @game.gold += gold
                    text = text + "\n\nYou find #{gold} gold pieces!"
                  if (@encounter.items.length == 0)
                    @gurk.pushView(new AlertView(@gurk, feature.icon, "Treasure", text, null, feature.altIcon))
                  else
                    @gurk.pushView(new AlertView(@gurk, feature.icon, "Treasure", text, "treasure", feature.altIcon))
                else
                  @gurk.playCombatMusic()
                  @gurk.pushView(new AlertView(@gurk, feature.icon, "Encounter", feature.text, "combat"))
                return null
              when "alert"
                if (realMove)
                  @gurk.game.setMarkers(feature.sets)
                  @gurk.pushView(new AlertView(@gurk, feature.icon, feature.title, feature.text, "alert", feature.altIcon))
                  return null
              when "goal"
                @gurk.game.setMarkers(feature.sets)
                @gurk.pushView(new AlertView(@gurk, feature.icon, feature.title, feature.text, "goal", feature.altIcon))
                return null
              when "ship"
                # Already handled, no-op
              else
                @addButtonForFeature(feature, realMove)
      if (!haveFeature)
        @clearButton(5)
        # Make sure it's a "real" move
        if (realMove)
          if (@game.checkForRandomEncounter())
            @encounter = @game.createEncounter()
            if (@encounter.creatures.length > 0)
              if (@encounter.ambushed)
                text = "Your adventurers have been ambushed!"
              else
                text = "Your adventurers have been attacked!"
              @gurk.playCombatMusic()
              @gurk.pushView(new AlertView(@gurk, Data.icons.combat, "Encounter", text, "combat"))
              return null

  setMap : (mapName, x, y) =>
    super(mapName, x, y)
    @tileMap.setMap(mapName)
    if (@map.music)
      @gurk.playMusic(@map.music)

  addButtonForFeature: (feature, realMove) =>
    @clearButton(5)
    switch feature.type
      when "sign"
        if (feature.text)
          command = feature.action ? "LOOK"
          @setButton(5, command)
      when "transition"
        if (realMove)
          name = Data.maps[feature.target].name
          @setBanner(name)
        @setButton(5, "GO")
      when "shop"
        @setBanner(feature.name)
        @setButton(5, "SHOP")
      when "temple"
        @setButton(5, "HEAL")
      when "dispatch"
        @setButton(5, feature.action)

  processFeature: (command) =>
    feature = @getTopFeature(@posX, @posY)
    switch feature.type
      when "sign"
        @gurk.game.setMarkers(feature.sets)
        @gurk.pushView(new AlertView(@gurk, feature.icon, feature.title ? "Sign", feature.text, "sign", feature.altIcon))
      when "transition"
        @gurk.pushView(new ConfirmView(@gurk, feature.icon, "Go", feature.text, "transition", null))
      when "shop"
        @gurk.pushView(new ItemView(@gurk, null, ItemView.ACTION_BUY, feature))
      when "temple"
        if (feature.cost > @game.gold)
          @gurk.pushView(new AlertView(@gurk, feature.icon, "Cannot Pay", "The priests of the temple demand a tribute of #{feature.cost} gold pieces, but you cannot pay it!", null))
        else
          @gurk.pushView(new ConfirmView(@gurk, feature.icon, "Tribute", "To heal the adventurers, the priests require a tribute of #{feature.cost} gold pieces, will you pay it?", "heal", null))
      when "ship"
        if (feature.charter > @game.gold)
          @gurk.pushView(new AlertView(@gurk, feature.icon, "Cannot Pay", "The crew demand #{feature.charter} gold pieces to charter this vessel, but you cannot pay it!", null))
        else
          @gurk.pushView(new ConfirmView(@gurk, feature.icon, "Charter Ship", "Will you pay the crew #{feature.charter} gold pieces to charter this ship?", "charter", null))
      when "dispatch"
        @gurk.pushView(new ConfirmView(@gurk, feature.icon, feature.title, feature.text, "dispatch", null, feature.altIcon))

  processResult: (result) =>
    switch result
      when "goal"
        @move(0, 0)
        @draw()
      when "alert", "sign"
        @move(0, 0)
        @draw()
      when "transition"
        feature = @getTopFeature(@posX, @posY)
        @game.transitionTo(feature.target, feature.targetX, feature.targetY)
        @setMap(feature.target, feature.targetX, feature.targetY)
        # Process it as a move
        @move(0, 0)
        if (@mapMode)
          @toggleMap()
        @draw()
      when "victory"
        if (@game.aboard)
          if (@map.boatMusic)
            @gurk.playMusic(@map.boatMusic)
          else
            @gurk.playMusic(Data.boatMusic)
        else if (@map.music)
          @gurk.playMusic(@map.music)
        feature = @game.getFeature(@posX, @posY, "encounter")
        if (feature)
          @gurk.game.setMarkers(feature.id)
          @gurk.game.setMarkers(feature.sets)
        @move(0, 0) # Compute shadows, set visited, etc.
        treasure = @encounter.items
        gold = @encounter.gold
        @game.gold += gold
        action = null
        if (treasure.length > 0)
          action = "treasure"
          icon = Data.icons.treasure
          if (gold > 0)
            text = "You find #{gold} gold pieces and treasure amongst your defeated foes!"
          else
            text = "You find treasure amongst your defeated your foes!"
        else
          if (gold > 0)
            icon = Data.icons.gold
            text = "You find #{gold} gold pieces amongst your defeated foes!"
          else
            icon = Data.icons.party
            text = "You have defeated your foes!"
        @upgrades = @game.giveExperience(@encounter.creatures)
        if (@upgrades.length > 0)
          text += "\n"
          for upgrade in @upgrades
            text += "\n#{upgrade.player.character.name} gained a level!"
          action = "levelup"
        @gurk.pushView(new AlertView(@gurk, icon, "Victory", text, action))
      when "levelup"
        if (@encounter.items.length > 0)
          nextAction = "treasure"
        else
          nextAction = null
        @gurk.pushView(new LevelUpView(@gurk, @upgrades, nextAction))
      when "treasure"
        treasure = @encounter.items
        @gurk.pushView(new ItemView(@gurk, null, "GIVE", treasure))
      when "combat"
        combatView = new CombatView(@gurk, @gurk.game.getCombatMap(), @gurk.imageProcessor, @encounter.creatures, @encounter.ambushed)
        @gurk.pushView(combatView)
      when "heal"
        temple = @getTopFeature(@posX, @posY)
        @game.gold -= temple.cost
        @game.healParty()
      when "charter"
        ship = @getTopFeature(@posX, @posY)
        @game.gold -= ship.charter
        @game.boardShip(ship.id)
        if (@map.boatMusic)
          @gurk.playMusic(@map.boatMusic)
        else
          @gurk.playMusic(Data.boatMusic)
        @clearButton(5)
      when "dispatch"
        feature = @getTopFeature(@posX, @posY)
        @gurk.game.setMarkers(feature.sets)
      when "defeat"
        @game.death()
        start = @game.getStart()
        @map = start.map
        @x = start.x
        @y = start.y
        @game.transitionTo(start.map, start.x, start.y)
        @setMap(start.map, start.x, start.y)
        @move(0, 0)
        @gurk.pushView(new AlertView(@gurk, Data.icons.death, "Defeat", "You have been defeated! As blackness closes in, a strange feeling comes over the adventurers...", null))
      when "debug1"
        @game.players[0].takeDamage(3)
        image = @gurk.imageProcessor.rotate(Data.icons.death, ImageProcessor.LEFT)
        @fly(Data.icons.death, 1, 7, 7, 1, 75, @animDone, image)
