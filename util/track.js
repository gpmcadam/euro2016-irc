const request = require('request');
const Promise = require('bluebird');

module.exports = (action_name, actor, properties, ip_address, timestamp, utc_now, write_key) => {
    write_key = write_key || process.env.CALQ_WRITE_KEY;
    const payload = { action_name, actor, properties, ip_address, timestamp, utc_now, write_key };
    return new Promise((resolve, reject) => {
        request({ method: 'POST', url: 'http://api.calq.io/track', json: payload }, (err, response, body) => {
            if (err) {
                reject(err);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Invalid response from Calq API Server: ${response.statusCode}`));
                return;
            }
            resolve(body);
            return;
        });
    });
};
