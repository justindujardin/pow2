E.B.U.R.P Engine
================

The "Eight-Bit Universal Role Playing" Engine is a feverishly retro-inspired RPG system, optimized for simple, single-handed mobile play.
It is written in CoffeeScript (which compiles to JavaScript), so that it can be run on any platform that supports HTML5.
This includes iOS and Android, as well as compliant desktop browsers such as Chrome, Firefox and Safari.
Some of the build tools are written in Java, so this is required to build the game from source.

Included is a playable and fun demo game. Go here to play it: http://pents90.github.io/eburp

This engine was written to make Gurk III, an RPG for [Android](http://play.google.com/store/apps/details?id=com.larvalabs.gurk3) and [iOS](http://itunes.apple.com/us/app/gurk-iii-the-8-bit-rpg/id685128493?mt=8).

## Philosophy

The goal of this engine is to use a very simple push-button approach to play, as opposed to complex gestures and menus.
The result is not the most ideal interface, but it is very easy to develop for, and players can learn it and become quite fast and satisfied with it.
The game itself is also simple, but has enough complexity to support an interesting story and subtle combat strategy.

## If You Use This Project

Even though the name "Gurk" is all over the source and the demo game. Please don't call your game "Gurk", that's our little brand!
Also, you can use anything that is in this open-source project, but please don't pirate and graphics or music from the Gurk series that is not included here.
That's all, enjoy!

## Making Your Own Game

Have a look at the file 'game/gurkDemo.js'. This is a self-documented JavaScript file that shows you how to customize the game data.
You can also use the map editor by running the Java class gurk.MapEditor.

## Build Instructions

To build EBURP you need to have Node.JS and Grunt.JS installed, and a basic familiarity with executing commands in your system terminal.

### Node.JS

If you don't already have Node.JS, don't worry, there's an installer for your platform.  Go ahead and get it, we'll wait.

Download: [NodeJS](http://nodejs.org/)

Once you're done with that let's make sure it's installed properly.  Type these two commands in your terminal window:

> node --version
>
> npm --version

If those commands both return a value, and no error message, you're ready to go.

### Grunt.JS

Once you have Node.JS installed you can install Grunt.JS via NPM, and be one step closer to working on your game!

Enter these commands in your terminal to install the `grunt` utility.

> npm install -g grunt-cli
>
> grunt --version

If you receive errors, you may need to run this command as an administrator on your OS.  For more detailed information, see
the grunt [Getting Started Guide](http://gruntjs.com/getting-started#installing-the-cli).

Once you've installed grunt and it echos its version back without error, you're ready to install npm dependencies and then
run your game!

### Build it!

Now that you have `node`, `npm`, and `grunt` installed--you're good to go.  Let's start up the developer workflow and test
out the game.  Type the following command in to your terminal:

> grunt watch

This command should print information about executing some tasks, and eventually settle down and say that it's waiting.  Once
this happens without error, just open up the index.html file in the root directory to play your game.

While the grunt watch task is running the game assets will be rebuilt if a file (Sprites, Maps, Code) changes.  This means you
can edit your files and refresh your webpage a few moments later when the new build is done.  No muss, no fuss, just game stuff.

## Architecture

The engine consists of the following CoffeeScript files: 

* core.coffee - This has all the fundamental drawing and GUI utilities.
* model.coffee - This defines the core data model for the game, including heroes, items, creatures and spells.
* adventure.coffee - This has all the user interface for the entire except for combat.
* combat.coffee - This has the combat user interface and engine.
* gurk.coffee - This ties everything together and serves as the entry point into the game.

There will be more to docs to come!
