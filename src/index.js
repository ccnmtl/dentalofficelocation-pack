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

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1));
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

jQuery(document).ready(function() {

    if (!getUrlParameter('parent')) {
        jQuery('#cu-privacy-notice').addClass('required');
    }

    module.OfficeLocationApp.initialize();
});
