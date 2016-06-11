const sinon = require('sinon');
const matches = require('../../../commands/euro2016').matches;
const assert = require('chai').assert;
const expect = require('chai').expect;
const nock = require('nock');
const moment = require('moment');
require('moment-timezone');
require('moment-precise-range-plugin');

moment.tz.setDefault('Europe/Paris');

describe('Euro2016!matches', () => {

    describe('future matches', () => {
        it('should correctly parse the date without a query', (done) => {
            nock('http://daaseuro2016.uefa.com/')
                .filteringPath(() => {
                    return '/';
                })
                .get('/')
                .query(() => {
                    return true;
                })
                .replyWithFile(200, __dirname + '/stub/euro2016-competitions.json');
            const command = { from: 'John', to: '#channel', text: '', args: [] };
            const client = { say: sinon.spy() };
            matches(command, client)
                .finally(() => {
                    assert.isTrue(client.say.calledTwice);
                    assert.equal(client.say.getCall(0).args[0], command.to);
                    expect(client.say.getCall(0).args[1]).to.contain(moment().format('dddd, MMMM Do Z'));
                    done();
                });
        });
        it('should show matches for a given date', (done) => {
            nock('http://daaseuro2016.uefa.com/')
                .filteringPath(() => {
                    return '/';
                })
                .get('/')
                .query(() => {
                    return true;
                })
                .replyWithFile(200, __dirname + '/stub/euro2016-competitions.json');
            const command = { from: 'John', to: '#channel', text: 'friday june 10th' };
            const client = { say: sinon.spy() };
            matches(command, client)
                .finally(() => {
                    assert.isTrue(client.say.calledTwice);
                    assert.equal(client.say.getCall(0).args[0], command.to);
                    expect(client.say.getCall(1).args[1]).to.equal('John: France [21:00] Romania');
                    done();
                });
        });
    });

    describe('live matches', () => {
        it('should show the score for a live/archived match', (done) => {
            nock('http://daaseuro2016.uefa.com/')
                .filteringPath(() => {
                    return '/';
                })
                .get('/')
                .query(() => {
                    return true;
                })
                .replyWithFile(200, __dirname + '/stub/euro2016-competitions-live.json');
            const command = { from: 'John', to: '#channel', text: 'friday june 10th' };
            const client = { say: sinon.spy() };
            matches(command, client)
                .finally(() => {
                    assert.isTrue(client.say.calledTwice);
                    assert.equal(client.say.getCall(0).args[0], command.to);
                    expect(client.say.getCall(1).args[1]).to.equal('John: France 1 - 1 Romania');
                    done();
                });
        });
    });
});
