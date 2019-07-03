const axios = require('axios');

function fetch_data(url) {
    return new Promise((resolve, reject) => {
        axios.get(url)
            .then((response) => {

                let main_result = response.data[0].field_winning_numbers.split(',');
                let extra_ball = main_result.pop();

                return resolve({
                    'main_result': main_result,
                    'extra_ball': extra_ball,
                    'additional_games': {
                        'megaplier': response.data[0].field_multiplier
                    },
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