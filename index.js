'use strict';

require('dotenv').config({silent: true});

const irc = require('irc');
const moment = require('moment');
const crypto = require('crypto');

const euro2016commands = require('./commands/euro2016');
const alert = require('./util/alert');
const ircUtil = require('./util/irc');
const track = require('./util/track');

const server = process.env.IRC_SERVER || 'irc.rizon.net';
const nick = process.env.IRC_NICK || 'Euro2016';
const channels = process.env.IRC_CHANNELS.split(',').map(channel => `#${channel }`) || [];
const port = process.env.IRC_PORT || 6667;
const realName = process.env.IRC_REALNAME || null;
const userName = process.env.IRC_NAME || null;

const client = new irc.Client(server, nick, { port, channels, realName, userName });

const ALERT_MESSAGES_PER_MINUTE = process.env.IRC_ALERT_MESSAGES_PER_MINUTE || 100;
const commandMonitor = {};

const helpMapping = {
    group: {
        desc: 'Show standings for a group',
        usage: '[query]',
        example: ['a', 'france']
    },
    country: {
        desc: 'Show matches for a country',
        usage: '[country]',
        example: ['england', 'rep ireland', 'ger'],
        aliases: ['team']
    },
    matches: {
        desc: 'Show matches on a given day',
        usage: '[day]',
        example: ['tomorrow', 'this friday', 'yesterday']
    },
    player: {
        desc: 'Query player information (beta)',
        usage: '[player name]',
        example: ['rooney', 'rashford', 'ibra', 'cech']
    },
    next: {
        desc: 'Show the next match',
        usage: ''
    },
    lineups: {
        desc: 'Show the lineups for a specific match or the next match',
        usage: '!lineups [COUNTRY]',
        example: ['', 'england', 'ger']
    }
};

const commandMapping = {
    hello: require('./commands/hello'),
    help: (command, client) => require('./commands/help')(command, client, helpMapping, Object.keys(commandMapping)),
    group: euro2016commands.group,
    country: euro2016commands.country,
    team: euro2016commands.country,
    matches: euro2016commands.matches,
    player: euro2016commands.player,
    next: euro2016commands.next,
    lineups: euro2016commands.lineups
};

client.addListener('registered', () => {
    if (process.env.IRC_PASSWORD) {
        client.say('nickserv', `IDENTIFY ${process.env.IRC_PASSWORD}`);
    }
});

client.addListener('message', (from, to, message) => {
    const command = ircUtil.parseCommand(message, from, to);
    if (!command) {
        return;
    }
    const min = moment(new Date).format('YYYY-MM-DD HH:mm');
    if (!commandMonitor[min]) {
        commandMonitor[min] = 0;
    }
    commandMonitor[min]++;
    if (commandMonitor[min] === ALERT_MESSAGES_PER_MINUTE) {
        alert('Euro 2016 IRC Bot High usage!', `Over ${ALERT_MESSAGES_PER_MINUTE} commands per minute detected.`);
    }

    const userHash = crypto.createHash('sha256').update(from).digest('hex');
    if (ircUtil.mapCommand(command, commandMapping, client)) {
        track('command', userHash, { command, server, message });
    } else {
        track('invalid_command', userHash, { command, server, message });
    }
});

/* eslint-disable no-console */
client.addListener('error', message => {
    alert('ERROR with Euro2016 IRC Bot', message);
    track('error', 0, { server, nick, message });
    console.log('error: ', message);
});
