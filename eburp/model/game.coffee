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

class Game

  @MAX_ENCOUNTER_CREATURES = 18
  @NUM_SHOP_ITEMS = 15

  players : null
  bag : null
  gold : 0
  map : null
  x : 0
  y : 0
  itemId : 0
  moveNum : 0

  # Record of what squares have been visited
  visited : null

  # Transient - current map features
  features : null

  # Map of ship ID to current location (ship will not be here if not yet chartered)
  ships : null

  # Map of game variables to 'true' if completed.
  markers : null

  # Map of shop key to items (transient)
  shops : null

  # If currently in a ship, this will be its ID
  aboard : null

  constructor : ->
    @players = new Array()
    @map = eburp.data.start[0].map
    @x = eburp.data.start[0].x
    @y = eburp.data.start[0].y
    @gold = eburp.data.start[0].gold
    @ships = {}
    @markers = {}
    @shops = {}
    @visited = {}
    @moveNum = 0
    @buildFeatures()

  saveGame : ->
    copy = JSON.parse(JSON.stringify(this))
    delete copy.features
    for player in copy.players
      for item in player.items
        item.template = item.template.name
      for k,item of player.equipment
        if (item)
          player.equipment[k] = item.id
    if (copy.bag)
      for item in copy.bag.items
        item.template = item.template.name
    copy

  loadGame : (json) ->
    saved = JSON.parse(json)
    @players = []
    for obj in saved.players
      player = new Player(obj.character)
      player.fromData(obj)
      @players.push(player)
    @map = saved.map
    @x = saved.x
    @y = saved.y
    @gold = saved.gold
    @ships = saved.ships
    @markers = saved.markers
    @visited = saved.visited
    @moveNum = saved.moveNum
    @itemId = saved.itemId
    if (saved.bag)
      @bag = new Player(saved.bag.character)
      @bag.fromData(saved.bag)
    @buildFeatures()
    true

  createBag : ->
    if (!@bag)
      @bag = new Player(Library.getCharacterByName("Bag of Holding"))

  death : ->
    @ships = {}
    for player in @players
      player.healCompletely()
    @gold = 0
    @buildFeatures()

  getStart : ->
    best = eburp.data.start[0]
    for start in eburp.data.start
      if (start.after and @hasMarker(start.after))
        best = start
    best

  @getKey : (x, y) ->
    "" + x + "_" + y

  setMarkers : (listOrSingle) ->
    return false if not listOrSingle
    @createBag() if listOrSingle == "bagOfHolding" and not @bag
    Device.setSetting "won", true if listOrSingle == "gameOver"
    newMarkers = false
    listOrSingle = [listOrSingle] if listOrSingle not instanceof Array
    for a in listOrSingle
      if not @markers[a]
        @markers[a] = true
        newMarkers = true
      for quest,info of eburp.data.quests
        if info.done == a and info.graphId
          eburp.track "Complete Quest",
            Name: quest
            GraphID: info.graphId

          # Support client side action posting, if we know the FB graph token.
          # This covers cases where a server session is not established, e.g.
          # in the FB canvas.
          url = "/c/quest/#{info.graphId}"
          if window._context and window._context.graphToken
            url += "/#{window._context.graphToken}"
          $.post url

    @buildFeatures() if newMarkers
    newMarkers

  hasMarker : (marker) ->
    return !!@markers[marker]

  hasAllMarkers : (listOrSingle) ->
    if (listOrSingle)
      if (listOrSingle instanceof Array)
        for a in listOrSingle
          if (!@markers[a])
            return false
      else
        if (!@markers[listOrSingle])
          return false
    true

  hasAnyMarkers : (listOrSingle) ->
    if (listOrSingle)
      if (listOrSingle instanceof Array)
        for a in listOrSingle
          if (@markers[a])
            return true
      else
        if (@markers[listOrSingle])
          return true
    false

  buildFeatures : ->
    list = eburp.getMap(@map).features
    @features = {}
    @shops = {}
    if (list)
      for feature in list
        if (@hasAllMarkers(feature.after) and !@hasAnyMarkers(feature.until) && !@hasAnyMarkers(feature.id))
          x = feature.x
          y = feature.y
          # If it's a ship, it may have moved
          if (feature.type == "ship" and @ships[feature.id])
            {x, y} = @ships[feature.id]
          key = Game.getKey(x, y)
          object = @features[key]
          if (!object)
            object = {}
            @features[key] = object
          object[feature.type] = feature
          if (feature.type == "store")
            @populateShopItems(key, feature)

  populateShopItems : (key, shop) ->
    items = []
    @shops[key] = items
    for i in [0 ... Game.NUM_SHOP_ITEMS]
      item = @getRandomItem(shop.level, shop.groups)
      if (item)
        items.push(item)

  getShopItems : (x, y) ->
    key = Game.getKey(x, y)
    @shops[key]

  isChartered : (shipID) ->
    if (@ships[shipID]) then true else false

  boardShip : (shipID) ->
    @aboard = shipID
    @moveShip(@x, @y)

  moveShip : (x, y) ->
    oldPos = @ships[@aboard]
    if (oldPos)
      oldKey = Game.getKey(oldPos.x, oldPos.y)
      object = @features[oldKey]
      if (object)
        feature = object["ship"]
        if (object)
          delete object["ship"]
          if (Util.isEmpty(object))
            delete @features[oldKey]
    else
      feature = @getFeature(x, y, "ship")
    key = Game.getKey(x, y)
    pos = {"x":x, "y":y}
    @ships[@aboard] = pos
    object = @features[key]
    if (!object)
      object = {}
    @features[key] = object
    object["ship"] = feature

  disembark : ->
    @aboard = null

  getCombatMap : ->
    @getTerrainInfo().combatMap

  getFeatures : (x, y) ->
    key = Game.getKey(x, y)
    @features[key]

  getFeature : (x, y, type) ->
    key = Game.getKey(x, y)
    object = @features[key]
    if (!object)
      return null
    else
      object[type]

  addPlayer : (player) ->
    @players.push(player)

  getVisitedArray : ->
    array = @visited[@map]
    if (!array)
      array = Util.create2DArray(eburp.data.maps[@map].width, eburp.data.maps[@map].height,0)
      @visited[@map] = array
    array

  markVisited : (x, y) ->
    array = @getVisitedArray()
    array[y][x] = 1

  wasVisited : (x, y) ->
    array = @getVisitedArray()
    return array[y][x] == 1

  moveTo : (x, y) ->
    @x = x
    @y = y
    if (@aboard)
      @moveShip(x, y)

  transitionTo : (map, x, y) ->
    @map = map
    @buildFeatures()
    @x = x
    @y = y

  doesItemExist : (name) ->
    ## 1) Check all players
    for player in @players
      if (player.hasItem(name))
        return true
    if (@bag and @bag.hasItem(name))
      return true
    ## 2) Check all shops
    for k, shop of @shops
      for item in shop
        if (item.template.name == name)
          return true
    false

  createItem : (template, bonus = 0, charges = 0) ->
    @itemId++
    new Item(template, @itemId, bonus, charges)

  getRandomTemplate : (templates) ->
    sum = 0
    for template in templates
      sum += template.rarity ? 1000
    value = Util.random(0, sum-1)
    for template in templates
      rarity = template.rarity ? 1000
      if (rarity > value)
        return template
      else
        value -= rarity
    null

  getRandomItem : (mapLevel, groups) ->
    level = Library.getLevelNear(mapLevel)
    templates = Library.getItemTemplates(level, groups)
    realLevel = level
    while (templates == null and realLevel > 1)
      realLevel--
      templates = Library.getItemTemplates(realLevel, groups)
    level = realLevel
    if (templates and templates.length > 0)
      attempts = 0
      template = null
      while (template == null and attempts < 5)
        attempts++
        template = @getRandomTemplate(templates)
        if (template.legendary)
          if (@doesItemExist(template.name))
            template = null
      if (template == null)
        null
      else
        bonus = 0
        if (!template.legendary)
          modChance = 1
          levelDiffFactor = mapLevel - level + 2
          if (levelDiffFactor > 0)
            for i in [0 ... levelDiffFactor]
              modChance *= 2
          if (modChance > 75)
            modChance = 75
          chance = Util.random(0, 99)
          while (chance < modChance and bonus < 6)
            bonus++
            chance = Util.random(0, 99)
        if (template.chargesMin)
          charges = Util.random(template.chargesMin, template.chargesMax)
        else
          charges = 0
        @createItem(template, bonus, charges)
    else
      null

  playersNeedHealing: () ->
    for player in @players
      if (player.hitPoints < player.maxHitPoints)
        return true
    false

  healParty : ->
    for player in @players
      player.healCompletely()

  regenerateParty : ->
    for player in @players
      if (player.isAlive())
        if (player.hitPoints < player.maxHitPoints)
          player.hitPoints++
        if (player.spellPoints < player.maxSpellPoints)
          player.spellPoints++

  @getCreatureQuantity: (creatureLevel, mapLevel, limit = false) ->
    diff = creatureLevel - mapLevel
    if (diff < -3)
      diff = -3
    else if (diff > 3)
      diff = 3
    switch (diff)
      when -3 then amount = Util.random(3, 9)
      when -2 then amount = Util.random(2, 5)
      when -1 then amount = Util.random(1, 4)
      when 0 then amount = Util.random(1, 3)
      else amount = 1
    if (limit)
      amount = Math.round(amount / 2)
      if (amount < 1)
        amount = 1
      if (amount > 2)
        amount = 2
    amount

  getEncounter: (feature) ->
    creatures = []
    for creature in feature.creatures
      template = Library.getCreatureByName(creature.name)
      bonus = creature.bonus ? 0
      hpBonus = creature.hitPoints ? 0
      creature = new Creature(template, bonus)
      creature.maxHitPoints += hpBonus
      creature.hitPoints += hpBonus
      creatures.push(creature)
    items = []
    for item in feature.items
      template = Library.getItemTemplateByName(item.name)
      bonus = item.bonus ? 0
      if (template.chargesMin)
        charges = Util.random(template.chargesMin, template.chargesMax)
      else
        charges = 0
      items.push(@createItem(template, bonus, charges))
    gold = feature.gold ? 0
    if (feature.ambushed)
      ambushed = true
    else
      ambushed = false
    {"creatures" : creatures, "items" : items, "gold" : gold, "ambushed" : ambushed}

  giveExperience : (creatures) ->
    totalXP = 0
    for creature in creatures
      totalXP += creature.template.experienceValue
    totalPlayers = 0
    for player in @players
      if (player.isAlive())
        totalPlayers++
    xp = Math.ceil(totalXP / totalPlayers)
    upgrades = []
    for player in @players
      if (player.isAlive())
        player.experience += xp
        if (player.experience >= eburp.data.levels[player.level])
          # Level up
          player.level++
          attrBonuses = [0, 0, 0, 0]
          for i in [0 ... 2]
            attr = Util.random(0, 3)
            attrBonuses[attr]++
            switch attr
              when 0
                player.strength++
                break
              when 1
                player.accuracy++
                break
              when 2
                player.awareness++
                break
              when 3
                player.constitution++
                break
          constitutionBonus = player.getAttributeBonus(player.getConstitution())
          awarenessBonus = player.getAttributeBonus(player.getAwareness())
          hitPointBonus = Util.random(2, 8) + constitutionBonus
          if (hitPointBonus < 1)
            hitPointBonus = 1
          if (player.hasSpells())
            spellPointBonus = Util.random(1, 5) + awarenessBonus
            if (spellPointBonus < 1)
              spellPointBonus = 1
            if (player.maxSpellPoints == 0)
              player.spellPoints = 0
          else
            spellPointBonus = 0
          player.maxHitPoints += hitPointBonus
          player.hitPoints += hitPointBonus
          player.maxSpellPoints += spellPointBonus
          player.spellPoints += spellPointBonus
          newSpells = Library.newSpellsForCharacterAndLevel(player.character, player.level)
          upgrades.push({"player" : player, "attrBonuses" : attrBonuses, "hitPointBonus" : hitPointBonus, "spellPointBonus" : spellPointBonus, "newSpells" : newSpells})
    upgrades

  getAveragePlayerLevel : ->
    total = 0
    for player in @players
      if (player.isAlive())
        total += player.level
    total / 3

  getTile : (x, y) ->
    override = @getFeature(x, y, "override")
    if (override)
      override.tile
    else
      index = y * eburp.data.maps[@map].width + x
      eburp.data.maps[@map].map.charAt(index)

  getTerrainInfo : ->
    tile = @getTile(@x, @y)
    terrain = eburp.data.maps[@map].terrain?[tile]
    if (terrain)
      terrain
    else
      map = eburp.data.maps[@map]
      {
        level : map.level,
        encounterChance: map.encounterChance,
        combatMap : map.combatMap,
        groups: map.groups
      }

  checkForRandomEncounter : ->
    terrain = @getTerrainInfo()
    encounterChance = terrain.encounterChance
    if (encounterChance)
      dungeonLevel = terrain.level
      chance = encounterChance
      if (dungeonLevel < 10) # Don't filter encounters over a certain level, for indefinite play
        chance = chance / Math.max(1, @getAveragePlayerLevel() - dungeonLevel - 1.5)
      if (Util.randomChance(chance, 1000))
        return true
    false

  createEncounter: () ->
    terrain = @getTerrainInfo()
    mapLevel = terrain.level
    groups = terrain.groups
    creatures = []
    k = Util.random(1, 3)
    full = false
    for i in [0 ... k]
      if (!full)
        level = Library.getLevelNear(mapLevel)
        candidates = Library.getCreatures(level, groups)
        while (candidates.length == 0 and level > 0)
          level--
          candidates = Library.getCreatures(level, groups)
        if (candidates.length > 0)
          template = Util.randomElement(candidates)
          n = Game.getCreatureQuantity(template.level, mapLevel, template.limit)
          if (template.summons)
            n = Math.min(n, 2)
          for j in [0 ... n]
            # Todo - maybe have a chance of an "uber" version of creature here, with a bonus?
            creatures.push(new Creature(template, 0))
            if (creatures.length == Game.MAX_ENCOUNTER_CREATURES)
              full = true
              break
    items = []
    gold = 0
    for creature in creatures
      maxGold = 2
      for i in [0 ... creature.template.level - 1]
        if (i > 9)
          maxGold = maxGold * 1.1
        else if (i > 2)
          maxGold = maxGold * 1.4
        else
          maxGold = maxGold * 1.8
      max = Math.round(maxGold)
      gold += Util.random(0, max)
      treasureLevel = creature.template.level
      if (treasureLevel > 10)
        treasureLevel = 10
      if (Util.randomChance(eburp.data.treasureChance[treasureLevel - 1], 1000))
        item = @getRandomItem(creature.template.level, groups)
        if (item)
          if (item.template.legendary)
            unique = true
            for other in items
              if (other.template.name == item.template.name)
                unique = false
                break
            if (!unique)
              item = null
        if (item)
          items.push(item)
        if (items.length == 5)
          break
    ambushed = Util.randomChance(25, 100)
    {"creatures" : creatures, "items" : items, "gold" : gold, "ambushed" : ambushed}

