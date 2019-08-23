const axios = require('axios');
const puppeteer = require('puppeteer');

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

function fetch_jackpot(page) {
    return new Promise((resolve, reject) => {
        page.$('div.estimated-jackpot')
            .then((divElem) => {
                return divElem.$eval('span.number', node => node.innerText)
            }).then((data) => {
                let jackPotData = data.split(' ');
            console.log(jackPotData);
            try {
                    if (jackPotData.length > 1 && jackPotData[1] == "Million") {

                        let number = parseInt(jackPotData[0].replace('$', ''), 10) * 1000000;
                        return resolve(number);
                    }
                    return resolve(0);
                } catch (e) {
                    return reject(e);
                }
            }).catch((err) => {
                return reject(err);
        });
    });
}

function load_page(url) {

    return new Promise((resolve, reject) => {

        let brws = null;
        let pg = null;

        puppeteer.launch()
        .then((browser) => {
            brws = browser;
            return browser.newPage();
        }).then((page) => {
            pg = page;
            return page.goto(url);
        }).then(() => {
            return pg.waitFor(2000);
        }).then(() => {
            return resolve([ brws, pg ])
        }).catch((err) => {
            return reject(err);
        });
    });
}


const us_powerball_parser = {
    async parse(res_url, jackpot_url) {
        let result = await fetch_data(res_url);

        let jack_pot = await load_page(jackpot_url);
        let jBrowser = jack_pot[0];
        let jPage = jack_pot[1];

        let jackpot_data = await fetch_jackpot(jPage);

        if (jBrowser) {
            await jBrowser.close();
        }

        if (jackpot_data instanceof Error) {
            return jackpot_data;
        }

        result.jack_pot = jackpot_data;

        return result;
    }
};

module.exports = us_powerball_parser;