'use strict';

module.exports = (command, client) => {
    client.say(command.to, `Hi, ${command.from}!`);
};
