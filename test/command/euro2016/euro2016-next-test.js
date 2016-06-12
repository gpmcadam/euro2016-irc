'use strict';

const sinon = require('sinon');
const next = require('../../../commands/euro2016').next;
const assert = require('chai').assert;
const expect = require('chai').expect;
const nock = require('nock');

describe('Euro2016!next', () => {
    it('should show an error when the service is unavailable', done => {

        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .reply(500);
        const command = { from: 'John', to: '#channel', text: '', args: [] };
        const client = { say: sinon.spy() };
        next(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledOnce);
                assert.equal(client.say.getCall(0).args[0], command.to);
                expect(client.say.getCall(0).args[1]).to.contain('ERROR');
                done();
            });
    });

    it('should show the next match when there are upcoming matches', done => {

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
        next(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledOnce);
                assert.equal(client.say.getCall(0).args[0], command.to);
                expect(client.say.getCall(0).args[1]).to.contain('John: Next match is');
                done();
            });
    });

    it('should show the next game based on date', done => {
        const clock = sinon.useFakeTimers(new Date(2016,5,11,17,0,1).getTime());
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
        next(command, client)
            .finally(() => {
                expect(client.say.getCall(0).args[1]).to.contain('John: Next match is');
                expect(client.say.getCall(0).args[1]).to.contain('England');
                expect(client.say.getCall(0).args[1]).to.contain('Russia');
                expect(client.say.getCall(0).args[1]).to.contain('Saturday, June 11th');
                done();
                clock.restore();
            });

    });

    it('should say show an error if no upcoming matches', done => {
        const clock = sinon.useFakeTimers(new Date(2016,7,11,16,0,0).getTime());
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .replyWithFile(200, __dirname + '/stub/euro2016-competitions-empty.json');
        const command = { from: 'John', to: '#channel', text: '', args: [] };
        const client = { say: sinon.spy() };
        next(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledOnce);
                assert.equal(client.say.getCall(0).args[0], command.to);
                expect(client.say.getCall(0).args[1]).to.equal('John: ERROR! No upcoming matches found');
                done();
                clock.restore();
            });
    });


});
