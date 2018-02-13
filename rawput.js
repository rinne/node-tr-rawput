'use strict';

var http = undefined;
var https = undefined;
const fs = require('fs');
const uu = require('url');

function rawPut(url, fileNameOrReadableStream, extraHeaders, returnResponseBody, forceMethod) {
	var input;
	var r = (Promise.resolve()
			 .then(function() {
				 if (typeof(fileNameOrReadableStream) === 'string') {
					 input = fs.createReadStream(fileNameOrReadableStream);
				 } else {
					 input = fileNameOrReadableStream;
				 }
			 })
			 .then(function() {
				 return new Promise(function(resolve, reject) {
					 var u = uu.parse(url), p, m;
					 if (forceMethod) {
						 if ((typeof(forceMethod) === 'string') && (forceMethod.length > 0)) {
							 m = forceMethod;
						 } else {
							 throw new Error('Bad method');
						 }
					 } else {
						 m = 'PUT';
					 }
					 if (! (u && u.protocol)) {
						 throw new Error('Bad URL');
					 }
					 switch (u.protocol) {
					 case 'http:':
						 if (! http) {
							 http = require('http');
						 }
						 p = http;
						 break;
					 case 'https:':
						 if (! https) {
							 https = require('https');
						 }
						 p = https;
						 break;
					 default:
						 throw new Error('Bad protocol');
					 }
					 var o = {
						 hostname: u.host,
						 port: u.port,
						 path: u.path,
						 auth: u.auth,
						 method: m,
						 headers: {
							 'Host': u.host,
							 'Content-Type': 'application/octet-stream'
						 }
					 };
					 if (extraHeaders) {
						 if (typeof(extraHeaders) !== 'object') {
							 throw new Error("Bad extra headers definition");
						 }
						 Object.keys(extraHeaders).forEach(function(k) {
							 if ((typeof(k) === 'string') && (typeof(extraHeaders[k]) === 'string')) {
								 o.headers[k] = extraHeaders[k];
							 } else {
								 throw new Error("Bad extra headers definition");
							 }
						 });
					 }
					 var req = p.request(o);
					 req.on('response', function (res) { resolve(res); });
					 req.on('error', function(e) { reject(e); });
					 input.pipe(req);
				 });
			 })
			 .then(function(ret) {
				 return new Promise(function(resolve, reject) {
					 if (ret.statusCode != 200) {
						 return reject(new Error('Bad HTTP code ' + ret.statusCode + ' in response'));
					 }
					 var body = returnResponseBody ? new Buffer(0) : undefined;
					 ret.on('error', function(e) { return reject(e); });
					 ret.on('data', function(data) { if (returnResponseBody && data) { body = Buffer.concat([ body, data]) } });
					 ret.on('end', function() { return resolve(returnResponseBody ? body : true); });
				 });
			 })
			 .then(function(ret) {
				 return ret;
			 })
			 .catch(function(e) {
				 throw e;
			 }));
	return r;
}

module.exports = rawPut;
