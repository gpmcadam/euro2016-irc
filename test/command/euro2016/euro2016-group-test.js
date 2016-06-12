const sinon = require('sinon');
const group = require('../../../commands/euro2016').group;
const assert = require('chai').assert;
const expect = require('chai').expect;
const nock = require('nock');

describe('Euro2016!group', () => {
    it('should show the group for a group letter', done => {
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-groups.json');
        const command = { from: 'John', to: '#channel', text: 'a', args: [ 'a' ] };
        const client = { say: sinon.spy() };
        group(command, client)
            .finally(() => {
                assert.isTrue(client.say.callCount > 4);
                expect(client.say.getCall(4).args[1]).to.contain('France');
                done();
            });
    });
    it('should show an error for an invalid team', done => {
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-groups.json');
        const command = { from: 'John', to: '#channel', text: 'scotland', args: [ 'scotland' ] };
        const client = { say: sinon.spy() };
        group(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledOnce);
                expect(client.say.getCall(0).args[1]).to.contain('ERROR');
                done();
            });
    });
    it('should show an error for an invalid group letter', done => {
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-groups.json');
        const command = { from: 'John', to: '#channel', text: 'Z', args: [ 'z' ] };
        const client = { say: sinon.spy() };
        group(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledOnce);
                expect(client.say.getCall(0).args[1]).to.contain('ERROR');
                done();
            });
    });
    it('should show an error when command fails', done => {
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .reply(500);
        const command = { from: 'John', to: '#channel', text: 'england', args: [ 'england' ] };
        const client = { say: sinon.spy() };
        group(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledOnce);
                expect(client.say.getCall(0).args[1]).to.contain('ERROR');
                done();
            });
    });
    it('should show an error when no group name given', done => {
        const command = { from: 'John', to: '#channel', text: '', args: [] };
        const client = { say: sinon.spy() };
        group(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledOnce);
                expect(client.say.getCall(0).args[1]).to.contain('specify a group name');
                done();
            });
    });
    it('should show the group for a team name', done => {
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-groups.json');
        const command = { from: 'John', to: '#channel', text: 'france', args: [ 'france' ] };
        const client = { say: sinon.spy() };
        group(command, client)
            .finally(() => {
                assert.isTrue(client.say.callCount > 4);
                expect(client.say.getCall(4).args[1]).to.contain('France');
                done();
            });
    });
});
