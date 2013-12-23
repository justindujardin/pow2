eburp.registerMap("keep",{
   name : "Rogaard Keep",
   map : "\
XXXXXXXXXXXXXXXXXXXXXXX\
X...XXXXXX...XXXXXX...X\
X...XXXXXX...XXXXXX...X\
X...XXXXXL...LXXXXX...X\
XXDXX.............XXDXX\
XX.XX.....L.L.....XX.XX\
XX.XX.............XX.XX\
XX.XX.............XX.XX\
XX.......p...p.......XX\
XX.XX.............XX.XX\
XX.XX....p...p....XX.XX\
XX.XX.............XX.XX\
XX.XX.............XX.XX\
XX.XXXXXXXXGXXXXXXXX.XX\
XX.X.....D...D.....X.XX\
XX.X....XXX.XXX....X.XX\
XXDXXXXXXXX.XXXXXXXXDXX\
X...XiiiXSXGXSXiiiX...X\
X...XiiiXSiiiSXiiiX...X\
X...XiiiiiSiSiiiiiX...X\
XXXXXiiiiiiiiiiiiiXXXXX\
iiiiiiiiiSiiiSiiiiiiiii\
iiiiiiiiiiiiiiiiiiiiiii\
",
   width : 23,
   height : 23,
   music : "gurkdemo9",
   dark : true,
   level : 1,
   groups : ["default"],
   encounterChance: 0,
   combatMap: "outdoorCombat",
   features : [
      {
         type : "transition",
         x : 11,
         y : 17,
         icon : "dungeonGate.png",
         text : "Will you exit Rogaard Keep and return to the Warvish Tundralands?",
         target : "wilderness",
         transitionType : "outdoor",
         targetX : 76,
         targetY : 7
      },
      {
         type : "block",
         x : 11,
         y : 18
      },
      {
         type : "barrier",
         x : 11,
         y : 14,
         icon : "dwarfGuard.png",
         title : "Guard",
         text : "During times of war, the Keep is off duty to all but those with Royal Decree!",
         until : "keepStart"
      },
      {
         type : "alert",
         x : 11,
         y : 14,
         icon : "dwarfGuard.png",
         altIcon : "sigil.png",
         title : "Guard",
         text : "I see you carry the sigil of the Southern King. Enter and speak your business with the Grand Chieftain of the Warvish Tribes!",
         after : "keepStart",
         sets : "keepDone",
         until : "keepDone"
      },
      {
         type : "sign",
         x : 11,
         y : 14,
         icon : "dwarfGuard.png",
         title : "Guard",
         text : "Fare thee well, travellers.",
         after : "alertKeepSigil"
      },
      {
         type : "dispatch",
         x : 11,
         y : 1,
         icon : "dwarfKing.png",
         altIcon : "prism.png",
         action : "TALK",
         sets : "towerStart",
         until : "towerStart",
         title : "Chieftain",
         text : "So our worst fears have been realized... for Vezu to be stopped, the barricade must be broken. Wielding this prism at the top of the Vygurn Tower could break Vezu's barricade, but the Magi worship Vezu, and welcome his return. Will you defeat the Magi and break the barricade?"
      },
      {
         type : "sign",
         x : 11,
         y : 1,
         icon : "dwarfKing.png",
         action : "TALK",
         after : "towerStart",
         until : "towerDone",
         title : "Chieftain",
         text : "Travel East across the Tundralands to reach the Vygurn, the infamous Tower of the Magi. The fate of the Three Kingdoms depends on it!"
      },
      {
         type : "dispatch",
         x : 11,
         y : 1,
         icon : "dwarfKing.png",
         action : "TALK",
         after : "towerDone",
         sets : "vezuStart",
         until : "vezuStart",
         title : "Chieftain",
         text : "With the Magi defeated and the barricade broken, there is a chance that Vezu could be defeated. Will you face your destiny at Mount Vezu and fight the dragon?"
      },
      {
         type : "sign",
         x : 11,
         y : 1,
         icon : "dwarfKing.png",
         action : "TALK",
         after : "vezuStart",
         until : "gameOver",
         title : "Chieftain",
         text : "Travel North by ship to Mount Vezu, the fates of the Warvish peoples are in your hands!"
      },
      {
         type : "sign",
         x : 11,
         y : 1,
         icon : "dwarfKing.png",
         action : "TALK",
         after : "gameOver",
         title : "Chieftain",
         text : "The peoples of the Three Kingdoms shall sing songs of your victory until the end of time!"
      },
      {
         type : "sign",
         x : 10,
         y : 11,
         icon : "dwarf2.png",
         until : "towerStart",
         text : "Vezu must be defeated, yet he has barricaded himself until his strength reaches its peak. We must find a way to break that barricade before he sallies forth on his on accord...",
         title : "Dwarf Elder",
         action : "TALK"
      },
      {
         type : "sign",
         x : 10,
         y : 11,
         icon : "dwarf2.png",
         after : "towerStart",
         text : "May fortune favor you, brave adventurers!",
         title : "Dwarf Elder",
         action : "TALK"
      },
      {
         type : "encounter",
         id : "towerReward",
         x : 11,
         y : 2,
         icon : "chest.png",
         text : "The Warvish citizenry have gathered together their wealth to support you in your great quest to defeat Vezu!",
         gold : 110,
         after : "towerDone",
         creatures : [
         ],
         items : [
         ]
      },
      {
         type : "store",
         name : "Dwarven Armors",
         x : 7,
         y : 6,
         icon : "shop.png",
         level : 4,
         groups : ["armor"],
         buyRate : 125,
         sellRate : 28
      },
      {
         type : "store",
         name : "Dwarven Arms",
         x : 15,
         y : 6,
         icon : "shop.png",
         level : 4,
         groups : ["weapon"],
         buyRate : 125,
         sellRate : 28
      },
      {
         type : "store",
         name : "Warvian Antiquities",
         x : 7,
         y : 10,
         icon : "shop.png",
         level : 4,
         groups : ["misc"],
         buyRate : 125,
         sellRate : 25
      },
      {
         type : "store",
         name : "Potions and Elixirs",
         x : 15,
         y : 10,
         icon : "shop.png",
         level : 4,
         groups : ["potion"],
         buyRate : 115,
         sellRate : 22
      }
   ]
});