'use strict';

const euro2016 = require('./src/euro2016api');
const AsciiTable = require('ascii-table');
const moment = require('moment');
require('moment-precise-range-plugin');

const sendGroup = (command, client, group) => {
    const table = new AsciiTable();
    client.say(command.to, `${command.from}: ${group.groupName}`);
    table.setHeading('Team', 'W', 'L', 'D', 'GD', 'Pts');
    group.standings.forEach(standing => table.addRow(standing.team.officialName, standing.won, standing.lost, standing.drawn, standing.goalDifference, standing.points));
    table.toString().split('\n').forEach(line => client.say(command.to, line));
};

const sendNextMatch = (command, client, match) => {
    const diff = moment.preciseDiff(match.dateTime, moment());
    client.say(command.to, `${command.from}: Next match is ${match.homeTeamName} vs ${match.awayTeamName} in ${diff} at ${match.dateTime.format('HH:mm dddd, MMMM Do Z')}`);
};

const sendMatches = (command, client, result) => {
    client.say(command.to, `${command.from}: ${result.matches.length} matches found on ${result.queryDate.format('dddd, MMMM Do Z')}`);
    const formattedMatches = result.matches.map(match => {
        const matchStatus = match.status === 1 ? `[${match.dateTime.format('HH:mm')}]` : `${match.results.homeTeamScore - match.results.awayTeamScore}`;
        // TODO when we know the match statuses, we should show this is LIVE, HT, FT etc.
        return `${match.homeTeamName} ${matchStatus} ${match.awayTeamName}`;
    });
    formattedMatches.length > 0 && client.say(command.to, `${command.from}: ${formattedMatches.join(' | ')}`);
};

const sendPlayer = (command, client, player) => {
    client.say(command.to, `${command.from}: ${player.profile.webNameAlt} (#${player.profile.jerseyNumber} ${player.profile.fieldSubPosName}) ${player.profile.countryName} (${player.profile.clubOfficialName}) - Played: ${player.profile.matchesPlayed} Scored: ${player.profile.goalsScored} Conceded: ${player.profile.goalsConceded}`);
};

const sendError = (command, client, message) => {
    client.say(command.to, `${command.from}: ERROR! ${message}`);
};

const group = (command, client) => {
    if (command.args.length < 1) {
        client.say(command.to, `${command.from}: You must specify a group name!`);
        return;
    }
    if (command.text.length > 1) {
        return country(command, client);
    }
    euro2016.getGroup(command.args[0])
        .then(group => {
            sendGroup(command, client, group);
        })
        .catch(e => {
            sendError(command, client, e.message);
        });
};

const country = (command, client) => {
    if (command.args.length < 1) {
        client.say(command.to, `${command.from}: You must specify a countr name to search for!`);
        return;
    }
    euro2016.getGroupByTeam(command.text)
        .then(group => {
            sendGroup(command, client, group);
        })
        .catch(e => {
            sendError(command, client, e.message);
        });
};

const matches = (command, client) => {
    euro2016.getMatches(command.text)
        .then(result => {
            sendMatches(command, client, result);
        })
        .catch(e => {
            sendError(command, client, e.message);
        });
};

const player = (command, client) => {
    euro2016.searchPlayer(command.text)
        .then(player => {
            sendPlayer(command, client, player);
        })
        .catch(e => {
            sendError(command, client, e.message);
        });
};

const next = (command, client) => {
    euro2016.getMatches()
        .then(result => {
            const matches = result.matches;
            const nextMatch = matches.filter(match => {
                return match.status === 1;
            }).shift();
            if (!nextMatch) {
                sendError(command, client, 'No upcoming matches found');
            }
            sendNextMatch(command, client, nextMatch);
        })
        .catch(e => {
            sendError(command, client, e.message);
        });
};

module.exports = { group, country, matches, player, next };
