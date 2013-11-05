eburp.registerMap("ruins",{
   name : "Kinstown Ruins",
   map : "\
~~~~~~~~~~~~=======\
~~~~~~~~~~=========\
~~~~~~~~===========\
~~~~~~~~~~XXXXXX===\
~~~~~~~~=~~~~~~X===\
~~~~~~~~===~~~~X===\
~~~~~~~~==)=~~(X===\
~~~~~~~~(===(!(X===\
~~~~~~~~(====)(X===\
~~~~~~~)(==....X===\
~~~~~~~(===.XPXX===\
~~~~~~)(===.X==X===\
~~~~~~=(==).===X===\
~~~~~==)===.X==X===\
~~~~~==(===.XPXX===\
~~~~~=(====.===X===\
~~~~~==)===.)==X===\
~~~~~==========X===\
~~~~~~XXX=).===X===\
~~~~~~P====.PXXX===\
~~~~--===...X=X====\
~~~~~~......G=D====\
~~~~--===...X=X====\
~~~~~~XXPXP=XXXX===\
~~~~~~~~====~~~X===\
~~~~~~~~~~~~~~~~~~~\
~~~~~~~~~~~~~~~~~~~\
~~~~~~~~~~~~~~~~~~~\
~~~~~~~~~~~~~~~~~~~\
",
   width : 19,
   height : 29,
   music : "gurkdemo7",
   dark : true, // When dark is true, the fairly-lame line-of-sight algorithm will be engaged.
   level : 1,
   groups : ["kobold", "default"],
   encounterChance: 40,
   combatMap: "outdoorCombat",
   features : [
      {
         type : "transition",
         x : 14,
         y : 21,
         icon : "doorInWall.png",
         text : "Exit the ruins and return to the Wildernesse?",
         target : "wilderness",
         transitionType : "outdoor",
         targetX : 17,
         targetY : 43
      },
      {
         type : "block",
         x : 15,
         y : 21
      },
      {
         type : "barrier",
         x : 12,
         y : 21,
         icon : "dungeonGate.png",
         title : "Locked",
         text : "There is a heavy locked gate here, and you cannot force it open!",
         until : "ruinsStart"
      },
      {
         type : "alert", // Alerts appear immediately, unlike 'sign', where the user must engage.
         x : 12,
         y : 21,
         icon : "dungeonGate.png",
         altIcon : "silverKey.png",
         title : "Unlocked",
         text : "You use the key to unlock the gate and enter the ruins of Kinstown Harbor.",
         sets : "alertRuinsKey",
         until : "alertRuinsKey",
         after : "ruinsStart"
      },
      {
         type : "transition",
         x : 14,
         y : 9,
         icon : "doorway.png",
         text : "You see a doorway here leading down into the sewers below the town. Dare you explore them?",
         target : "sewer",
         transitionType : "dungeon",
         targetX : 21,
         targetY : 1
      }
   ]
});