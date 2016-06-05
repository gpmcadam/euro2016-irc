'use strict';

const request = require('request');
const qs = require('querystring');
const Promise = require('bluebird');
const moment = require('moment');
const chrono = require('chrono-node')

const makeRequest = (path, params, app, version) => {
    if (!params) {
        params = {};
    }
    if (!app) {
        app = 'mobile/euro2016';
    }
    if (!version) {
        version = 2;
    }

    const options = {
        headers: {
            'Connection': 'close',
            'Accept': '*/*',
            'User-Agent': 'Euro2016 - Prod/1.6 (iPhone; iOS 9.3.2; Scale/2.00)',
            'Accept-Language': 'en-GB;q=1',
            'Authorization': `SportDataLayer key=${process.env.EURO2016_API_KEY}`,
            'Accept-Encoding': 'gzip, deflate'
        },
        timeout: 10000
    }
    const url = `http://daaseuro2016.uefa.com/api/v${version}/${app}/en/${path}?${qs.stringify(params).replace(/%24/g, '$')}`;
    console.log(url);
    return new Promise((resolve, reject) => {
        request.get(url, options, (err, response, body) => {
            if (err) {
                reject(new Error('Oops! I can\'t get that for you right now. Try again later?'));
                return;
            }
            if (response.statusCode !== 200) {
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

const getGroup = groupId => {
    return new Promise((resolve, reject) => {
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
                }).length > 0
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

const getMatches = queryDate => {
    if (!queryDate) {
        queryDate = moment();
    }
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
            const matches = resp.matchInfoItems.filter(match => {
                return moment(match.dateTime).isSame(queryDate, 'day');
            }).sort((a, b) => {
                return moment(a.dateTime).isAfter(moment(b.dateTime))
            });
            resolve({
                matches, queryDate
            })
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
                return resolve(getPlayer(resp.playerSearchList[0].idPlayer));
            })
            .catch(reject);
    });
};

const getPlayer = playerId => {
    return new Promise((resolve, reject) => {
        // makeRequest(`players/${playerId}/matchlog`)
        //     .then(playerMatchLog => {
                makeRequest(`players/${playerId}`, { '$top': 20, '$skip': 0 })
                    .then(playerFullData => {
                        resolve(playerFullData);
                    })
                    .catch(reject);
            // });
    });
};

module.exports = { getGroups, getGroup, getGroupByTeam, getMatches, searchPlayer, getPlayer };
