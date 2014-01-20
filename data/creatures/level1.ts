///<reference path="../../source/core/api.ts"/>
//// Creatures
pow2.registerCreatures(1,[
   //// LEVEL 1
   {
      name : "Imp",
      icon : "imp.png",
      groups : ["dungeon", "outdoor", "kobold"],
      hp: 8,
      attackLow:4,
      attackHigh:8,
      exp: 6,
      gold: 6,
      description : "Small but mean, the Imp can attack very quickly, doing considerable damage before an opponent can counter-attack."
   },
   {
      name : "Kobold",
      icon : "kobold.png",
      groups : ["outdoor", "dungeon", "desert", "kobold"],
      hp: 16,
      attackLow:8,
      attackHigh:16,
      exp: 18,
      gold: 18,
      description : "Thought to be the result of an unfortunate cross-breeding experiment, these dog-like men are diminutive, but hunt effectively in packs."
   }
//   {
//      name : "Goblin Scout",
//      icon : "goblinScout.png",
//      groups : ["goblin", "dungeon"], // These groups are used to specify in which maps they should appear
//      hp: 20,
//      exp: 3,
//      description : "Small and nimble, the Goblin Scout may not be the most imposing of the goblins, but it can sneak in and do quick damage while deftly avoiding counter-attacks."
//   },
//   {
//      name : "Goblin",
//      icon : "goblin.png",
//      groups : ["goblin", "dungeon"],
//      hp: 22,
//      exp: 4,
//      "agility": 3,
//      description : "The object of many a child's nightmare, Goblins are cruel and vicious creatures. While certainly not a threat in individual combat, they can often overwhelm with sheer numbers."
//   },
//   {
//      name : "Goblin Swashbuckler",
//      icon : "goblin6.png",
//      groups : ["goblin", "dungeon"],
//      hp: 21,
//      exp: 5,
//      description : "Goblin Swashbucklers are trained in the breeding pits to fight more viciously than other Goblins. While this makes them a dangerous foe, it also dramatically reduces their life expectancy."
//   },
//   {
//      name : "Giant Spider",
//      icon : "greenSpider.png",
//      groups : ["outdoor", "dungeon", "kobold", "swamp"],
//      hp: 23,
//      exp: 5,
//      description : "These incredible beasts are almost the size of a full-grown man. They are notoriously hard to kill."
//   },
//   {
//      name : "Giant Snake",
//      icon : "snake.png",
//      groups : ["outdoor", "desert", "kobold", "swamp"],
//      hp: 19,
//      exp: 5,
//      description : "While not poisonous, the Giant Snake has been known to take down and devour very large prey, including people!"
//   },
//   {
//      name : "Wererat",
//      icon : "wererat.png",
//      groups : ["dungeon", "kobold"],
//      hp: 19,
//      exp: 6,
//      "hitSpell" : "Weakening Bite",
//      description : "An infernal subterranean pest, the bite of a Wererat has a toxin that weakens its victim."
//   },
//   {
//      name : "Swordfish",
//      icon : "swordFish.png",
//      groups : ["water"],
//      hp: 20,
//      exp: 6,
//      "hitModifier" : 1,
//      description : "Possessed and controlled by the Merfolk, these poor, everyday fish have been coerced to take up arms against all who walk on dry land."
//   }

]);