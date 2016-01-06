const pkg = require('../package.json');
const env = process.env.NODE_ENV || 'development';

const { MONGOHQ_URL, MONGO_PORT_27017_TCP } = process.env;
const db = (MONGOHQ_URL || MONGO_PORT_27017_TCP || 'localhost').replace(/^(tcp|mongodb):\/\//, '');

module.exports = {
    database: {
        url: `mongodb://${db}/${pkg.name}-${env}`
    }
};
