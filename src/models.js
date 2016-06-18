/* global jQuery: true, module: true */

jQuery = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');

var STAKEHOLDER_LIMIT = 4;
var QUESTION_LIMIT = 3;
var BOARDMEMBER_LIMIT = 6;

var Notepad = Backbone.Model.extend({
    defaults: {
        notes: ''
    }
});

var Location = Backbone.Model.extend({
    defaults: {
        rowIndex: null,
        colIndex: null
    }
});

var MapLayer = Backbone.Model.extend({
    defaults: {
        visible: false
    },
    toTemplate: function() {
        return _(this.attributes).clone();
    }
});

var MapLayerList = Backbone.Collection.extend({
    model: MapLayer,
    initialize: function(lst) {
        if (lst !== undefined && lst instanceof Array) {
            for (var i = 0; i < lst.length; i++) {
                var x = new MapLayer(lst[i]);
                this.add(x);
            }
        }
    },
    toTemplate: function() {
        var a = [];
        this.forEach(function(item) {
            a.push(item.toTemplate());
        });
        return a;
    }
});

var ActorQuestion = Backbone.Model.extend({
    defaults: {
        asked: false
    },
    toTemplate: function() {
        return _(this.attributes).clone();
    }
});

var ActorQuestionList = Backbone.Collection.extend({
    model: ActorQuestion,
    initialize: function(lst) {
        if (lst !== undefined && lst instanceof Array) {
            for (var i = 0; i < lst.length; i++) {
                var q = new ActorQuestion(lst[i]);
                this.add(q);
            }
        }
    },
    toTemplate: function() {
        var a = [];
        this.forEach(function(item) {
            var j = item.toTemplate();
            a.push(j);
        });
        return a;
    }
});

var Actor = Backbone.Model.extend({
    defaults: {
        interviewed: false,
        reply: ''
    },
    initialize: function(attributes) {
        if (attributes) {
            this.set('questions', new ActorQuestionList(attributes.questions));
        }
    },
    asked: function() {
        var questions = this.get('questions');
        var n = 0;
        for (var i = 0; i < questions.length; i++) {
            if (questions.at(i).get('asked')) {
                n++;
            }
        }
        return n;
    },
    toTemplate: function() {
        var json = _.clone(this.attributes);
        json.questions = this.get('questions').toTemplate();
        json.asked = this.asked();
        json.reply = this.get('reply');
        return json;
    }
});

var ActorList = Backbone.Collection.extend({
    model: Actor,
    initialize: function(lst) {
        if (lst !== undefined && lst instanceof Array) {
            for (var i = 0; i < lst.length; i++) {
                var x = new Actor(lst[i]);
                this.add(x);
            }
        }
    },
    toTemplate: function() {
        var a = [];
        this.forEach(function(item) {
            a.push(item.toTemplate());
        });
        return a;
    },
    interviewCount: function() {
        var n = 0;
        this.forEach(function(item) {
            if (item.get('interviewed')) {
                n++;
            }
        });
        return n;
    }
});

module.exports.Location = Location;
module.exports.Notepad = Notepad;
module.exports.Actor = Actor;
module.exports.ActorList = ActorList;
module.exports.ActorQuestionList = ActorQuestionList;
module.exports.MapLayerList = MapLayerList;
