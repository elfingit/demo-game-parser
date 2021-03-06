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

function fetch_jackpot(page) {
    return new Promise((resolve, reject) => {
        page.$('div.HomeGameTeaserItem--lotto6aus49')
            .then((divElem) => {
                return divElem.$eval('strong.HomeGameTeaserItem__jackpot', node => node.innerText);
            }).then((data) => {
                let jackPotData = data.split(' ');
                console.log(jackPotData);
            if (jackPotData.length > 0 && jackPotData[1] == 'Millionen') {
                    let jackpot = jackPotData[0] * 1000000;
                    return resolve(jackpot);
                }

                return  resolve(0)
            }).catch((err) => {
                return reject(err);
            });
    });
}

function fetch_result(page) {

    return new Promise((resolve, reject) => {
        let main_result = fetch_main_result(page);
        let superzahl_result = fetch_superzahl_result(page);
        let spiel77_result = fetch_spiel77_result(page);
        let super6_result = fetch_super6_result(page);
        let date_result = fetch_date(page);

        Promise.all([main_result, superzahl_result, spiel77_result, super6_result, date_result])
            .then((res) => {
                return resolve(res);
            }).catch((err) => {
                return reject(err);
            })
        });

}

function fetch_date(page) {
    return new Promise((resolve, reject) => {
        page.$('div.WinningNumbers')
            .then((divElement) => {
                return divElement.$eval('span.WinningNumbers__date', node => node.innerText)
            })
            .then((res) => {
                let regex = /(\d{1,2})\.(\d{1,2})\.(\d{4})/;

                let match = regex.exec(res);

                return resolve(match[3] + '-' + match[2] + '-' + match[1]);
            }).catch((err) => {
                return reject(err);
            });
    });
}

function fetch_super6_result(page) {
    return new Promise((resolve, reject) => {
        page.$('div.WinningNumbers')
            .then((divElement) => {
                return divElement.$$('.WinningNumbersAdditionalGame');
            }).then((elems) => {
            return elems[1].$eval('span.WinningNumbersAdditionalGame__text span', node => node.innerText)
        }).then((result) => {
            return resolve(result);
        }).catch((err) => {
            return reject(err);
        })
    });
}

function fetch_spiel77_result(page) {
    return new Promise((resolve, reject) => {
        page.$('div.WinningNumbers')
            .then((divElement) => {
                return divElement.$$('.WinningNumbersAdditionalGame');
            }).then((elems) => {
                return elems[0].$eval('span.WinningNumbersAdditionalGame__text span', node => node.innerText)
            }).then((result) => {
                return resolve(result);
            }).catch((err) => {
                return reject(err);
            })
    });
}

function fetch_superzahl_result(page) {
    return new Promise((resolve, reject) => {
        page.$('div.WinningNumbers')
            .then((divElement) => {
                return divElement.$$('.DrawNumbersCollection__container');
            }).then((elems) => {
                return elems[1].$eval('span.LottoBall__circle', node => node.innerText);
            }).then((result) => {
                return resolve(result);
            }).catch((err) => {
                return reject(err);
            });

    });
}

function fetch_main_result(page) {
    return new Promise((resolve, reject) => {
        page.$('div.WinningNumbers')
            .then((divElement) => {
                return divElement.$$('.DrawNumbersCollection__container');
            }).then((elems) => {
                return elems[0].$$eval('span.LottoBall__circle', nodes => nodes.map(n => n.innerText));
            }).then((mainResult) => {
                return resolve(mainResult);
            }).catch((err) => {
                return reject(err);
            })
    });
}


const de_lotto_parser = {

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

        if (game_data instanceof Error) {
            return game_data;
        }

        if (jackpot_data instanceof Error) {
            return jackpot_data;
        }

        return {
            'main_result': game_data[0],
            'extra_ball': game_data[1],
            'additional_games': {
                'spiel77': game_data[2],
                'super6': game_data[3]
            },
            'date': game_data[4],
            'jack_pot': jackpot_data
        };
    }

};


module.exports = de_lotto_parser;