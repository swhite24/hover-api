/**
 * hover-test.js
 *
 * (C) Steven White 2015
 */

var should = require('should'),
    hover = require('./..'),
    h = null;

describe('on require', function () {
    it('should provide a function', function () {
        should.exist(hover);
        hover.should.be.type('function');
    });
});

describe('on invoke', function () {
    it('should provide an object', function () {
        h = hover('username', 'password');
        should.exist(h);
        h.should.be.type('object');
    });

    ['getAllDomains', 'getAllDns', 'getDomain', 'getDomainDns', 'createARecord',
         'createMXRecord', 'updateDomainDns', 'removeDns'].forEach(function (method) {
        it('should expose ' + method, function () {
            should.exist(h[method]);
            h[method].should.be.type('function');
        });
    });
});
