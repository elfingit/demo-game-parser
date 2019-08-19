const allowed_games_validator = require('../validators/allowed_games');
const config = require('../config');

class GameController
{
    static async show(req, resp) {

        let game_code = req.params.game_code;

        if (allowed_games_validator(game_code) === false) {
            return resp.json({'message': 'Not found'}).status(404).end();
        }

        console.info('Getting result for: ' + game_code);

        let result = await config.games[game_code]
                .parser
                .parse(
                    config.games[game_code].result_url,
                    config.games[game_code].jackpot_url
                );

        if (result instanceof Error) {
            return resp.json({
                'success': false,
                'message': result.message
            }).status(500).end();
        }

        return resp.json(result).end();

    }
}

module.exports = GameController;