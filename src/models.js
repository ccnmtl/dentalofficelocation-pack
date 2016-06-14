/* global jQuery: true, module: true */

jQuery = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');

var STAKEHOLDER_LIMIT = 4;
var QUESTION_LIMIT = 3;
var BOARDMEMBER_LIMIT = 6;

var User = Backbone.Model.extend({
    defaults: {
    }
});

var Notepad = Backbone.Model.extend({
    defaults: {
        notes: ''
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
        interviewed: false
    },
    initialize: function(attributes) {
        if (attributes) {
            Backbone.Model.prototype.initialize.apply(this, attributes);
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

/**
var UserState = Backbone.Model.extend({
    defaults: {
        layers: new MapLayerList(),
        actors: new ActorList(),
        responses: new ActorResponseList(),
        notes: '',
        strategies_viewed: new StrategyList(),
        strategy_selected: new Strategy(),
        strategy_responses: new ActorResponseList()
    },
    selectActor: function(actor) {
        this.get('actors').add(actor);
    },
    isActorSelected: function(actor) {
        var obj = this.get('actors').get(actor.get('id'));
        return typeof obj !== 'undefined' && obj !== null;
    },
    viewStrategy: function(strategy) {
        this.get('strategies_viewed').add(strategy);
    },
    isStrategyViewed: function(strategy) {
        var obj = this.get(
            'strategies_viewed').id(strategy.get('id'));
        return typeof obj !== 'undefined' && obj !== null;
    },
    selectStrategy: function(strategy) {
        this.set('strategy_selected', strategy);
    },
    getActorState: function(actor) {
        if (!this.isActorSelected(actor)) {
            return 'unselected';
        }

        var responses = this.get('responses').getResponsesByActor(actor);
        if (responses.length >= QUESTION_LIMIT) {
            return 'complete';
        } else {
            return 'inprogress';
        }
    },
    isQuestionAnswered: function(actor, question) {
        var answered = false;
        this.get('responses').forEach(function(response) {
            if (response.get('actor').get('id') === actor.get('id') &&
                response.get('question').get('id') === question.get('id')) {
                answered = true;
            }
        });
        return answered;
    },
    getStrategyQuestionResponse: function(question) {
        this.get('strategy_responses').forEach(function(response) {
            if (response.get('question').get('id') === question.get('id')) {
                return response;
            }
        });
        return null;
    },
    unlock: function() {
        var allResponses = this.get('responses');
        var stakeholders = [];
        var boardmembers = [];

        this.get('actors').forEach(function(actor) {
            var responses = allResponses.getResponsesByActor(actor);
            if (actor.get('type') === 'IV' &&
                    responses.length >= QUESTION_LIMIT) {
                stakeholders.push(actor);
            } else if (actor.get('type') === 'BD' && responses.length > 0) {
                if (responses[0].get('long_response').length > 0) {
                    boardmembers.push(actor);
                }
            }
        });

        if (stakeholders.length < STAKEHOLDER_LIMIT) {
            return false;
        }

        if (this.get('view_type') === 'LC' ||
            this.get('view_type') === 'BD') {
            if (this.get('practice_location_row') === undefined ||
                this.get('practice_location_row') === null ||
                this.get('practice_location_column') === undefined ||
                this.get('practice_location_column') === null) {
                return false;
            }
        }

        if (this.get('view_type') === 'BD' &&
                boardmembers.length < BOARDMEMBER_LIMIT) {
            return false;
        }

        return true;
    },
    unlockStrategy: function(strategyTotal, questionTotal) {
        if (this.get('strategies_viewed').length < strategyTotal) {
            return false;
        }

        if (this.get('view_type') === 'SS' &&
                this.get('strategy_selected') === null) {
            return false;
        }

        if (this.get('view_type') === 'DS' &&
                this.get('strategy_responses').length < questionTotal) {
            return false;
        }

        return true;
    }
});
**/

module.exports.Notepad = Notepad;
module.exports.ActorList = ActorList;
module.exports.ActorQuestionList = ActorQuestionList;
module.exports.MapLayerList = MapLayerList;
