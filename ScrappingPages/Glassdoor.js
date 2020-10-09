const puppeteer = require("puppeteer");
const request = require("request");


/*
Scrapper for Glassdoor
*/
async function startGlassdoor(WHAT_TEXT, WHERE_TEXT, PAGES_INT) {
  const browser = await puppeteer.launch({ headless: false, slowMo: 5, devtools: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1040 });

    
  await page.setRequestInterception(true);
  await page.on('request', (req) => {
    if(req.resourceType() == 'font' || req.resourceType() == 'image'){
        req.abort();
    }
    else {
        req.continue();
    }
});

    
  await page.goto("https://www.glassdoor.de/Job/data-scientist-jobs-SRCH_KO0,14.htm");




  //Type search term    await page.waitForSelector("input.keyword");
  const inputWHAT = await page.$('input.keyword');
  await inputWHAT.click({ clickCount: 3 });
  await inputWHAT.type(WHAT_TEXT);

  //Type City  
  const inputWHERE = await page.$('input.loc');
  await inputWHERE.click({ clickCount: 3 });
  await inputWHERE.type(WHERE_TEXT);

  await page.waitFor(2000);

  //cllick "Find Jobs"
  await clickButton("#HeroSearchButton > span", page);
  await page.waitFor(2000);



  let infos = [];
  let seitenAnz;
  n = 1;

  try {
    await page.waitForSelector("#ResultsFooter > div.cell.middle.hideMob.padVertSm");
    seitenAnz = await page.evaluate(() => {
      return document.querySelectorAll("#ResultsFooter > div.cell.middle.hideMob.padVertSm")[0].innerText;
    });

    seitenAnz = seitenAnz.split(' '),
      seitenAnz = seitenAnz[3];
    console.log("Seiten: "+seitenAnz);
  } catch{

    console.log("konnte anzahl der Seiten nicht lesen!");
  }



  while (n <= seitenAnz && n<= PAGES_INT) {
    console.log("Seite: " + n);
    let inf = await scrapPage(page, browser, n);
    infos.push(inf);
    await page.waitFor(50);

    let next = await clickButton("#FooterPageNav > div > ul > li.next > a", page);
    if (next == false) {
      console.log("seite vorbei auf seite:" + n)
      break;
    }

    n++;
  }

  browser.close();
  return infos;
} // end of startIndeed ------------------------------------------------------------------------------



//Die angezeigte Seite von oben nach unten scrappen ---------------------------------------------------
async function scrapPage(page, browser, page_nr) {

  let clicked = true;

  await page.waitFor(500);
  await page.waitForSelector("div.jobContainer");


  // ID der Überschriften zum klicken auslesen und in result speichern
  let result = await page.evaluate(() =>
    Array.from(document.querySelectorAll("div.jobContainer"))
      .map(element => ({
        title: element.childNodes[1].innerText,
        city: element.childNodes[2].childNodes[0].innerText,
        href: element.childNodes[1].href,
        days: element.childNodes[2].childNodes[1].innerText,
        company: element.childNodes[0].innerText
      }))
  ); // end of result

  let endData = [];

  //klick durch die Überschriften
  for (i = 1; i <= result.length; i++) {

    if (i == 6) {
      i++;
    }

    // klick dletzte an
    try {
      await page.waitFor(100);
    } catch (e) {
      continue;
    }

    // klick die i-te Anzeige an
    try {
      await page.waitForSelector(`#MainCol > div > ul > li:nth-child( ${i}) > div.jobContainer > a`, { timeout: 5000 });
      await page.click(`#MainCol > div > ul > li:nth-child( ${i}) > div.jobContainer > a`);

      await page.waitFor(100);
    } catch (e) {
      continue;
    }



    await clickIfAv(page, "#JAModal > div > div.modal_main > span > svg");


    // Warte bis alles auf der rechten Seite geladen hat 
    try {

      await page.waitForSelector("#HeroHeaderModule > div.empWrapper.ctasTest > div.empInfo.newDetails > div.title", { timeout: 2000 });

    } catch{

      await page.waitFor(500);

      await page.goBack();

      await page.waitFor(200);

      await page.click(`#MainCol > div > ul > li:nth-child( ${i}) > div.jobContainer > a`);
      try {
        await page.waitForSelector("#HeroHeaderModule > div.empWrapper.ctasTest > div.empInfo.newDetails > div.title", { timeout: 2000 });

      } catch{
        continue;
      }
    }

    /* 
    Vergleich Titel von Linke Seite und rechte Seite, falls die eiden nicht übereinstimmen, wird 200ms gewartet, bis die rchte Seite nachlädt
    */

    let count_rl = 0;
    let cont = false;

    let leftTitle;
    let rightTitle

    try {

      leftTitle = await page.evaluate((i) => {
        return document.querySelectorAll("#MainCol > div > ul > li:nth-child( 1) > div.jobContainer > a")[0].innerText;
      }, (i));

      rightTitle = await page.evaluate(() => {
        return document.querySelector("div.title").innerText;
      });

    } catch{
      continue;
    }

    // Warten bis rechte Seite geladen hat

    let count_n = 0;
    while (leftTitle != rightTitle) {

      if (count_n > 5) {
        await page.click(`#MainCol > div > ul > li:nth-child( ${i + 1}) > div.jobContainer > a`);
        await page.click(`#MainCol > div > ul > li:nth-child( ${i}) > div.jobContainer > a`);
        await page.waitFor(300);
      }
      if (count_n > 10) {
        page.evaluate(_ => {
          window.scrollBy(0, window.innerHeight);
        });
      }




      await page.waitFor(200);

      rightTitle = await page.evaluate(() => {
        return document.querySelector("div.title").innerText;
      });

      leftTitle = await page.evaluate((i) => {
        return document.querySelectorAll("#MainCol > div > ul > li:nth-child( " + (i) + ") > div.jobContainer > a")[0].innerText;
      }, (i));
      count_n++;

    }


    
    try {

      await page.waitForSelector("div.employerName", { timeout: 2000 });
      await page.waitForSelector("div.location", { timeout: 2000 });
      await page.waitForSelector("div.jobDesc", { timeout: 2000 });
      await page.waitForSelector("#MainCol > div > ul > li:nth-child( 1) > div.jobContainer > a", { timeout: 2000 });

    } catch{
      console.log("cont");
      continue;
    }





    let info = await page.evaluate((i) => {

      let things = [];
      let Title = document.querySelector("div.title").innerText;
      let Company = document.querySelector("div.employerName").innerText;
      let City = document.querySelector("div.location").innerText;
      let Descr = document.querySelectorAll('div.jobDesc')[0].innerText.replace(/\r\n|\n|\r/gm, "  ");

      let URL = document.querySelectorAll("#MainCol > div > ul > li:nth-child( " + i + ") > div.jobContainer > a")[0].href;
      let Days = document.querySelectorAll("#MainCol > div > ul > li:nth-child( " + i + ") > div.jobContainer")[0].childNodes[2].childNodes[1].innerText;

      things.push({ Title, Company, City, Descr, URL, Days }); // Push an object with the data onto our array

      return things; // Return our data array
    }, (i));

    // Den text auf Zahlen minimieren, falls keine Zahlen: vor 0 Tagen

    let finDate = daysToDate(info[0].Days);

    if (finDate == 1900-01-01) {
      continue;

    }

    info[0].Days = finDate;




    endData.push(info);

  }

  return endData;

} // end of scrapFirstPage--------------------------------------------------------




// wenn werbung angezeigt wird, klick sie weg--------------------------------------
function daysToDate(days) {

  if (days.indexOf("Tg.") !== -1 || days.indexOf("Tg.") !== -1) {
    var days1 = days.match(/(\d+)/)[0];

    var d = new Date();
    d.setDate(d.getDate() - days1);
  }


  if (days.indexOf("Std.") !== -1) {
    var days1 = days.match(/(\d+)/)[0];

    var d = new Date();
    d.setHours(d.getHours() - days1);
  }

  try {
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-');

  } catch{
    return 1900-01-01;
  }



} // end of clickIfAv--------------------------------------------------------------



// wenn werbung angezeigt wird, klick sie weg--------------------------------------
async function clickIfAv(page, selector) {
  if ((await page.$(selector)) !== null) {
    await page.waitForSelector(selector);
    page.click(selector);
  }
} // end of clickIfAv--------------------------------------------------------------

/**
 * Methode zum klicken eines Buttons.
 * Rückgabewert true bei gelingen, false bei scheitern. 
 */

async function clickButton(selector, page) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);

    return true

  } catch (e) {
    return false

  }
} // end of inputBoxType--------------------------------------------------------------






module.exports = {

  doGlassdoor: async (WHAT_TEXT, WHERE_TEXT, PAGES_INT) => {
    return await startGlassdoor(WHAT_TEXT, WHERE_TEXT, PAGES_INT);

  }
};
