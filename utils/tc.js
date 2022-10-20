import stringify from 'qs-stringify';
import fetch from 'node-fetch';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

export default class threeCommas {
    constructor() {
        this._url = process.env.API_URL;
        this._apiKey = process.env.API_KEY;
        this._apiSecret = process.env.API_SECRET;
        this._forcedMode = 'real';
    }

    generateSignature(requestUri, reqData) {
        const request = requestUri + reqData;
        return crypto.createHmac('sha256', this._apiSecret).update(request).digest('hex');
    }

    async makeRequest(method, path, params) {
        if (!this._apiKey || !this._apiSecret) return new Error('missing api key or secret');
        const sig = this.generateSignature(path, stringify(params));
        try {
            let response = await fetch(`${this._url}${path}${stringify(params)}`, {
                method: method,
                timeout: 30000,
                agent: '',
                headers: {
                    APIKEY: this._apiKey,
                    Signature: sig,
                    'Forced-Mode': this._forcedMode,
                },
            });

            return await response.json();
        } catch (e) {
            return false;
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////
    async dealPanicSell(deal_id) {
        return await this.makeRequest('POST', `/public/api/ver1/deals/${deal_id}/panic_sell?`, { deal_id });
    }
    async getDeals(params) {
        return await this.makeRequest('GET', '/public/api/ver1/deals?', params);
    }
    async botCreate(params) {
        return await this.makeRequest('POST', '/public/api/ver1/bots/create_bot?', params);
    }

    async getBots(params) {
        return await this.makeRequest('GET', `/public/api/ver1/bots?`, params);
    }

    async getBotsStats(params) {
        return await this.makeRequest('GET', `/public/api/ver1/bots/stats?`, params);
    }

    async botUpdate(params) {
        return await this.makeRequest('PATCH', `/public/api/ver1/bots/${params.bot_id}/update?`, params);
    }

    async botDisable(bot_id) {
        return await this.makeRequest('POST', `/public/api/ver1/bots/${bot_id}/disable?`, { bot_id });
    }

    async botEnable(bot_id) {
        return await this.makeRequest('POST', `/public/api/ver1/bots/${bot_id}/enable?`, { bot_id });
    }
    async botDelete(bot_id) {
        return await this.makeRequest('POST', `/public/api/ver1/bots/${bot_id}/delete?`, { bot_id });
    }

    async botPaniceSellAllDeals(bot_id) {
        return await this.makeRequest('POST', `/public/api/ver1/bots/${bot_id}/panic_sell_all_deals?`, { bot_id });
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async botDealsStats(bot_id) {
        return await this.makeRequest('GET', `/public/api/ver1/bots/${bot_id}/deals_stats?`, {
            bot_id,
        });
    }
    async botShow(bot_id) {
        return await this.makeRequest('GET', `/public/api/ver1/bots/${bot_id}/show?`, { bot_id });
    }
    async getBotStatsByDate(params) {
        return await this.makeRequest('GET', `/public/api/ver1/bots/stats_by_date?`, params);
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async accountsLoadBalances(account_id) {
        return await this.makeRequest('POST', `/public/api/ver1/accounts/${account_id}/load_balances?`, { account_id });
    }
    async accountsTypes(params) {
        return await this.makeRequest('GET', `/public/api/ver1/accounts/types_to_connect?`, params);
    }
    async accountsNew(params) {
        return await this.makeRequest('POST', `/public/api/ver1/accounts/new?`, params);
    }

    async getAccounts() {
        return await this.makeRequest('GET', `/public/api/ver1/accounts?`, null);
    }

    async accountsMarketList() {
        return await this.makeRequest('GET', `/public/api/ver1/accounts/market_list?`, null);
    }

    async accountsCurrencyRates() {
        return await this.makeRequest('GET', `/public/api/ver1/accounts/currency_rates?`, null);
    }
    async accountRemove(account_id) {
        return await this.makeRequest('POST', `/public/api/ver1/accounts/${account_id}/remove?`, { account_id });
    }
}

const tc = new threeCommas();

// console.log(await tc.api.accountsNew({ type: 'binance', name: 'test', api_key: '131dda', secret: 'e21d2331' }));
// console.log(await tc.accountRemove(32094619));

// console.log(JSON.stringify(await tc.botShow(9921422)));
// console.log(await tc.getAccounts());
// console.log(await tc.getBots({ bot_id: 9917423 }));
// console.log(await tc.api.botDelete(9914987));
// console.log(await tc.getAcc({ account_id: 32083983 }));

