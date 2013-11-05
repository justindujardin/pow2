eburp.registerMap("town",{
   name : "Bryerlake",
   map : "\
========================~~~\
===========!=!=========~~~~\
=======================~~~~\
==========!!=!!========~~~~\
===XXXXXXXXXDXXXXXXXXXX~~~~\
===X=!=!===X.X===!!!!!!~~~~\
===X=====!=...=====!!!!~~~~\
===X=!=!====.=======!!~~~~~\
===X=======...===!==!!~~~~~\
===X===.....p.....===!~~~~~\
===X=======...===!===~~~~~~\
===X=!=!======!!=====~~~~~~\
===X=====!==!!!!!=====~~~~~\
===X=!=!===!!~~!====!!~~~~~\
===X=====!==!~~~~===!~~~~~~\
===X=========~~=~~~~~~~~~~~\
===X!~~!======!=!!===~~~~~~\
=~~X~~~~~==~~=====!~~~~~~~~\
~~~~~~~~~~~~~~~~~~~~~~~~~~~\
~~~~~~~~~~~~~~~~~~~~~~~~~~~\
~~~~~~~~~~~~~~~~~~~~~~~~~~~\
~~~~~~~~~~~~~~~~~~~~~~~~~~~\
",
   width : 27,
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
         x : 12,
         y : 4,
         icon : "doorInWall.png",
         text : "Will you exit the safety of Bryarlake and explore the great Wildernesse?",
         target : "wilderness",
         transitionType : "outdoor",
         targetX : 16,
         targetY : 51
      },
      {
         type : "block", // This prevents passage, but unlike a barrier it doesn't react at all if the party tries to walk on this square. Always use these to block off an exit to a town or dungeon so the player doesn't get confused about where the exit is.
         x : 12,
         y : 3
      },
      {
         type : "sign",
         x : 11,
         y : 6,
         icon : "soldier.png",
         action : "TALK", // This action must be in all-caps, and it appears on the center button when the party is on this square.
         title : "Guard",
         text : "May you find glory on your noble quest!"
      },
      {
         type : "sign",
         x : 13,
         y : 6,
         icon : "soldier.png",
         action : "TALK",
         title : "Guard",
         text : "Be sure to avoid the forests at first, there are some really dangerous creatures lurking amongst the trees."
      },
      {
         type : "sign",
         x : 8,
         y : 16,
         icon : "man.png",
         action : "TALK",
         title : "Citizen",
         text : "Ever since the volcano erupted up North, things have taken an awful turn. Monsters lurk everywhere, preventing regular folk from travelling or trading."
      },
      {
         type : "temple",
         x : 15,
         y : 15,
         icon : "temple.png",
         cost : 15
      },
      {
         type : "shop",
         name : "Bryarlake Market",
         x : 6,
         y : 9,
         icon : "shop.png",
         level : 1, // This is not strict, items at neighboring levels can appear
         groups : ["default"], // Only items with this group will appear
         buyRate : 100, // The buy price of items will be item.baseValue * buyRate / 100
         sellRate : 35 // The sell price of items will be item.baseValue * sellRate / 100
      },
      {
         type : "dispatch", // This dispatches the party on a quest, if they respond "YES
         x : 18,
         y : 9,
         icon : "oldMan.png",
         altIcon : "silverKey.png", // You can specify a secondary icon to appear on the right. Usually used to show keys.
         action : "TALK",
         sets : "ruinsStart", // This variable is set if the party says "YES" only
         until : "ruinsStart", // Always use an 'until' on a dispatch, otherwise you will keep dispatching the quest.
         title : "Lord of Bryarlake",
         text : "Our sister city, Kinstown Harbor, lies in ruins. We hear that they were overrun by creatures that emerged from their sewers! Will you three brave heroes enter the city with this key and regain Kinstown from the clutches of evil?"
      },
      {
         type : "sign", // This what the party sees after they have accepted the quest but before they have completed it.
         x : 18,
         y : 9,
         icon : "oldMan.png",
         action : "TALK",
         after : "ruinsStart",
         until : "ruinsDone",
         title : "Lord of Bryarlake",
         text : "Please, liberate Kinstown Harbor so that we may rebuild her docks and resume trading by sea!"
      },
      {
         type : "dispatch", // After they complete the first quest, they are dispatched on another.
         x : 18,
         y : 9,
         icon : "oldMan.png",
         action : "TALK",
         after : "ruinsDone",
         sets : "portStart",
         until : "portStart",
         title : "Lord of Bryarlake",
         text : "Thank you, noble heroes for your brave efforts in Kinstown! We have received word that the elves of the North are in danger! Will you travel to Port Artha and meet with the Elvish Council?"
      },
      {
         type : "sign",
         x : 18,
         y : 9,
         icon : "oldMan.png",
         action : "TALK",
         after : "portStart",
         until : "portDone",
         title : "Lord of Bryarlake",
         text : "The Elves of Nothian Forest are in dire need of your bravery! Head North and visit the Elvish Council in Port Artha."
      },
      {
         type : "sign", // Once the two quests are done, they see this. It's pretty manual and easy to make mistakes. :(
         x : 18,
         y : 9,
         icon : "oldMan.png",
         action : "TALK",
         after : "portDone",
         title : "Lord of Bryarlake",
         text : "As long as the town of Bryarlake still stands, your bravery will never be forgotten!"
      },
      {
         type : "encounter", // An 'encounter' with only items/gold and no creatures is treated as treasure. So parsimonious! But also pretty lousy, sorry about that. :(
         id : "ruinsReward",
         x : 17,
         y : 9,
         icon : "chest.png",
         text : "The town has presented you with a reward for liberating Kinstown Harbor!",
         gold : 20,
         after : "ruinsDone",
         creatures : [
         ],
         items : [
         ]
      }
   ]
});