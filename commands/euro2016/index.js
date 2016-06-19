'use strict';

const euro2016 = require('./src/euro2016api');
const AsciiTable = require('ascii-table');
const moment = require('moment');
const Promise = require('bluebird');

require('moment-timezone');
require('moment-precise-range-plugin');

moment.tz.setDefault('Europe/Paris');

const sendLineUps = (command, client, result) => {
    const lineUps = result.lineups && result.lineups.lineupRootContract.lineUpHeader.status !== null ? result.lineups.lineupRootContract : null;
    const match = result.match || null;
    if (!match) {
        client.say(command.to, `${command.from}: No matches found`);
        return;
    }
    if (!lineUps) {
        client.say(command.to, `${command.from}: No lineups released for ${match.homeTeamName} vs ${match.awayTeamName}`);
        return;
    }
    const lineUpFormat = lineup => {
        return lineup.filter(l => l.isFielded === 1).map(l => `${l.kindNameAbbreviation || ''} ${l.bibNum}. ${l.playerSurname}`).join(', ');
    };
    client.say(command.to, `${command.from}: Lineups for ${lineUps.lineUpHeader.homeTeam} vs ${lineUps.lineUpHeader.awayTeam}`);
    client.say(command.to, `${command.from}: ${lineUps.lineUpHeader.homeTeam} ${lineUpFormat(lineUps.homeLineUpItems)}`);
    client.say(command.to, `${command.from}: ${lineUps.lineUpHeader.awayTeam} ${lineUpFormat(lineUps.awayLineUpItems)}`);
};

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
    let matchesSuffix = 'found';
    if (result.queryDate) {
        matchesSuffix = `found on ${result.queryDate.format('dddd, MMMM Do Z')}`;
    } else if (result.queryCountry) {
        matchesSuffix = `found for ${result.queryCountry}`;
    }
    client.say(command.to, `${command.from}: ${result.matches.length} matches ${matchesSuffix}`);
    const formattedMatches = result.matches.map(match => {
        const matchStatus = match.status === 1 ? `[${match.dateTime.format('HH:mm')}]` : `${match.results.homeGoals} - ${match.results.awayGoals}`;
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
        return new Promise(resolve => {
            client.say(command.to, `${command.from}: You must specify a group name!`);
            resolve();
        });
    }
    return euro2016.getGroup(command.args[0], command.text.length > 1)
        .then(group => sendGroup(command, client, group))
        .catch(e => {
            sendError(command, client, e.message);
        });
};

const country = (command, client) => {
    if (command.args.length < 1) {
        return new Promise(resolve => {
            client.say(command.to, `${command.from}: You must specify a country name to search for!`);
            resolve();
        });
    }
    return euro2016.getMatchesForTeam(command.text)
        .then(result => {
            sendMatches(command, client, result);
        })
        .catch(e => {
            sendError(command, client, e.message);
        });
};

const matches = (command, client) => {
    return euro2016.getMatches(command.text || moment(new Date))
        .then(result => {
            sendMatches(command, client, result);
        })
        .catch(e => {
            sendError(command, client, e.message);
        });
};

const player = (command, client) => {
    return euro2016.searchPlayer(command.text)
        .then(player => {
            sendPlayer(command, client, player);
        })
        .catch(e => {
            sendError(command, client, e.message);
        });
};

const next = (command, client) => {
    return euro2016.getMatches()
        .then(result => {
            const matches = result.matches;
            const nextMatch = matches.filter(match => {
                return match.status === 1 && match.dateTime.isAfter(moment(new Date));
            }).shift();
            if (!nextMatch) {
                return sendError(command, client, 'No upcoming matches found');
            }
            return sendNextMatch(command, client, nextMatch);
        })
        .catch(e => {
            return sendError(command, client, e.message);
        });
};

const lineups = (command, client) => {
    return euro2016.getLineups(command.text)
        .then(result => {
            return sendLineUps(command, client, result);
        })
        .catch(e => {
            return sendError(command, client, e.message);
        });
};

module.exports = { group, country, matches, player, next, lineups };
