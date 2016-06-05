const euro2016 = require('./src/euro2016api');
const AsciiTable = require('ascii-table');

const sendGroup = (command, client, group) => {
    const table = new AsciiTable();
    client.say(command.to, `${command.from}: ${group.groupName}`);
    table.setHeading('Team', 'W', 'L', 'D', 'GD', 'Pts');
    group.standings.forEach(standing => table.addRow(standing.team.officialName, standing.won, standing.lost, standing.drawn, standing.goalDifference, standing.points));
    table.toString().split('\n').forEach(line => client.say(command.to, line));
};

const sendMatches = (command, client, result) => {
    client.say(command.to, `${command.from}: ${result.matches.length} matches found on ${result.queryDate.format('dddd, MMMM Do')}`);
    const formattedMatches = result.matches.map(match => {
        const matchStatus = match.status == 1 ? `[${match.time}]` : `${match.results.homeTeamScore - match.results.awayTeamScore}`;
        // TODO when we know the match statuses, we should show this is LIVE, HT, FT etc.
        return `${match.homeTeamName} ${matchStatus} ${match.awayTeamName}`;
    });
    formattedMatches.length > 0 && client.say(command.to, `${command.from}: ${formattedMatches.join(' | ')}`);
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
}

const matches = (command, client) => {
    euro2016.getMatches(command.text)
        .then(result => {
            sendMatches(command, client, result);
        })
        .catch(e => {
            sendError(command, client, e.message);
        });
};

module.exports = { group, country, matches };
