/* global jQuery: true */

require('!file-loader?name=[name].[ext]!../static/index.html');
require('./static.js');

// load and apply css
require('!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css');
// eslint-disable-next-line security/detect-non-literal-require
require('!style-loader!css-loader!bootstrap-arrow-buttons/dist/css/' +
        'bootstrap-arrow-buttons.css');
require('!style-loader!css-loader!../static/css/common.css');
require('!style-loader!css-loader!../static/css/steps.css');
require('!style-loader!css-loader!../static/css/officelocation.css');

var jQuery = require('jquery');
var module = require('./officelocation.js');

jQuery(document).ready(function() {
    module.OfficeLocationApp.initialize();
});
