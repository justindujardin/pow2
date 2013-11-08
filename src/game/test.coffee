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

class Test

  @assert: (condition, failDescription) =>
    if (!condition)
      console.log("ASSERTION FAILED: " + failDescription)

  @run: =>
    console.log("--- TESTING START ---")

    shortSwordTemplate = Library.getItemTemplateByName("Short Sword")
    Test.assert(shortSwordTemplate, "Short sword template not found by name")
    shortSword = new Item(shortSwordTemplate, 100, 2)
    Test.assert(shortSword.name == "Short Sword +2", "Short Sword name is wrong.")
    Test.assert(shortSword.getMeleeMinDamage() == 3, "Short Sword melee min damage is wrong.")
    Test.assert(shortSword.getMeleeMaxDamage() == 7, "Short Sword melee max damage is wrong.")
    Test.assert(shortSword.getToHitBonus() == 2, "Short Sword to hit bonus is wrong.")
    Test.assert(shortSword.getArmorClass() == 0, "Short Sword should have 0 AC.")
    leatherArmor = new Item(Library.getItemTemplateByName("Leather Armor"), 101, -1)
    Test.assert(leatherArmor.getArmorClass() == 1, "Leather Armor -1 should have 1 AC")
    rugnar = new Player(Data.characters[0])
    Test.assert(rugnar.strength >= rugnar.accuracy, "Strength is not greatest attribute.")
    Test.assert(rugnar.strength >= rugnar.awareness, "Strength is not greatest attribute.")
    Test.assert(rugnar.strength >= rugnar.constitution, "Strength is not greatest attribute.")
    Test.assert(rugnar.maxHitPoints > 0, "Max hit points not positive.")
    Test.assert(rugnar.hitPoints == rugnar.maxHitPoints, "Hit points not equal to max hit points.")
    rugnar.strength = 18
    Test.assert(rugnar.getAttributeBonus(rugnar.strength) == 3, "Strength bonus incorrect.")
    damage = rugnar.getMeleeDamageBounds()
    Test.assert(damage.min == 1 + 3, "Min damage is wrong")
    Test.assert(damage.max == 1 + 3, "Max damage is wrong")
    rugnar.addItem(shortSword)
    rugnar.equipItem(shortSword)
    damage = rugnar.getMeleeDamageBounds()
    Test.assert(damage.min == 1 + 2 + 3, "Min damage is wrong")
    Test.assert(damage.max == 5 + 2 + 3, "Max damage is wrong")
    rugnar.addItem(leatherArmor)
    rugnar.equipItem(leatherArmor)
    rugnar.awareness = 14
    Test.assert(rugnar.getArmorClass() == 1 + 1, "Rugnar armor class is wrong.")
    rugnar.unequipItem(leatherArmor)
    Test.assert(rugnar.getArmorClass() == 0 + 1, "Rugnar armor class is wrong after unequip.")
    rugnar.dropItem(leatherArmor)
    Test.assert(rugnar.items.length == 1, "Rugnar should have 1 item.")

    console.log("--- TESTING COMPLETED ---")
