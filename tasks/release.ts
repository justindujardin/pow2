///<reference path="../types/node/node.d.ts"/>

module.exports = (grunt:any) => {

   // Release a version
   // --------------------------------------------------
   grunt.loadNpmTasks('grunt-bump');
   grunt.loadNpmTasks('grunt-conventional-changelog');
   grunt.loadNpmTasks('grunt-npm');
   grunt.registerTask('release', 'Build, bump and tag a new release.', function(type:any) {
      type = type || 'patch';
      grunt.task.run([
         'npm-contributors',
         'bump:' + type + ':bump-only',
         'default',
         'uglify',
         'changelog',
         'artifacts:add',
         'bump-commit',
         'artifacts:remove'
      ]);
   });

   var exec = require('child_process').exec;
   grunt.registerTask('artifacts', 'temporarily version output libs for release tags', function(type:any) {
      var opts = this.options({
         files: [],
         pushTo: 'origin',
         commitAdd:"chore: add artifacts for release",
         commitRemove:"chore: remove release artifacts"
      });
      var done = this.async();
      console.log(opts.files);
      if(type === 'add') {
         exec('git add -f ' + opts.files.join(' '), function (err:any, stdout:any, stderr:any) {
            if (err) {
               grunt.fatal('Cannot add the release artifacts:\n  ' + stderr);
            }
            var commitMessage = opts.commitAdd;
            exec('git commit ' + opts.files.join(' ') + ' -m "' + commitMessage + '"', function (err:any, stdout:any, stderr:any) {
               if (err) {
                  grunt.fatal('Cannot create the commit:\n  ' + stderr);
               }
               grunt.log.ok('Committed as "' + commitMessage + '"');
               done();
            });
         });
      }
      else if(type === 'remove'){
         exec('git rm -f ' + opts.files.join(' ') + ' --cached', function(err:any, stdout:any, stderr:any) {
            if (err) {
               grunt.fatal('Cannot remove the release artifacts:\n  ' + stderr);
            }
            var commitMessage = opts.commitRemove;
            exec('git commit -m "' + commitMessage + '"', function(err:any, stdout:any, stderr:any) {
               if (err) {
                  grunt.fatal('Cannot create the commit:\n  ' + stderr);
               }
               grunt.log.ok('Committed as "' + commitMessage + '"');
               exec('git push ' + opts.pushTo, function(err:any, stdout:any, stderr:any) {
                  if (err) {
                     grunt.fatal('Can not push to ' + opts.pushTo + ':\n  ' + stderr);
                  }
                  grunt.log.ok('Pushed to ' + opts.pushTo);
                  done();
               });
            });
         });
      }
      else {
         grunt.fatal('Invalid type to artifacts');
      }
   });

};
