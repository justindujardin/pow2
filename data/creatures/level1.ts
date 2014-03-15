///<reference path="../../lib/pow2.d.ts"/>

//// Creatures
pow2.registerCreatures(1,[
   //// LEVEL 1
   {
      name : "Snake",
      icon : "greensnake.png",
      groups : ["dungeon", "outdoor"],
      hp: 8,
      attackLow:1,
      attackHigh:4,
      exp: 6,
      gold: 6,
      evade:6,
      hitPercent:2
   },
   {
      name : "Kobold",
      icon : "kobold.png",
      groups : ["outdoor", "dungeon", "desert", "kobold"],
      hp: 16,
      attackLow:4,
      attackHigh:7,
      exp: 18,
      gold: 6,
      evade:9,
      hitPercent:4,
      description : "Thought to be the result of an unfortunate cross-breeding experiment, these dog-like men are diminutive, but hunt effectively in packs."
   }
]);