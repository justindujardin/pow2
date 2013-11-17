eburp.registerMap("splashScreen",{ // This special map appears when the player first starts the game
   name: "Splash Screen",
   width: 9,
   height: 9,
   map : "\
MMMMM==!!\
MMMM=====\
M!!=====!\
!===!==!!\
=!=!==!!!\
=~|~==!MM\
~~~~~=!!M\
~~~~~===M\
~~~~!!!MM\
",
   features : [
      {
         type : "sign",
         x : 1,
         y : 7,
         icon : "ship.png"
      },
      {
         type : "sign",
         x : 1,
         y : 3,
         icon : "bigCastleLeft.png"
      },
      {
         type : "sign",
         x : 2,
         y : 3,
         icon : "bigCastleCenter.png"
      },
      {
         type : "sign",
         x : 3,
         y : 3,
         icon : "bigCastleRight.png"
      },
      {
         type : "sign",
         x : 7,
         y : 7,
         icon : "temple.png"
      }
   ]
});