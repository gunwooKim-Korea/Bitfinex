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
const request = require('request');
const crypto = require('crypto');
const fetch = require('node-fetch');
const fs = require('fs');
const dpdlvldkdlzl = require('./dpdlvldkdlzl');

const baseUri = 'https://api.bitfinex.com';

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {
    dd='0'+dd
}

if(mm<10) {
    mm='0'+mm
}

function log(str){
    today = yyyy.toString()+mm.toString()+dd.toString();

	fs.appendFileSync('./log/bitfinex_' + today + '.txt', str+'\n', 'utf-8');
}

//공통적인 option들을 만드는 함수
function make_option(uri, body){
    const nonce = Date.now().toString();
	body.request = uri;
	body.nonce	 = nonce;

	const payload_tmp = new Buffer(JSON.stringify(body)).toString('base64');
	
	const signature_tmp = crypto
  	.createHmac('sha384', dpdlvldkdlzl.dpdlvldkdlzltlzmflt)
  	.update(payload_tmp)
  	.digest('hex');
	
	const options_tmp = {
		method: 'post',	
		headers: {
			'X-BFX-APIKEY': dpdlvldkdlzl.dpdlvldkdlzl,
			'X-BFX-PAYLOAD': payload_tmp,
			'X-BFX-SIGNATURE': signature_tmp
	  	},
		body: JSON.stringify(body)
	};
	
	return options_tmp;
}

//현재 잔액정보를 제공하는 함수
async function getBalanceInfo(){
	const balance_uri = '/v1/balances';
	const balance_completeURI = baseUri + balance_uri;

	let available_usd = 0;
	
	const balance_body = {
		  request: balance_uri,
	};

	const balance_options = make_option(balance_uri, balance_body);
	
	await fetch(balance_completeURI, balance_options)
	.then(res => res.json())
	.then(res => {
		available_usd = res[1].available; //1번은 USD정보
	});

	return available_usd;
}

//FundingBook에 Offer하는 함수
async function newOfferFunding(avgRate, usd){
	const newOffer_uri = '/v1/offer/new';
	const newOffer_completeURI = baseUri + newOffer_uri;
	
	const newOffer_data = {
	  currency: 'USD',
	  amount: usd.toString(),
	  rate: avgRate.toString(),
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

	await fetch(newOffer_completeURI, newOffer_options)
	.then(res => res.json())
	.then(res => {
		log("offer Info : ");
		log(res);
		log('offer OK');
	});
}

async function getActiveOfferList(){
	const activeOfferList_uri = '/v1/offers';
	let activeOfferList = [];
	const activeOfferList_completeURI = baseUri + activeOfferList_uri;

	const activeOfferList_body = {
	};
	
	const activeOfferList_options = make_option(activeOfferList_uri, activeOfferList_body);

    await fetch(activeOfferList_completeURI, activeOfferList_options)
	.then(res => res.json())
	.then(res => {
		activeOfferList = res;
	});

	return activeOfferList;
}

//FundingBook에 게시했던 Offer를 취소하는 함수
async function offerCancel(order_id){
	const offerCancel_uri = '/v1/offer/cancel';
	const offerCancel_completeURI = baseUri + offerCancel_uri;

	const offerCancel_body = {
	   order_id: order_id,
	};
	
	const offerCancel_options = make_option(offerCancel_uri, offerCancel_body);
	
	await fetch(offerCancel_completeURI, offerCancel_options)
	.then(res => res.json())
	.then(res => {
		log('cancel');
		log(res.id + " cancel OK");
	});
}

//현재 Funding한 정보 출력(많이 쓰이진 않을듯)
async function getActiveCreditsInfo(order_id){
	const activeCredits_uri = '/v1/credits';
	
	const activeCredits_body = {
	};
	
	const activeCredits_options = make_option(activeCredits_uri, activeCredits_body);
	
	request.post(
	  activeCredits_options,
	  function(error, response, body) {
		log('activeCredits_response:', JSON.stringify(response));
	  }
	);
}

async function fundingBook(){

    const funding_uri = '/v2/book/fUSD/P3';

	const fundingBook_completeURI = baseUri + funding_uri;

    /*
		RATE,
		PERIOD,
		COUNT,
		AMOUNT > 0인경우를 봐야함
	*/

	let maxRate = 0;

    // request
    await fetch(fundingBook_completeURI, {})
	.then(res => res.json())
	.then(res => {
		for(var i = 0; i < res.length; i++){
			if(res[i][3] > 0 && res[i][1] === 2) {
				if(maxRate < res[i][0]) {
                    maxRate = res[i][0];
                }
			}
		}
    });

	/*
	var getRates = await setInterval(async function(){
		cnt++;
		if(cnt > 5){
			clearInterval(getRates);
		}
		// request
		await fetch(fundingBook_completeURI, {})
			.then(res => res.json())
			.then(res => {
				for(var i = 0; i < res.length; i++){
					if(res[i][3] > 0 && res[i][1] === 2) {
						// properDataCnt++;
						// avgRate += res[i][0];
						console.log(res[i][0]);
					}
				}

                // console.log(avgRate);
            });
	}, 10000);
	*/

    return maxRate;
}

async function getMarketAvgRate(available_usd){

	let marketAvgRateUri = '/v2/calc/trade/avg';

	const marketAvgRate_completeURI = baseUri + marketAvgRateUri;

	let a ={};

    const marketAvgRate_options = {
        method: 'post',
        url : marketAvgRate_completeURI,
		headers : {},
        body : {}//JSON.stringify(qs),
    };

    // request
    await fetch(marketAvgRate_completeURI+'?symbol=fUSD&amount='+available_usd + '&period=2', marketAvgRate_options)
	.then(res => res.json())
	.then(res => {
		// console.log(res);
		a = res;
		// return res;
	});

    return a;
}
async function main() {

    const startTime = Date.now().toString();
    log('------------------------------------------------');
	log('START : ' + startTime);

    const available_usd = await getBalanceInfo();

    const avgRate = await fundingBook();

    const activeOfferList = await getActiveOfferList();

    const marketAvgRate = await getMarketAvgRate(available_usd);

    if(available_usd < 50) {
        log("No available USD");
    } else {
        // new Offer (Funding Logic);

       // let offerRate = (avgRate * 0.96)*365*100; //평균이율보다 조금낮게, 연이율로 계산
		let offerRate = marketAvgRate[0] * 1.01 * 365 * 100;
        await newOfferFunding(offerRate, available_usd);
    }

    if(activeOfferList.length !== 0) {
        log("activeOffer trx");

        // let avgRate_discount = (avgRate * 0.93)*365*100; //평균이율보다 조금낮게, 연이율로 계산
        let avgRate_discount = marketAvgRate[0] * 0.98 * 365 * 100;

        log('activeOfferList\n', activeOfferList);

        for( let i = 0; i < activeOfferList.length; i++) {
            // cancel
            await offerCancel(activeOfferList[i].id);

            if(avgRate_discount < avgRate * 0.8) {
                log('rate is too low !!');
            	return 0;
            }
        }

        // new Offer (Funding Logic);
        await newOfferFunding(avgRate_discount, available_usd);
    }

    log('END   : ' + Date.now().toString());
    log('------------------------------------------------');
	return 0;
}

main();
