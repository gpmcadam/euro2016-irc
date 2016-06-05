const sinon = require('sinon');
const hello = require('../../commands/hello');
const assert = require('chai').assert;

describe('Hello Command', () => {
    it('should say hello to the person calling using the given irc client', () => {
        const command = { from: 'John', to: '#channel' };
        const client = { say: sinon.spy() };
        hello(command, client);
        assert(client.say.calledWith(command.to, `Hi, ${command.from}!`));
    });
});
