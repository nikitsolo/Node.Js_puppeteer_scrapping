const puppeteer = require("puppeteer");
const request = require("request");

async function startStepstone(WHAT_TEXT, WHERE_TEXT, PAGES_INT) {
  const browser = await puppeteer.launch({ headless:  false, slowMo: 5, devtools: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1040 });

  await page.setRequestInterception(true);

  page.on('request', (req) => {
    if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
        req.abort();
    }
    else {
        req.continue();
    }
});

  await page.goto("https://www.stepstone.de/");

  //Type search term
  await page.waitForSelector("input.form-control.typeahead.search-box__field.search-box__field-what.typeahead__input");
  await page.type("input.form-control.typeahead.search-box__field.search-box__field-what.typeahead__input", WHAT_TEXT);

  //Type City 
  await page.waitForSelector("input.form-control.typeahead.search-box__field.search-box__field-where.typeahead__input");
  const input = await page.$("input.form-control.typeahead.search-box__field.search-box__field-where.typeahead__input");
  //await input.click({ clickCount: 3 });
  await input.type(WHERE_TEXT);
  await page.waitFor(2000);

  //cllick "Find Jobs"
  await clickButton("#collapseSearch > div > div > div > div > form > div.col-xs-12.col-sm-3.col-md-2 > div > button > strong", page);
  await page.waitFor(2000);

  //klick Werbung weg
  await clickButton("#japubox-popover__modal > div > div > div.modal-header.modal-header_mex > button > span", page);



  const infos = [];
  n = 1;

  while (n < 300) {
    
    if(n > 99 ){
      console.log("Seite: " + n);
      let inf = await scrapPage(page, browser, n);
      infos.push(inf);
      await page.waitFor(50);

    }


    try {
      await page.click(
        "#app-dynamicResultlist > div > div.container > div > div.col-lg-9 > div.styled__BottomNavigationContainer-yge25r-1.jsDorM.row > div.styled__PaginationWrapper-kcc06r-0.btHeXu.col-xs-12.col-md-4.col-lg-4 > a.styled__PageLink-kcc06r-2.eQDInk > span > svg");
    } catch {
        break;
    }
    await page.waitFor(1000);
    n++;
  }
  browser.close();
  return infos;

} // end of startIndeed ------------------------------------------------------------------------------



//Die angezeigte Seite von oben nach unten scrappen ---------------------------------------------------
async function scrapPage(page, browser, page_nr) {

  let clicked = true;

  await page.waitFor(500);
  await page.waitForSelector("div.styled__ResultsSectionContainer-gdhf14-0", {timeout: 5000});

  // ID der Überschriften zum klicken auslesen und in result speichern
  const result = await page.evaluate(() =>
    Array.from(document.querySelectorAll("article"))
      .map(element => ({
        id: element.id,
        city: element.childNodes[1].childNodes[2].childNodes[1].innerText,
        href: element.childNodes[1].childNodes[0].childNodes[0].href,
        days: element.childNodes[1].childNodes[2].childNodes[0].innerText,
        company: element.childNodes[1].childNodes[1].innerText
      }))
  ); // end of result

  let endData = [];

  //klick durch die Überschriften
  for (i = 0; i < result.length; i++) {



    const page_new = await browser.newPage();
    await page_new.setViewport({ width: 1280, height: 1040 });
    await page_new.setDefaultNavigationTimeout(100000); 
    
    await page_new.setRequestInterception(true);
    await page_new.on('request', (req) => {
      if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
          req.abort();
      }
      else {
          req.continue();
      }
  });

    
    await page.waitFor(500);
    try{
      await page_new.goto(result[i].href);
      await page_new.waitForSelector("div.col-xs-12.col-sm-10.col-md-10.col-lg-10.js-print-header > h1", {timeout: 5000});
                                      
    }catch(e){
      console.log(e)
      await page_new.close();
      continue;
    }




    //Infos der Stellenanzeige
    const info = await page_new.evaluate(() => {

      let things = [];

      let Title = document.querySelector("div.col-xs-12.col-sm-10.col-md-10.col-lg-10.js-print-header > h1").innerText;
      let Company;
      let City;
      let Descr = document.querySelector("div.listing-content.js-listing-content.listing-content-liquiddesign > div:nth-child(4) > div");
      if(Descr != null){
        Descr = Descr.innerText.replace(/\r\n|\n|\r/gm, "  ");
      }else{
          Descr = document.querySelector("div.js-app-ld-ContentBlock").innerText.replace(/\r\n|\n|\r/gm, "  ");
      }
      

      let URL;
      let Days;

      things.push({ Title, Company, City, Descr, URL, Days }); // Push an object with the data onto our array

      return things; // Return our data array
    });
    // Den text auf Zahlen minimieren, falls keine Zahlen: vor 0 Tagen
    info[0].Days = daysToDate(result[i].days);
    info[0].City = result[i].city
    info[0].URL = result[i].href;
    info[0].Company = result[i].company;


    endData.push(info);
    page_new.close();
  }

  return endData;

} // end of scrapFirstPage--------------------------------------------------------




// --------------------------------------
function daysToDate(days) {
  
  if (days.indexOf("Monat") !== -1 || days.indexOf("month") !== -1 ){
    var days1 = days.match(/(\d+)/)[0] * 30;

    var d = new Date();
    d.setDate(d.getDate() - days1);
  }

  if (days.indexOf("weeks") !== -1 || days.indexOf("Wochen") !== -1 || days.indexOf("week") !== -1 || days.indexOf("Woche") !== -1) {
    var days1 = days.match(/(\d+)/)[0] * 7;

    var d = new Date();
    d.setDate(d.getDate() - days1);
  }

  if (days.indexOf("days") !== -1 || days.indexOf("Tagen") !== -1 || days.indexOf("day") !== -1 || days.indexOf("Tag") !== -1) {
    var days1 = days.match(/(\d+)/)[0];  

    var d = new Date();
    d.setDate(d.getDate() - days1);
  }

  if (days.indexOf("minutes") !== -1  || days.indexOf("Minuten") !== -1  || days.indexOf("minute") !== -1 || days.indexOf("Minute") !== -1) {
    var days1 = 0;

    var d = new Date();
    d.setDate(d.getDate() - days1);  
  }

  if (days.indexOf("hours") !== -1 || days.indexOf("Stunden") !== -1 || days.indexOf("hour") !== -1 || days.indexOf("Stunde") !== -1) {
    var days1 = days.match(/(\d+)/)[0]; 

    var d = new Date();
    d.setHours( d.getHours() - days1 );  
  }
  let returnDate;

  try{
    returnDate =  [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-')
  }catch(e){
    console.log("Datum Fehlgeschlagen: D: "+days1 + " Days: "+days);

    returnDate = d;
  }
  return returnDate;

} // --------------------------------------------------------------



// wenn werbung angezeigt wird, klick sie weg--------------------------------------
async function clickIfAv(page, selector) {
  if ((await page.$(selector)) !== null) {
    await page.waitForSelector(selector, {timeout: 5000});
    page.click(selector);
  }
} // end of clickIfAv--------------------------------------------------------------

/**
 * Methode zum klicken eines Buttons.
 * Rückgabewert true bei gelingen, false bei scheitern. 
 * Kurze Rückmeldung über Console.log zum Stand
 */

async function clickButton(selector, page) {
  try {
    await page.waitForSelector(selector, {timeout: 10000});
    await page.click(selector);

    return true

  } catch (e) {
    
    return false

  }
} // end of inputBoxType--------------------------------------------------------------






module.exports = {

  doStepstone: async (WHAT_TEXT, WHERE_TEXT, PAGES_INT) => {
    let val = await startStepstone(WHAT_TEXT, WHERE_TEXT, PAGES_INT);
    return val;
  }
};
