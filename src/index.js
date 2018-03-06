/* global jQuery: true */

require('!file-loader?name=[name].[ext]!../static/index.html');
require('./static.js');

// load and apply css
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-arrow-buttons/dist/css/bootstrap-arrow-buttons.css';
import '../static/css/common.css';
import '../static/css/steps.css';
import '../static/css/officelocation.css';

import jQuery from 'jquery';
import module from './officelocation';

jQuery(document).ready(function() {
    module.OfficeLocationApp.initialize();
});
