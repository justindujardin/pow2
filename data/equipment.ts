///<reference path="../lib/pow2.game.d.ts"/>

pow2.registerWeapons(1,[
   //// Level 1
   {
      name : "Crude Club",
      icon : "club.png",
      groups : ["default", "weapon"],
      usedBy : ["warrior"],
      attack:5,
      hit:10,
      cost:25
   },
   {
      name : "Sling",
      icon : "sling.png",
      groups : ["default", "weapon"],
      usedBy : ["archer"],
      attack:5,
      hit:10,
      cost:25
   },
   {
      name : "Short Sword",
      icon : "shortSword.png",
      groups : ["default", "weapon"],
      usedBy : ["warrior"],
      attack:9,
      hit:5,
      cost:150
   },
   {
      name : "Short Staff",
      icon : "shortStaff.png",
      groups : ["default", "weapon"],
      usedBy : ["mage"],
      attack:2,
      hit:0,
      cost:25
   }
//   {
//      name : "Goblin Scimitar",
//      icon : "scimitar.png",
//      groups : ["goblin", "kobold","weapon"],
//      usedBy : ["archer"],
//      attack:10,
//      hit:10,
//      cost:150
//   },
//   {
//      name : "Short Bow",
//      icon : "shortBow2.png",
//      groups : ["default", "weapon"],
//      usedBy : ["archer"],
//      attack:7,
//      hit:10,
//      cost:20
//   },
//   {
//      name : "Goblin Crossbow",
//      icon : "crossbow3.png",
//      groups : ["goblin", "kobold", "weapon"],
//      attack:13,
//      hit:5,
//      cost:100
//   }
]);

pow2.registerArmor(1,[
   {
      name : "Clothes",
      type : "body",
      icon : "clothes.png",
      groups : ["default", "armor"],
      defense:1,
      evade:-2,
      cost:10
   },
   {
      name : "Leather Armor",
      type : "body",
      icon : "leatherArmor.png",
      groups : ["default", "armor"],
      usedBy : [
         pow2.HeroType.Warrior,
         pow2.HeroType.Ranger
      ],
      defense:4,
      evade:-8,
      cost:50
   },
   {
      name : "Cloak",
      type : "body",
      icon : "cloak.png",
      groups : ["default", "armor"],
      usedBy : [
         pow2.HeroType.DeathMage,
         pow2.HeroType.LifeMage
      ],
      defense:1,
      evade:-2,
      cost:10
   },
   {
      name : "Leather Shield",
      type : "arms",
      icon : "leatherShield.png",
      groups : ["default", "armor"],
      usedBy : [
         pow2.HeroType.Warrior
      ],
      defense:2,
      evade:-2,
      cost:40
   },
   {
      name : "Leather Helm",
      type : "head",
      icon : "leatherHelm.png",
      groups : ["default", "armor"],
      usedBy : [
         pow2.HeroType.Warrior,
         pow2.HeroType.Ranger
      ],
      defense:1,
      evade:-1,
      cost:20
   },
   {
      name : "Leather Boots",
      type : "feet",
      icon : "leatherBoots2.png",
      groups : ["default", "armor"],
      usedBy : [
         pow2.HeroType.Warrior,
         pow2.HeroType.Ranger
      ],
      defense:1,
      evade:-1,
      cost:20
   }
]);