///<reference path="../../source/core/api.ts"/>
//// Creatures
pow2.registerCreatures(1,[
   //// LEVEL 1
   {
      name : "Imp",
      icon : "imp.png",
      groups : ["dungeon", "outdoor", "kobold"],
      hp: 8,
      attackLow:1,
      attackHigh:4,
      exp: 6,
      gold: 6,
      evade:6,
      hitPercent:2,
      description : "Small but mean, the Imp can attack very quickly, doing considerable damage before an opponent can counter-attack."
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