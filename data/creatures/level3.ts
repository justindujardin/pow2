///<reference path="../../lib/pow2.d.ts"/>
//// Creatures
pow2.registerCreatures(3,[
   //// LEVEL 3
   {
      "name" : "Goblin Shaman",
      "icon" : "goblinWizard.png",
      "groups" : ["goblin"],
      "meleeMinDamage" : 1,
      "strength": 2,
      "hp": 10,
      "exp": 14,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 5,
      "hitModifier" : 1,
      "spells" : [
         {
            "name" : "Cursed Slime",
            "weight" : 80
         },
         {
            "name" : "Elixir of Strength",
            "weight" : 40
         }
      ],
      "description" : "The Goblin Shaman often accompanies large groups of goblins and orcs. It administers noxious elixirs that boost the strength of its allies."
   },
   {
      "name" : "Goblin Archer",
      "icon" : "goblinArcher.png",
      "groups" : ["goblin"],
      "meleeMinDamage" : 1,
      "strength": 2,
      "rangeMinDamage" : 3,
      "rangeMaxDamage" : 6,
      "rangeAnimation" : "animArrow.png",
      "hp": 11,
      "exp": 14,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 6,
      "hitModifier" : 3,
      "description" : "Female goblins are typically recruited and trained as archers, where they become astonishingly adept, especially considering the poor quality of their bows."
   },
   {
      "name" : "Hobgoblin",
      "icon" : "dude.png",
      "groups" : ["dungeon", "desert", "tundra"],
      "meleeMinDamage" : 4,
      "strength": 8,
      "hp": 17,
      "exp": 16,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 6,
      "hitModifier" : 2,
      "description" : "Despite its name, the Hobgoblin is more closely related to trolls than goblins. It is formidable, but fights without dignity, delivering vicious bites with its large and toothy mouth."
   },
   {
      "name" : "Blue Goblin",
      "icon" : "blueGoblin.png",
      "groups" : ["tundra"],
      "meleeMinDamage" : 3,
      "strength": 7,
      "hp": 15,
      "exp": 16,
      "numAttacks" : 1,
      "numMoves" : 2,
      "armorClass" : 5,
      "resistance" : 3,
      "hitModifier" : 2,
      "description" : "This Northern species is stronger, faster and deadlier than the more common varietal. Indeed, the Blue Goblin lists its temperate cousins amongst its favorite foods."
   },
   {
      "name" : "Treant",
      "icon" : "treant.png",
      "groups" : ["outdoor"],
      "meleeMinDamage" : 3,
      "strength": 6,
      "hp": 24,
      "exp": 15,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 2,
      "resistance" : 5,
      "hitModifier" : 2,
      "description" : "Once regarded as gentle giants, the Treants have recently turned against humankind, blaming them for the degradation of the forests."
   },
   {
      "name" : "Skeleton Guard",
      "icon" : "skeletonGuard.png",
      "groups" : ["undead", "skeleton"],
      "meleeMinDamage" : 1,
      "strength": 5,
      "rangeMinDamage" : 2,
      "rangeMaxDamage" : 5,
      "rangeAnimation" : "animThrowingBone.png",
      "hp": 12,
      "exp": 16,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 7,
      "resistance" : 2,
      "hitModifier" : 2,
      "description" : "The Skeleton Guard is a better-equipped and more resolute skeletal automaton than the garden-variety. They are not to be trifled with."
   },
   {
      "name" : "Merman",
      "icon" : "mermanFighter.png",
      "groups" : ["water"],
      "meleeMinDamage" : 3,
      "strength": 6,
      "hp": 15,
      "exp": 14,
      "numAttacks" : 1,
      "numMoves" : 2,
      "armorClass" : 7,
      "resistance" : 2,
      "hitModifier" : 3,
      "description" : "The Merfolk once had a tenuous alliance with the Helenikan Empire, but they now regard all sea-going vessels as a threat to their oceanic sovereignty."
   },
   {
      "name" : "Giant Crab",
      "icon" : "crab.png",
      "groups" : ["water"],
      "meleeMinDamage" : 3,
      "strength": 10,
      "hp": 10,
      "exp": 15,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 4,
      "resistance" : 1,
      "hitModifier" : 2,
      "description" : "This species of crab is enormous and eats anything that moves. Its claws are tremendously powerful."
   },
   {
      "name" : "Spitting Spider",
      "icon" : "redSpider.png",
      "groups" : ["outdoor", "desert"],
      "meleeMinDamage" : 1,
      "strength": 3,
      "rangeMinDamage" : 3,
      "rangeMaxDamage" : 6,
      "rangeAnimation" : "animHotBallSmall.png",
      "hp": 10,
      "exp": 15,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 4,
      "hitModifier" : 2,
      "description" : "The Spitting Spider can project acidic venom with astounding accuracy over great distances. It's an insect worth avoiding."
   },
   {
      "name" : "Orc Champion",
      "icon" : "bugbear.png",
      "groups" : ["dungeon", "desert", "tundra"],
      "meleeMinDamage" : 3,
      "strength": 7,
      "hp": 15,
      "exp": 14,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 6,
      "hitModifier" : 3,
      "resistance" : 1,
      "spells" : [
         {
            "name" : "Memory of Abuse",
            "weight" : 15
         }
      ],
      "description" : "These orcs are believed to have been transformed via evil magic and gruelling conditioning. They develop an innate ability to temporarily increase their strength, to devastating effect."
   }
]);