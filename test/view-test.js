/* global describe: true, before: true, it: true */

var chai = require('chai');
var assert = chai.assert;

var jQuery = require('jquery');
var module = require('../src/officelocation');

function waitFor(testFx, doneFx, millis) {
    var timeout = millis ? millis : 3000; // Default Max Timout is 10s
    var start = new Date().getTime();

    var interval = setInterval(function() {
        var condition = testFx();

        if (condition) {
            clearInterval(interval);
            doneFx();
        } else if ((new Date().getTime() - start >= timeout)) {
            clearInterval(interval);
            doneFx(new Error('timeout occurred'));
        }
    }, 250); //< repeat check every 250ms
}

describe('OfficeLocationApp', function() {
    var app;

    before(function() {
        var elt = jQuery('.office-location');
        assert.isDefined(elt);
        jQuery(elt).html('');

        app = module.OfficeLocationApp.initialize();
    });

    describe('step1 interaction', function() {
        it('step 1: initialized', function() {
            assert.equal(jQuery('.btn-step').length, 4);
            assert.equal(jQuery('.btn-print:visible').length, 1);

            assert.equal(jQuery('.page-1:visible').length, 1);
            assert.isTrue(
                jQuery('a[href="#one"]').hasClass('btn-primary'));
            assert.equal(
                jQuery('a[href="#two"]').attr('disabled'), 'disabled');
            assert.equal(
                jQuery('a[href="#three"]').attr('disabled'), 'disabled');
            assert.equal(
                jQuery('a[href="#four"]').attr('disabled'), 'disabled');

            assert(jQuery('.map-layers').is(':visible'));
            assert.equal(jQuery('.map-layer').not(':visible').length, 4);
            assert.equal(jQuery('.actor-state.empty').length, 4);
        });

        it('help', function() {
            jQuery('.btn-help').click();
            assert.isTrue(jQuery('#help-modal').is(':visible'));
        });

        it('notepad', function() {
            jQuery('.btn-notepad').click();
            assert.isTrue(jQuery('#notepad-modal').is(':visible'));
        });
    });
});
