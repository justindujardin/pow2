///<reference path="../../lib/pow2.d.ts"/>

//// Creatures
pow2.registerCreatures(1,[
   //// LEVEL 1
   {
      name : "Snake",
      icon : "greensnake.png",
      groups : ["dungeon", "outdoor"],
      hp: 8,
      attacklow:1,
      attackhigh:4,
      exp: 6,
      gold: 6,
      evade:6,
      hitpercent:2
   },
   {
      name : "Kobold",
      icon : "kobold.png",
      groups : ["outdoor", "dungeon", "desert", "kobold"],
      hp: 16,
      attacklow:4,
      attackhigh:7,
      exp: 18,
      gold: 6,
      evade:9,
      hitpercent:4,
      description : "Thought to be the result of an unfortunate cross-breeding experiment, these dog-like men are diminutive, but hunt effectively in packs."
   },
   {
      "name" : "Goblin Scout",
      "icon" : "goblinScout.png",
      "groups" : ["goblin", "dungeon"], // These groups are used to specify in which maps they should appear
      "meleeMinDamage" : 1,
      "strength": 3,
      "hp": 20,
      "exp": 3,
      "numAttacks" : 1,
      "numMoves" : 2,
      "armorClass" : 5,
      "description" : "Small and nimble, the Goblin Scout may not be the most imposing of the goblins, but it can sneak in and do quick damage while deftly avoiding counter-attacks."
   },
   {
      "name" : "Goblin",
      "icon" : "goblin.png",
      "groups" : ["goblin", "dungeon"],
      "meleeMinDamage" : 1,
      "strength": 3,
      "hp": 22,
      "exp": 4,
      "numAttacks" : 1,
      "numMoves" : 1,
      "agility": 3,
      "description" : "The object of many a child's nightmare, Goblins are cruel and vicious creatures. While certainly not a threat in individual combat, they can often overwhelm with sheer numbers."
   },
   {
      "name" : "Goblin Swashbuckler",
      "icon" : "goblin6.png",
      "groups" : ["goblin", "dungeon"],
      "meleeMinDamage" : 2,
      "strength": 3,
      "hp": 21,
      "exp": 5,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 2,
      "description" : "Goblin Swashbucklers are trained in the breeding pits to fight more viciously than other Goblins. While this makes them a dangerous foe, it also dramatically reduces their life expectancy."
   },
   {
      "name" : "Imp",
      "icon" : "imp.png",
      "groups" : ["dungeon", "outdoor", "kobold"],
      "meleeMinDamage" : 1,
      "strength": 2,
      "hp": 19,
      "exp": 5,
      "numAttacks" : 2,
      "numMoves" : 1,
      "armorClass" : 4,
      "description" : "Small but mean, the Imp can attack very quickly, doing considerable damage before an opponent can counter-attack."
   },
   {
      "name" : "Giant Spider",
      "icon" : "greenSpider.png",
      "groups" : ["outdoor", "dungeon", "kobold", "swamp"],
      "meleeMinDamage" : 1,
      "strength": 3,
      "hp": 23,
      "exp": 5,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 1,
      "description" : "These incredible beasts are almost the size of a full-grown man. They are notoriously hard to kill."
   },
   {
      "name" : "Giant Snake",
      "icon" : "snake.png",
      "groups" : ["outdoor", "desert", "kobold", "swamp"],
      "meleeMinDamage" : 2,
      "strength": 4,
      "hp": 19,
      "exp": 5,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 2,
      "description" : "While not poisonous, the Giant Snake has been known to take down and devour very large prey, including people!"
   },
   {
      "name" : "Kobold",
      "icon" : "kobold.png",
      "groups" : ["outdoor", "dungeon", "desert", "kobold"],
      "meleeMinDamage" : 1,
      "strength": 3,
      "hp": 19,
      "exp": 4,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 4,
      "description" : "Thought to be the result of an unfortunate cross-breeding experiment, these dog-like men are diminutive, but hunt effectively in packs."
   },
   {
      "name" : "Wererat",
      "icon" : "wererat.png",
      "groups" : ["dungeon", "kobold"],
      "meleeMinDamage" : 1,
      "strength": 2,
      "hp": 19,
      "exp": 6,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 3,
      "hitSpell" : "Weakening Bite",
      "description" : "An infernal subterranean pest, the bite of a Wererat has a toxin that weakens its victim."
   },
   {
      "name" : "Swordfish",
      "icon" : "swordFish.png",
      "groups" : ["water"],
      "meleeMinDamage" : 1,
      "strength": 4,
      "hp": 20,
      "exp": 6,
      "numAttacks" : 1,
      "numMoves" : 1,
      "armorClass" : 2,
      "hitModifier" : 1,
      "description" : "Possessed and controlled by the Merfolk, these poor, everyday fish have been coerced to take up arms against all who walk on dry land."
   }

]);