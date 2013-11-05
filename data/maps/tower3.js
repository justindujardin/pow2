eburp.registerMap("tower3",{
   name : "Vygurn Tower",
   map : "\
wwwwwwwwwww\
wfffffwwffw\
wwfwwfwwfww\
wwfwwfffffw\
wwffwwwwwfw\
wwwwwwwwwfw\
wwwwwwwfffw\
wfffwfwwfww\
wffffffffww\
wfffwfwwffw\
wwwwwwwwwww\
",
   width : 11,
   height : 11,
   music : "gurkdemo7",
   dark : true,
   level : 5,
   groups : ["tundra", "dungeon", "default"],
   encounterChance: 35,
   combatMap: "iceMazeCombat",
   features : [
      {
         type : "transition",
         x : 1,
         y : 1,
         icon : "doorway.png",
         text : "Descend to the second level of the tower?",
         target : "tower2",
         transitionType : "down",
         targetX : 1,
         targetY : 5
      },
      {
         type : "encounter",
         id : "towerMagi",
         x : 5,
         y : 8,
         icon : "iceMage.png",
         text : "A group of Ice Magi block your passage! \"The power in the chamber beyond is no match for your feeble minds!\" They attack!",
         gold : 47,
         creatures : [
            {"name" : "Ice Magus", "bonus" : 1, "hitPoints" : 5},
            {"name" : "Ice Magus"},
            {"name" : "Ice Magus"}
         ],
         items : [
            {name : "Magic Staff", bonus : 1},
            {name : "Energy Potion", bonus : 2}
         ]
      },
      {
         type : "sign",
         x : 2,
         y : 8,
         icon : "plaque.png",
         until : "towerStart",
         text : "You have a complete view of the Tundralands below, as the sun shines in through the ice walls of the tower. There is a podium of some sort here, but you aren't sure what to do!",
         title : "Podium",
         action : "LOOK"
      },
      {
         type : "sign",
         x : 2,
         y : 8,
         icon : "plaque.png",
         altIcon : "prism.png",
         after : "towerStart",
         sets : "towerDone",
         until : "towerDone",
         text : "You place the prism on the podium and there is a sudden, massive discharge of energy, destroying both the prism and the podium! Has the barricade in the North been broken?",
         title : "Podium",
         action : "PRISM"
      }
   ]
});