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

  // =====================================================================
  // =====================================================================

  // =====================================================================
  // =====================================================================
  addUser = async (params) => {
    try {
      const res = await this.query(
        'INSERT INTO users ("id", "username") VALUES ($1, $2) RETURNING id',
        [params.id, params.username],
      );
      return res.rows[0].id;
    } catch (error) {
      console.log(error);
      return { message: 'Error', error: true };
    }
  };
  // =====================================================================
  // =====================================================================
  addUserEmail = async (params) => {
    try {
      await this.query('UPDATE users SET email = $1 WHERE id = $2', [
        params.email,
        params.id,
      ]);
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
  getUser = async (id) => {
    try {
      const res = await this.query(
        'SELECT * FROM users WHERE id = $1',
        [id],
      );
      return res.rows[0];
    } catch (error) {
      console.log(error);
    }
  };

  // =====================================================================
  // =====================================================================
  getUserById = async (id) => {
    try {
      const res = await this.query(
        'SELECT * FROM users WHERE id = $1',
        [id],
      );
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
        'INSERT INTO api_keys ("user_id", "api_key", "api_secret", "exchange_id","account_id","name") VALUES ($1, $2, $3, $4, $5, $6) RETURNING api_id',
        [
          params.user_id,
          params.api_key,
          params.api_secret,
          params.exchange_id,
          params.account_id,
          params.name,
        ],
      );
      return { apiId: res.rows[0].api_id };
    } catch (error) {
      console.log(error);
    }
  };
  // =====================================================================
  // =====================================================================
  getApiKeysByUserId = async (id) => {
    try {
      const res = await this.query(
        'SELECT * FROM api_keys WHERE user_id = $1',
        [id],
      );
      return res.rows;
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
      const res = await this.query(
        'SELECT * FROM subscriptions WHERE user_id = $1',
        [userId],
      );
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
        [
          params.user_bot_id,
          params.user_id,
          params.bot_id,
          params.api_keys,
        ],
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
      const res = await this.query(
        'UPDATE user_bots SET active_deal = $1 WHERE user_bot_id = $2',
        [params.deal_id, params.bot_id],
      );

      return { message: 'Successfully added!' };
    } catch (error) {
      console.log(error);
    }
  };
  getUserBotActiveDeal = async (bot_id) => {
    try {
      const res = await this.query(
        'SELECT active_deal FROM user_bots WHERE user_bot_id = $1',
        [bot_id],
      );
      return res.rows[0].active_deal;
    } catch (error) {
      console.log(error);
    }
  };
  addDeposit = async (params) => {
    try {
      const res = await this.query(
        'UPDATE user_bots SET deposit = $1 WHERE user_bot_id = $2',
        [params.deposit, params.botId],
      );

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
        'SELECT * FROM user_bots LEFT JOIN bots ON bots.bot_id = user_bots.bot_id WHERE user_bots.user_id = $1 ',
        [userId],
      );
      return res.rows;
    } catch (error) {
      console.log(error);
    }
  };
  // =====================================================================
  // =====================================================================
  addStep = async (params) => {
    try {
      const res = await this.query(
        'INSERT INTO steps ("user_id", "step") VALUES ($1, $2)',
        [params.userId, params.step],
      );
      return { message: 'Successfully added!' };
    } catch (error) {
      console.log(error);
    }
  };
  // =====================================================================
  // =====================================================================
  addDeal = async (params) => {
    try {
      const res = await this.query(
        'INSERT INTO deals ("deal_id", "user_id") VALUES ($1, $2) RETURNING deal_id',
        [params.dealId, params.userId],
      );
      return { message: 'Successfully added!' };
    } catch (error) {
      console.log(error);
    }
  };

  // =====================================================================
  // =====================================================================
  getDeal = async (userId) => {
    try {
      const res = await this.query(
        'SELECT * FROM deals WHERE user_id = $1',
        [userId],
      );
      return res.rows[0];
    } catch (error) {
      console.log(error);
    }
  };
  // =====================================================================
  // =====================================================================
  getExchange = async (id) => {
    try {
      const res = await this.query(
        'SELECT * FROM exchanges WHERE exchange_id = $1',
        [id],
      );
      return res.rows[0];
    } catch (error) {
      console.log(error);
    }
  };
  // =====================================================================
  // =====================================================================
  getBot = async (botId) => {
    try {
      const res = await this.query(
        'SELECT * FROM bots WHERE bot_id = $1',
        [botId],
      );
      return res.rows[0];
    } catch (error) {
      console.log(error);
    }
  };
}
