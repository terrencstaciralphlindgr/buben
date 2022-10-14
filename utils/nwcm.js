import Encrypter from './crypto.js';
// import configBots from './utils/config.js';
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
    async checkUserDeals() {
        if (!this.apiKey) return;

        super.setApi(this.apiKey, this.apiSecret);
        const deals = await this.checkDeals();
        console.log(this.dealStatus, this.dealId);
        if (!deals) return;
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
    async toggleAllBot() {
        let type = this.cd[0].active;
        type === 'short' ? (type = 'long') : (type = 'short');
        this.cd.map((element, idx) => {
            setTimeout(() => {
                this.config.editConfig(idx, { active: type });
            }, 300 * idx);
        });
        return type;
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async editSingleBot(
        uid = this.editBot.uid,
        bot_i = this.editBot.bot_i,

        tp = this.editBot.tp || null,
        bov = this.editBot.bov || null,
        slp = this.editBot.slp || null,
    ) {
        const stat = await this.getBot(uid, bot_i);
        const obj = {
            ...stat,
            pairs: JSON.stringify(stat.pairs),
            base_order_volume: `${bov * +stat.leverage_custom_value || stat.base_order_volume}`,
            take_profit: tp || stat.take_profit,
            stop_loss_percentage: slp || stat.stop_loss_percentage,
            strategy_list: JSON.stringify(stat.strategy_list),
            bot_id: stat.id,
        };
        console.log(obj.base_order_volume);
        await this.changeBotOptions(obj);
        this.config.writeSingleConfig(uid, bot_i, obj);
        this.updateConfigData();
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async editAllBot() {
        this.cd.map(async (element, idx) => {
            setTimeout(async () => {
                await this.editSingleBot(idx, 0);
                setTimeout(async () => {
                    await this.editSingleBot(idx, 1);
                }, 300);
            }, 600 * idx);
        });
        // this.editBot = {};
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async addNewBot() {
        !this.cd ? (this.cd = []) : true;
        super.setApi(this.newBot.key, this.newBot.secret);
        const ids = await this.getBotsId();
        if (ids.error) {
            return bot.sendMessage(chatId);
        }
        ids.map(async (i) => {
            i.strategy === 'long' ? this.addNewBotValue({ long: i.id }) : this.addNewBotValue({ short: i.id });
            this.bots.push({
                name: i.name,
                pairs: JSON.stringify(i.pairs),
                base_order_volume: i.base_order_volume,
                take_profit: i.take_profit,
                safety_order_volume: i.safety_order_volume,
                martingale_volume_coefficient: i.martingale_volume_coefficient,
                martingale_step_coefficient: i.martingale_step_coefficient,
                max_safety_orders: i.max_safety_orders,
                active_safety_orders_count: i.active_safety_orders_count,
                safety_order_step_percentage: i.safety_order_step_percentage,
                take_profit_type: i.take_profit_type,
                strategy_list: JSON.stringify(i.strategy_list),
                stop_loss_percentage: i.stop_loss_percentage,
                leverage_custom_value: i.leverage_custom_value,
                bot_id: i.id,
                type: i.strategy,
            });
        });
        const { key, secret } = this.addApiData({
            key: this.newBot.key,
            secret: this.newBot.secret,
        });
        setTimeout(async () => {
            this.config.writeBotConfig({
                id: this.cd.length,
                name: this.newBot.name,
                active: this.cd.length ? this.cd[0].active : 'long',
                short: this.newBot.short,
                long: this.newBot.long,
                bots: this.bots,
                key,
                secret,
            });
        }, 500);
        this.updateConfigData();
        return 'Bot successfuly added!';
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
}

