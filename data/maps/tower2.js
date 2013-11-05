eburp.registerMap("tower2",{
   name : "Vygurn Tower",
   map : "\
wwwwwwwwwwwwwwwwwww\
wfffffwwwwwwwfffffw\
wwwfffwwwwwwwfffffw\
wfffffffwfwfffffffw\
wwwfffwfwfwfwfffffw\
wfffffwfwfwfwfffffw\
wwwwwwwfwfwfwwwfwww\
wwwwwwwfwfwfwwwfwww\
wwwwwwwfwfwfwwwfwww\
wwwwwwwfffffwwwfwww\
wwwwwwwwwfwwwwwfwww\
wwwwwwwwwfwwwwwfwww\
wwwwwwwwwfwwwwwfwww\
wfffffwwwwwwwfffffw\
wfffffwwwwwwwfffffw\
wfffffffffffffffffw\
wfffffwwwwwwwfffffw\
wfffffwwwwwwwfffffw\
wwwwwwwwwwwwwwwwwww\
",
   width : 19,
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
         x : 3,
         y : 15,
         icon : "doorway.png",
         text : "Return to the first level of the tower?",
         target : "tower1",
         transitionType : "down",
         targetX : 7,
         targetY : 16
      },
      {
         type : "encounter",
         id : "towerGolem",
         x : 9,
         y : 9,
         icon : "iceGolem.png",
         text : "Two handlers release the bonds on a hulking monstrosity made entirely of ice! It lurches towards you!",
         gold : 8,
         creatures : [
            {"name" : "Ice Golem", "bonus" : 1, "hitPoints" : 5},
            {"name" : "Blue Goblin"},
            {"name" : "Blue Goblin"}
         ],
         items : [
            {name : "Amulet of Might", bonus : 1}
         ]
      },
      {
         type : "encounter",
         id : "towerTrolls",
         x : 5,
         y : 3,
         icon : "iceTroll.png",
         text : "You are set upon by a group of trolls!",
         ambushed : true,
         gold : 8,
         creatures : [
            {"name" : "Ice Troll", "bonus" : 1, "hitPoints" : 5},
            {"name" : "Ice Troll"},
            {"name" : "Two-headed Troll"},
            {"name" : "Troll"},
            {"name" : "Troll"}
         ],
         items : [
            {name : "Magic Sword"}
         ]
      },
      {
         type : "alert",
         x : 9,
         y : 3,
         title : "Bag of Holding",
         sets : "bagOfHolding",
         until : "bagOfHolding",
         icon : "bag.png",
         "text" : "You have found the Bag of Holding! You can now store an additional 15 items in the bag."
      },
      {
         type : "transition",
         x : 1,
         y : 5,
         icon : "doorway.png",
         text : "Climb to the top level of the tower?",
         target : "tower3",
         transitionType : "up",
         targetX : 1,
         targetY : 1
      }
   ]
});