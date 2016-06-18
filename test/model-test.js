/* global describe: true, it: true */

var assert = require('chai').assert;

var models = require('../src/models.js');

describe('Collections', function() {
    var actors = [{
        'name': 'John Smith',
        'interviewed': true,
        'questions': [{
            'answer': 'test answer',
            'question': 'test question'
        }]
    }, {
        'name': 'Jane Smith',
        'questions': []
    }];

    it('MapLayerList', function() {
        var data = [{'name': 'test layer'}];
        var a = new models.MapLayerList(data);
        var output = a.toTemplate();

        assert.equal(output.length, 1);
        assert.equal(data[0].name, output[0].name);
    });

    it('ActorList', function() {
        var a = new models.ActorList(actors);
        var output = a.toTemplate();

        assert.equal(output.length, 2);
        assert.equal(actors[0].name, 'John Smith');
        assert.isTrue(actors[0].interviewed);
        assert.isUndefined(actors[0].reply);
        assert.equal(actors[0].questions.length, 1);
        assert.equal(actors[0].questions[0].answer, 'test answer');
        assert.equal(actors[0].questions[0].question, 'test question');
        assert.isUndefined(actors[0].questions[0].asked);

        assert.equal(actors[1].name, 'Jane Smith');
        assert.equal(actors[1].questions.length, 0);
        assert.isUndefined(actors[1].interviewed);

        assert.equal(a.interviewCount(), 1);
    });

    it('Notepad', function() {
        var obj = new models.Notepad();
        assert.equal(obj.get('notes'), '');
    });

    it('Location', function() {
        var obj = new models.Notepad();
        assert.equal(obj.get('rowIndex'), null);
        assert.equal(obj.get('colIndex'), null);
    });

    it('Actor', function() {
        var actor = new models.Actor(actors[0]);
        assert.equal(actor.asked(), 0);

        actor.get('questions').at(0).set('asked', true);
        assert.equal(actor.asked(), 1);
    });
});
