///<reference path="../../source/core/api.ts"/>
//// Creatures
pow2.registerCreatures(5,[
   //// LEVEL 5
   {
      "name" : "Skeleton Wizard",
      "icon" : "skeletonWizard.png",
      "groups" : ["undead", "skeleton"],
      "meleeMinDamage" : 1,
      "strength": 8,
      "spells" : [
         {
            "name" : "Summon Skeleton",
            "weight" : 20
         },
         {
            "name" : "Electric Bolt",
            "weight" : 70
         },
         {
            "name" : "Whithering Glare",
            "weight" : 10
         }
      ],
      "hp": 30,
      "exp": 45,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 6,
      "resistance" : 6,
      "hitModifier" : 5,
      "limit" : true,
      "description" : "Unlike most raised spirits, the Skeleton Wizards willingly joined the undead, and are hence more powerful. They can summon skeletons and weaken their opponents with their gaze."
   },
   {
      "name" : "Giant Jellyfish",
      "icon" : "jellyfish.png",
      "groups" : ["water"],
      "meleeMinDamage" : 3,
      "strength": 8,
      "hp": 30,
      "exp": 45,
      "numAttacks" : 1,
      "numMoves" : 1,
      "hitModifier" : 5,
      "armorClass" : 4,
      "resistance" : 7,
      "hitSpell" : "Jellyfish Sting",
      "description" : "The Giant Jellyfish not only has a size advantage, but its sting delivers a poisonous toxin to its victim."
   },
   {
      "name" : "Oliphant Sentry",
      "icon" : "oliphant4.png",
      "groups" : ["desert"],
      "meleeMinDamage" : 5,
      "strength": 9,
      "hp": 32,
      "exp": 38,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 10,
      "resistance" : 4,
      "hitModifier" : 5,
      "spells" : [
         {
            "name" : "Pachydermal Rage",
            "weight" : 10
         }
      ],
      "description" : "The Oliphant Sentry's training imbues it with a maniacal instinct to preserve the well-being of the herd. It can fly off in to a wild rage when it feels that its brethren are threatened."
   },
   {
      "name" : "Ogre",
      "icon" : "ogre.png",
      "groups" : ["outdoor", "dungeon", "desert", "tundra"],
      "meleeMinDamage" : 4,
      "strength": 12,
      "hp": 36,
      "exp": 40,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 9,
      "resistance" : 4,
      "hitModifier" : 6,
      "description" : "The common Ogre is the scourge of civilized people everywhere, as civilized people is the food of choice for the common Ogre."
   },
   {
      "name" : "Mummy",
      "icon" : "mummy.png",
      "groups" : ["undead"],
      "meleeMinDamage" : 4,
      "strength": 10,
      "hp": 30,
      "exp": 40,
      "numAttacks" : 1,
      "numMoves" : 2,
      "armorClass" : 10,
      "resistance" : 4,
      "hitModifier" : 6,
      "hitSpell" : "Weakening Bite",
      "description" : "A Mummy is the reanimated corpse of a wealthy noble or ruler. It can move with surprising speed, and its vicious bite weakens its victim."
   },
   {
      "name" : "Phantom",
      "icon" : "phantom2.png",
      "groups" : ["undead"],
      "meleeMinDamage" : 2,
      "strength": 6,
      "hp": 28,
      "exp": 40,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 8,
      "resistance" : 10,
      "hitModifier" : 6,
      "spells" : [
         {
            "name" : "Phantom Menace",
            "weight" : 75
         }
      ],
      "description" : "A Phantom is an undead spirit that is only partially present in the corporeal realm. It attacks with magic at range, yet is itself very resistant to magical effects."
   },
   {
      "name" : "Fire Snake",
      "icon" : "redSnake.png",
      "groups" : ["outdoor", "dungeon", "desert"],
      "meleeMinDamage" : 2,
      "strength": 6,
      "rangeMinDamage" : 1,
      "rangeMaxDamage" : 6,
      "target" : "area",
      "rangeAnimation" : "animFireBall.png",
      "hp": 25,
      "exp": 50,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 6,
      "resistance" : 3,
      "hitModifier" : 8,
      "description" : "One of the most dangerous animals ever documented, the combustible venom of the Fire Snake can engulf hapless opponents in blistering flames."
   },
   {
      "name" : "Ice Troll",
      "icon" : "iceTroll.png",
      "groups" : ["tundra"],
      "meleeMinDamage" : 2,
      "strength": 10,
      "rangeMinDamage" : 2,
      "rangeMaxDamage" : 7,
      "rangeAnimation" : "animRockSmall1.png",
      "hp": 23,
      "exp": 50,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 7,
      "resistance" : 6,
      "hitModifier" : 6,
      "spells" : [
         {
            "name" : "Frozen Armor",
            "weight" : 40
         }
      ],
      "description" : "The Ice Troll is not the largest of trolls, but it is skilled in hurling rocks at its opponents, and is able to protect itself at will in a sheath of hardened ice."
   },
   {
      "name" : "Drow Elf",
      "icon" : "drowElf.png",
      "groups" : ["tundra"],
      "meleeMinDamage" : 1,
      "strength": 5,
      "rangeMinDamage" : 1,
      "rangeMaxDamage" : 5,
      "rangeAnimation" : "animArrow.png",
      "hp": 22,
      "exp": 55,
      "numAttacks" : 2,
      "numMoves" : 1,
      "armorClass" : 8,
      "resistance" : 7,
      "hitModifier" : 6,
      "description" : "The Drow are a subspecies of elf that long ago abandoned the forests for the Northern taiga. Reclusive and nocturnal, they are even more adept with a bow than their arboreal cousins."
   },
   {
      "name" : "Snow Ogre",
      "icon" : "snowman.png",
      "groups" : ["tundra"],
      "meleeMinDamage" : 3,
      "strength": 10,
      "hp": 32,
      "minSpellPoints": 2,
      "maxSpellPoints": 5,
      "exp": 42,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 7,
      "resistance" : 5,
      "hitModifier" : 7,
      "spells" : [
         {
            "name" : "Ice Snap",
            "weight" : 50
         }
      ],
      "description" : "While not as large as its warm-weather cousins, the Snow Ogre is no less dangerous. It will snap quite suddenly into a rage, attacking its enemies with wild abandon."
   }
]);