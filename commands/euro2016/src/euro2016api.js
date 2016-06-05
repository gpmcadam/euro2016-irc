const request = require('request');
const qs = require('querystring');
const Promise = require('bluebird');
const moment = require('moment');
const chrono = require('chrono-node')

const makeRequest = (path, params={}, app='mobile/euro2016', version=2) => {
    const url = `http://daaseuro2016.uefa.com/api/v${version}/${app}/en/${path}?${qs.stringify(params).replace('%24', '$')}`;
    // console.log(url);
    return new Promise((resolve, reject) => {
        request.get(url, (err, response, body) => {
            if (err) {
                reject(new Error('Oops! I can\t get that for you right now. Try again later?'));
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
        });
    });
};

const getGroupByTeam = findTeam => {
    return new Promise((resolve, reject) => {
        getGroups().then(resp => {
            const group = resp.groups.filter(group => {
                return group.standings.filter(({ team }) => {
                    const reg = new RegExp(findTeam.replace(' ', '.*'));
                    return reg.test(team.officialName);
                }).length > 0
            }).shift();
            if (!group) {
                reject(new Error('Oops! I can\'t find that country.'));
                return;
            }
            return resolve(group);
        });
    });
};

const getMatches = (queryDate) => {
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
            const matches = resp.matchInfoItems.filter(({ dateTime }) => moment(dateTime).isSame(queryDate, 'day')).sort((a, b) => moment(a.dateTime).isAfter(moment(b.dateTime)));
            resolve({
                matches, queryDate
            })
        });
    });
};

module.exports = { getGroups, getGroup, getGroupByTeam, getMatches };
