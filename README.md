In a Nutshell
=============

Small promise-based utility function to http/https PUT raw contents of
the file to the remote URL. The input can be either a file name or
already created readable stream.


Reference
=========

```
const rawPut = require('tr-rawput');

return (rawPut('http://foo.bar/receiver/endpoint', '/my/file/to/put')
        .then(function() {
          console.log('Oh yeah!');
        })
        .then(function() {
          return rawPut('http://foo.bar/abc',
                        readableStreamFromSomewhere,
                        { 'Content-Length', readableStreamDataLengthWeHappenToKnow },
                        true,
                        'POST');
        })
        .then(function(ret) {
	  console.log('Server response body:');
	  console.log(ret.toString());
        })
        .catch(function(e) {
          console.log('Something terribly wrong');
          throw e;
        }));
```


Author
======

Timo J. Rinne <tri@iki.fi>


License
=======

GPL-2.0
