const assert = require('chai').assert;
const track = require('../util/track');
const nock = require('nock');

describe('Track Util', () => {
    it('should track using properties given', done => {
        nock('http://api.calq.io/')
            .filteringRequestBody(body => {
                assert.deepEqual(JSON.parse(body), {
                    action_name: 'test',
                    actor: 1,
                    properties: { foo: 'bar' },
                    ip_address: 123,
                    timestamp: 456,
                    utc_now: false,
                    write_key: 789
                });
                return body;
            })
            .post('/track')
            .reply(200, {});
        track('test', 1, { foo: 'bar' }, 123, 456, false, 789).then(() => { done(); });
    });
    it('should track using env variable api key', done => {
        process.env.CALQ_WRITE_KEY = 'hi';
        nock('http://api.calq.io/')
            .filteringRequestBody((body) => {
                assert.deepEqual(JSON.parse(body), {
                    action_name: 'test',
                    actor: 1,
                    properties: { foo: 'bar' },
                    write_key: 'hi'
                });
                return body;
            })
            .post('/track')
            .reply(200, {});
        track('test', 1, { foo: 'bar' }).then(() => { done(); });
    });
    it('should handle server error when tracking', done => {
        nock('http://api.calq.io/')
            .post('/track')
            .reply(500);
        track('test', 1, { foo: 'bar' })
            .catch(e => {
                assert.equal(e.message, 'Invalid response from Calq API Server: 500');
                done();
            });
    });
    it('should handle error when tracking', done => {
        nock('http://api.calq.io/')
            .post('/track')
            .replyWithError('something awful happened');
        track('test', 1, { foo: 'bar' })
            .catch(e => {
                assert.equal(e.message, 'something awful happened');
                done();
            });
    });
});
