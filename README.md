# hover-api

Hover DNS api client, inspired completely by [https://gist.github.com/dankrause/5585907](https://gist.github.com/dankrause/5585907).

## Usage

```javascript
var hover = require('hover-api')('username', 'password');

hover.getAllDomains(function (err, domains) {
    console.log(domains);
});
```

## API

* getAllDomains(cb)
* getAllDns(cb)
* getDomain(domain, cb)
* getDomainDns(domain, cb)
* createARecord (domain, subdomain, ip, cb)
* createMXRecord (domain, subdomain, priority, ip, cb)
* updateDomainDns (dns, ip, cb)
* removeDns (dns, cb)

## License

See [LICENSE](LICENSE)
