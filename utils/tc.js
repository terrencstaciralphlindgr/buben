import threeCommasAPI from '3commas-api-node';
const dateFormat = (date) => {
    return Math.round(date.getTime() / 1000);
};
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
        if (!deal_id) return;
        await this.api.dealPanicSell(deal_id);
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async checkDeals() {
        try {
            const deals = await this.api.getDeals({ limit: 1 });
            return deals;
        } catch (error) {
            console.log(error);
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
            console.log(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async statusBot(bot_id) {
        try {
            const res = await this.api.botShow(bot_id);
            return { enable: res.is_enabled, deal: res.active_deals };
        } catch (error) {
            console.log(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async stopBot(bot_id) {
        try {
            await this.api.botDisable(bot_id);
        } catch (error) {
            console.log(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async startBot(bot_id, date) {
        try {
            const response = await this.api.botEnable(bot_id);
        } catch (error) {
            console.log('error ' + error);
        }
    }
    checkDealsTimeout(date) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const deals = await this.checkDeals();
                let res = { status: false };
                if (!deals) {
                    return;
                }
                deals.forEach((element) => {
                    const deal_time = dateFormat(new Date(element.created_at));
                    if (deal_time > date) {
                        res = {
                            error: element.deal_has_error,
                            message: element.error_message,
                            price: element.base_order_average_price,
                            id: element.id,
                        };
                    }
                });
                resolve(res);
            }, 1000);
        });
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async botDealsStats(bot_id) {
        return await this.api.makeRequest('GET', `/public/api/ver1/bots/${bot_id}/deals_stats?`, {
            bot_id,
        });
    }
    async botCopy(params) {
        return await this.api.makeRequest('POST', `/public/api/ver1/bots/${params.bot_id}/copy_and_create?`, {
            params,
        });
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

