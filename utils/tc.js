import threeCommasAPI from '3commas-api-node';
import pino from 'pino';
import pinoms from 'pino-multi-stream';
import fs from 'fs';

const streams = [{ stream: process.stdout }, { stream: fs.createWriteStream('./logs/tc.log', { flags: 'a' }) }];
const logger = pino({ level: 'info' }, pinoms.multistream(streams));

export default class threeCommas {
    constructor() {
        this.api_key = 0;
        this.api_secret = 0;
        this.api = this.setApi(this.api_key, this.api_secret);
    }
    setApi(key, secret) {
        this.api = new threeCommasAPI({
            apiKey: key,
            apiSecret: secret,
        });
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async stopDeal(deal_id) {
        try {
            await this.api.dealPanicSell(deal_id);
        } catch (error) {
            logger.error(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async checkDeals(params) {
        try {
            const deals = await this.api.getDeals(params);
            return deals;
        } catch (error) {
            logger.error(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async statsBot(botId) {
        try {
            const stat = await this.botDealsStats(botId);
            return {
                profit: Math.round(stat.completed_deals_usd_profit * 100) / 100,
            };
        } catch (error) {
            logger.error(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async statusBot(bot_id) {
        try {
            const res = await this.api.botShow(bot_id);
            return { enable: res.is_enabled, deal: res.active_deals };
        } catch (error) {
            logger.error(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async stopBot(bot_id) {
        try {
            await this.api.botDisable(bot_id);
        } catch (error) {
            logger.error(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async startBot(bot_id, date) {
        try {
            const response = await this.api.botEnable(bot_id);
        } catch (error) {
            logger.error(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async botDealsStats(bot_id) {
        try {
            return await this.api.makeRequest('GET', `/public/api/ver1/bots/${bot_id}/deals_stats?`, {
                bot_id,
            });
        } catch (error) {
            logger.error(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async botCopy(params) {
        try {
            return await this.api.makeRequest('POST', `/public/api/ver1/bots/${params.bot_id}/copy_and_create?`, params);
        } catch (error) {
            logger.error(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async getBotStatsByDate(params) {
        try {
            return await this.api.makeRequest('GET', `/public/api/ver1/bots/stats_by_date?`, params);
        } catch (error) {
            logger.error(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async getAcc(params) {
        try {
            return await this.api.makeRequest('POST', `/public/api/ver1/accounts/${params.account_id}/load_balances?`, params);
        } catch (error) {
            logger.error(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async getAccTypes(params) {
        try {
            return await this.api.makeRequest('GET', `/public/api/ver1/accounts/types_to_connect?`, params);
        } catch (error) {
            logger.error(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async getBotOptions(bot_id) {
        const obj = await this.api.botShow(bot_id);
        return obj;
    }
    async changeBotOptions(options) {
        const { api_key, api_secret, ...obj } = options;
        console.log('update');
        await this.api.botUpdate(obj);
    }
    async getBotsId() {
        const bots = await this.api.getBots();
        console.log('getBots');
        return bots;
    }
}

const tc = new threeCommas();
tc.setApi(
    '61225ce12aa94961bdd11dc391f39d1b5bccbfeb05b14762ba59cc5aee52659b',
    'f67da7b4e66b0de7eb7a4d7e8dfc8da8235b5f9edb37b3cd4d6beadc3aa51649100b59a2635d3f19a5d91517bf872a69428601fcb6a400bd3b0cb63a39337fe54202a9a260de419a1c5a4bf1485a3d680147c2b13acd67ef046d12e3ae67be4069853505',
);

// console.log(await tc.api.accountsNew({ type: 'binance', name: 'test', api_key: '131dda', secret: 'e21d2331' }));
// console.log(await tc.api.accountRemove(32092880));
// console.log(await tc.api.accounts());
// console.log(await tc.api.botDelete(9914987));
// console.log(await tc.getAcc({ account_id: 32083983 }));

