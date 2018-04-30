// Third party modules
const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const RDB = require('./rdb');

class App {
    constructor() {
        this.app = express();
        this.rdb = new RDB(this.init.bind(this));
        this.config();
        this.routes();
    }

    config() {
        this.app.use(bodyParser.json());
    }

    routes() {
        // GET
        this.app.get('/message/:id', (req, res) => {
            let id = req.params.id;
            this.rdb.get(id, (err, message) => {
                if(err) {
                    return this.sendResponse(err, message, res);
                }
                if(!message) {
                    return this.sendResponse({
                        message: 'Resource not found'
                    }, {}, res, 404);
                } 
                return this.sendResponse(null, {
                    id: id,
                    message: message
                }, res, 200);
            });
        });

        // POST
        this.app.post('/message', (req, res) => {
            let reqBody = req.body;
            if (!reqBody.id || !reqBody.message) {
                return this.sendResponse({
                    message: 'Id and Message are required.'
                }, {}, resp, 400);
            }
            this.rdb.set(reqBody.id, reqBody.message, 30);
            return this.sendResponse(null, {
                id: reqBody.id,
                message: reqBody.message
            }, res, 200)
        });

        // CLEAN
        this.app.delete('/message', (req, res) => {
            this.rdb.clean();
            return this.sendResponse(null, {}, res, 200)
        });
    }

    sendResponse(err, data, resp, statusCode) {
        if(err) {
            resp.format({
                'application/json': () => {
                    resp.status(statusCode || 500).json({
                        'status': 'fail',
                        'data': {},
                        'message': err.message
                    });
                }
            });
        } else {
            resp.format({
                'application/json': () => {
                    resp.status(statusCode).json({
                        'status': 'success',
                        'data': data                    
                    });
                }
            });
        }
    }

    init(redisFailure) {
        if (redisFailure) {
            console.log('Redis is failed...');
            return;
        }
        this.app.listen(3000, (err) => {
            if (err) {
                console.log(`Error while running the server - ${JSON.stringify(err)}`)
                return;
            }
            console.log('Server is listening on http://localhost:3000');
        });
    }
}

new App();