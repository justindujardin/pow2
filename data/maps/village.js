eburp.registerMap("village",{
   name : "Moorhaven",
   map : "\
MMMMMMM~~~~~~~\
MMMMMMM~~~~~~~\
MMMMMMMM~~~~~~\
MMMMMMMMMM~~~~\
MMMMMMM!!M~~~~\
MMMMMM!!!!~~~~\
MMMMM!!==~~~~~\
MMMMM====~~~~~\
MMMMM===~~~~~~\
MMMMM===~~~~~~\
MMMM====~~~~~~\
MMMMM===~~~~~~\
MMMMM==!~~~~~~\
MMMMM!!=~~~~~~\
MMMM!!=!!~~~~~\
MMMMM!!!~~~~~~\
MMMMMM!MM~~~~~\
MMM~MMMM~~~~~~\
MMM~~~M~~~~~~~\
M~~~~~~~~~~~~~\
MM~~~~~~~~~~~~\
",
   width : 14,
   height : 21,
   music : "gurkdemo9",
   dark : false,
   level : 1,
   groups : ["default"],
   encounterChance: 0,
   combatMap: "outdoorCombat",
   features : [
      {
         type : "transition",
         x : 4,
         y : 10,
         icon : "doorway.png",
         text : "Climb down the steep path back to the Wildernesse?",
         target : "wilderness",
         transitionType : "outdoor",
         targetX : 31,
         targetY : 27
      },
      {
         type : "sign",
         x : 8,
         y : 7,
         icon : "oldMan2.png",
         action : "TALK",
         title : "Elder",
         text : "Legends tell of Vezu, a powerful ancient dragon that terrorized the Three Kingdoms. It was finally defeated in the North, then entombed in a mountain that bears his name. Could the volcanic eruption have awoken the dragon within?"
      },
      {
         type : "shop",
         name : "Trading Post",
         x : 6,
         y : 8,
         icon : "shop.png",
         level : 1,
         groups : ["default"],
         buyRate : 100,
         sellRate : 45
      },
      {
         type : "temple",
         x : 6,
         y : 14,
         icon : "temple.png",
         cost : 10
      }
   ]
});