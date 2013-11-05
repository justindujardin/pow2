eburp.registerMap("tower1",{
   name : "Vygurn Tower",
   map : "\
%%%i%wwwwwwwwwwwwwwwwww\
%%%i%wwwffffffffwwwwwfw\
%%%i%wfffwwwwwwfffffwfw\
%%ii%wfwwwwwwwwwwwwfwfw\
%ii%%wfwwwwfffffffffffw\
%i%%%wfffwffwwwwwwwwwww\
%ii%%wfwfwfwwffffffffww\
%i%%%wfwfwfwwfwwwwwwfww\
%ii%%wfwfwffffwwwwwwffw\
%%iifffwfwwwwwwwfffffww\
%%%%%wwwfwwwffwwfwwwwww\
%%%%%wwwfffwffffffffffw\
%%%%%wwwfffwwwwwfwwwwww\
%%%%%wwwwfwwffwwfwfffww\
%%%%%wwwwwwwwfwwfwwwfww\
%%%%%wfffwwwwfwwfwwwfww\
%%%%%wfffffffffffffffww\
%%%%%wfffwwwwwwwwfwwwww\
%%%%%wwwwwwwwwwwwwwwwww\
",
   width : 23,
   height : 19,
   music : "gurkdemo7",
   dark : true,
   level : 5,
   groups : ["tundra", "dungeon", "default"],
   encounterChance: 35,
   combatMap: "iceMazeCombat",
   features : [
      {
         type : "transition",
         x : 4,
         y : 9,
         icon : "iceFloor.png",
         text : "Will you exit Vygurn Tower?",
         target : "wilderness",
         transitionType : "outdoor",
         targetX : 88,
         targetY : 16
      },
      {
         type : "block",
         x : 3,
         y : 9
      },
      {
         type : "encounter",
         id : "towerGuard",
         x : 8,
         y : 16,
         icon : "drowElf.png",
         text : "Drow Elves and Snow Ogres approach you. \"You will regret setting foot in this tower!\"",
         gold : 25,
         creatures : [
            {"name" : "Drow Elf", "bonus" : 1, "hitPoints" : 5},
            {"name" : "Snow Ogre", "bonus" : 1, "hitPoints" : 5},
            {"name" : "Drow Elf"},
            {"name" : "Snow Ogre"}
         ],
         items : [
            {name : "Magic Bow"}
         ]
      },
      {
         type : "transition",
         x : 7,
         y : 16,
         icon : "doorway.png",
         text : "Ascend to the second level of the tower?",
         target : "tower2",
         transitionType : "up",
         targetX : 3,
         targetY : 15
      }
   ]
});