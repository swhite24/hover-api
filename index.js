/**
 * index.js
 * Entry point into hover-api
 *
 * (C) Steven White 2015
 */

var request = require('request'),
    _ = require('lodash');

module.exports = function (username, password) {

    // Base url for all hover api requests
    var baseUrl = 'https://www.hover.com/api';

    // Captured from cookie in hover authentication request.
    var cookies = request.jar();

    // Note whether login has occured.
    // A successful login generates a "hoverauth" cookie
    var _loggedin = false;

    // Create request wrapper, enabling json and cookies
    var r = request.defaults({
        jar: cookies,
        json: true
    });

    /**
     * Retrieve list of all domains in account
     *
     * @param {Function} cb
     * @api public
     */
    function getAllDomains (cb) {
        _hoverRequest('GET', '/domains', cb);
    }

    /**
     * Retrieve list of all dns records in account
     *
     * @param {Function} cb
     * @api public
     */
    function getAllDns (cb) {
        _hoverRequest('GET', '/dns', cb);
    }

    /**
    * Retrieve individual domain in account
    *
    * @param {String} domain Domain identifier
    * @param {Function} cb
    * @api public
    */
    function getDomain (domain, cb) {
        _hoverRequest('GET', '/domains/' + domain, cb);
    }

    /**
    * Retrieve list of all dns records for particular domain
    *
    * @param {String} domain Domain identifier
    * @param {Function} cb
    * @api public
    */
    function getDomainDns (domain, cb) {
        _hoverRequest('GET', '/domains/' + domain + '/dns', cb);
    }

    /**
     * Create a new A record under the specified domain
     *
     * @param {String} domain Domain identifier
     * @param {String} subdomain Subdomain of record
     * @param {String} ip IP Address of record
     * @param {Function} cb
     * @api public
     */
    function createARecord (domain, subdomain, ip, cb) {
        var body = {
            name: subdomain,
            type: 'A',
            content: ip
        };
        _hoverRequest('POST', '/domains/' + domain + '/dns', body, cb);
    }

    /**
     * Create a new MX record under the specified domain
     *
     * @param {String} domain Domain identifier
     * @param {String} subdomain Subdomain of record
     * @param {String} priority Priority of record
     * @param {String} ip IP Address of record
     * @param {Function} cb
     * @api public
     */
    function createMXRecord (domain, subdomain, priority, ip, cb) {
        var body = {
            name: subdomain,
            type: 'MX',
            content: [priority, ip].join(' ')
        };
        _hoverRequest('POST', '/domains/' + domain + '/dns', body, cb);
    }

    /**
     * Update an existing domain record
     *
     * @param {String} dns DNS identifier
     * @param {String} ip New IP Address of record
     * @param {Function} cb
     * @api public
     */
    function updateDomainDns (dns, ip, cb) {
        var body = {
            content: ip
        };
        _hoverRequest('PUT', '/dns/' + dns, body, cb);
    }

    /**
     * Remove an existing dns record
     *
     * @param {String} dns DNS identifier
     * @param {Function} cb
     * @api public
     */
    function removeDns (dns, cb) {
        _hoverRequest('DELETE', '/dns/' + dns, cb);
    }

    /**
     * Proxy request to hover API. Will issue login request if not
     * previously generated.
     *
     * @param {String} method
     * @param {String} path
     * @param {Function} cb
     * @api private
     */
    function _hoverRequest (method, path, body, cb) {
        // Check if previously logged in
        if (_loggedin) return _hoverApiRequest(method, path, body, cb);

        // Issue login request with provided username / password
        r.post({
            uri: baseUrl + '/login',
            form: {username: username, password: password},
        }, _rCallback(function (err) {
            if (err) return cb(err);

            // Note logged in / forward request
            _loggedin = true;
            _hoverApiRequest(method, path, body, cb);
        }));
    }

    /**
     * Issue request to hover api.
     *
     * @param {String} method
     * @param {String} path
     * @param {Object} [body]
     * @param {Function} cb
     * @api private
     */
    function _hoverApiRequest (method, path, body, cb) {
        // Check body provided
        if (typeof body === 'function') {
            cb = body;
            body = null;
        }

        // Default options
        var options = {
            method: method,
            uri: baseUrl + path
        };

        // Add body if provided
        if (body) options.body = body;

        // Issue request
        r(options, _rCallback(function (err, data) {
            if (err) return cb(err);

            // Pull out property name
            var key = _.without(_.keys(data), 'succeeded');
            cb(null, data[key]);
        }));
    }

    /**
     * Request callback abstraction to deliver http or connection error.
     *
     * @param {Function} cb
     * @return {Function}
     * @api private
     */
    function _rCallback (cb) {
        return function (err, res, data) {
            if (err) return cb(err);
            if (!res || res.statusCode > 400) return cb(data);

            cb(null, data);
        };
    }

    // Expose API
    return {
        getAllDomains: getAllDomains,
        getAllDns: getAllDns,
        getDomain: getDomain,
        getDomainDns: getDomainDns,
        createARecord: createARecord,
        createMXRecord: createMXRecord,
        updateDomainDns: updateDomainDns,
        removeDns: removeDns
    };
};
