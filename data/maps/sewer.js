eburp.registerMap("sewer",{
   name : "Kinstown Sewers",
   map : "\
XXXXXXXXXXXXXXXXXXXXXXX\
XXXXXXXXXXXXXXXXXXXX..X\
XXXX....XXXXXXXRRRRR.XX\
XXXX....XXXXXXXRXXXX.XX\
XXXX....XXXXXXXRXX...XX\
XXXX....XXXXX.RRR.....X\
XXXXXDXXXXXXX.RRR..XX.X\
XXXXX.XXXXXXX.RRR.XXX.X\
XXXXX.XXXXXXX..RR.XXX.X\
XXXXX.XX.......R..XXX.X\
XXXXX......XX..RXXXXX.X\
XXXXXXXX...XXXXRXXXXX.X\
XXXXXXXX...XXXRRXXX...X\
XXXXXXXX...XXRRRXXX.XXX\
XXXXXXXX...XXRXXXXX..XX\
XXX...D......RXXXXX..XX\
XXX...XXXXXX.RXXX....XX\
XXX...XXXXXX.RXXX.XX.XX\
XXXDXXXXXXXX.RXXX.XX.XX\
XXX.XXXXXXXX.RXXX.XX.XX\
XXX.XXX..XXX.-....XX.XX\
XXX.XXX.XXXXXRXXXXXX.XX\
XXX.XXX.XXXXXRXXXXXX.XX\
XXX.XXX.XXXXXRXXXXXX.XX\
XXX.XXX......RXXXXXX.XX\
XXX..........RXXXXXX.XX\
XXXXXXX......RXXXXXX.XX\
XXXXXXX......RXXXXXX.XX\
XXXXXXXXXXDXXRXXXXXX.XX\
XXRRRRRRXX.XXRXXXXXX.XX\
XXXRRRRRRX.XXRXXXXXXDXX\
XRRRRRRRRX.XXRXXL....XX\
XXRXXRRRRR|RRRXX.....XX\
XRRX..RRR...RRXX.....XX\
XXRX..---...XRRX.....XX\
XRRX..RRR..XXRRXL...LXX\
XXRXXRRRRXXXXXXXXXXXXXX\
XRRRRRRRRXXXXXXXXXXXXXX\
XXXRRRRRRXXXXXXXXXXXXXX\
XXRRRRRRXXXXXXXXXXXXXXX\
XXXXXXXXXXXXXXXXXXXXXXX\
",
   width : 23,
   height : 41,
   music : "gurkdemo7",
   dark : true,
   level : 1,
   groups : ["kobold", "default"],
   encounterChance: 40,
   combatMap: "dungeonCombat",
   features : [
      {
         type : "transition",
         x : 21,
         y : 1,
         icon : "doorway.png",
         text : "Escape the sewers and return to the ruins above?",
         target : "ruins",
         transitionType : "town",
         targetX : 14,
         targetY : 9
      },
      {
         type : "encounter",
         id : "sewerEntrance",
         x : 20,
         y : 4,
         icon : "wererat.png",
         text : "The sewers are inhabited by Wererats! They attack!",
         ambushed : true,
         gold : 4,
         creatures : [
            {"name" : "Wererat", "bonus" : 1},
            {"name" : "Wererat"},
            {"name" : "Wererat"}
         ],
         items : [
            {"name" : "Leather Helm"}
         ]

      },
      {
         type : "encounter",
         id : "sewerKobolds",
         x : 18,
         y : 33,
         icon : "koboldSwordsman.png",
         text : "You are confronted by a pack of Kobolds!",
         gold : 6,
         creatures : [
            {"name" : "Kobold Fighter"},
            {"name" : "Kobold", "bonus" : 1},
            {"name" : "Kobold", "bonus" : 1},
            {"name" : "Kobold Fighter"}
         ],
         items : [
            {"name" : "Energy Salve"}
         ]
      },
      {
         type : "encounter",
         id : "sewerSpiders",
         x : 7,
         y : 25,
         icon : "greenSpider.png",
         text : "Enormous spiders drop from the ceiling and attack!",
         ambushed : true,
         gold : 1,
         creatures : [
            {"name" : "Giant Spider", "bonus" : 1},
            {"name" : "Giant Spider"},
            {"name" : "Giant Spider"},
            {"name" : "Giant Spider"}
         ],
         items : [
            {"name" : "Leather Armor"}
         ]
      },
      {
         type : "encounter",
         id : "caveTalisman",
         x : 7,
         y : 2,
         icon : "impTalisman.png",
         text : "You discover here an unusual little statue.",
         gold : 0,
         creatures : [
         ],
         items : [
            {"name" : "Imp Talisman", "bonus" : 1}
         ]
      },
      {
         type : "encounter",
         id : "sewerKoboldElite",
         x : 4,
         y : 34,
         icon : "koboldShaman.png",
         text : "At long last, you find the source of the evil in Kinstown. Surrounded by roiling sewage water, you see a make-shift Kobold throne room! A shamanistic Kobold points at you and howls!",
         gold : 12,
         sets : "ruinsDone",
         creatures : [
            {"name" : "Kobold"},
            {"name" : "Kobold"},
            {"name" : "Kobold"},
            {"name" : "Kobold"},
            {"name" : "Kobold Fighter"},
            {"name" : "Kobold Fighter"},
            {"name" : "Kobold Mystic", "bonus" : 2, "hitPoints" : 12}
         ],
         items : [
            {"name" : "Healing Salve", "bonus" : 1}, // You can specify bonuses on items, too. Here we have a 'Healing Salve +1'
            {"name" : "Long Oak Staff"}
         ]

      }
   ]
});