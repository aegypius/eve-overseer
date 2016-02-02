const run = (name, worker) => {
    return (params, callback) => {
        worker.run(params)
            .then((result) => {
                callback(null, result);
            }).catch((error) => {
                callback(error);
            })
        ;
    };
};

module.exports = {
    'migrate' : run('migrate', require('./DatabaseMigrate')),
    'update skilltree' : run('update skilltree', require('./UpdateSkillTree'))
};
