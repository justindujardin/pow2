eburp.registerMap("crypt",{
   name : "Ashvari Crypts",
   map : "\
CCCCCCCCCCCCCCCCCCCCCCCCC\
CCCC~CC~~C'CCCCCCCCCCCCCC\
CCC~~~~~'''''CCCCCCCCCCCC\
CC~~~~~~~''''CCCCCCCCCCCC\
C~~~~~~~~~~~~~C''''CCCCCC\
C~~'''~~~~~~~CC'CC'CCCCCC\
C~~''~~~~~~~~~C'C''CCCCCC\
C~~~~~~~~~~~~CC'C'CC''''C\
CC~~~~CC~~~''C''C'CC'CC'C\
CCCC~~~CC~~''C'CC'CC'C''C\
CCC~~~~~~~~'CC'CC'CC'C'CC\
CC~~~~~~CCCCCC'CC'CC'C'CC\
CCCC~~~~~~CCCC'C''CC'C'CC\
CCCCC~~~~~CCCC'C'''''C'CC\
CC~~~~C~~-''C''C''CCCC''C\
CC~CCCC~~~C'''CCCCCCCCC'C\
CCCCCCCCCCCCCCCCCCCCCCC'C\
XXXXXXXXXXXXXXXXXXXXXXXDX\
XXXXXXXXXXX..XXXX..X.X..X\
XXXXXXX..XX..XXXX..X.X.XX\
X.....G..D...XXXXXGXGXGXX\
X.XXXXX..XXXXX.X........X\
X....XXXXXXX...D........X\
XXXX..XXXXXX.X.X........X\
AAAXX.XXXXXX.XXXXXGXGXGXX\
::AAX.XXXXXX.XXXX..X.X.XX\
::::X.XXXXXX.XXXX..X.X.XX\
::::XDXX...X.XXXXXXXXXXXX\
::::G.D..p.X...XXXXXXXXXX\
::::XDXX...XXX..XXXXXXXXX\
::::X.XXXXXXXXX..XXXXXXXX\
::AAX.XXXXXXXXXX........X\
AXXXX.XX.XXXXXXXXXXXXXX.X\
XX..G.X...X.XXXXXXXXXXX.X\
XX..X.X...X.XXXXXXX..XX.X\
XXXXX.XXGXXGXX....G...X.X\
XX..G..........XXXX...X.X\
XX..XXXXXXXXXX....XXX...X\
XXXXXXXXXXXXXXXXXXXXXXXXX\
",
   width : 25,
   height : 39,
   music : "gurkdemo7",
   dark : true,
   level : 4,
   groups : ["undead", "default"],
   encounterChance: 35,
   combatMap: "dungeonCombat",
   terrain : {
      "~" : {
         level : 4,
         encounterChance: 35,
         combatMap : "shipCombat",
         groups: ["undead", "default"]
      }
   },
   features : [
      {
         type : "transition",
         x : 4,
         y : 28,
         icon : "dungeonGate.png",
         text : "Will you escape the Ashvari Crypts and return to the land of the living?",
         target : "wilderness",
         transitionType : "outdoor",
         targetX : 73,
         targetY : 57
      },
      {
         type : "block",
         x : 3,
         y : 28
      },
      {
         type : "sign",
         icon : "column.png",
         x : 3,
         y : 27
      },
      {
         type : "sign",
         icon : "column.png",
         x : 3,
         y : 29
      },
      {
         type : "encounter",
         id : "cryptsSkeletons",
         x : 8,
         y : 33,
         icon : "skeletonGuard.png",
         text : "A squadron of Skeletons attack!",
         gold : 12,
         creatures : [
            {"name" : "Skeleton Guard", "bonus" : 2},
            {"name" : "Skeleton Guard", "bonus" : 1, "hitPoints" : 5},
            {"name" : "Skeleton Guard"},
            {"name" : "Skeleton"},
            {"name" : "Skeleton"},
            {"name" : "Skeleton"},
            {"name" : "Skeleton"}
         ],
         items : [
            {name : "Spiked Shield"},
            {name : "Curing Potion"}
         ]

      },
      {
         type : "encounter",
         id : "cryptsGhoul",
         x : 19,
         y : 35,
         icon : "ghoul.png",
         text : "As you pass through the door, you are ambushed by horrific, frightening creatures!",
         ambushed : true,
         gold : 19,
         creatures : [
            {"name" : "Ghoul", "bonus" : 1, "hitPoints" : 5},
            {"name" : "Ghoul"}
         ],
         items : [
            {"name" : "Great Sword", "bonus" : 1}
         ]

      },
      {
         type : "encounter",
         id : "cryptsPhantom",
         x : 14,
         y : 22,
         icon : "phantom2.png",
         text : "Two phantasmal forms emerge, seemingly only partially present in this realm.",
         gold : 9,
         creatures : [
            {"name" : "Phantom", "bonus" : 1, "hitPoints" : 10},
            {"name" : "Phantom", "bonus" : 1, "hitPoints" : 4}
         ],
         items : [
            {"name" : "Fine Bow", "bonus" : 2}
         ]
      },
      {
         type : "ship",
         x : 8,
         y : 14,
         icon : "ship.png",
         id : "cryptsShip"
      },
      {
         type : "encounter",
         id : "cryptsWizard",
         x : 10,
         y : 2,
         icon : "skeletonWizard.png",
         text : "A Skeleton Wizard shrieks, \"With Vezu's power, we can convert the dead into an an unstoppable army against the living!\" It and its minions attack!",
         ambushed : true,
         gold : 37,
         creatures : [
            {"name" : "Skeleton Wizard", "bonus" : 1, "hitPoints" : 5},
            {"name" : "Ghoul"},
            {"name" : "Zombie"},
            {"name" : "Zombie"},
            {"name" : "Skeleton Guard"},
            {"name" : "Skeleton"}
         ],
         items : [
            {"name" : "Amulet of Thought", "bonus" : 2}
         ]
      },
      {
         type : "sign",
         x : 10,
         y : 1,
         icon : "dragonStone.png",
         title : "Tablet",
         sets : "cryptsDone",
         text : "You see here a tablet bearing a depiction of the dragon Vezu. You must inform the King that the Crypts are somehow linked to the dragon!",
         action : "LOOK"
      },
      {
         type : "barrier",
         x : 23,
         y : 17,
         icon : "lockedDoor.png",
         until : "cryptsStart",
         title : "Locked",
         text : "There is an unusual-looking, narrow door here, but is locked!"
      },
      {
         type : "alert",
         x : 23,
         y : 17,
         icon : "lockedDoor.png",
         altIcon : "ancientKey.png",
         title : "Unlocked",
         text : "You use the ancient key provided by the King to open the narrow door.",
         sets : "alertCryptsKey",
         until : "alertCryptsKey",
         after : "cryptsStart"
      }
   ]
});