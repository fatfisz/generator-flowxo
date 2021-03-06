'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var mkdirp = require('mkdirp');
var _ = require('lodash');

var FlowXOMethodGenerator = module.exports = function FlowXOMethodGenerator() {
  yeoman.generators.Base.apply(this, arguments);
};

util.inherits(FlowXOMethodGenerator, yeoman.generators.Base);

FlowXOMethodGenerator.prototype.prompts = function() {
  var done = this.async();
  var self = this;

  var onPromptComplete = function(props) {
    _.assign(self, props);

    if(props.type === 'action') {
      self.kind = 'task';
    } else {
      self.kind = 'trigger';
    }
    done();
  };

  var prompts = [
    // Name
    {
      type: 'input',
      name: 'name',
      message: 'What is the user-visible name of the method e.g. Add a Document',
      default: self.name,
      validate: function(name) {
        // Ensure we have selected an answer
        return !!name;
      }
    },
    // Slug
    {
      type: 'input',
      name: 'slug',
      message: 'What slug would you like for the method? e.g. add_a_document',
      default: function(answers) {
        return _.snakeCase(answers.name);
      },
      validate: function(slug) {
        // Ensure we have selected an answer
        return !!slug;
      }
    },
    // Type
    {
      type: 'list',
      name: 'type',
      message: 'What type of method is it?',
      choices: [{
        name: 'Poller Trigger',
        value: 'poller',
      }, {
        name: 'Webhook Trigger',
        value: 'webhook'
      }, {
        name: 'Action',
        value: 'action'
      }],
      validate: function(type) {
        // Ensure we have selected an answer
        return !!type;
      }
    },
    // Scripts
    {
      type: 'checkbox',
      name: 'scripts',
      message: 'Select which scripts you would like to generate for the method.',
      choices: [{
        name: 'Custom Input',
        value: 'input',
      }, {
        name: 'Custom Output',
        value: 'output'
      }],
      when: function(answers) {
        // Do not run on webhooks
        answers.scripts = [];
        return answers.type !== 'webhook';
      }
    }
  ];

  this.prompt(prompts, onPromptComplete);
};

FlowXOMethodGenerator.prototype.fieldPrompts = function fieldPrompts() {
  var done = this.async();
  done();
};

FlowXOMethodGenerator.prototype.methodFiles = function coreFiles() {
  var methodDir = path.join('lib', 'methods', this.slug);
  mkdirp(methodDir);

  this.destinationRoot(methodDir);
  this.template('_config.js', 'config.js');
  this.template('_run.js', 'run.js');

  if(this.scripts.indexOf('input') !== -1) {
    this.template('_input.js', 'input.js');
  }
  if(this.scripts.indexOf('output') !== -1) {
    this.template('_output.js', 'output.js');
  }
};
