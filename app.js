const request = require('request');	
const crypto = require('crypto');
const fetch = require('node-fetch');

const baseUri = 'https://api.bitfinex.com';
const nonce = Date.now().toString();

/*
모든 request header, body엔 각각 필수값이 있다

header : 
api key 	// api key
payload 	// body를 base64로 encode한 데이터
signature 	// apiSecret값, payload를 HASH 함수를 돌려 만든 값

body :
request		// api의 uri
nonce		// 현재날짜, 시간 ex) 07 Oct 2018 03:05:27 GMT

가 필요한데, make_option함수에서 추가해주기때문에 각 request packet 생성할 때 넣어주지않아도됨

request를 보내는건, options을 보냄
options을 구성하는건 header와 body, uri고

header	: apikey, payload, signature
body	: 각 uri의 endpoint가 필요한 데이터들
*/

//공통적인 option들을 만드는 함수
function make_option(uri, body){
	const completeURI = baseUri + uri;
	
	body.request = uri;
	body.nonce	 = nonce;
	body.url	= completeURI;

	const payload_tmp = new Buffer(JSON.stringify(body))
		.toString('base64');
	
	const signature_tmp = crypto
	  .createHmac('sha384', apiSecret)
	  .update(payload_tmp)
	  .digest('hex');
	
	const options_tmp = {
		method: 'post',	
		headers: {
		'X-BFX-APIKEY': apiKey,
		'X-BFX-PAYLOAD': payload_tmp,
		'X-BFX-SIGNATURE': signature_tmp
	  	},
		body: JSON.stringify(body)
	};
	
	return options_tmp;
}

//현재 잔액정보를 제공하는 함수
function getBalanceInfo(){
	const balance_uri = '/v1/balances';
	var available_usd = 0;
	
	const balance_body = {
		  request: balance_uri,
	};

	const balance_options = make_option(balance_uri, balance_body);

	var balance_completeURI = baseUri + balance_uri;
	
	await fetch(balance_completeURI, balance_options)
	.then(res => res.json())
	.then(res => {
		available_usd = res[1].available;
	});

	return available_usd;
}

//FundingBook에 Offer하는 함수
function newOfferFunding(){
	const newOffer_uri = '/v1/offer/new';
	
	const newOffer_data = {
	  currency: 'USD',
	  amount: '100.0',
	  rate: '50.0',
	  period: 2,
	  direction: 'lend'
	};

	const newOffer_body = {
	   currency: newOffer_data.currency,
	   amount: newOffer_data.amount,
	   rate: newOffer_data.rate,
	   period: newOffer_data.period,
	   direction: newOffer_data.direction,
	};

	const newOffer_options = make_option(newOffer_uri, newOffer_body);

	request.post(
	  newOffer_options,
	  function(error, response, body) {
		console.log('newOffer_response:', JSON.stringify(response));
		//const order_id = JSON.stringify(response).id
		//return order_id;
	  }
	);
}

//FundingBook에 게시했던 Offer를 취소하는 함수
function offerCancel(order_id){
	const offerCancel_uri = '/v1/offer/cancel';
	
	const offerCancel_body = {
	   order_id: order_id,
	};
	
	const offerCancel_options = make_option(offerCancel_uri, offerCancel_body);
	
	request.post(
	  offerCancel_options,
	  function(error, response, body) {
		console.log('offerCancel_response:', JSON.stringify(response));
	  }
	);
}

//현재 Funding한 정보 출력(많이 쓰이진 않을듯)
function getActiveCreditsInfo(order_id){
	const activeCredits_uri = '/v1/credits';
	
	const activeCredits_body = {
	};
	
	const activeCredits_options = make_option(activeCredits_uri, activeCredits_body);
	
	request.post(
	  activeCredits_options,
	  function(error, response, body) {
		console.log('activeCredits_response:', JSON.stringify(response));
	  }
	);
}

function main() {

	var available_usd = getBalanceInfo();
	console.log(available_usd);
	
	/*
	async.waterfall([
		// Balance Info Logic
		function(callback){
			available_usd = getBalanceInfo();
			callback(null);
		},
		// Balance Info Logic22222
		function(callback){
			console.log('available_usd : ', available_usd);
			callback(null);
		},
		
	], function(err) {
		console.log('error:', err);
	});
	*/
	
	// new Offer (Funding Logic)
	// const order_id = newOfferFunding();
	// newOfferFunding();
	
	// cancel
	// offerCancel('323098323');
	
}

main();
