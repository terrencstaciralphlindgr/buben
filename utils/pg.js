import postgresql from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const { Pool } = postgresql;

export default class DB {
    constructor() {
        this.pool = new Pool({
            user: process.env.PGUSER,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            host: process.env.PGHOST,
            port: process.env.PGPORT,
            max: 20,
            connectionTimeoutMillis: 0,
            idleTimeoutMillis: 0,
            allowExitOnIdle: true,
        });
        this.apiKey = '';
        this.secretKey = '';
        this.exchangeId = '';
        this.baseOrder = '';
    }
    query = (text, params) => this.pool.query(text, params);
    // =====================================================================
    // =====================================================================
    setApi = (obj) => {
        this.apiKey = obj.apiKey || this.apiKey;
        this.secretKey = obj.secretKey || this.secretKey;
        this.exchangeId = obj.exchangeId || this.exchangeId;
        this.baseOrder = obj.baseOrder || this.baseOrder;
    };
    // =====================================================================
    // =====================================================================
    getApi = () => {
        return { apiKey: this.apiKey, secretKey: this.secretKey, exchangeId: this.exchangeId, baseOrder: this.baseOrder };
    };
    // =====================================================================
    // =====================================================================
    addUser = async (params) => {
        try {
            const res = await this.getUserByChatId(params.chatId);
            if (res) return { message: 'Already exist!', error: false };
            await this.query('INSERT INTO users ("chat_id", "username") VALUES ($1, $2)', [params.chatId, params.username]);
            return { message: 'Successfully added!', error: false };
        } catch (error) {
            console.log(error);
            return { message: 'Error', error: true };
        }
    };
    // =====================================================================
    // =====================================================================
    addUserEmail = async (params) => {
        try {
            const res = await this.query('UPDATE users SET email = $1 WHERE chat_id = $2', [params.email, params.chatId]);
            return { message: 'Successfully added!' };
        } catch (error) {
            console.log(error);
        }
    };

    // =====================================================================
    // =====================================================================
    getUsers = async () => {
        try {
            const res = await this.query('SELECT * FROM users', []);
            return res.rows[0];
        } catch (error) {
            console.log(error);
        }
    };
    // =====================================================================
    // =====================================================================
    getUserByChatId = async (chatId) => {
        try {
            const res = await this.query('SELECT * FROM users WHERE chat_id = $1', [chatId]);
            return res.rows[0];
        } catch (error) {
            console.log(error);
        }
    };

    // =====================================================================
    // =====================================================================
    getUserById = async (id) => {
        try {
            const res = await this.query('SELECT * FROM users WHERE id = $1', [id]);
            return res.rows[0];
        } catch (error) {
            console.log(error);
        }
    };

    // =====================================================================
    // =====================================================================
    addApiKeys = async (params) => {
        try {
            const res = await this.query(
                'INSERT INTO api_keys ("user_id", "api_key", "api_secret", "exchange_id") VALUES ($1, $2, $3, $4) RETURNING api_id',
                [params.userId, this.apiKey, this.secretKey, this.exchangeId],
            );
            return { apiId: res.rows[0].api_id };
        } catch (error) {
            console.log(error);
        }
    };
    // =====================================================================
    // =====================================================================
    getApiKeys = async (userId) => {
        try {
            const res = await this.query('SELECT * FROM api_keys WHERE user_id = $1', [userId]);
            return res.rows[0];
        } catch (error) {
            console.log(error);
        }
    };
    // =====================================================================
    // =====================================================================
    addSubscription = async (params) => {
        try {
            const res = await this.query(
                'INSERT INTO subscriptions ("start", "end", "user_id", "is_pro") VALUES ($1, $2, $3, $4 ) RETURNING subscription_id',
                [params.start, params.end, params.userId, params.isPro],
            );
            return { message: 'Successfully added!' };
        } catch (error) {
            console.log(error);
        }
    };
    // =====================================================================
    // =====================================================================
    getSubscription = async (userId) => {
        try {
            const res = await this.query('SELECT * FROM subscriptions WHERE user_id = $1', [userId]);
            return res.rows[0];
        } catch (error) {
            console.log(error);
        }
    };
    // =====================================================================
    // =====================================================================
    addUserBot = async (params) => {
        try {
            const res = await this.query(
                'INSERT INTO user_bots ("user_bot_id","user_id", "bot_id", "api_keys") VALUES ($1, $2, $3, $4)',
                [params.userBotId, params.userId, params.botId, params.apiKeys],
            );
            return { message: 'Successfully added!' };
        } catch (error) {
            console.log(error);
        }
    };
    // =====================================================================
    // =====================================================================
    addActiveDeal = async (params) => {
        try {
            const res = await this.query('UPDATE user_bots SET active_deal = $1 WHERE user_id = $2', [
                params.deal,
                params.userId,
            ]);

            return { message: 'Successfully added!' };
        } catch (error) {
            console.log(error);
        }
    };
    // =====================================================================
    // =====================================================================
    getUserBotByUserId = async (userId) => {
        try {
            const res = await this.query(
                'SELECT user_bots.user_bot_id,user_bots.bot_id,bots.api_key,bots.api_secret,bots.name FROM user_bots LEFT JOIN bots ON bots.bot_id = user_bots.bot_id WHERE user_bots.user_id = $1 ',
                [userId],
            );
            return res.rows[0];
        } catch (error) {
            console.log(error);
        }
    };
    // =====================================================================
    // =====================================================================
    addStep = async (params) => {
        try {
            const res = await this.query('INSERT INTO steps ("user_id", "step") VALUES ($1, $2)', [params.userId, params.step]);
            return { message: 'Successfully added!' };
        } catch (error) {
            console.log(error);
        }
    };
    // =====================================================================
    // =====================================================================
    addDeal = async (params) => {
        try {
            const res = await this.query('INSERT INTO deals ("deal_id", "user_id") VALUES ($1, $2) RETURNING deal_id', [
                params.dealId,
                params.userId,
            ]);
            return { message: 'Successfully added!' };
        } catch (error) {
            console.log(error);
        }
    };

    // =====================================================================
    // =====================================================================
    getDeal = async (userId) => {
        try {
            const res = await this.query('SELECT * FROM deals WHERE user_id = $1', [userId]);
            return res.rows[0];
        } catch (error) {
            console.log(error);
        }
    };
    // =====================================================================
    // =====================================================================
    getExchange = async (exchangeId) => {
        try {
            const res = await this.query('SELECT * FROM exchanges WHERE exchange_id = $1', [exchangeId]);
            return res.rows[0];
        } catch (error) {
            console.log(error);
        }
    };
    // =====================================================================
    // =====================================================================
    getBot = async (botId) => {
        try {
            const res = await this.query('SELECT * FROM bots WHERE bot_id = $1', [botId]);
            return res.rows[0];
        } catch (error) {
            console.log(error);
        }
    };
}

