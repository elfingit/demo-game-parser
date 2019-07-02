const de_lotto_parser = require('../parsers/de_lotto');

const config = {
    games: {
        'de_lotto': {
            result_url: 'https://www.lotto.de/lotto-6aus49/lottozahlen',
            parser: de_lotto_parser
        },

        'us_powerball': {
            result_url: 'https://www.powerball.com/api/v1/numbers/powerball/recent?_format=json',
            parser: null
        }
    }

};


module.exports = config;