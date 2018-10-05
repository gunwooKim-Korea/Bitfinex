url = "https://api.bitfinex.com/v1/";
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
