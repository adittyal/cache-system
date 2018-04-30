// Third party modules
const redis = require('redis');

class Redis {

    constructor(initApp) {
        this.redisClient = null;
        this.initRedis(initApp);
    }

    initRedis(initApp) {
        this.redisClient = redis.createClient();
        this.redisClient.on('error', () => {
            initApp(true);
        });
        this.redisClient.on('ready', () => {
            initApp(false);
        });
    }

    set(key, value, exp) {
        this.redisClient.set(key, value);
        if(exp) {
            this.redisClient.expire(key, exp);
        }
        return;
    }

    get(key, cb) {
        this.redisClient.get(key, (err, value) => {
            return cb(err, value);
        });
    }

    clean() {
        this.redisClient.flushall();
    }
}

module.exports = Redis;