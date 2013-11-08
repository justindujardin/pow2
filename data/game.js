window.Data = {
   //// Experience Levels, the amount of experience required to be at a certain level.
   levels : [
      0,      // 1
      60,     // 2
      200,    // 3
      500,    // 4
      1000,    // 5
      2000,    // 6
      3600,   // 7
      6000,   // 8
      10000,   // 9
      20000,  // 10
      100000000// END
   ],

   splashMusic : "gurkdemo7", // Music played during splash screen and character creation
   combatMusic : "gurkdemo8", // Music played when in combat
   boatMusic : "gurkdemo7", // Music played while on a ship

   //// Level transformations, each row adds to 10,000, maps level -> level for encounters, treasure, etc.

   levelTransformations : [
      [9300, 500, 199, 1, 0, 0, 0, 0, 0, 0, 0, 0],           // 1
      [4650, 4650, 500, 199, 1, 0, 0, 0, 0, 0, 0, 0],        // 2
      [3100, 3100, 3100, 500, 199, 1, 0, 0, 0, 0, 0, 0],     // 3
      [600, 2900, 2900, 2900, 500, 199, 1, 0, 0, 0, 0, 0],   // 4 (For example, this means that if the map is level 4, then there is a 1 in 10k chance that a level 7 creature will appear!)
      [100, 600, 2850, 2850, 2900, 500, 199, 1, 0, 0, 0, 0], // 5 (But the good news is, if you kill a creature that is level 5, there is a 1 in 10k chance that a level 8 item will appear as treasure!)
      [20, 80, 600, 2850, 2850, 2900, 500, 199, 1, 0, 0, 0], // 6
      [0, 20, 80, 600, 2850, 2850, 2900, 500, 199, 1, 0, 0], // 7
      [0, 0, 20, 80, 600, 2850, 2850, 2900, 500, 199, 1, 0], // 8
      [0, 0, 0, 20, 81, 600, 2850, 2850, 2900, 499, 199, 1], // 9
      [0, 0, 0, 0, 20, 82, 600, 2850, 2850, 2900, 499, 199], // 10
      [0, 0, 0, 0, 0, 40, 162, 699, 2850, 2850, 2900, 499],  // 11
      [0, 0, 0, 0, 0, 0, 80, 364, 956, 2850, 2850, 2900]     // 12
   ],

   //// Chance out of 1000 of a creature having treasure, by level. Anything over level 10 is the same as level 10.

   treasureChance : [
      150,
      160,
      180,
      210,
      250,
      300,
      350,
      400,
      450,
      500
   ],

   //// Game Start Data

   start : [ // This is where you start after making a new game
      {
         map : "town",
         x : 12,
         y : 10,
         gold : 20
      }/* // You can specify later starting positions based on set variables. The below would be a bad idea, though, since all ships are reset after death, so the party would be stranded without a boat.
       ,
       {
       after : "towerDone",
       map : "keep",
       x : 11,
       y : 9,
       gold : 20
       }
       */
   ],

   // Registered dynamically.
   maps: {},
   sprites: {}

}; // Well, that's it. Easy right? No, no it isn't.
