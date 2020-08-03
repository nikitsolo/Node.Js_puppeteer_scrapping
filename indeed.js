
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const request = require("request");
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')


async function startIndeed(WHAT_TEXT, WHERE_TEXT, PAGES_INT) {
  const browser = await puppeteer.launch({ headless: false, slowMo: 5, devtools: false });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1040 });

  await puppeteer.use(StealthPlugin())
  //puppeteer.use(AdblockerPlugin({ blockTrackers: true }))


  //Blockiert js und pic
  await page.setRequestInterception(true);
  await page.on('request', (req) => {
    if (req.resourceType() == 'font' || req.resourceType() == 'image') {
      req.abort();
    }
  });


  if (WHERE_TEXT == "Wien") {
    await page.goto("https://at.indeed.com");
  } else {
    await page.goto("https://de.indeed.com/");
  }
  await page.waitFor(500);

  let what = await page.$("#text-input-what");
  let where = await page.$("#text-input-where");


  await what.click({ clickCount: 3 });
  await what.type(WHAT_TEXT);
  await page.waitFor(1000);

  await where.click({ clickCount: 3 });
  await where.type(WHERE_TEXT);
  await page.waitFor(1000);

  await page.click("#whatWhere > div > div > form > div.icl-WhatWhere-buttonWrapper > button");
  await page.waitFor(1000);

  //Auf der Seite

  await clickIfAv(page, "#refineresults > div.serp-filters-sort-by-container > span.no-wrap > a");

  await clickIfAv(page, "#resultsCol > div.resultsTop > div.secondRow > div.serp-filters-sort-by-container > span.no-wrap > a");

  await clickIfAv(page, "#popover-x > a > svg");



  let infos = [];
  n = 2;

  try {
    await page.waitForSelector("#searchCountPages");
    seitenAnz = await page.evaluate(() => {
      return document.querySelectorAll("#searchCountPages")[0].innerText;
    });

    seitenAnz = seitenAnz.split(' '),
      seitenAnz = seitenAnz[3];
    console.log("Stellenanzeigen: " + seitenAnz);
  } catch{

    console.log("konnte anzahl der Seiten nicht lesen!");
  }

  while (n < PAGES_INT + 3) {
    console.log("Page: " + n);

    let inf = await scrapPage(page);


    infos.push(inf);
    await page.waitFor(100);

    if (n > 7) {
      m = 7;
    } else {
      m = n;
    }

    let SeiteWeiter;
    if(WHERE_TEXT != "Wien") {
      SeiteWeiter = "#resultsCol > div.pagination > a:nth-child(" + m + ") > span"
    }else{
      SeiteWeiter = "#resultsCol > nav > div > ul > li:nth-child("+ m + ") > a > span"
    }
    
   

    try {
      await page.click(SeiteWeiter);
    } catch (e) {
      console.log("Verarbeitung fertig..." + SeiteWeiter);
      await page.waitFor(5000);
      break;
    }



    // Reihenfolge der klickbaren charaktere: 2, 4, 5, 6, 7, 7, 7, .... 
    if (n == 2) {
      n++;
    }
    n++;
  }
  browser.close();
  return infos;
} // end of startIndeed ------------------------------------------------------------------------------



//Die angezeigte Seite von oben nach unten scrappen ---------------------------------------------------
async function scrapPage(page) {




  page.on('popup', resp => {
    console.log("pages length " + pages.length);
    page.length = 2;
    console.log("pages length " + pages.length);
  });

  await clickIfAv(page, "#popover-x > a > svg > g > path");
  await page.waitFor(500);



  if (page.url() == 'https://hrtechprivacy.com/de/brands/about-indeed' || page.url() == 'https://hrtechprivacy.com/de/brands/about-indeed#Cookies') {
    await page.goBack();

  }
  try {
    await page.waitForSelector(".title", { timeout: 5000 });

  } catch{
    console.log("failed div.title");
  }

  const elements = await page.$$(".title"); // Using '.$$' is the puppeteer equivalent of 'querySelectorAll'

  const data = [];

  // ID der Überschriften zum klicken auslesen und in result speichern
  const result = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".title"))
      .map(element => ({
        id: element.childNodes[1].id,
        href: element.childNodes[1].href
      }))
  ); // end of result

  const daysAgo = await page.evaluate(() =>
    Array.from(document.querySelectorAll("span.date"))
      .map(element => ({
        text: element.innerText
      }))
  ); // end of result


  let endData = [];

  //klick durch die Überschriften


  await page.waitFor(500);

  for (i = 0; i < result.length; i++) {
    //page.on('popup', () => console.info('👉 New page is opened'));

    try {
      await page.waitForSelector("#" + result[i].id, { timeout: 5000 });
      await page.click("#" + result[i].id);

      if (page.url() == 'https://hrtechprivacy.com/de/brands/about-indeed' || page.url() == 'https://hrtechprivacy.com/de/brands/about-indeed#Cookies' || page.url() == 'https://hrtechprivacy.com/de/brands/about-indeed#PrivacyPolicy') {
        console.log("Werbung")
        await page.goBack();
        await page.waitForSelector("#" + result[i].id, { timeout: 5000 });
        await page.click("#" + result[i].id);
      }

    } catch (e) {

      try {
        await page.waitForSelector("#" + result[i].id, { timeout: 5000 });
        await page.click("#" + result[i].id);
      } catch{
        continue;
      }
    }

    await clickIfAv(page, "#popover-x");

    try {
      //await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
      await page.waitForSelector("#vjs-jobtitle", { timeout: 5000 });
      await page.waitFor(50);
    } catch (e) {
      try {
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        await page.waitForSelector("#" + result[i].id, { timeout: 5000 });
        await page.waitForSelector("#vjs-jobtitle", { timeout: 5000 });
        await page.waitFor(50);
      } catch{
        continue;
      }
    }
    //Infos der Stellenanzeige
    let info = await page.evaluate(() => {

      let things = [];
      let Title = document.querySelector("#vjs-jobtitle").innerText;
      let Company = document.querySelector("#vjs-cn").innerText;
      let City = document.querySelector("#vjs-loc").innerText;

      let Descr = document.querySelectorAll("#vjs-desc")[0].innerText.replace(/\r\n|\n|\r/gm, "  ");
      let URL;
      let Days;


      things.push({ Title, Company, City, Descr, URL, Days }); // Push an object with the data onto our array

      return things; // Return our data array
    });

    info[0].URL = result[i].href;
    // Den text auf Zahlen minimieren, falls keine Zahlen: vor 0 Tagen
    info[0].Days = daysToDate(daysAgo[i]);

    endData.push(info);

  }
  return endData;
} // end of scrapFirstPage--------------------------------------------------------




// wenn werbung angezeigt wird, klick sie weg--------------------------------------
function daysToDate(days) {
  var days1 = days.text.match(/(\d+)/);
  if (days1) {
    days2 = days1[0];
  } else {
    days2 = 0;
  }

  var d = new Date();
  d.setDate(d.getDate() - days2);

  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-');
} // end of clickIfAv--------------------------------------------------------------



// wenn werbung angezeigt wird, klick sie weg--------------------------------------
async function clickIfAv(page, selector) {
  try {
    if ((await page.$(selector)) !== null) {
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.click(selector);
    }
  } catch{
    console.log("couldnt click: " + selector);
  }

} // end of clickIfAv--------------------------------------------------------------

module.exports = {
  name: "David",
  email: "info@mail.com",
  doIndeed: async (WHAT_TEXT, WHERE_TEXT, PAGES_INT) => {
    let val = await startIndeed(WHAT_TEXT, WHERE_TEXT, PAGES_INT);

    return val;
  }
};
