//// Creatures
pow2.registerCreatures(7,[
   //// Level 7
   {
      "name" : "Oliphant Priestess",
      "icon" : "oliphant.png",
      "groups" : ["desert"],
      "meleeMinDamage" : 3,
      "meleeMaxDamage" : 9,
      "spells" : [
         {
            "name" : "Summon Oliphant 3",
            "weight" : 50
         },
         {
            "name" : "Righteous Missile",
            "weight" : 75
         },
         {
            "name" : "Heal the Herd",
            "weight" : 50
         }
      ],
      "minHP" : 25,
      "maxHP" : 40,
      "experienceValue" : 150,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 8,
      "hitModifier" : 10,
      "resistance" : 8,
      "limit" : true,
      "description" : "The Priestesses rule the Oliphant herd societies. They can magically summon their brethren, and can heal whole groups of compatriots at a time."
   },
   {
      "name" : "Mind Flayer",
      "icon" : "mindFlayer.png",
      "groups" : ["outdoor", "dungeon"],
      "meleeMinDamage" : 3,
      "meleeMaxDamage" : 10,
      "minHP" : 34,
      "maxHP" : 55,
      "experienceValue" : 160,
      "numAttacks" : 2,
      "numMoves" : 1,
      "armorClass" : 9,
      "resistance" : 7,
      "hitModifier" : 8,
      "spells" : [
         {
            "name" : "Mind Flay",
            "weight" : 75
         }
      ],
      "description" : "The Mind Flayer is the stuff of nightmares, a merciless killer that attacks its victims' minds with agonizing psychic damage."
   },
   {
      "name" : "Ice Magus",
      "icon" : "iceMage.png",
      "groups" : ["tundra"],
      "meleeMinDamage" : 3,
      "meleeMaxDamage" : 6,
      "minHP" : 25,
      "maxHP" : 41,
      "minSpellPoints": 25,
      "maxSpellPoints": 35,
      "experienceValue" : 160,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 7,
      "resistance" : 6,
      "hitModifier" : 6,
      "spells" : [
         {
            "name" : "Hailstorm",
            "weight" : 40
         },
         {
            "name" : "Refract",
            "weight" : 20
         },
         {
            "name" : "Whiteout",
            "weight" : 30
         },
         {
            "name" : "Summon Snow Ogre",
            "weight" : 30
         }
      ],
      "limit" : true,
      "description" : "The Ice Magi are infamous throughout the Fiefdoms for their spell-casting prowess. Intelligent and unpredictable, they can defeat an opponent a number of different ways."
   },
   {
      "name" : "Rock Golem",
      "icon" : "rockGolem.png",
      "groups" : ["outdoor", "dungeon", "desert"],
      "meleeMinDamage" : 2,
      "meleeMaxDamage" : 10,
      "rangeMinDamage" : 4,
      "rangeMaxDamage" : 15,
      "rangeAnimation" : "animRockSmall1.png",
      "minHP" : 40,
      "maxHP" : 62,
      "experienceValue" : 160,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 10,
      "resistance" : 6,
      "hitModifier" : 10,
      "description" : "The Rock Golem attacks by hurling the very stuff that it is made of: rocks. Its geologic construction has few weaknesses."
   },
   {
      "name" : "Minotaur",
      "icon" : "minotaur.png",
      "groups" : ["dungeon", "outdoor"],
      "meleeMinDamage" : 12,
      "meleeMaxDamage" : 20,
      "minHP" : 45,
      "maxHP" : 70,
      "experienceValue" : 150,
      "numAttacks" : 1,
      "numMoves" : 2,
      "armorClass" : 9,
      "resistance" : 6,
      "hitModifier" : 12,
      "description" : "The mighty Minotaur is among the greatest of warriors. Few have survived hand-to-hand combat with the murderous creatures."
   },
   {
      "name" : "Wraith",
      "icon" : "wraith2.png",
      "groups" : ["undead", "dungeon"],
      "meleeMinDamage" : 4,
      "meleeMaxDamage" : 8,
      "rangeMinDamage" : 5,
      "rangeMaxDamage" : 12,
      "rangeAnimation" : "animColdBallSmall.png",
      "minHP" : 25,
      "maxHP" : 45,
      "experienceValue" : 150,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 15,
      "resistance" : 4,
      "hitModifier" : 10,
      "description" : "A Wraith is the undead incarnation of a soul that was simply too angry to remain properly dead. It is very hard to injure and can deal considerable damage at range."
   },
   {
      "name" : "Vezu",
      "icon" : "vezu.png",
      "groups" : ["default"],
      "meleeMinDamage" : 12,
      "meleeMaxDamage" : 20,
      "rangeMinDamage" : 9,
      "rangeMaxDamage" : 15,
      "target" : "area",
      "level" : 1000, // Use a high level to ensure a special creature never shows up in a random encounter
      "rangeAnimation" : "animFireBall.png",
      "minHP" : 110,
      "maxHP" : 110,
      "experienceValue" : 1500,
      "numAttacks" : 1,
      "numMoves" : 2,
      "armorClass" : 12,
      "resistance" : 7,
      "limit" : true,
      "hitModifier" : 14,
      "description" : "Vezu the Ancient was thought to be destroyed when last he threatened the Three Kingdoms, but he survived inside the heart of the volcano and has emerged once again!"
   }
]);