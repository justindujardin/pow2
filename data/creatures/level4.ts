///<reference path="../../source/core/api.ts"/>
//// Creatures
pow2.registerCreatures(4,[

   //// LEVEL 4
   {
      "name" : "Oliphant",
      "icon" : "oliphant2.png",
      "groups" : ["desert"],
      "meleeMinDamage" : 4,
      "meleeMaxDamage" : 9,
      "minHP" : 8,
      "maxHP" : 16,
      "experienceValue" : 22,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 6,
      "resistance" : 2,
      "hitModifier" : 4,
      "description" : "Oliphants are a race of elephant-like humanoids. They are fiercely reclusive and suspicious of humans."
   },
   {
      "name" : "Troll",
      "icon" : "troll.png",
      "groups" : ["outdoor", "dungeon", "tundra"],
      "meleeMinDamage" : 3,
      "meleeMaxDamage" : 8,
      "rangeMinDamage" : 3,
      "rangeMaxDamage" : 7,
      "rangeAnimation" : "animRockSmall1.png",
      "minHP" : 6,
      "maxHP" : 24,
      "experienceValue" : 26,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 7,
      "resistance" : 3,
      "hitModifier" : 3,
      "description" : "Trolls are large, nasty and devious humanoids. Their preferred method of attack is to hurl large rocks at their opponent, with devastating efficiency."
   },
   {
      "name" : "Frost Snake",
      "icon" : "whiteSnake.png",
      "groups" : ["tundra"],
      "meleeMinDamage" : 2,
      "meleeMaxDamage" : 5,
      "rangeMinDamage" : 4,
      "rangeMaxDamage" : 10,
      "rangeAnimation" : "animColdBallSmall.png",
      "minHP" : 7,
      "maxHP" : 19,
      "experienceValue" : 28,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 6,
      "resistance" : 8,
      "hitModifier" : 4,
      "description" : "The large and mischievous Frost Snake uses dense balls of ice as a projectile weapon, expertly spitting at opponents from range. It is also fairly resistant to magical attacks."
   },
   {
      "name" : "Bugbear",
      "icon" : "bugbear2.png",
      "groups" : ["outdoor", "dungeon", "desert", "tundra"],
      "meleeMinDamage" : 5,
      "meleeMaxDamage" : 12,
      "minHP" : 8,
      "maxHP" : 24,
      "experienceValue" : 30,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 7,
      "resistance" : 3,
      "hitModifier" : 4,
      "spells" : [
         {
            "name" : "Regenerate",
            "weight" : 10
         }
      ],
      "description" : "The Bugbear is a race of large and vicious humanoids. They possess the ability to regenerate their wounds, which matches well with their highly aggressive combat style."
   },
   {
      "name" : "Ghoul",
      "icon" : "ghoul.png",
      "groups" : ["undead"],
      "meleeMinDamage" : 2,
      "meleeMaxDamage" : 6,
      "minHP" : 10,
      "maxHP" : 22,
      "experienceValue" : 32,
      "numAttacks" : 2,
      "numMoves" : 1,
      "armorClass" : 8,
      "resistance" : 3,
      "hitModifier" : 5,
      "spells" : [
         {
            "name" : "Scare",
            "weight" : 10
         }
      ],
      "limit" : true,
      "description" : "One of the most frightening incarnations of the undead, the Ghoul can emit a fearsome shriek that will freeze an opponent in its tracks."
   },
   {
      "name" : "Spider Queen",
      "icon" : "hugeSpider.png",
      "groups" : ["outdoor", "dungeon", "desert", "swamp"],
      "meleeMinDamage" : 2,
      "meleeMaxDamage" : 6,
      "spells" : [
         {
            "name" : "Summon Black Spider",
            "weight" : 50
         },
         {
            "name" : "Web of Protection",
            "weight" : 20
         }
      ],
      "minHP" : 18,
      "maxHP" : 32,
      "experienceValue" : 35,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 5,
      "resistance" : 3,
      "hitModifier" : 3,
      "limit" : true,
      "description" : "The glorious Spider Queen can summon her numerous children with but a whisper. She also spins reinforcing webs to protect her brood."
   },
   {
      "name" : "Merman Swordsman",
      "icon" : "merman.png",
      "groups" : ["water"],
      "meleeMinDamage" : 2,
      "meleeMaxDamage" : 8,
      "minHP" : 5,
      "maxHP" : 18,
      "experienceValue" : 28,
      "numAttacks" : 2,
      "numMoves" : 1,
      "armorClass" : 6,
      "resistance" : 3,
      "hitModifier" : 4,
      "description" : "Training with a sword underwater results in an incredible amount of precision an speed, making the Merman Swordsman a highly respected opponent in battle, both in and out of water."
   },
   {
      "name" : "Merman Sorcerer",
      "icon" : "mermanWizard.png",
      "groups" : ["water"],
      "meleeMinDamage" : 2,
      "meleeMaxDamage" : 4,
      "spells" : [
         {
            "name" : "Summon Swordfish",
            "weight" : 40
         },
         {
            "name" : "Aquatic Missile",
            "weight" : 80
         },
         {
            "name" : "Oyster Ointment",
            "weight" : 20
         }
      ],
      "minHP" : 6,
      "maxHP" : 16,
      "experienceValue" : 25,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 5,
      "resistance" : 6,
      "hitModifier" : 3,
      "description" : "Some legends claim that the Merfolk were the very first discoverers of sorcery, although it is disputed. The Merman Sorcerers can heal allies and summon oceanic brethren to aid in their battles."
   },
   {
      "name" : "Goblin King",
      "icon" : "goblinKing.png",
      "groups" : ["goblin"],
      "meleeMinDamage" : 1,
      "meleeMaxDamage" : 2,
      "spells" : [
         {
            "name" : "Summon Goblin",
            "weight" : 40
         },
         {
            "name" : "Royal Slime",
            "weight" : 60
         },
         {
            "name" : "Speech Maniacal",
            "weight" : 20
         }
      ],
      "minHP" : 18,
      "maxHP" : 28,
      "experienceValue" : 40,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 4,
      "resistance" : 4,
      "hitModifier" : 2,
      "limit" : true,
      "description" : "There are a conspicuously large number of Goblins claiming to be monarchs, and each has legions of followers, who can be whipped into a bloodthirsty frenzy."
   },
   {
      "name" : "Treant Elder",
      "icon" : "treantElder.png",
      "groups" : ["outdoor"],
      "meleeMinDamage" : 3,
      "meleeMaxDamage" : 15,
      "minHP" : 22,
      "maxHP" : 32,
      "experienceValue" : 42,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 4,
      "resistance" : 8,
      "hitModifier" : 4,
      "spells" : [
         {
            "name" : "Tangle of Roots",
            "weight" : 20
         }
      ],
      "description" : "The ancient Treant Elders can summon the forces of nature to spontaneously sprout roots, entrapping its adversaries."
   }
]);