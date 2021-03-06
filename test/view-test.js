/* global describe: true, before: true, it: true */
require('!file-loader?name=[name].[ext]!../test/view-test.html');

require('../src/static.js');
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

function interviewStakeholder(doneFx) {
    jQuery('img.actor').first().click();
    waitFor(function() {
        return jQuery('#profile-modal').is(':visible');
    }, doneFx);
}

describe('OfficeLocationApp', function() {

    before(function() {
        var elt = jQuery('.office-location');
        assert.ok(elt);
        jQuery(elt).html('');

        module.OfficeLocationApp.initialize();
    });

    describe('step1 interaction', function() {
        it('initialized', function() {
            assert.equal(jQuery('.btn-step').length, 4);
            assert.equal(jQuery('.activity-completed:visible').length, 0);

            assert.equal(jQuery('.page-1:visible').length, 1);
            assert.strictEqual(
                jQuery('a[href="#one"]').hasClass('btn-primary'), true);
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
            assert.strictEqual(jQuery('#help-modal').is(':visible'), true);
        });

        it('notepad', function() {
            jQuery('.btn-notepad').click();
            assert.strictEqual(jQuery('#notepad-modal').is(':visible'), true);
        });

        it('interview stakeholder', function(done) {
            interviewStakeholder(done);
        });

        it('interview stakeholder - cancel', function(done) {
            jQuery('#profile-modal .btn-danger').click();
            waitFor(function() {
                return jQuery('#profile-modal').is(':hidden');
            }, done);
        });

        it('interview stakeholder', function(done) {
            interviewStakeholder(done);
        });

        it('interview stakeholder - continue', function(done) {
            jQuery('#profile-modal .btn-info.interview').click();
            waitFor(function() {
                return jQuery('#profile-modal .panel-group').is(':visible') &&
                    jQuery('#profile-modal .question-state').is(':visible') &&
                    jQuery('.interview-state .question-state').is(':visible');
            }, done);
        });

        it('interview stakeholder - ask a question', function(done) {
            jQuery('#profile-modal .btn-info.ask').first().click();
            waitFor(function() {
                return jQuery('#profile-modal span.asked').length === 1 &&
                    jQuery('#profile-modal .ask[disabled="disabled"]')
                        .length === 5;
            }, done);
        });

        it('interview stakeholder - close question', function(done) {
            var sel = '#profile-modal .btn-close-question';
            jQuery(sel).click();
            waitFor(function() {
                return jQuery('#profile-modal .btn-warning.ask').first()
                    .html().trim() === 'Asked' &&
                    jQuery('#profile-modal .ask[disabled="disabled"]')
                        .length === 0;
            }, done);
        });
    });
});
