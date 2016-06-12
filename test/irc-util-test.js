const assert = require('chai').assert;
const ircUtil = require('../util/irc');
const sinon = require('sinon');

describe('Irc Util', () => {
    it('should correctly identify a command', () => {
        assert.isTrue(ircUtil.isCommand('!yes'));
        assert.isFalse(ircUtil.isCommand('.no'));
    });
    it('should not parse an invalid command', () => {
        const command = 'foo bar baz';
        const from = 'John';
        const to = '#test';
        assert.isNull(ircUtil.parseCommand(command, from, to));
    });
    it('should correctly parse a command', () => {
        const command = '!foo bar baz';
        const from = 'John';
        const to = '#test';
        const commandParsed = { name: 'foo', text: 'bar baz', args: [ 'bar', 'baz' ], from, to };
        assert.deepEqual(ircUtil.parseCommand(command, from, to), commandParsed);
    });
    it('should correctly map a command regardless of case', () => {
        const mapping = {
            foo: sinon.spy()
        };
        const client = {
            say: sinon.spy()
        };
        const command = '!FoO bar baz';
        const from = 'John';
        const to = '#test';
        ircUtil.mapCommand(ircUtil.parseCommand(command, from, to), mapping, client);
        assert.isTrue(mapping.foo.calledOnce);
    });
    it('should return false for a missing command', () => {
        const mapping = {};
        const client = {
            say: sinon.spy()
        };
        const command = '!FoO bar baz';
        const from = 'John';
        const to = '#test';
        assert.isFalse(ircUtil.mapCommand(ircUtil.parseCommand(command, from, to), mapping, client));
    });
});
