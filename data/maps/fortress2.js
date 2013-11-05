eburp.registerMap("fortress2",{
   name : "Goblin Fortress",
   map : "\
XXXXXXXXXXXXXXXXXXXXXXXXX\
XXXXX.............XXXXXXX\
XXXXX.XXXXXXXXXXX.XXXXXXX\
XXXX...XXXXXXXXX..XXXXXXX\
XX.......XXX...D.XXXXXXXX\
XXX.....XXXX...X.XXXXXXXX\
XXXXX.XXXXXX...X.....XXXX\
XXXXX.XXXXXXXXXXDXXX.XXXX\
XXXXX.XXXXXXXX....XX.XXXX\
XXXXX.XX...XXX....XX.XXXX\
XXXXX.D....XXX....XX.XXXX\
XXXXX.XX...XXX....XX.X..X\
XXXXX.XXXDXXXXXDXXXX.D..X\
XX....XXX.XXXXX.XXXXXX..X\
XX.XX.X...XXXXX.XXXXXXXXX\
XX.XXXXX.XXXX...XXXXXXXXX\
XX.XXXXXGXXXX.XXXXXXXXXXX\
X..XXXX...XXX.XXX...XXXXX\
X.XXXXX...XXX.XX.....XXXX\
X.XXXXXX.XXXX.X..p.p..XXX\
X.XXXX.....XX.G.......XXX\
XDXXXXXX.XXXXXX..p.p..XXX\
X..XXX.....XXXXX.....XXXX\
X..XXXX...XXXXXXX...XXXXX\
XXXXXXXXXXXXXXXXXXXXXXXXX\
",
   width : 25,
   height : 25,
   music : "gurkdemo7",
   dark : true,
   level : 2,
   groups : ["goblin", "default"],
   encounterChance: 40,
   combatMap: "dungeonCombat",
   features : [
      {
         type : "encounter",
         id : "goblinArchers",
         x : 16,
         y : 3,
         icon : "goblinArcher.png",
         text : "You are targeted by skilled Goblin archers!",
         gold : 7,
         creatures : [
            {"name" : "Goblin Archer"},
            {"name" : "Goblin Archer"},
            {"name" : "Goblin Warrior"},
            {"name" : "Goblin Warrior"},
            {"name" : "Goblin"},
            {"name" : "Goblin"}
         ],
         items : [
            {name : "Wand of Striking", bonus : 2}
         ]

      },
      {
         type : "encounter",
         id : "goblinPotion",
         x : 18,
         y : 20,
         icon : "chest.png",
         text : "You find here a small cache of potions.",
         ambushed : true,
         gold : 15,
         creatures : [
         ],
         items : [
            {name : "Energy Salve"},
            {name : "Healing Salve", bonus : 1}
         ]
      },
      {
         type : "sign",
         x : 8,
         y : 18,
         icon : "carpetS.png"
      },
      {
         type : "sign",
         x : 8,
         y : 19,
         icon : "carpetNS.png"
      },
      {
         type : "sign",
         x : 8,
         y : 20,
         icon : "carpetNS.png"
      },
      {
         type : "sign",
         x : 8,
         y : 21,
         icon : "carpetNS.png"
      },
      {
         type : "sign",
         x : 8,
         y : 22,
         icon : "carpetN.png"
      },
      {
         type : "encounter",
         id : "pitsKing2",
         x : 8,
         y : 23,
         icon : "goblinKing.png",
         sets : "goblinDone",
         text : "You face your enemy, the King of the Goblins! He is enormous and flanked by well-equipped soldiers.",
         gold : 23,
         creatures : [
            {"name" : "Goblin King", "bonus" : 2, "hitPoints" : 10},
            {"name" : "Goblin Archer"},
            {"name" : "Goblin Warrior"},
            {"name" : "Goblin"},
            {"name" : "Goblin Shaman"}
         ],
         items : [
            {"name" : "Leather Armor", bonus : 1},
            {"name" : "Heavy Axe"},
            {"name" : "Elvish Helm"}
         ]
      },
      {
         type : "transition",
         x : 23,
         y : 12,
         icon : "doorway.png",
         text : "Return to the lower level of the fortess?",
         target : "fortress1",
         transitionType : "down",
         targetX : 3,
         targetY : 3
      }
   ]
});