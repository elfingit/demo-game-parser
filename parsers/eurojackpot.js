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

function fetch_main_result(page) {
    return new Promise((resolve, reject) => {
        page.$('ul.results')
            .then((ulElem) => {
                return ulElem.$$eval('li:not([class])', nodes => nodes.map(n => n.innerText));
            }).then((result) => {
                return resolve(result);
            }).catch((err) => {
                return reject(err);
            })
    });
}

function fetch_date(page) {
    return new Promise((resolve, reject) => {
        page.$('div.time')
            .then((divElem) => {

                return divElem.$eval('time', node => node.innerText);

            }).then((result) => {

                let regex = /(\d{1,2})\.(\d{1,2})\.(\d{4})/;

                let match = regex.exec(result);

                return resolve(match[3] + '-' + match[2] + '-' + match[1]);

            }).catch((err) => {
                return reject(err);
            })
    });
}

function fetch_extra_ball(page) {
    return new Promise((resolve, reject) => {
        page.$('ul.results')
            .then((ulElem) => {
                return ulElem.$$eval('li.extra', nodes => nodes.map(n => n.innerText));
            }).then((result) => {
            return resolve(result);
        }).catch((err) => {
            return reject(err);
        })
    });
}

function fetch_jackpot(page) {
    return new Promise((resolve, reject) => {
        page.$('div.next-jackpot')
            .then((divElem) => {

                return divElem.$eval('span.jackpot', node => node.innerText);

            }).then((data) => {
                let number = parseInt(data) * 1000000;
                return resolve(number);
            })
            .catch((err) => {
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

const eurojackpot_parser = {
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
            return  game_data;
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

        return {
            'main_result': game_data[0],
            'extra_ball': game_data[2],
            'date': game_data[1],
            'jack_pot': jackpot_data
        };
    }
};

module.exports = eurojackpot_parser;