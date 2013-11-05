eburp.registerMap("port",{
   name : "Port Artha",
   map : "\
~~~~~~~!~~!!!!!!!!!===!!!!!!!\
~~~~~~~!~!!!!!!!!!!===!!!!!!!\
~~~~!!~~~!!!!!!!!!!!=!!!!!!!!\
~~~~~~~~!!!!!!!!!!!!=!!!!!!!!\
~~~~~~~~XXXXXXXXXXXXDXXXXX!!!\
~~~~~!~!!!!!!!!!!!X!.!X!!X!!!\
~~~~~~~!!!!!!!!!!!X=.=X!!X!!!\
~~~!=~!!!!!!!!!!!!X!.!X!!X!!!\
~~~~~~======!!!!!!XX.XX!!X!!!\
~~~~--=======!!!!!==.==!!X!!!\
~~~~~~==!.!=!=!!!!!=.=!!!X!!!\
~~~~--...............=!!!X!!!\
~~~~~~==!=!=!=!=!!!===!!!X!!!\
~~~~--=======!!=!!!!!!!!!X!!!\
~~~~~~======!!!=!!!!!!!!!X!!!\
~~~~~!!!!!!!!!!=!!!!!!!!!X!!!\
~~~~~!!!!!!!!!===!!~|~!!!X!!!\
~~~~~!!!!!!!!!===!~~=~~!!X!!!\
~~~~XXXXXXXXXXXXXXXXXXXXXX!!!\
~~~~!!!!!!!!!!!!!!!!!!!!!!!!!\
~~~~!!!!!!!!!!!!!!!!!!!!!!!!!\
~~~~!!!!!!!!!!!!!!!!!!!!!!!!!\
",
   width : 29,
   height : 22,
   music : "gurkdemo9",
   dark : false,
   level : 1,
   groups : ["default"],
   encounterChance: 0,
   combatMap: "outdoorCombat",
   features : [
      {
         type : "transition",
         x : 20,
         y : 4,
         icon : "doorway.png",
         text : "Exit Port Artha and return to the Nothian Forest?",
         target : "wilderness",
         transitionType : "outdoor",
         targetX : 10,
         targetY : 24
      },
      {
         type : "block",
         x : 20,
         y : 3
      },
      {
         type : "sign",
         x : 19,
         y : 6,
         icon : "gnome3.png",
         action : "TALK",
         title : "Elvish Guard",
         text : "Welcome, travellers from the South."
      },
      {
         type : "sign",
         x : 21,
         y : 6,
         icon : "gnome3.png",
         action : "TALK",
         title : "Elvish Guard",
         text : "May your stay in Port Artha be peaceful and restful, despite the difficulty of these times."
      },
      {
         type : "sign",
         x : 7,
         y : 14,
         icon : "gnome.png",
         action : "TALK",
         title : "Elf",
         text : "We once sailed dozens of boats from this port. We traded with our kin, the Merfolk. But they have since become distrustful and aggressive, attacking all vessels that sail the Wandering Sea."
      },
      {
         type : "shop",
         name : "Nothian Wares",
         x : 9,
         y : 9,
         icon : "shop.png",
         level : 2,
         groups : ["default"],
         buyRate : 120,
         sellRate : 25
      },
      {
         type : "sign",
         x : 16,
         y : 17,
         icon : "gnome2.png",
         action : "TALK",
         until : "goblinDone",
         title : "Elvish Elder",
         text : "We are struggling under the weight of endless Goblin assaults! It is believed that a powerful and ambitious Goblin King in the Eastern edge of the forest is behind the attacks."
      },
      {
         type : "sign",
         x : 16,
         y : 17,
         icon : "gnome2.png",
         action : "TALK",
         after : "goblinDone",
         title : "Elvish Elder",
         text : "Tales of your heroism will be sung by the Elvish people for all of eternity! Now sail the Wandering Sea and discover if even greater deeds await you."
      },
      {
         type : "dispatch",
         x : 15,
         y : 17,
         icon : "gnomeKing.png",
         altIcon : "goldKey.png",
         action : "TALK",
         sets : ["portDone", "goblinStart"],
         until : "goblinStart",
         title : "Elvish Councillor",
         text : "Welcome, heroes of Bryarlake. The Goblin King in the fortress in the eastern edge of the forest must be stopped! Will you take this key, sneak into the fortress, and defeat the king?"
      },
      {
         type : "sign",
         x : 15,
         y : 17,
         icon : "gnomeKing.png",
         action : "TALK",
         after : "goblinStart",
         until : "goblinDone",
         title : "Elvish Councillor",
         text : "Please make haste to defeat the Goblin King in his fortress at the eastern extent of Nothian Forest!"
      },
      {
         type : "dispatch",
         x : 15,
         y : 17,
         icon : "gnomeKing.png",
         altIcon : "rolledScroll.png",
         action : "TALK",
         after : "goblinDone",
         sets : "castleStart",
         until : "castleStart",
         title : "Elvish Councillor",
         text : "Your brave acts are enough for many lifetimes, yet we urge you to take this scroll by sea to the Great Suvian Desert, where the proud people of Castle Bashgar are in great danger. A boat is prepared for you outside the city, will you go?"
      },
      {
         type : "sign",
         x : 15,
         y : 17,
         icon : "gnomeKing.png",
         action : "TALK",
         after : "castleStart",
         until : "castleDone",
         title : "Elvish Councillor",
         text : "Travel by sea South, then East until you arrive at the desert. The wondrous Castle Bashgar is located at the Eastern edge of the Suvian Kingdom."
      },
      {
         type : "sign",
         x : 15,
         y : 17,
         icon : "gnomeKing.png",
         action : "TALK",
         after : "castleDone",
         title : "Elvish Councillor",
         text : "You are and always will remain a friend of the Elvish peoples."
      },
      {
         type : "encounter",
         id : "goblinReward",
         x : 15,
         y : 16,
         icon : "chest.png",
         text : "The elves reward you for your defeat of the Goblin King!",
         gold : 35,
         after : "goblinDone",
         creatures : [
         ],
         items : [
         ]
      },
      {
         type : "temple",
         x : 20,
         y : 17,
         icon : "temple.png",
         cost : 20
      }
   ]
});