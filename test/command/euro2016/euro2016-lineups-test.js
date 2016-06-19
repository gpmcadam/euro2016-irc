const sinon = require('sinon');
const lineups = require('../../../commands/euro2016').lineups;
const assert = require('chai').assert;
const expect = require('chai').expect;
const nock = require('nock');

describe('Euro2016!lineups', () => {
    it('should show the lineups for the next or current match', done => {
        const clock = sinon.useFakeTimers(new Date(2016,5,18,16,0,0).getTime());
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-lineup-competitions.json')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-lineup.json');
        const command = { from: 'John', to: '#channel', text: '', args: [] };
        const client = { say: sinon.spy() };
        lineups(command, client)
            .finally(() => {
                assert.isTrue(client.say.callCount === 3);
                expect(client.say.getCall(1).args[1]).to.contain('Akinfeev');
                clock.restore();
                done();
            });
    });
    it('should show no lineups for match if none', done => {
        const clock = sinon.useFakeTimers(new Date(2016,5,19,10,0,0).getTime());
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-lineup-competitions.json')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-lineup-empty.json');
        const command = { from: 'John', to: '#channel', text: 'albania', args: ['albania'] };
        const client = { say: sinon.spy() };
        lineups(command, client)
            .finally(() => {
                assert.isTrue(client.say.called);
                expect(client.say.getCall(0).args[1]).to.contain('Albania');
                expect(client.say.getCall(0).args[1]).to.contain('Romania');
                clock.restore();
                done();
            });
    });
    it('should show no lineups if none', done => {
        const clock = sinon.useFakeTimers(new Date(2016,8,19,16,0,0).getTime());
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-lineup-competitions.json')
            .filteringPath(() => {
                return '/';
            });
        const command = { from: 'John', to: '#channel', text: 'france', args: ['france'] };
        const client = { say: sinon.spy() };
        lineups(command, client)
            .finally(() => {
                assert.isTrue(client.say.called);
                expect(client.say.getCall(0).args[1]).to.contain('No matches found');
                clock.restore();
                done();
            });
    });
    it('should show an error if service unavailable', done => {
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .reply(404)
            .filteringPath(() => {
                return '/';
            });
        const command = { from: 'John', to: '#channel', text: 'france', args: ['france'] };
        const client = { say: sinon.spy() };
        lineups(command, client)
            .finally(() => {
                assert.isTrue(client.say.called);
                expect(client.say.getCall(0).args[1]).to.contain('ERROR');
                done();
            });
    });
});
