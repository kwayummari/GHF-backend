require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ghf_db',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        dialectModule: require('mysql2'), // Add this line
        dialectOptions: {
            bigNumberStrings: true,
            supportBigNumbers: true,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        logging: console.log,
    },
    test: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME_TEST || 'ghf_db_test',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        dialectModule: require('mysql2'),
        dialectOptions: {
            bigNumberStrings: true,
            supportBigNumbers: true,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        logging: false,
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        dialectModule: require('mysql2'),
        dialectOptions: {
            bigNumberStrings: true,
            supportBigNumbers: true,
            ssl: process.env.DB_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false,
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        logging: false,
    },
};