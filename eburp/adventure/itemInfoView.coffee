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

class ItemInfoView extends InfoView

  @getUsedBy : (template) ->
    first = true
    text = ""
    for type in template.usedBy
      if (first)
        first = false
      else
        text += ", "
      switch (type)
        when "warrior"
          text += "Warriors"
        when "archer"
          text += "Archers"
        when "mage"
          text += "Mages"
    text

  constructor : (gurk, @item) ->
    super(gurk, "DONE")
    template = @item.template
    @addIcon(template.icon, 3, 3)
    y = 23
    x = 3
    if (template.legendary)
      @addLabelCentered(@item.name, @item.getColor(), 0, 3, 128, 8)
      @addLabelCentered("(Legendary Artifact)", "#A0A0A0", 0, 12, 128, 8)
    else
      @addLabelCentered(@item.name, @item.getColor(), 0, 4, 128, 16)
    @addLabel("(#{ItemInfoView.getUsedBy(template)})", "#FFF", x, y)
    y += 8
    # todo - show charges, and spell effect for usable items
    if (@item.isMeleeWeapon())
      @addLabel("Melee Damage: #{Math.max(1, @item.getMeleeMinDamage())} - #{Math.max(1, @item.getMeleeMaxDamage())}", "#FFF", x, y)
      y += 8
    if (@item.isRangeWeapon())
      @addLabel("Range Damage: #{Math.max(1, @item.getRangeMinDamage())} - #{Math.max(1, @item.getRangeMaxDamage())}", "#FFF", x, y)
      y += 8
    if (@item.getHitSpell())
      @addLabel("Hit Effect", "#A0A0A0", x, y)
      y += 8
      y = @showSpell(@item.getHitSpell(), 8, y, false, false)
    if (@item.getCombatSpell())
      speed = if @item.getCombatSpell().fast then "|" else "="
      @addLabel("Once per Combat #{speed}", "#A0A0A0", x, y)
      y += 8
      y = @showSpell(@item.getCombatSpell(), 8, y, true, true)
    if (@item.getExtraMoves() > 0)
      @addLabel("Extra Moves: #{@item.getExtraMoves()}", "#FFF", x, y)
      y += 8
    if (@item.getExtraAttacks() > 0)
      @addLabel("Extra Attacks: #{@item.getExtraAttacks()}", "#FFF", x, y)
      y += 8
    if (@item.getToHitBonus() != 0)
      @addLabel("To-Hit Bonus: #{@item.getToHitBonus()}", "#FFF", x, y)
      y += 8
    if (@item.getArmorClass() != 0)
      @addLabel("Armor Class Bonus: #{@item.getArmorClass()}", "#FFF", x, y)
      y += 8
    if (@item.getResistance() != 0)
      @addLabel("Resistance Bonus: #{@item.getResistance()}", "#FFF", x, y)
      y += 8
    if (@item.getStrengthBonus() != 0)
      @addLabel("Strength Bonus: #{@item.getStrengthBonus()}", "#FFF", x, y)
      y += 8
    if (@item.getAccuracyBonus() != 0)
      @addLabel("Accuracy Bonus: #{@item.getAccuracyBonus()}", "#FFF", x, y)
      y += 8
    if (@item.getAwarenessBonus() != 0)
      @addLabel("Awareness Bonus: #{@item.getAwarenessBonus()}", "#FFF", x, y)
      y += 8
    if (@item.getConstitutionBonus() != 0)
      @addLabel("Toughness Bonus: #{@item.getConstitutionBonus()}", "#FFF", x, y)
      y += 8
    if (@item.isUseable())
      @addLabel("Charges Left: #{@item.charges}", "#FFF", x, y)
      y += 8
      spell = @item.getSpell()
      speed = if spell.fast then "| Fast" else "= Normal"
      @addLabel("Speed: #{speed}", "#FFF", x, y)
      y += 8
      @showSpell(spell, x, y, true, true)

  showSpell : (spell, x, y, showRange = true, showDrainDamage = false) =>
    if (spell.type == "summon")
      @addLabel("Summons: #{spell.creature}", "#FFF", x, y)
      y += 8
    else
      range = @item.getSpellRange(spell)
      if (spell.type == "damage")
        effect = "Damage #{range.min} - #{range.max}"
      else if (spell.type == "teleport")
        effect = "Teleport"
      else if (spell.type == "drain")
        if (showDrainDamage)
          effect = "Drains Life #{range.min} - #{range.max}"
        else
          effect = "Drains Life"
      else if (spell.type == "heal")
        if (spell.healType == "restore")
          effect = "Restore #{range.min} - #{range.max}"
        else if (spell.healType == "remove")
          effect = "Cure Afflictions"
        else
          effect = "Heal #{range.min} - #{range.max}"
      else
        effect = spell.effect;
        if ("Poisoned" == effect)
          effect += " (" + spell.value + ")"
      if (showRange)
        # speed = if spell.fast then "|" else "="
        @addLabel("Effect: #{effect}", "#FFF", x, y)
      else
        @addLabel("#{effect}", "#FFF", x, y)
      y += 8
      if (showRange)
        if (spell.target == "touch")
          target = "Touch"
        else if (spell.target == "self")
          target = "Self"
        else if (spell.target == "range")
          target = "Range"
        else if (spell.target == "area")
          target = "Area"
        @addLabel("Target: #{target}", "#FFF", x, y)
        y += 8
    y
