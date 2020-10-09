
const indeed = require("./Indeed.js");
const stepstone = require("./Stepstone.js");
const glassdoor = require("./Glassdoor.js");
const db = require("../db/SafeDataDB.js");

const cron = require("node-cron");


// --------------------------- INDEED ---------------------------
async function scrapIndeed(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT) {

  console.log("Indeed: text: " + WHAT_TEXT + ", where: " + WHERE_TEXT + ", counter" + fail_counter);
  if (fail_counter == 100) {
    return;
  }

  //indeed
  let data_Indeed = await indeed
    .doIndeed(WHAT_TEXT, WHERE_TEXT, PAGES_INT)
    .then(result => {
      return result;
    })
    .catch(err => {
      console.log("Fehler beim Ausführen von Indeed: " + err);
      fail_counter++;
      console.log("Fail-Counter:" + fail_counter);
      await scrapIndeed(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT);
    });

  try {
    await db.save(data_Indeed, WHAT_TEXT, WHERE_TEXT, PAGES_INT, "indeed", fail_counter);
  } catch (err) {
    console.log("Couldnt save data" + err);
  }
  return true;
} // end of scrapIndeed ------------------------------------


// --------------------------- STEPSTONE ---------------------------
async function scrapStepstone(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT) {
  
  console.log("Stepstone: text: " + WHAT_TEXT + ", where: " + WHERE_TEXT + ", counter" + fail_counter);

  if (fail_counter == 100) {
    return;
  }
    //stepstone
    let data_stepstone = await stepstone
      .doStepstone(WHAT_TEXT, WHERE_TEXT, PAGES_INT)
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log("Fehler beim Ausführen von Stepstone: " + err);
        fail_counter++;
        console.log("Fail-Counter:" + fail_counter);
        console.log(e);
        await scrapStepstone(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT);
      });
    try {
      await db.save(data_stepstone, WHAT_TEXT, WHERE_TEXT, PAGES_INT, "stepstone", fail_counter);
    } catch (err) {
      console.log("Couldnt save data" + err);
    }

  return true;
} // end of scrapIndeed ------------------------------------

// --------------------------- GLASSDOOR ---------------------------
async function scrapGlassdoor(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT) {
  console.log("Glassdoor: text: " + WHAT_TEXT + ", where: " + WHERE_TEXT + ", counter" + fail_counter);
  if (fail_counter == 100) {
    return;
  }

    //glassdoor
    let data_glassdoor = await glassdoor
      .doGlassdoor(WHAT_TEXT, WHERE_TEXT, PAGES_INT)
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log("Fehler beim Ausführen von Glassdoor: " + err);
        fail_counter++;
        console.log("Fail-Counter:" + fail_counter)
        console.log(e)
        await scrapGlassdoor(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT);
      });
    try {
      await db.save(data_glassdoor, WHAT_TEXT, WHERE_TEXT, PAGES_INT, "glassdoor", fail_counter);

    } catch (err) {
      console.log("Couldnt save data" + err);
    }

  return true;
} // end of scrapIndeed ------------------------------------







module.exports = {

  scrap: async (webpage, descr, where, pages) => {
    switch (webpage) {

      case 'Stepstone':
        await scrapStepstone(0, descr, where, pages);
        break;

      case 'Indeed':
        await scrapIndeed(0, descr, where, pages);
        break;

      case 'Glassdoor':
        await scrapGlassdoor(0, descr, where, pages);
        break;

      default:
        console.log("Webpage nicht vorhanden.");
    }
  }
}


