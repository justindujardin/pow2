///<reference path="../../lib/pow2.d.ts"/>

//// Creatures
pow2.registerCreatures(2,[
   //// LEVEL 2
   {
      "name" : "Skeleton",
      "icon" : "skeleton.png",
      "groups" : ["undead", "skeleton"],
      "meleeMinDamage" : 1,
      "strength": 3,
      "rangeMinDamage" : 1,
      "rangeMaxDamage" : 2,
      "rangeAnimation" : "animThrowingBone.png",
      "hp": 9,
      "exp": 8,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 5,
      "description" : "Skeletons are crude and artless undead re-animations. They are easily dispatched in hand-to-hand combat, but have the annoying habit of standing at a distance and lobbing bones plucked from their own body at their opponents."
   },
   {
      "name" : "Goblin Warrior",
      "icon" : "goblin7.png",
      "groups" : ["goblin"],
      "meleeMinDamage" : 1,
      "strength": 6,
      "hp": 9,
      "exp": 8,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 6,
      "hitModifier" : 1,
      "description" : "Only the largest and most fearsome goblins are granted the title of 'Goblin Warrior'. Besides being bigger, they are also generally better-equipped for combat than their weaker brethren."
   },
   {
      "name" : "Orc",
      "icon" : "goblin4.png",
      "groups" : ["dungeon", "desert"],
      "meleeMinDamage" : 2,
      "strength": 7,
      "hp": 10,
      "exp": 9,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 5,
      "hitModifier" : 1,
      "description" : "Orcs are related to goblins, and are often found in their company. They are larger than goblins, but far less intelligent."
   },
   {
      "name" : "Giant Bear",
      "icon" : "bear.png",
      "groups" : ["outdoor"],
      "meleeMinDamage" : 2,
      "strength": 5,
      "hp": 12,
      "exp": 9,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 3,
      "hitModifier" : 1,
      "description" : "The Giant Bear is typically docile and reclusive. However, when angered, its rage and aggression can be unmatched."
   },
   {
      "name" : "Zombie",
      "icon" : "zombie3.png",
      "groups" : ["undead"],
      "meleeMinDamage" : 3,
      "strength": 5,
      "hp": 8,
      "exp": 8,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 3,
      "hitModifier" : 1,
      "hitSpell" : "Poison Touch",
      "description" : "A Zombie is the rotting carcass of the deceased that, for whatever reason, was reanimated by black magic. Its bite can infect the victim with a debilitating illness."
   },
   {
      "name" : "Black Spider",
      "icon" : "blackSpider.png",
      "groups" : ["outdoor", "dungeon", "desert", "swamp"],
      "meleeMinDamage" : 1,
      "strength": 8,
      "hp": 9,
      "exp": 9,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 1,
      "hitSpell" : "Slowing Venom",
      "description" : "The Black Spider looks similar to the giant spider, but it possesses a venom that slows the reactions of its target, rendering them easy prey."
   },
   {
      "name" : "Kobold Fighter",
      "icon" : "koboldSwordsman.png",
      "groups" : ["outdoor", "dungeon", "desert"],
      "meleeMinDamage" : 1,
      "strength": 4,
      "hp": 8,
      "exp": 9,
      "numAttacks" : 2,
      "numMoves" : 1,
      "armorClass" : 1,
      "hitModifier" : 1,
      "description" : "The Kobold Fighter is a surprisingly well-trained warrior. It can wield two weapons with amazing dexterity."
   },
   {
      "name" : "Kobold Mystic",
      "icon" : "koboldShaman.png",
      "groups" : ["outdoor", "dungeon", "desert"],
      "meleeMinDamage" : 1,
      "strength": 2,
      "hp": 6,
      "exp": 10,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 1,
      "spells" : [
         {
            "name" : "Kobold Focus",
            "weight" : 40 // Relative chance that they use this spell, moving and attacking have default weights too and can be overridden
         },
         {
            "name" : "Mystic Missile",
            "weight" : 80
         }
      ],
      "description" : "The Kobold Mystic can attack at range with spells, and uses foul magic to boost the abilities of its allies in combat."
   },
   {
      "name" : "Sea Snake",
      "icon" : "blueSnake.png",
      "groups" : ["water"],
      "meleeMinDamage" : 2,
      "strength": 6,
      "hp": 9,
      "exp": 8,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 4,
      "hitModifier" : 2,
      "hitSpell" : "Poison Touch",
      "description" : "The Sea Snake looks fairly harmless, but it is not to be trifled with as its bite carries a poisonous venom."
   },
   {
      "name" : "Craw Fighter",
      "icon" : "crawFighter.png",
      "groups" : ["water"],
      "meleeMinDamage" : 2,
      "strength": 5,
      "hp": 10,
      "exp": 9,
      "numAttacks" : 2,
      "numMoves" : 1,
      "armorClass" : 6,
      "hitModifier" : 2,
      "description" : "The Craw Fighter is a skilled and well-armored protector of the sanctity of the seas. Landlubbers, beware!"
   }
]);