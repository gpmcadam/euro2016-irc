const sinon = require('sinon');
const country = require('../../../commands/euro2016').country;
const assert = require('chai').assert;
const expect = require('chai').expect;
const nock = require('nock');
const moment = require('moment');
require('moment-timezone');
require('moment-precise-range-plugin');

moment.tz.setDefault('Europe/Paris');

describe('Euro2016!country', () => {
    it('should show all matches for a country', done => {
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-competitions.json');
        const command = { from: 'John', to: '#channel', text: 'england', args: [ 'england' ] };
        const client = { say: sinon.spy() };
        country(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledTwice);
                assert.equal(client.say.getCall(0).args[0], command.to);
                expect(client.say.getCall(1).args[1]).to.contain(command.from);
                expect(client.say.getCall(1).args[1]).to.contain('England');
                expect(client.say.getCall(1).args[1]).to.contain('Russia');
                expect(client.say.getCall(1).args[1]).to.contain('Wales');
                expect(client.say.getCall(1).args[1]).to.contain('Slovakia');
                done();
            });
    });
    it('should show an error if the service is unavailable', done => {
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
        country(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledOnce);
                expect(client.say.getCall(0).args[1]).to.contain('ERROR');
                done();
            });
    });
    it('should show a message if no country given', done => {
        const command = { from: 'John', to: '#channel', text: '', args: [  ] };
        const client = { say: sinon.spy() };
        country(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledOnce);
                assert.equal(client.say.getCall(0).args[0], command.to);
                expect(client.say.getCall(0).args[1]).to.contain('You must specify a country name to search for');
                done();
            });
    });
    it('should show a message if country not found', done => {
        nock('http://daaseuro2016.uefa.com/')
            .filteringPath(() => {
                return '/';
            })
            .get('/')
            .query(() => {
                return true;
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-competitions.json');
        const command = { from: 'John', to: '#channel', text: 'scotland', args: [ 'scotland' ] };
        const client = { say: sinon.spy() };
        country(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledOnce);
                assert.equal(client.say.getCall(0).args[0], command.to);
                expect(client.say.getCall(0).args[1]).to.contain('0 matches found');
                done();
            });
    });
});
