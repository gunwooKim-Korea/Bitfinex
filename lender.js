const request = require('request');	
const crypto = require('crypto');

function main() {

	const apiKey = '';
	const apiSecret = '';

	const baseUrl = 'https://api.bitfinex.com';

	const url = '/v1/balances';
	const nonce = Date.now().toString();
	const completeURL = baseUrl + url;
	const body = {
	  request: url,
	  nonce
	};
	const payload = new Buffer(JSON.stringify(body))
		.toString('base64');

	const signature = crypto
	  .createHmac('sha384', apiSecret)
	  .update(payload)
	  .digest('hex');

	const options = {
	  url: completeURL,
	  headers: {
		'X-BFX-APIKEY': apiKey,
		'X-BFX-PAYLOAD': payload,
		'X-BFX-SIGNATURE': signature
	  },
	  body: JSON.stringify(body)
	};

	return request.post(
	  options,
	  function(error, response, body) {
		console.log('response:', JSON.stringify(body));
	  }
	);
	
	/*
	const apiPath = 'v2/auth/r/alerts';
	const nonce = Date.now().toString();
	const queryParams = 'type=price';
	const body = {};
	let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`;

	const sig = crypto.createHmac('sha384', apiSecret).update(signature);
	const shex = sig.digest('hex');

	const uri_v2 = "https://api.bitfinex.com/v2";

	const options = {
		url: uri_v2 + "/auth/r/wallets",//`https://api.bitfinex.com/${apiPath}?${queryParams}`,
		headers: {
			'bfx-nonce': nonce,
			'bfx-apikey': apiKey,
			'bfx-signature': shex
		},
		"content-type" : 'application/json',
	  	body: body,
	  	json: true
	};
	
	request.post({
		uri: uri + "/auth/r/funding/offers/fUSD",
		headers: {
		'bfx-nonce': nonce,
		'bfx-apikey': apiKey,
		'bfx-signature': shex
	  	},
	  }, (error, response, body) => {
		  console.log(body);
	});
*/	
	/*
	request.post(options, (error, response, body) => {
		console.log(body);
	});
	*/
	// const uri = "https://api.bitfinex.com/v1";
	// console.log("\n");
	/*
	const uri = "https://api.bitfinex.com/v1";

	var options = { 
		method: 'POST',
	  	url: 'https://api.bitfinex.com/v2/calc/trade/avg',
	  	qs: { symbol: 'fusd' } };
		
		request(options, function (error, response, body) {
		  if (error) throw new Error(error);

		  console.log(body);
	});
	*/
	/*
	const fundingbook_options = { 
		uri: uri + '/lendbook/USD?limit_asks=1', 
		method: "GET", 
		timeout: 10000, 
		followRedirect: true, 
		maxRedirects: 10
	};
		  	
	request.get(fundingbook_options,
	  function(error, response, body) {
		console.log(JSON.stringify(body));
	});
	*/
}

main();
