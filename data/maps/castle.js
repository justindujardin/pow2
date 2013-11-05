eburp.registerMap("castle",{
   name : "Castle Bashgar",
   map : "\
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\
XTTT:TTTXX...XL...LX...XX:::::::X\
XTT:::TTX....D.....D....X:::::::X\
XT::.::TXX...Xp...pX...XX:::.:::X\
XTTT.TTTTXXXDXXp.pXXDXXX:::...::X\
XTT:.:TTTXX...X...X...XX::::.:::X\
XTT:.:::TTXX..XXGXX..XX:::::.:::X\
XTT...:TT:TXXXXX.XXXXX:T:T:...::X\
XTT........D.........D........:TX\
XTT...:TT:TXXXXX.XXXXX:T:T:...::X\
XTTTTT:::::XXXXL.LXXXX::::::::::X\
XTTT:TTTTT:XXXXXGXXXXX::::::T::TX\
XXXXXXXXXXXXXXTT:TTXXXXXXXXXXXXXX\
:::::::::::::T:::::T:::::::::::::\
:::::::::::::::T:T:::::::::::::::\
:::::::::::::::T:T:::::::::::::::\
:::::::::::::::T:T:::::::::::::::\
",
   width : 33,
   height : 17,
   music : "gurkdemo9",
   dark : true,
   level : 1,
   groups : ["default"],
   encounterChance: 0,
   combatMap: "outdoorCombat",
   features : [
      {
         type : "transition",
         x : 16,
         y : 11,
         icon : "dungeonGate.png",
         text : "Pass through the gates of Castle Bashgar and return to the Great Suvian Desert?",
         target : "wilderness",
         transitionType : "outdoor",
         targetX : 76,
         targetY : 61
      },
      {
         type : "block",
         x : 16,
         y : 12
      },
      {
         type : "barrier",
         x : 16,
         y : 9,
         icon : "guard2.png",
         title : "Guard",
         text : "The Castle is closed to all but heroes of the Three Kingdoms! Prove yourself elsewhere before demanding an audience of the Suvian King!",
         until : "goblinDone"
      },
      {
         type : "sign",
         x : 15,
         y : 5,
         icon : "tarrSoldier.png",
         title : "Guard",
         text : "Welcome to the royal court of the King in the South!",
         action : "TALK"
      },
      {
         type : "sign",
         x : 17,
         y : 5,
         icon : "tarrSoldier.png",
         title : "Guard",
         text : "Welcome, Westerners! Be sure to visit our great shops to purchase equipment and supplies for your travels.",
         action : "TALK"
      },
      {
         type : "sign",
         x : 16,
         y : 1,
         icon : "emperor.png",
         altIcon : "rolledScroll.png",
         action : "TALK",
         sets : "castleDone",
         until : "cryptsStart",
         title : "King",
         text : "This scroll carries foul tidings... if the Elves are right, then our sacred Ashvari Crypts have been overrun with evil magic. Talk to my viceroy, he will provide you with the key to the Crypts."
      },
      {
         type : "sign",
         x : 16,
         y : 1,
         icon : "emperor.png",
         action : "TALK",
         after : "cryptsStart",
         until : "cryptsDone",
         title : "King",
         text : "The evil unleashed by that volcano in the North is spreading throughout the Three Kingdoms... I fear the worst for my people."
      },
      {
         type : "dispatch",
         x : 16,
         y : 1,
         icon : "emperor.png",
         altIcon : "sigil.png",
         action : "TALK",
         after : "cryptsDone",
         until : "keepStart",
         sets : "keepStart",
         title : "King",
         text : "We would feast for weeks in celebration of your victory, but you must warn the Dwarves in the Tundralands that Vezu has returned. Take this Sigil to Rogaard Keep so they know you have my blessing. Will you go?"
      },
      {
         type : "sign",
         x : 16,
         y : 1,
         icon : "emperor.png",
         action : "TALK",
         after : "keepStart",
         until : "keepDone",
         title : "King",
         text : "Please visit the Dwarves at Rogaard Keep at once! The Chieftan must be informed that Vezu seeks domination of our realm."
      },
      {
         type : "sign",
         x : 16,
         y : 1,
         icon : "emperor.png",
         action : "TALK",
         after : "keepDone",
         title : "King",
         text : "May your travels be blessed and fruitful, heroes of the realm."
      },
      {
         type : "sign",
         x : 15,
         y : 1,
         icon : "oolanMaster.png",
         until : "castleDone",
         text : "Welcome, brave heroes! We have been expecting you.",
         title : "Suvian Viceroy",
         action : "TALK"
      },
      {
         type : "dispatch",
         x : 15,
         y : 1,
         icon : "oolanMaster.png",
         altIcon : "ancientKey.png",
         after : "castleDone",
         sets : "cryptsStart",
         until : "cryptsStart",
         text : "We fear that the peace of the dead has been disturbed in the crypts. Take this key and be wary of black magic! Will you explore the crypts?",
         title : "Suvian Viceroy",
         action : "TALK"
      },
      {
         type : "sign",
         x : 15,
         y : 1,
         icon : "oolanMaster.png",
         after : "cryptsStart",
         until : "cryptsDone",
         text : "Travel North to the Crypts with haste, lest our ancestors souls be forever damned!",
         title : "Suvian Viceory",
         action : "TALK"
      },
      {
         type : "sign",
         x : 15,
         y : 1,
         icon : "oolanMaster.png",
         after : "cryptsDone",
         text : "The Desert Peoples bestow upon you one thousand and one thanks for your bravery in the Crypts!",
         title : "Suvian Viceory",
         action : "TALK"
      },
      {
         type : "encounter",
         id : "cryptsReward",
         x : 16,
         y : 2,
         icon : "chest.png",
         text : "The King has rewarded you for your victory in the Crypts!",
         gold : 65,
         after : "cryptsDone",
         creatures : [
         ],
         items : [
         ]
      },
      {
         type : "sign",
         x : 3,
         y : 9,
         icon : "tarrMan2.png",
         title : "Citizen",
         text : "Since the volcano erupted in the North, the world has become increasingly evil and dangerous. Only the most stalwart adventurers can safely travel beyond the castle walls.",
         action : "TALK"
      },
      {
         type : "shop",
         name : "Suvian Armors",
         x : 30,
         y : 4,
         icon : "shop.png",
         level : 3,
         groups : ["armor"],
         buyRate : 120,
         sellRate : 30
      },
      {
         type : "shop",
         name : "Suvian Arms",
         x : 26,
         y : 4,
         icon : "shop.png",
         level : 3,
         groups : ["weapon"],
         buyRate : 120,
         sellRate : 30
      },
      {
         type : "shop",
         name : "Suvian Artifacts",
         x : 28,
         y : 2,
         icon : "shop.png",
         level : 3,
         groups : ["misc"],
         buyRate : 120,
         sellRate : 20
      },
      {
         type : "shop",
         name : "Ashvari Apothecary",
         x : 4,
         y : 8,
         icon : "shop.png",
         level : 3,
         groups : ["potion"],
         buyRate : 120,
         sellRate : 22
      },
      {
         type : "temple",
         x : 4,
         y : 2,
         icon : "temple.png",
         cost : 40
      },
      {
         type : "sign",
         x : 28,
         y : 8,
         icon : "well.png"
      },
      {
         type : "sign",
         x : 16,
         y : 6,
         icon : "blueBannerDoor.png"
      }
   ]
});