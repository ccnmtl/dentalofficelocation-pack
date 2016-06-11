/* global jQuery: true, module: true */

jQuery = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var NumberedStepsView = require('./steps.js');
var models = require('./models.js');
window.jQuery = window.$ = jQuery;
require('bootstrap');

var NoteView = Backbone.View.extend({
    events: {
        'keyup textarea.notepad': 'onChangeNotes',
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'onChangeNotes');
        this.model = new models.Notepad();
    },
    onChangeNotes: function(evt) {
        this.model.set('notes', jQuery(evt.target).val());
    },
    render: function() {
        this.$el.find('textarea.notepad').val(this.model.get('notes'));
    }
});

var BaseView = Backbone.View.extend({
    initializeActors: function(actors) {
        this.actors = actors;
        var self = this;
        for (var i = 0; i < this.actors.length; i++) {
            var actor = this.actors.at(i);
            actor.bind('change:interviewed', self.renderProfile);

            var questions = actor.get('questions');
            for (var j = 0; j < questions.length; j++) {
                questions.at(j).bind('change:asked', self.renderProfile);
            }
        }

        this.profileTemplate =
            require('../static/templates/profile_template.html');
    },
    initializeMap: function(layers) {
        this.layers = layers;

        var self = this;
        for (var i = 0; i < this.layers.length; i++) {
            this.layers.at(i).bind('change:visible', self.renderMap);
        }

        this.actorStateTemplate =
            require('../static/templates/actor_state_template.html');
        this.actorMapTemplate =
            require('../static/templates/actor_map_template.html');
    },
    initializeNotes: function(noteView) {
        this.noteView = noteView;
    },
    onCloseQuestion: function(evt) {
        this.currentQuestion = undefined;
        jQuery(evt.target).parents('.collapse').collapse('hide');
    },
    onSelectLayer: function(evt) {
        var layerId = jQuery(evt.target).data('id');
        var isChecked = jQuery(evt.target).is(':checked');
        var layer = this.layers.get(layerId);

        layer.set('visible', jQuery(evt.target).is(':checked'));
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
    renderActors: function() {
        for (var i = 0; i < this.actors.length; i++) {
            var actor = this.actors.at(i);
            if (!actor.get('interviewed')) {
                continue;
            }
            var $slot =
                this.$el.find('.actor_state_' + actor.get('id')).first();
            if ($slot.length < 1) {
                $slot = this.$el.find('.actor-state.empty').last();
            }

            if ($slot.length > 0) {
                var markup = this.actorStateTemplate(actor.toTemplate());
                jQuery($slot).replaceWith(markup);

                // update the actor state div within the map
                markup = this.actorMapTemplate(actor.toTemplate());
                this.$el.find('.actor_map_' + actor.get('id')).html(markup);
            }
        }
    },
    renderMap: function() {
        for (var i = 0; i < this.layers.length; i++) {
            var layer = this.layers.at(i);
            var $elt = this.$el.find('.map_layer_' + layer.id);
            if ($elt.length < 1) {
                continue;
            }

            var $legend = this.$el.find('.map_legend_' + layer.id);
            if (layer.get('visible')) {
                $elt[0].style.display = '';
                $legend[0].style.display = '';
            } else {
                $elt[0].style.display = 'none';
                $legend[0].style.display = 'none';
            }
        }
    },
    renderProfile: function() {
        if (this.currentActor) {
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
        }
    }
});

var InterviewView = BaseView.extend({
    events: {
        'click .select-layer': 'onSelectLayer',
        'click img.actor': 'onShowProfile',
        'hidden.bs.modal #profile-modal': 'onHideProfile',
        'click button.interview': 'onInterview',
        'shown.bs.collapse .collapse': 'onAskQuestion',
        'click .btn-close-question': 'onCloseQuestion',
        'hidden.bs.collapse': 'renderProfile'
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'renderActors', 'renderMap', 'renderProfile',
            'onSelectLayer', 'onShowProfile', 'onHideProfile',
            'onInterview', 'onAskQuestion', 'onCloseQuestion',
            'initializeActors', 'initializeMap', 'initializeNotes',
            'maybeComplete');

        this.complete = false;

        this.initializeActors(options.actors);
        this.initializeMap(options.layers);
        this.initializeNotes(options.noteView);

        this.template = require('../static/templates/page_one.html');
    },
    render: function() {
        var markup = this.template({
            actors: this.actors.toTemplate(),
            layers: this.layers.toTemplate(),
            complete: this.complete});
        this.$el.html(markup);
        this.$el.show();

        this.renderMap();
        this.renderActors();
        this.noteView.render();

        this.trigger('complete', this);
    },
    onInterview: function(evt) {
        this.currentActor.set('interviewed', true);
    },
    onAskQuestion: function(evt) {
        var qId = jQuery(evt.target).data('id');
        var question = this.currentActor.get('questions').get(qId);
        this.currentQuestion = question;
        question.set('asked', true);
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

var PickLocationView = BaseView.extend({
    events: {
        'click .select-layer': 'onSelectLayer',
        'click img.actor': 'onShowProfile',
        'hidden.bs.modal #profile-modal': 'onHideProfile',
        'click .btn-close-question': 'onCloseQuestion',
        'hidden.bs.collapse': 'renderProfile',
        'mouseover .map-layers table tr td': 'onMouseOver',
        'mouseout .map-layers table tr td': 'onMouseOut',
        'click .map-layers table tr td': 'onSelectLocation',
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'renderActors', 'renderMap', 'renderProfile',
                  'onSelectLayer', 'onShowProfile', 'onHideProfile',
                  'onCloseQuestion', 'onMouseOver', 'onMouseOut',
                  'initializeActors', 'initializeMap', 'initializeNotes',
                  'maybeComplete');

        this.complete = false;
        this.initializeMap(options.layers);
        this.initializeActors(options.actors);
        this.initializeNotes(options.noteView);

        this.template = require('../static/templates/page_two.html');
    },
    render: function() {
        this.$el.html('Pick Location');
        this.$el.show();

        var markup = this.template({
            actors: this.actors.toTemplate(),
            layers: this.layers.toTemplate(),
            complete: this.complete,
            row: this.rowIndex,
            col: this.colIndex});

        this.$el.html(markup);
        this.$el.show();

        this.renderMap();
        this.renderActors();
        this.noteView.render();
    },
    onMouseOver: function(evt) {
        jQuery(evt.target).addClass('hovered');
    },
    onMouseOut: function(evt) {
        jQuery(evt.target).removeClass('hovered');
    },
    onSelectLocation: function(evt) {
        var rowIndex = jQuery(evt.target).parent().index('tr');
        var colIndex = jQuery(evt.target).index('tr:eq(' + rowIndex + ') td');

        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.maybeComplete();
        this.render();
    },
    maybeComplete: function() {
        if (this.rowIndex && this.colIndex) {
            this.complete = true;
            this.trigger('complete', this);
        }
    }
});

var BoardView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');

        var actors = require('../static/json/boardmembers.json');
        this.actors = new models.ActorList(actors);
    },
    render: function() {
        this.$el.html('Board View');
        this.$el.show();
        this.trigger('complete', this);
    }
});

var FinalReportView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');
    },
    render: function() {
        this.$el.html('Final Report View');
        this.$el.show();
        this.trigger('complete', this);
    }
});

var OfficeLocationApp = {
    initialize: function(options) {
        var $parent = jQuery('.office-location');

        var data = require('../static/json/layers.json');
        var layers = new models.MapLayerList(data);

        data = require('../static/json/actors.json');
        var actors = new models.ActorList(data);

        var noteView = new NoteView({
            el: $parent
        });

        var views = [];

        // Step 1
        var page = jQuery('<div></div>');
        $parent.append(page);
        var view = new InterviewView({
            el: page,
            layers: layers,
            actors: actors,
            noteView: noteView
        });
        views.push(view);

        // Step 2
        page = jQuery('<div></div>');
        $parent.append(page);
        view = new PickLocationView({
            el: page,
            layers: layers,
            actors: actors,
            noteView: noteView
        });
        views.push(view);

        // Step 3
        page = jQuery('<div></div>');
        $parent.append(page);
        view = new BoardView({
            el: page
        });
        views.push(view);

        // Step 4
        page = jQuery('<div></div>');
        $parent.append(page);
        view = new FinalReportView({el: page});
        views.push(view);

        this.steps = new NumberedStepsView({
            el: jQuery('.steps'),
            views: views
        });

        jQuery('body').show();
    }
};

module.exports.OfficeLocationApp = OfficeLocationApp;
