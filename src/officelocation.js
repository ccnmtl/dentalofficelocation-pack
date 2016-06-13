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
            layers: layers,
            noteView: this.inst.noteView
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
    events: {
        'click img.actor': 'onShowProfile',
        'hidden.bs.modal #profile-modal': 'onHideProfile',
        'click button.interview': 'onInterview',
        'shown.bs.collapse .collapse': 'onAskQuestion',
        'click .btn-close-question': 'onCloseQuestion',
        'hidden.bs.collapse': 'renderProfile'
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'renderProfile', 'renderActors',
            'onShowProfile', 'onHideProfile', 'onInterview',
            'onAskQuestion', 'onCloseQuestion');

        this.complete = false;
        this.layers = options.layers;
        this.noteView = options.noteView;

        var actors = require('../static/json/actors.json');
        this.actors = new OfficeLocationApp.Models.ActorList(actors);
        var self = this;
        for (var i = 0; i < this.actors.length; i++) {
            var actor = this.actors.at(i);
            actor.bind('change:interviewed', self.renderProfile);

            var questions = actor.get('questions');
            for (var j = 0; j < questions.length; j++) {
                questions.at(j).bind('change:asked', self.renderProfile);
            }
        }

        this.template =
            require('../static/templates/page_one.html');
        this.profileTemplate =
            require('../static/templates/profile_template.html');
        this.actorStateTemplate =
            require('../static/templates/actor_state_template.html');
        this.actorMapTemplate =
            require('../static/templates/actor_map_template.html');
    },
    render: function() {
        var markup = this.template({
            actors: this.actors.toTemplate(this.questions),
            layers: this.layers.toTemplate(),
            complete: this.complete});
        this.$el.html(markup);
        this.$el.show();

        this.renderActors();
    },
    renderActors: function() {
        for (var i = 0; i < this.actors.length; i++) {
            var actor = this.actors.at(i);
            if (!actor.get('interviewed')) {
                continue;
            }
            var $slot = jQuery('#actor_state_' + actor.get('id')).first();
            if ($slot.length < 1) {
                $slot = this.$el.find('.actor-state.empty').last();
            }

            if ($slot.length > 0) {
                var markup = this.actorStateTemplate(actor.toTemplate());
                jQuery($slot).replaceWith(markup);

                // update the actor state div within the map
                markup = this.actorMapTemplate(actor.toTemplate());
                jQuery('#actor_map_' + actor.get('id')).html(markup);
            }
        }
    },
    renderProfile: function() {
        var json = this.currentActor.toTemplate();
        json.interviewCount = this.actors.interviewCount();
        if (this.currentQuestion) {
            json.currentQuestion = this.currentQuestion.toTemplate();
        } else {
            json.currentQuestion = null;
        }

        var markup = this.profileTemplate(json);
        var $modal = this.$el.find('#profile-modal');
        $modal.find('.modal-body').html(markup);
        $modal.find('.panel-group').collapse({toggle: false});

        this.renderActors();
        this.noteView.render();
        this.noteView.delegateEvents();
    },
    onShowProfile: function(evt) {
        var srcElement = evt.srcElement || evt.target || evt.originalTarget;
        var actorId = jQuery(srcElement).data('id');
        this.currentActor = this.actors.get(actorId);

        this.renderProfile();

        var $modal = this.$el.find('#profile-modal');
        $modal.modal({});
    },
    onHideProfile: function(evt) {
        this.currentActor = undefined;
        this.noteView.render();

        this.maybeComplete();
    },
    onInterview: function(evt) {
        this.currentActor.set('interviewed', true);
        this.currentActor.save();
    },
    onAskQuestion: function(evt) {
        var qId = jQuery(evt.target).data('id');
        var question = this.currentActor.get('questions').get(qId);
        this.currentQuestion = question;
        question.set('asked', true);
    },
    onCloseQuestion: function(evt) {
        this.currentQuestion = undefined;
        jQuery(evt.target).parents('.collapse').collapse('hide');
    },
    maybeComplete: function() {
        if (!this.complete) {
            var complete = 0;
            for (var i = 0; i < this.actors.length; i++) {
                var actor = this.actors.at(i);
                if (actor.asked() === 3) {
                    complete++;
                }
            }
            if (complete === 4) {
                this.complete = true;
                this.trigger('complete', this);
            }
        }
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
