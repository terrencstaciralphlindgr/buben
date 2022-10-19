import threeCommas from './tc.js';
import * as dotenv from 'dotenv';
dotenv.config();

export default class nwcmBot extends threeCommas {
    constructor() {
        super();
        this.apiKey = null;
        this.apiSecret = null;
        this.dealStatus = null;
        this.dealId = null;
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    setApiKeys(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    addNewBotValue(obj) {
        this.newBot.name = obj.name || this.newBot.name;
        this.newBot.key = obj.key || this.newBot.key;
        this.newBot.secret = obj.secret || this.newBot.secret;
        this.newBot.short = obj.short || this.newBot.short;
        this.newBot.long = obj.long || this.newBot.long;
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    editBotValue(obj) {
        this.editBot.bov = obj.bov || this.editBot.bov;
        this.editBot.slp = obj.slp || this.editBot.slp;
        this.editBot.tp = obj.tp || this.editBot.tp;
        this.editBot.uid = obj.uid || this.editBot.uid;
        this.editBot.bot_i = obj.bot_i || this.editBot.bot_i;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async mapData(data, callback) {
        let message = [];
        await Promise.all(
            data.map(async (el, idx) => {
                const res = await callback(el, idx);
                message.push(res);
            }),
        );
        return message;
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    generateEditKeyboard() {
        const keyboard = [];
        this.cd.map((element, i) => {
            const res = [{}, {}];
            res[0].text = `${element.name} ${element.bots[0].type === 'short' ? '| short  📉' : '| long 📈'}`;
            res[1].text = `${element.name} ${element.bots[1].type === 'short' ? '| short  📉' : '| long 📈'}`;

            res[0].callback_data = `edit_short:${i}|${element.bots[1].type === 'short' ? 1 : 0}`;
            res[1].callback_data = `edit_long:${i}|${element.bots[0].type === 'long' ? 0 : 1}`;
            keyboard.push(res);
        });
        keyboard.push([{ text: 'Edit all bots ✅', callback_data: 'edit_all' }]);
        return keyboard;
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    dateFormat(date) {
        return Math.round(date.getTime() / 1000);
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async checkUserDeals(params) {
        if (!this.apiKey) return;

        super.setApi(this.apiKey, this.apiSecret);
        const deals = await this.checkDeals(params);
        // console.log(this.dealStatus, this.dealId, deals);
        if (deals.length === 0) return;
        if (this.dealStatus == deals[0].status && this.dealId == deals[0].id) {
        } else {
            const deal_cancel_time = this.dateFormat(new Date(deals[0].closed_at));

            this.dealId = deals[0].id;
            this.dealStatus = deals[0].status;
            return {
                id: deals[0].id,
                status: deals[0].status,
                localized_status: deals[0].localized_status,
                error: deals[0].deal_has_error,
                error_message: deals[0].error_message,
                base_order_average_price: deals[0].base_order_average_price,
                actual_usd_profit: deals[0].actual_usd_profit,
                deal_cancel_time,
            };
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async startSingleBot(botId) {
        const date = Math.floor(Date.now() / 1000);
        super.setApi(this.apiKey, this.apiSecret);
        const status = await this.statusBot(botId);
        if (status.enable && status.deal.length) {
            return { active_deal: true };
        } else {
            // await this.stopBot(botId); //
            const res = await this.startBot(botId, date);
            return res;
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async startAllBot() {
        const res = await this.mapData(this.cd, async (element) => {
            return await this.startSingleBot(element);
        });

        return res;
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async stopSingleBot(botId) {
        super.setApi(this.apiKey, this.apiSecret);
        await this.stopBot(botId);
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async stopAllBot() {
        this.mapData(this.cd, async (element) => {
            await this.stopSingleBot(element);
        });
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async statusSingleBot(botId) {
        super.setApi(this.apiKey, this.apiSecret);
        const res = await this.statusBot(botId);
        return res;
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async statusAllBot() {
        this.setChatID(this.chatID, true);
        return await this.mapData(this.cd, async (element) => {
            const res = await this.statusSingleBot(element);
            return res;
        });
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async statisticsSingleBot(botId) {
        super.setApi(this.apiKey, this.apiSecret);
        const stat = await this.statsBot(botId);
        return stat;
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async statisticsAllBot() {
        return await this.mapData(this.cd, async (element) => {
            const res = await this.statisticsSingleBot(element);
            res.name = element.name;
            return res;
        });
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async getBot(ubot_id, bot_i) {
        const bot_id = this.cd[ubot_id].bots[bot_i].bot_id;
        const { api_key, api_secret } = this.getApiData(this.cd[ubot_id]);
        super.setApi(api_key, api_secret);

        return await this.getBotOptions(bot_id);
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async newAcc(params) {
        try {
            super.setApi(this.apiKey, this.apiSecret);
            return await this.api.accountsNew(params);
        } catch (error) {}
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async addBot(params) {
        try {
            super.setApi(this.apiKey, this.apiSecret);
            const res = await this.api.botShow(params.bot_id);
            console.log(res);
            const data = {
                name: res.name,
                disable_after_deals_count: res.disable_after_deals_count,
                account_id: params.acc_id,
                pairs: JSON.stringify(res.pairs),
                max_active_deals: res.max_active_deals,
                base_order_volume: res.base_order_volume,
                base_order_volume_type: res.base_order_volume_type,
                take_profit: res.take_profit,
                safety_order_volume: res.safety_order_volume,
                safety_order_volume_type: res.safety_order_volume_type,
                martingale_volume_coefficient: res.martingale_volume_coefficient,
                martingale_step_coefficient: res.martingale_step_coefficient,
                max_safety_orders: res.max_safety_orders,
                active_safety_orders_count: res.active_safety_orders_count,
                stop_loss_percentage: res.stop_loss_percentage,
                cooldown: res.cooldown,
                trailing_enabled: res.trailing_enabled,
                trailing_deviation: res.trailing_deviation,
                btc_price_limit: res.btc_price_limit,
                strategy: res.strategy,
                safety_order_step_percentage: res.safety_order_step_percentage,
                take_profit_type: res.take_profit_type,
                strategy_list: JSON.stringify(res.strategy_list),
                leverage_type: res.leverage_type,
                leverage_custom_value: res.leverage_custom_value,
                min_price: res.min_price,
                max_price: res.max_price,
                stop_loss_timeout_enabled: res.stop_loss_timeout_enabled,
                stop_loss_timeout_in_seconds: res.stop_loss_timeout_in_seconds,
                min_volume_btc_24h: res.min_volume_btc_24h,
                tsl_enabled: res.tsl_enabled,
                deal_start_delay_seconds: res.deal_start_delay_seconds,
                profit_currency: res.profit_currency,
                start_order_type: res.start_order_type,
                stop_loss_type: res.stop_loss_type,
                allowed_deals_on_same_pair: res.allowed_deals_on_same_pair,
                close_deals_timeout: res.close_deals_timeout,
            };
            return await this.api.botCreate(data);
        } catch (error) {
            console.log(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
}

