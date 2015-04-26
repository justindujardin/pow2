///<reference path="../types/node/node.d.ts"/>

var _:any = require('underscore');

module.exports = (grunt) => {
  var td:any = require('typedoc');
  var path = require('path');
  var wrench = require('wrench');


  function enumerateModules(project, modules:any = {}):any {
    project.traverse((c) => {
      switch (c.kind) {
        case td.ReflectionKind.Module:
          var a = c;
          var ns = [c.name];
          while (a.parent && a.parent.kind === td.ReflectionKind.Module) {
            ns.unshift(a.parent.name);
            a = a.parent;
          }
          var modName:string = ns.join('.');

          if (!modules[modName]) {
            modules[modName] = {
              classes: [],
              interfaces: [],
              enumerations: [],
              reflections: []
            };
          }
          modules[modName].reflections.push(c);
          modules[modName].classes = enumerateClasses(c, modules[modName].classes);
          modules[modName].enumerations = enumerateEnums(c, modules[modName].enumerations);
          modules[modName].interfaces = enumerateInterfaces(c, modules[modName].interfaces);
      }
      enumerateModules(c, modules);
    });
    return modules;
  }

  function enumerateClasses(fromModule, items:any = []):any {
    fromModule.traverse((c) => {
      switch (c.kind) {
        case td.ReflectionKind.Class:
          items.push({
            name: c.name,
            reflection: c
          });
      }
    });
    return items;
  }

  function enumerateInterfaces(fromModule, items:any = []):any {
    fromModule.traverse((c) => {
      switch (c.kind) {
        case td.ReflectionKind.Interface:
          items.push({
            name: c.name,
            reflection: c
          });
      }
    });
    return items;
  }

  function enumerateEnums(fromModule, items:any = []):any {
    fromModule.traverse((c) => {
      switch (c.kind) {
        case td.ReflectionKind.Enum:
          items.push({
            name: c.name,
            reflection: c
          });
      }
      //enumerateClasses(c, items);
    });
    return items;
  }

  function buildModules(modules:any[]) {
    var result = [];
    _.each(modules, (value:any, key:string) => {
      result.push({
        name: key,
        type: 'toggle',
        classes: _.map(value.classes, (c) => {
          return {
            name: c.name,
            url: '/' + key + '/classes/' + c.name,
            type: 'link'
          };
        }),
        interfaces: _.map(value.interfaces, (c) => {
          return {
            name: c.name,
            url: '/' + key + '/interfaces/' + c.name,
            type: 'link'
          };
        }),
        enumerations: _.map(value.enumerations, (c) => {
          return {
            name: c.name,
            url: '/' + key + '/enumerations/' + c.name,
            type: 'link'
          };
        })
      })
    });
    return _.uniq(result);
  }

  function buildClasses(modules:any[]) {
    var result = [];
    _.each(modules, (value:any, key:string) => {
      _.each(value.classes, (c) => {
        result.push({
          name: key + '.' + c.name,
          data: c.reflection.toObject()
        })
      });
    });
    return result;
  }

  function buildInterfaces(modules:any[]) {
    var result = [];
    _.each(modules, (value:any, key:string) => {
      _.each(value.interfaces, (c) => {
        result.push({
          name: key + '.' + c.name,
          data: c.reflection.toObject()
        })
      });
    });
    return result;
  }

  function buildEnumerations(modules:any[]) {
    var result = [];
    _.each(modules, (value:any, key:string) => {
      _.each(value.enumerations, (c) => {
        result.push({
          name: key + '.' + c.name,
          data: c.reflection.toObject()
        })
      });
    });
    return result;
  }

  function buildEntities(workingPath:string,entities:any[]) {
    var result = [];

    // Enumerate Entities used in game, and pull out some metadata for site navigation.
    _.each(entities, (e:string) => {
      var fileName:string = e.substr(e.lastIndexOf('/') + 1).replace('.powEntities', '.json');
      var fileRelative:string = path.join("data/entities", fileName);
      var destFile:string = path.join(workingPath, fileRelative);

      // Metadata about entities
      var entityDescription = {
        name: fileName.replace('.json', ''),
        url: fileRelative,
        templates: []
      };

      var entityContainer = grunt.file.readJSON(e);
      _.each(entityContainer || [], (template:any)=> {
        entityDescription.templates.push({
          name: template.name,
          url: fileRelative
        });
      });
      result.push(entityDescription);
      grunt.file.copy(e, destFile);
    });
    return result;
  }

  grunt.registerMultiTask('docs', function () {
    var done = this.async();
    var app = new td.Application();

    var queue = this.files.slice();

    var entities = grunt.file.expand(this.data.entities || []);

    var foo = 2;
    //var entities = this.data.

    function _next() {
      if (queue.length > 0) {
        var exec = queue.shift();
        var result = app.converter.convert(exec.src, app.settings);
        var reflectionsIndex:string[] = [];

        // Copy base template
        wrench.copyDirSyncRecursive('data/templates/site', exec.dest, {
          forceDelete: true
        });

        //// Generate reflection json files
        //result.project.children.forEach((c:any) => {
        //  var fileName = c.name.replace(/"/g, '') + '.json';
        //  var fileFullName = path.join(exec.dest, fileName);
        //  reflectionsIndex.push(fileName);
        //  grunt.file.write(fileFullName, JSON.stringify(c.toObject(), null, 2));
        //  grunt.log.writeln('File "' + fileFullName + '" created.');
        //});

        // Generate project metadata file
        var modules = enumerateModules(result.project);
        var classes = buildClasses(modules);
        var enumerations = buildEnumerations(modules);
        var interfaces = buildInterfaces(modules);
        var indexFile:string = path.join(exec.dest, "metadata.js");

        var indexObject = {
          reflections: reflectionsIndex,
          modules: buildModules(modules),
          entities: buildEntities(exec.dest,entities)
        };

        _.each(classes, (c) => {
          var classFile:string = path.join(exec.dest, "data/classes", c.name + '.json');
          grunt.file.write(classFile, JSON.stringify(c.data, null, 2));
        });
        _.each(enumerations, (c) => {
          var classFile:string = path.join(exec.dest, "data/enumerations", c.name + '.json');
          grunt.file.write(classFile, JSON.stringify(c.data, null, 2));
        });
        _.each(interfaces, (c) => {
          var classFile:string = path.join(exec.dest, "data/interfaces", c.name + '.json');
          grunt.file.write(classFile, JSON.stringify(c.data, null, 2));
        });
        var jsSlug = "DocsApp.constant('METADATA', " + JSON.stringify(indexObject, null, 2) + ");";
        grunt.file.write(indexFile, jsSlug);
        grunt.log.writeln('File "' + indexFile + '" created.');

        return _next();
      }
      _done();
    }

    function _done() {
      done();
    }

    _next();
  });

};