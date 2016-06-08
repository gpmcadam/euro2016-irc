const sinon = require('sinon');
const next = require('../../../commands/euro2016').next;
const assert = require('chai').assert;
const expect = require('chai').expect;
const nock = require('nock');

describe('Euro2016!next', () => {
    it('should show the next match when there are upcoming matches', () => {
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
            });
    });
    it('should say show an error if no upcoming matches', () => {
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
            });
    });
});
