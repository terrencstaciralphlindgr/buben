import threeCommas from './tc.js';
import DB from './pg.js';

export default class bubenBot extends threeCommas {
    constructor() {
        super();
        this.dealStatus = null;
        this.dealId = null;
        this.db = new DB();
        this.selectedBotId = 0;
        this.apiKey = '';
        this.secretKey = '';
        this.exchangeId = '';
    }
    setUserApiKeys = (params) => {
        this.apiKey = params.apiKey || this.apiKey;
        this.secretKey = params.secretKey || this.secretKey;
        this.exchangeId = params.exchangeId || this.exchangeId;
        this.selectedBotId = params.selectedBotId || this.selectedBotId;
    };
    getUserApiKeys = () => {
        return { apiKey: this.apiKey, secretKey: this.secretKey, exchangeId: this.exchangeId, selectedBotId: this.selectedBotId };
    };
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async userNew(id, username) {
        try {
            const user = await this.db.getUser(id);
            return user ? user : await this.db.addUser({ id, username });
        } catch (error) {
            console.log(error);
        }
    }
    async userHasEmail(id) {
        try {
            const user = await this.db.getUser(id);
            return user?.email ? true : false;
        } catch (error) {
            console.log(error);
        }
    }
    async userAddEmail(id, email) {
        try {
            return await this.db.addUserEmail({ id, email });
        } catch (error) {
            console.log(error);
        }
    }
    async userHasApiKeys(id) {
        try {
            const apiKeys = await this.db.getApiKeysByUserId(id);
            return apiKeys;
        } catch (error) {
            console.log(error);
        }
    }
    async userAddEmail(id, email) {
        try {
            return await this.db.addUserEmail({ id, email });
        } catch (error) {
            console.log(error);
        }
    }
    async userAddApiKeys(params) {
        try {
            return await this.db.addApiKeys(params);
        } catch (error) {
            console.log(error);
        }
    }
    async userGetApiKeys(id) {
        try {
            return await this.db.getApiKeysByUserId(id);
        } catch (error) {
            console.log(error);
        }
    }
    async userAddBot(params) {
        try {
            return await this.db.addUserBot(params);
        } catch (error) {
            console.log(error);
        }
    }
    async getExchange(id) {
        try {
            return await this.db.getExchange(id);
        } catch (error) {
            console.log(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async startBot(bot_id) {
        try {
            return await this.botEnable(bot_id);
        } catch (error) {
            console.log(error);
        }
    }
    async stopBot(bot_id) {
        try {
            return await this.botDisable(bot_id);
        } catch (error) {
            console.log(error);
        }
    }
    dateFormat(date) {
        return Math.round(date.getTime() / 1000);
    }
    async userCheckDeals(params) {
        try {
            const deals = await this.getDeals(params);
            // console.log(this.dealStatus, this.dealId, deals);
            if (deals.length === 0) return;
            if (this.dealStatus == deals[0].status && this.dealId == deals[0].id) {
                return false;
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
        } catch (error) {
            console.log(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async newAccount(params) {
        try {
            return await this.accountsNew(params);
        } catch (error) {}
    }
    async getUserBotStat(bot_id) {
        try {
            return await this.getBotsStats(bot_id);
        } catch (error) {}
    }
    async getUserBotStatus(bot_id) {
        try {
            return await this.botShow(bot_id);
        } catch (error) {}
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    async addBot(params) {
        try {
            const res = await this.botShow(params.bot_id);
            console.log(res);
            const data = {
                name: res.name + params.user_id,
                disable_after_deals_count: res.disable_after_deals_count,
                account_id: params.account_id,
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
            return await this.botCreate(data);
        } catch (error) {
            console.log(error);
        }
    }
    async editBot(params) {
        try {
            const res = await this.botShow(params.bot_id);
            const data = {
                name: res.name,
                pairs: JSON.stringify(res.pairs),
                max_active_deals: res.max_active_deals,
                base_order_volume: params.base_order_volume,
                base_order_volume_type: res.base_order_volume_type,
                take_profit: +res.take_profit,
                safety_order_volume: params.safety_order_volume,
                safety_order_volume_type: res.safety_order_volume_type,
                martingale_volume_coefficient: +res.martingale_volume_coefficient,
                martingale_step_coefficient: +res.martingale_step_coefficient,
                max_safety_orders: res.max_safety_orders,
                active_safety_orders_count: res.active_safety_orders_count,
                stop_loss_percentage: +res.stop_loss_percentage,
                cooldown: +res.cooldown,
                trailing_enabled: res.trailing_enabled,
                trailing_deviation: +res.trailing_deviation,
                btc_price_limit: +res.btc_price_limit,
                safety_order_step_percentage: +res.safety_order_step_percentage,
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
                disable_after_deals_count: res.disable_after_deals_count,
                allowed_deals_on_same_pair: res.allowed_deals_on_same_pair,
                close_deals_timeout: res.close_deals_timeout,
                bot_id: res.id,
                account_id: res.account_id,
            };
            return await this.botCreate(data);
        } catch (error) {
            console.log(error);
        }
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
}

