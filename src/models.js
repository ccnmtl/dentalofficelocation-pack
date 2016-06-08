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

var MapLayer = Backbone.Model.extend({
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
    removeByDataId: function(id) {
        var internalId = this.urlRoot + id + '/';
        this.remove(internalId);
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
    initialize: function(attributes) {
        if (attributes) {
            Backbone.Model.prototype.initialize.apply(this, attributes);
            this.set('questions', new ActorQuestionList(attributes.questions));
        }
    },
    toTemplate: function() {
        var json = _.clone(this.attributes);
        json.questions = this.get('questions').toTemplate();
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
    parse: function(response) {
        return response.objects || response;
    },
    toTemplate: function() {
        var a = [];
        this.forEach(function(item) {
            a.push(item.toTemplate());
        });
        return a;
    }
});

var ActorResponse = Backbone.Model.extend({
    initialize: function(attrs) {
        if (attrs) {
            this.set('actor', new Actor(attrs.actor));
            this.set('question', new ActorQuestion(attrs.question));
        }
    },
    parse: function(response) {
        if (response) {
            response.actor = new Actor(response.actor);
            response.question = new ActorQuestion(response.question);
        }
        return response;
    },
    toTemplate: function() {
        var json = _(this.attributes).clone();
        json.question = this.get('question').toTemplate();
        json.actor = this.get('actor').toTemplate();
        return json;
    }
});

var ActorResponseList = Backbone.Collection.extend({
    model: ActorResponse,
    getResponsesByActor: function(actor) {
        var responses = [];
        this.forEach(function(obj) {
            if (actor.get('id') === obj.get('actor').get('id')) {
                responses.push(obj);
            }
        });
        return responses;
    },
    parse: function(response) {
        return response.objects || response;
    },
    toTemplate: function() {
        var a = [];
        this.forEach(function(item) {
            a.push(item.toTemplate());
        });
        return a;
    }
});

var Strategy = Backbone.Model.extend({
    initialize: function(attrs) {
        if (attrs) {
            this.set('question', new ActorQuestion(attrs.question));
        }
    },
    toTemplate: function() {
        var json = _.clone(this.attributes);
        json.question = this.get('question').toTemplate();

        if (json.pdf) {
            var a = json.pdf.split('/');
            json.pdf = a[a.length - 1];
        }
        return json;
    }
});

var StrategyList = Backbone.Collection.extend({
    model: Strategy,
    initialize: function(lst) {
        if (lst !== undefined && lst instanceof Array) {
            for (var i = 0; i < lst.length; i++) {
                var x = new Strategy(lst[i]);
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
    parse: function(response) {
        if (response) {
            response.layers = new MapLayerList(response.layers);
            response.actors = new ActorList(response.actors);
            response.responses = new ActorResponseList(response.responses);
            response.strategies_viewed =
                new StrategyList(response.strategies_viewed);
            if (response.strategy_selected) {
                response.strategy_selected =
                    new Strategy(response.strategy_selected);
            }
            response.strategy_responses =
                new ActorResponseList(response.strategy_responses);
        }
        return response;
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
