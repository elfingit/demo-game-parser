const axios = require('axios');

function fetch_data(url) {
    return new Promise((resolve, reject) => {
        axios.get(url)
            .then((response) => {

                return resolve({
                    'numbers': response.data[0].field_winning_numbers.split(','),
                    'extra_game': response.data[0].field_multiplier,
                    'date': response.data[0].field_draw_date
                });

            }).catch((err) => {
                return reject(err);
            })
    });
}


const us_powerball_parser = {
    async parse(url) {
        let result = await fetch_data(url);

        return result;
    }
};

module.exports = us_powerball_parser;