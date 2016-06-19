'use strict';

const request = require('request');
const qs = require('querystring');
const Promise = require('bluebird');
const moment = require('moment');
const chrono = require('chrono-node');

const alert = require('../../../util/alert');

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss ZZ';

const makeRequest = (path, params, app) => {
    if (!app) {
        app = 'mobile/euro2016';
    }
    const version = 2;
    const options = {
        headers: {
            'Connection': 'close',
            'Accept': '*/*',
            'User-Agent': 'Euro2016 - Prod/1.6 (iPhone; iOS 9.3.2; Scale/2.00)',
            'Accept-Language': 'en-GB;q=1',
            'Authorization': `SportDataLayer key=${process.env.EURO2016_API_KEY || ''}`,
            'Accept-Encoding': 'gzip, deflate'
        },
        timeout: 10000
    };
    const url = `http://daaseuro2016.uefa.com/api/v${version}/${app}/en/${path}?${qs.stringify(params).replace(/%24/g, '$')}`;
    return new Promise((resolve, reject) => {
        request.get(url, options, (err, response, body) => {
            if (err) {
                alert('Euro2016 Service Failure', err);
                reject(new Error('Oops! I can\'t get that for you right now. Try again later?'));
                return;
            }
            if (response.statusCode !== 200) {
                alert('Euro2016 Service Failure', err);
                reject(new Error('Oops! I can\'t get that for you right now. Try again later?'));
                return;
            }
            resolve(JSON.parse(body));
        });
    });
};

const getGroups = () => {
    return makeRequest('groups', { tournamentPhase: 2 });
};

const getGroup = (groupId, byTeam) => {
    return new Promise((resolve, reject) => {
        if (byTeam === true) {
            getGroupByTeam(groupId)
                .then(resolve)
                .catch(reject);
            return;
        }
        getGroups().then(resp => {
            const group = resp.groups.filter(group => group.groupName.toUpperCase() === `GROUP ${groupId.toUpperCase()}`).shift();
            if (!group) {
                reject(new Error('No such group.'));
                return;
            }
            return resolve(group);
        })
        .catch(reject);
    });
};

const getGroupByTeam = findTeam => {
    return new Promise((resolve, reject) => {
        getGroups().then(resp => {
            const group = resp.groups.filter(group => {
                return group.standings.filter(standing => {
                    const team = standing.team;
                    const reg = new RegExp(findTeam.replace(' ', '.*'), 'i');
                    return reg.test(team.officialName);
                }).length > 0;
            }).shift();
            if (!group) {
                reject(new Error('Oops! I can\'t find that country.'));
                return;
            }
            return resolve(group);
        })
        .catch(reject);
    });
};

const matchTeamName = (teamName, query) => {
    return (new RegExp(query.replace(' ', '.*'), 'i')).test(teamName);
};

const getMatchesForTeam = findTeam => {
    return new Promise((resolve, reject) => {
        getMatches().then(resp => {
            // console.log(resp.matches);
            // console.log(resp.matches.filter(match => match.matchDateTime !== undefined).length);
            resp.matches = resp.matches.filter(match => {
                const isAwayTeam = matchTeamName(match.awayTeamName, findTeam);
                const isHomeTeam = matchTeamName(match.homeTeamName, findTeam);
                if (isAwayTeam) {
                    resp.queryCountry = match.awayTeamName;
                    return true;
                } else if (isHomeTeam) {
                    resp.queryCountry = match.homeTeamName;
                    return true;
                }
            });
            resolve(resp);
        })
        .catch(reject);
    });
};

const getMatches = queryDate => {
    if (typeof queryDate === 'string') {
        queryDate = moment(chrono.parseDate(queryDate));
    }
    return new Promise((resolve, reject) => {
        makeRequest('competitions/3/seasons/2016/matches', {
            dateFrom: '20160501',
            dateTo: '20160712',
            isMobileApp: 'true',
            '$top': 100
        }, 'football')
        .then(resp => {
            let matches = resp.matchInfoItems.map((match) => {
                match.dateTime = moment(match.dateTime, DATE_FORMAT);
                return match;
            });
            matches.sort((a, b) => {
                return a.dateTime.diff(b.dateTime);
            });
            if (queryDate) {
                matches = matches.filter(match => {
                    return match.dateTime.isSame(queryDate, 'day');
                });
            }
            resolve({
                matches, queryDate
            });
        })
        .catch(reject);
    });
};

const searchPlayer = query => {
    return new Promise((resolve, reject) => {
        makeRequest('competitions/3/seasons/2016/players', {
            tournamentPhase: 2,
            isMobileApp: 'true',
            '$top': 1000,
            webname: query
        }, 'football')
        .then(resp => {
            if (!resp || !resp.playerSearchList || resp.playerSearchList.length < 1) {
                reject(new Error('No such player'));
                return;
            }
            getPlayer(resp.playerSearchList[0].idPlayer)
                .then(fullPlayerData => {
                    resolve(fullPlayerData);
                });
        })
        .catch(reject);
    });
};

const getPlayer = playerId => {
    return new Promise((resolve, reject) => {
        makeRequest(`players/${playerId}`, { '$top': 20, '$skip': 0 })
            .then(resolve)
            .catch(reject);
    });
};

const getLineupsForMatch = matchId => {
    return new Promise((resolve, reject) => {
        makeRequest(`matches/${matchId}/lineup`, {
            isMobileApp: 'true'
        }, 'football')
        .then(resolve)
        .catch(reject);
    });
};

const getLineups = next => {
    if (!next) {
        next = false;
    }
    return new Promise((resolve, reject) => {
        getMatches().then(resp => {
            const matches = resp.matches;
            const lineupResp = {
                match: null,
                lineups: null
            };
            if (next) {
                lineupResp.match = matches
                    .filter(match => match.status === 1 && match.dateTime.isAfter(moment(new Date)))
                    .shift();
            } else {
                lineupResp.match = matches
                    .filter(match =>
                        match.status !== 1
                            && match.dateTime.isSame(moment(new Date), 'd'))
                    .shift();
            }
            if (!lineupResp.match) {
                resolve(lineupResp);
                return;
            }
            getLineupsForMatch(lineupResp.match.idMatch)
                .then(lineups => {
                    lineupResp.lineups = lineups;
                    resolve(lineupResp);
                })
                .catch(reject);
        })
        .catch(reject);
    });
};

module.exports = {
    getGroups,
    getGroup,
    getGroupByTeam,
    getMatches,
    getMatchesForTeam,
    searchPlayer,
    getPlayer,
    getLineups
};
