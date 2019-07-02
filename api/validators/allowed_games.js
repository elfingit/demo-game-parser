const config = require('../config');

const allowed_games_validator = (game_code) => {

    let games = Object.keys(config.games);

    return games.includes(game_code);

};

module.exports = allowed_games_validator;