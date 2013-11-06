E.B.U.R.P Engine
================
[![Build Status](https://secure.travis-ci.org/justindujardin/eburp.png)](http://travis-ci.org/justindujardin/eburp)


`This is a fork of the "Eight-Bit Universal Role Playing" repository, to add a Node.JS and Grunt.JS based developer workflow
and support for easy deployment to heroku.`

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
