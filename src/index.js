/* global jQuery: true */

require('!file?name=[name].[ext]!../static/index.html');
require('./static.js');

// load and apply css
require('!style!css!bootstrap/dist/css/bootstrap.min.css');
require('!style!css!bootstrap-arrow-buttons/dist/css/' +
        'bootstrap-arrow-buttons.css');
require('../static/css/common.css');
require('../static/css/steps.css');
require('../static/css/officelocation.css');

var jQuery = require('jquery');
var module = require('./officelocation.js');

jQuery(document).ready(function() {
    module.OfficeLocationApp.initialize();
});
