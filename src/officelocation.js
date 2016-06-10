/* global jQuery: true, module: true */

jQuery = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var NumberedStepsView = require('./steps.js');
window.jQuery = window.$ = jQuery;
require('bootstrap');

var OfficeLocationApp = {
    Models: require('./models.js'),
    Views: {},
    inst: {},

    initialize: function(options) {
        var $parent = jQuery('.office-location');

        var data = require('../static/json/layers.json');
        var layers = new OfficeLocationApp.Models.MapLayerList(data);

        this.inst.noteView = new OfficeLocationApp.Views.NoteView({
            el: $parent
        });

        this.inst.mapView = new OfficeLocationApp.Views.MapView({
            el: $parent,
            layers: layers
        });

        var views = [];

        // Step 1
        var page = jQuery('<div></div>');
        $parent.append(page);
        var view = new OfficeLocationApp.Views.InterviewView({
            el: page,
            layers: layers
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
    events: {
        'keyup textarea.notepad': 'onChangeNotes',
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'onChangeNotes');
        this.model = new OfficeLocationApp.Models.Notepad();
    },
    onChangeNotes: function(evt) {
        this.model.set('notes', jQuery(evt.target).val());
    },
    render: function() {
        this.$el.find('textarea.notepad').val(this.model.get('notes'));
    }
});

OfficeLocationApp.Views.MapView = Backbone.View.extend({
    events: {
        'click .select-layer': 'onSelect'
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'onSelect');
        this.layers = options.layers;

        var self = this;
        for (var i = 0; i < this.layers.length; i++) {
            this.layers.at(i).bind('change:visible', self.render);
        }
    },
    onSelect: function(evt) {
        var layerId = jQuery(evt.target).data('id');
        var isChecked = jQuery(evt.target).is(':checked');
        var layer = this.layers.get(layerId);

        layer.set('visible', jQuery(evt.target).is(':checked'));
        layer.save();
    },
    render: function() {
        for (var i = 0; i < this.layers.length; i++) {
            var layer = this.layers.at(i);
            var $elt = jQuery('#map_layer_' + layer.id);
            var $legend = jQuery('#map_legend_' + layer.id);
            if (layer.get('visible')) {
                $elt.show();
                $legend.show();
            } else {
                $elt.hide();
                $legend.hide();
            }
        }
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

        this.layers = options.layers;

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
            actors: this.actors.toTemplate(),
            layers: this.layers.toTemplate()});
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
