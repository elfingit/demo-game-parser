const de_lotto_parser = require('../parsers/de_lotto');
const us_powerball_parser = require('../parsers/us_powerball');
const us_mega_millions_parser = require('../parsers/megamillions');
const euromillions_parser = require('../parsers/euromillions');
const eurojackpot_parser = require('../parsers/eurojackpot');

const config = {
    games: {
        'de_lotto': {
            result_url: 'https://www.lotto.de/lotto-6aus49/lottozahlen',
            parser: de_lotto_parser
        },

        'us_powerball': {
            result_url: 'https://www.powerball.com/api/v1/numbers/powerball/recent?_format=json',
            parser: us_powerball_parser
        },
        'us_mega_millions': {
            result_url: 'https://www.megamillions.com/Winning-Numbers.aspx',
            parser: us_mega_millions_parser
        },
        'euromillions': {
            result_url: 'https://www.euro-millions.com/',
            parser: euromillions_parser
        },
        'eurojackpot': {
            result_url: 'https://www.eurojackpot.org/en/',
            parser: eurojackpot_parser
        }
    }

};


module.exports = config;