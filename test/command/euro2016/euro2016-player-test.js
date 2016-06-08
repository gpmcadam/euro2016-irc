const sinon = require('sinon');
const player = require('../../../commands/euro2016').player;
const assert = require('chai').assert;
const expect = require('chai').expect;
const nock = require('nock');

describe('Euro2016!player', () => {
    it('should show player details for a query', (done) => {
        nock('http://daaseuro2016.uefa.com/')
            .get('/api/v2/football/en/competitions/3/seasons/2016/players')
            .query({
                tournamentPhase: 2,
                isMobileApp: true,
                '$top': 1000,
                webname: 'ronaldo'
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-playersearch.json')
            .get('/api/v2/mobile/euro2016/en/players/63706')
            .query({
                '$top': 20,
                '$skip': 0
            })
            .replyWithFile(200, __dirname + '/stub/euro2016-player.json');
        const command = { from: 'John', to: '#channel', text: 'ronaldo' };
        const client = { say: sinon.spy() };
        player(command, client)
            .finally(() => {
                assert.isTrue(client.say.calledOnce);
                assert.equal(client.say.getCall(0).args[0], command.to);
                expect(client.say.getCall(0).args[1]).to.contain('Cristiano Ronaldo');
                done();
            });
    });
});
