/* global jQuery: true */

// load and apply css
require('../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('../node_modules/bootstrap-arrow-buttons/dist/' +
        'css/bootstrap-arrow-buttons.css');
require('../static/css/common.css');
require('../static/css/steps.css');
require('../static/css/officelocation.css');

var jQuery = require('jquery');
var module = require('./officelocation.js');

jQuery(document).ready(function() {
    var view = new module.OfficeLocationApp({
        el: '.office-location'
    });
});
