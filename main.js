const s = require("./ScrappingPages/ScrapperBundle.js");

async function scrap() {

    const pages = ['Indeed', 'Stepstone', 'Glassdoor']

    const cities = ['Frankfurt', 'Wiesbaden', 'Mainz',
        'Wien', 'München', 'Bochum', 'Stuttgart',
        'Hamburg', 'Köln', 'Berlin']

    const jobs = ['IT Junior', 'IT Trainee', 'Data Junior',
        'Data Trainee', 'BI Junior', 'BI Trainee',
        'KI Junior', 'KI Trainee']

        let i = 0;
    for (page of pages) {
        for (job of jobs) {
            for (city of cities) {
                s.scrap(page, job, city, 1);
            }
        }
    }
}


/**
 * 3*10*8 = 240 Kombinationen aus Städten Berufsfeldern und Webseiten zum Scrappen
 * */

scrap();



