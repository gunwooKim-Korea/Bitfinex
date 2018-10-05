var http = require("http");
var options = {
  hostname: 'httpbin.org',
  path: '/post',
  method: 'POST',
  headers: {
    'Content-Type': 'text/html',
  }
};
 
var req = http.request(options, function(res) {
  console.log('Status: ' + res.statusCode);
  console.log('Headers: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (body) {
    console.log('Body: ' + body);
  });
});
req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});
 
req.write(
    '{"text": "test string"}'
);
req.end();

const request = require('request')
request.get(url + '/lendbook/usd',
  function(error, response, body) {
    console.log(body);
})

// optionally to limit bids and asks to length of 30:

request.get(url + '/lendbook/usd?limit_bids=30&limit_asks=30',
  function(error, response, body) {
    console.log(body);
})

// or use bitfinex-api-node

const BFX = require('bitfinex-api-node')
const bfxRest = new BFX(apiKey, apiSecretKey, {version: 1}).rest
bfxRest.fundingbook('USD', (err, res) => {
	if (err) console.log(err)
	console.log(res)
})

// or use bitfinex-api-node w/ limits

const options = {'limit_asks': 2, 'limit_bids': 2}
bfxRest.fundingbook('USD', options, (err, res) => {
	if (err) console.log(err)
	console.log(res)
})
