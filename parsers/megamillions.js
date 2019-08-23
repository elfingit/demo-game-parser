const puppeteer = require('puppeteer');

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

function fetch_result(page) {
    return new Promise((resolve, reject) => {
        let main_result = fetch_main_result(page);
        let date_result = fetch_date(page);
        let date_extra_ball = fetch_extra_ball(page);

        Promise.all([main_result, date_result, date_extra_ball])
            .then((result) => {
                return resolve(result);
            }).catch((err) => {
                return reject(err);
            });
    });
}

function fetch_extra_ball(page) {
    return new Promise((resolve, reject) => {
        page.$('ul.numbers')
            .then((ulElem) => {
                return ulElem.$('li.megaplier');
            }).then((liElem) => {
                return liElem.$eval('span.winNumMP', node => node.innerText);
            }).then((result) => {
                let regex = /\d+/;

                let match = regex.exec(result);

                return resolve(match[0]);
            }).catch((err) => {
                return reject(err);
            });
    });
}

function fetch_date(page) {
    return new Promise((resolve, reject) => {
        page.$('p.winningNumbersDate')
            .then((pElem) => {
                return pElem.$eval('span.lastestDate', node => node.innerText)
            }).then((result) => {
            let regex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;

            let match = regex.exec(result);

            return resolve(match[3] + '-' + match[1] + '-' + match[2]);
            }).catch((err) => {
                return reject(err);
            })
    });
}

function fetch_jackpot(page) {
    return new Promise((resolve, reject) => {
        page.$eval('span.estJackpot', node => node.innerText)
            .then((data) => {

                let jackPotData = data.split(' ');
                if (jackPotData.length > 0 && jackPotData[1] == 'Million') {
                    let number = parseInt(jackPotData[0].replace('$', ''), 10) * 1000000;
                    return resolve(number);
                }

                return resolve(0);
            }).catch((err) => {
                return reject(err);
        });
    });
}

function fetch_main_result(page) {
    return new Promise((resolve, reject) => {
        page.$('ul.numbers')
            .then((ulElem) => {
                return ulElem.$$eval('li.ball', nodes => nodes.map(n => n.innerText));
            }).then((items) => {
                return resolve(items);
            }).catch((err) => {
                return reject(err);
            });
    });
}

const megamillions_parser = {
    async parse(res_url, jackpot_url) {
        let result = await load_page(res_url);
        let browser = result[0];
        let page = result[1];

        let game_data = await fetch_result(page);

        if (page) {
            await page.close();
        }

        if (browser) {
            await browser.close();
        }

        if (game_data instanceof Error) {
            return game_data;
        }

        let jack_pot = await load_page(jackpot_url);
        let jBrowser = jack_pot[0];
        let jPage = jack_pot[1];

        let jackpot_data = await fetch_jackpot(jPage);

        if (jPage) {
            await jPage.close();
        }

        if (jBrowser) {
            await jBrowser.close();
        }

        if (jackpot_data instanceof Error) {
            return jackpot_data;
        }

        let extra_ball = game_data[0].pop();

        return {
            'main_result': game_data[0],
            'extra_ball': extra_ball,
            'additional_games': {
                'megaplier': game_data[2]
            },
            'date': game_data[1],
            'jack_pot': jackpot_data
        };
    }
};

module.exports = megamillions_parser;