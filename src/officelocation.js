/* global jQuery: true, module: true */

jQuery = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');
var NumberedStepsView = require('./steps.js');
var models = require('./models.js');

var OfficeLocationApp = {
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
    },
    render: function() {
    }
});

OfficeLocationApp.Views.PickLocationView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');
    },
    render: function() {
    }
});

OfficeLocationApp.Views.BoardView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');
    },
    render: function() {
    }
});

OfficeLocationApp.Views.ReportView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');
    },
    render: function() {
    }
});

module.exports.OfficeLocationApp = OfficeLocationApp;
