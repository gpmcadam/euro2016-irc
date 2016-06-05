require('dotenv').config({silent: true});

const irc = require('irc');
const euro2016commands = require('./commands/euro2016');

const server = process.env.IRC_SERVER || 'irc.rizon.net';
const nick = process.env.IRC_NICK || 'Euro2016';
const channels = process.env.IRC_CHANNELS.split(',').map(channel => `#${channel }`) || [];
const port = process.env.IRC_PORT || 6667;

const client = new irc.Client(server, nick, { port, channels });


const commandMapping = {
    hello: require('./commands/hello'),
    group: euro2016commands.group,
    country: euro2016commands.country,
    team: euro2016commands.country,
    matches: euro2016commands.matches,
    player: euro2016commands.player
};

const mapCommand = (command, mapping, client) => {
    if (!mapping[command.name]) {
        return false;
    }
    return mapping[command.name](command, client);
};

const isCommand = message => {
    return message.substring(0, 1) === '!';
};

const parseCommand = (message, from, to) => {
    if (!isCommand(message)) {
        return null;
    }
    const parts = message.split(' ');
    const name = parts.shift().substring(1);
    const text = parts.join(' ');
    return {
        name,
        args: parts,
        text,
        from,
        to
    };
};

client.addListener('message', function (from, to, message) {
    const command = parseCommand(message, from, to);
    if (!command) {
        return;
    }
    mapCommand(command, commandMapping, client);
});

client.addListener('error', function(message) {
    console.log('error: ', message);
});
