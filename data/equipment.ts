///<reference path="../source/core/api.ts"/>

pow2.registerWeapons(1,[
   //// Level 1
   {
      name : "Crude Club",
      icon : "club.png",
      groups : ["default", "weapon"],
      usedBy : ["warrior"],
      attack:5,
      hit:10,
      cost:10
   },
   {
      name : "Sling",
      icon : "sling.png",
      groups : ["default", "weapon"],
      usedBy : ["archer"],
      attack:5,
      hit:10,
      cost:5
   },
   {
      name : "Short Sword",
      icon : "shortSword.png",
      groups : ["default", "weapon"],
      usedBy : ["warrior"],
      attack:9,
      hit:5,
      cost:50
   },
   {
      name : "Goblin Scimitar",
      icon : "scimitar.png",
      groups : ["goblin", "kobold","weapon"],
      usedBy : ["archer"],
      attack:10,
      hit:10,
      cost:150
   },
   {
      name : "Short Bow",
      icon : "shortBow2.png",
      groups : ["default", "weapon"],
      usedBy : ["archer"],
      attack:7,
      hit:10,
      cost:20
   },
   {
      name : "Goblin Crossbow",
      icon : "crossbow3.png",
      groups : ["goblin", "kobold", "weapon"],
      attack:13,
      hit:5,
      cost:100
   },
   {
      name : "Short Staff",
      icon : "shortStaff.png",
      groups : ["default", "weapon"],
      usedBy : ["mage"],
      attack:6,
      hit:0,
      cost:30
   }
]);

pow2.registerArmor(1,[
   {
      name : "Leather Armor",
      type : "armor",
      icon : "leatherArmor.png",
      groups : ["default", "armor"],
      usedBy : ["warrior", "archer"],
      defense:5,
      evade:-1,
      cost:70
   },
   {
      name : "Cloak",
      type : "armor",
      icon : "cloak.png",
      groups : ["default", "armor"],
      usedBy : ["mage"],
      defense:1,
      evade:-2,
      cost:10
   },
   {
      name : "Leather Shield",
      type : "shield",
      icon : "leatherShield.png",
      groups : ["default", "armor"],
      usedBy : ["warrior"],
      defense:2,
      evade:0,
      cost:40
   },
   {
      name : "Leather Helm",
      type : "hat",
      icon : "leatherHelm.png",
      groups : ["default", "armor"],
      usedBy : ["warrior", "archer"],
      defense:1,
      evade:-1,
      cost:20
   },
   {
      name : "Leather Boots",
      type : "boots",
      icon : "leatherBoots2.png",
      groups : ["default", "armor"],
      usedBy : ["warrior", "archer", "mage"],
      defense:1,
      evade:-1,
      cost:20
   }
]);