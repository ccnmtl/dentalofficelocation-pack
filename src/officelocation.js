/* global jQuery: true, module: true */

jQuery = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var NumberedStepsView = require('./steps.js');

var OfficeLocationApp = {
    Models: require('./models.js'),
    Views: {},
    inst: {},

    initialize: function(options) {
        var $parent = jQuery('.office-location');

        this.inst.noteView = new OfficeLocationApp.Views.NoteView({
            el: $parent
        });

        this.inst.mapView = new OfficeLocationApp.Views.MapView({
            el: $parent
        });

        var views = [];

        // Step 1
        var page = jQuery('<div></div>');
        $parent.append(page);
        var view = new OfficeLocationApp.Views.InterviewView({
            el: page
        });
        views.push(view);

        // Step 2
        page = jQuery('<div></div>');
        $parent.append(page);
        view = new OfficeLocationApp.Views.PickLocationView({
            el: page
        });
        views.push(view);

        // Step 3
        page = jQuery('<div></div>');
        $parent.append(page);
        view = new OfficeLocationApp.Views.BoardView({
            el: page,
            chartView: this.inst.chartView
        });
        views.push(view);

        // Step 4
        page = jQuery('<div></div>');
        $parent.append(page);
        view = new OfficeLocationApp.Views.FinalReportView({el: page});
        views.push(view);

        this.inst.steps = new NumberedStepsView({
            el: jQuery('.steps'),
            views: views
        });

        jQuery('body').show();
    }
};

OfficeLocationApp.Views.NoteView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');
    },
    render: function() {
    }
});

OfficeLocationApp.Views.MapView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');
    },
    render: function() {
    }
});

OfficeLocationApp.Views.InterviewView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');

        var actors = require('../static/json/actors.json');
        this.actors = new OfficeLocationApp.Models.ActorList(actors);

        var questions = require('../static/json/questions.json');
        this.questions =
            new OfficeLocationApp.Models.ActorQuestionList(questions);

        var layers = require('../static/json/layers.json');
        this.layers =
            new OfficeLocationApp.Models.MapLayerList(layers);

        this.template =
            require('../static/templates/page_one.html');

        this.profile_template =
            require('../static/templates/profile_template.html');
        this.actor_state_template =
            require('../static/templates/actor_state_template.html');
        this.actor_map_template =
            require('../static/templates/actor_map_template.html');
    },
    render: function() {
        var markup = this.template({
            actors: this.actors,
            layers: this.layers});
        this.$el.html(markup);
        this.$el.show();
    }
});

OfficeLocationApp.Views.PickLocationView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');
    },
    render: function() {
        this.$el.html('Pick Location');
        this.$el.show();
        this.trigger('complete', this);
    }
});

OfficeLocationApp.Views.BoardView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');

        var actors = require('../static/json/boardmembers.json');
        this.actors = new OfficeLocationApp.Models.ActorList(actors);
    },
    render: function() {
        this.$el.html('Board View');
        this.$el.show();
        this.trigger('complete', this);
    }
});

OfficeLocationApp.Views.FinalReportView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');
    },
    render: function() {
        this.$el.html('Final Report View');
        this.$el.show();
        this.trigger('complete', this);
    }
});

module.exports.OfficeLocationApp = OfficeLocationApp;
