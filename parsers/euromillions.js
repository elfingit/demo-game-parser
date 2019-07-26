const puppeteer = require('puppeteer');
const { get_month_number } = require('../lib/utils');

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

function fetch_main_result(page) {
    return new Promise((resolve, reject) => {
        page.$('ul.balls')
            .then((ulElem) => {
                return ulElem.$$eval('li.ball', nodes => nodes.map(n => n.innerText));
            }).then((result) => {
                return resolve(result);
            }).catch((err) => {
                return reject(err);
            })
    });
}

function fetch_date(page) {
    return new Promise((resolve, reject) => {
        page.$('div.results')
            .then((divResults) => {
                return divResults.$eval('div.title', node => node.innerText);
            }).then((result) => {
                let regexp = /(\d{1,2})[a-zA-Z]{1,3}\s{1}([a-zA-Z]+)\s{1}(\d{4})/;

                let matches = regexp.exec(result);

                let month_num = get_month_number(matches[2]);

                return resolve(matches[3] + '-' + month_num + '-' + matches[1]);

            }).catch((err) => {
                return reject(err);
            });
    });
}

function fetch_extra_ball(page) {
    return new Promise((resolve, reject) => {
        page.$('ul.balls')
            .then((ulElem) => {
                return ulElem.$$eval('li.lucky-star', nodes => nodes.map(n => n.innerText));
            }).then((result) => {
                return resolve(result);
            }).catch((err) => {
                return reject(err);
            })
    });
}

function fetch_additioanal_game(page) {
    return new Promise((resolve, reject) => {
        page.$('div.results')
            .then((divElem) => {
                return divElem.$('div.centred');
            }).then((divElem) => {
                return divElem.$('p');
            }).then((pElem) => {
                return pElem.$eval('strong', node => node.innerText);
            }).then((data) => {
                return resolve(data);
            }).catch((err) => {
                return reject(err);
        });
    });
}

function fetch_jackpot(page) {
    return new Promise((resolve, reject) => {
        page.$('div.jackpotAmount')
            .then((divElem) => {
                return divElem.$eval('span', node => node.innerText);
            }).then((data) => {

                let number = parseInt(data) * 1000000;

                return resolve(number);

            }).catch((err) => {
                return reject(err);
            });
    });
}

function fetch_result(page) {
    return new Promise((resolve, reject) => {
        let main_result = fetch_main_result(page);
        let date_result = fetch_date(page);
        let date_extra_ball = fetch_extra_ball(page);
        let additional_game = fetch_additioanal_game(page);

        Promise.all([main_result, date_result, date_extra_ball, additional_game])
            .then((result) => {
                return resolve(result);
            }).catch((err) => {
            return reject(err);
        });
    });
}

const euromillions_parser = {
    async parse(res_url, jackpot_url) {
        let result = await load_page(res_url);
        let browser = result[0];
        let page = result[1];

        let game_data = await fetch_result(page);

        if (browser) {
            browser.close();
        }

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

        return {
            'main_result': game_data[0],
            'extra_ball': game_data[2],
            'date': game_data[1],
            'additional_games': {
                'millionare_maker': game_data[3]
            },
            'jack_pot': jackpot_data
        };
    }
};

module.exports = euromillions_parser;