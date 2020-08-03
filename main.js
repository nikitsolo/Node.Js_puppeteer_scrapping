
const indeed = require("./indeed.js");
const stepstone = require("./stepstone.js");
const glassdoor = require("./glassdoor.js");
const db = require("./db");
const cron = require("node-cron");


// --------------------------- INDEED ---------------------------
async function scrapIndeed(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT) {
  console.log("Indeed: text: " + WHAT_TEXT + ", where: " + WHERE_TEXT + ", counter" + fail_counter);
  if (fail_counter == 200) {
    return;
  }

  try {

    //indeed
    let data_Indeed = await indeed
      .doIndeed(WHAT_TEXT, WHERE_TEXT, PAGES_INT)
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
    try {
      await saveDataDB(data_Indeed, WHAT_TEXT, WHERE_TEXT, PAGES_INT, "indeed", fail_counter);
    } catch (e) {
      console.log("Couldnt save data" + e);
    }
  } catch (e) {
    fail_counter++;
    console.log("Fail-Counter:" + fail_counter);
    await scrapIndeed(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT);

  }

  return true;
} // end of scrapIndeed ------------------------------------


// --------------------------- STEPSTONE ---------------------------
async function scrapStepstone(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT) {
  console.log("Stepstone: text: " + WHAT_TEXT + ", where: " + WHERE_TEXT + ", counter" + fail_counter);

  if (fail_counter == 200) {
    return;
  }

  try {

    //stepstone
    let data_stepstone = await stepstone
      .doStepstone(WHAT_TEXT, WHERE_TEXT, PAGES_INT)
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
    try {
      await saveDataDB(data_stepstone, WHAT_TEXT, WHERE_TEXT, PAGES_INT, "stepstone", fail_counter);
    } catch (e) {
      console.log("Couldnt save data" + e);
    }

  } catch (e) {
    fail_counter++;
    console.log("Fail-Counter:" + fail_counter);
    console.log(e);
    await scrapStepstone(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT);

  }

  return true;
} // end of scrapIndeed ------------------------------------

// --------------------------- GLASSDOOR ---------------------------
async function scrapGlassdoor(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT) {
  console.log("Glassdoor: text: " + WHAT_TEXT + ", where: " + WHERE_TEXT + ", counter" + fail_counter);
  if (fail_counter == 200) {
    return;
  }

  try {

    //monster
    let data_glassdoor = await glassdoor
      .doGlassdoor(WHAT_TEXT, WHERE_TEXT, PAGES_INT)
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
    try {
      await saveDataDB(data_glassdoor, WHAT_TEXT, WHERE_TEXT, PAGES_INT, "glassdoor", fail_counter);

    } catch (e) {
      console.log("Couldnt save data" + e);
    }
  } catch (e) {
    fail_counter++;
    console.log("Fail-Counter:" + fail_counter)
    console.log(e)
    await scrapGlassdoor(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT);

  }

  return true;
} // end of scrapIndeed ------------------------------------

async function saveDataDB(data, WHAT_TEXT, WHERE_TEXT, PAGES_INT, website, fail_counter) {

  var text = "";
  var double_count = 0;
  var saved_count = 0;
  var saved_descr_count = 0;
  var saved_site = 0;
  var firstRow = 0;
  var lastRow = 0;

  let stepstone = 0;
  let indeed = 0;
  let glassdoor = 0;

  firstRow = await db.lastAppl();

  if (typeof data === 'undefined') {
    return;
  }

  switch (website) {

    case 'stepstone':
      stepstone = 1;
      break;

    case 'indeed':
      indeed = 1;
      break;

    case 'glassdoor':
      glassdoor = 1;
      break;

    default:
      console.log('FAIL:  ' + website + '.');
  }

  // In DB speichern
  for (i = 0; i < data.length; i++) {
    console.log("Der "+ i + " Punkt wurde gespeichert")
    for (j = 0; j < data[i].length; j++) {

      try {

        //const ss_application_id = "";

        // Überprüfung nach der descr
        let uniqueDescr = await db.checkDescr(
          data[i][j][0].Descr

        );

        // title, company_name
        let uniqueInfo = await db.checkInfo(
          data[i][j][0].Title,
          data[i][j][0].Company
        );

        let uniqueSite = await db.checkSite(
          data[i][j][0].Descr,
          indeed,
          stepstone,
          glassdoor
        );

        var dateDiff = await dateDiffInDays(data[i][j][0].Days);


        /*
          wenn es keine Übereinstimmung mit Titel und Gesellschaft gibt: 
        */
        if (uniqueInfo.length == 0) {

          await db.createApplication(
            data[i][j][0].Title,
            data[i][j][0].City,
            data[i][j][0].Descr,
            data[i][j][0].Company,
            1,
            indeed,
            stepstone,
            glassdoor,
            data[i][j][0].URL,
            data[i][j][0].Days,
            WHAT_TEXT,
            dateDiff
          );
          //var results = await db.showAll();
          saved_count++;

        } else if (uniqueDescr.length == 0) {
          // Das titel und die gesellschaft passt zueinander, aber verschiedene Texte

          await db.createDouble(
            data[i][j][0].Title,
            data[i][j][0].City,
            data[i][j][0].Descr,
            data[i][j][0].Company,
            1,
            indeed,
            stepstone,
            glassdoor,
            data[i][j][0].URL,
            data[i][j][0].Days,
            WHAT_TEXT,
            "gleiche Daten, aber verschiedene Beschriftung",
            dateDiff
          );
          saved_descr_count++;

        } else if (uniqueSite.length == 0) {
          await db.createDouble(
            data[i][j][0].Title,
            data[i][j][0].City,
            data[i][j][0].Descr,
            data[i][j][0].Company,
            1,
            indeed,
            stepstone,
            glassdoor,
            data[i][j][0].URL,
            data[i][j][0].Days,
            WHAT_TEXT,
            "gleiche Daten, aber unterschiedliche Webseiten",
            dateDiff
          );
          saved_site ++;

        }else {

          var dateDiffnew = await dateDiffInDays(uniqueDescr[0].date_created);

          db.update_apl_days(dateDiffnew, uniqueDescr[0].application_id);

          double_count++;

        }

      }

      catch (e) {
        console.log("es geht nicht weiter");
        console.log(e)
        continue;
      }
    }
  }

  lastRow = await db.lastAppl();
  text = website + " - First ID: " + firstRow.application_id + " - Last ID: " + lastRow.application_id;

  await db.createLog(
    text,
    search_website = website,
    search_term = WHAT_TEXT,
    search_city = WHERE_TEXT,
    search_pages = PAGES_INT,
    double_count,
    saved_count,
    saved_descr_count,
    saved_site,
    fail_counter
  );
  console.log("-----------------------------finished-----------------------------");
}//End of saveDataDB ------------------------------


// a and b are javascript Date objects
async function dateDiffInDays(date) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;

  a = new Date(date)
  b = new Date()
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
//----------------------------------------------------------


async function testScrap() {
  await scrapIndeed(0, "IT Junior", "Wien", 1);
  await scrapStepstone(0, "IT Junior", "Wien", 1);
  await scrapGlassdoor(0, "IT Trainee", "Frankfurt", 2);

}
async function scrapParallel(startcounter, what, city, page) {
  //await scrapGlassdoor(startcounter, what, city, page);
  //await scrapIndeed(startcounter, what, city, page);
  await scrapStepstone(startcounter, what, city, page);

}


async function scrap(page, city) {

  await scrapParallel(0, "IT Junior", city, page);
  await scrapParallel(0, "IT Trainee", city, page);

  await scrapParallel(0, "Data Junior", city, page);
  await scrapParallel(0, "Data Trainee", city, page);

  await scrapParallel(0, "BI trainee", city, page);
  await scrapParallel(0, "BI Junior", city, page);

  await scrapParallel(0, "KI Junior", city, page);
  await scrapParallel(0, "KI Trainee", city, page);


}

async function scrapCity1(page) {

  await scrap(page, "Frankfurt");
  await scrap(page, "Wiesbaden");
  await scrap(page, "Mainz");

}

async function scrapCity2(page) {
  await scrap(page, "Wien");
  await scrap(page, "München");

}

async function scrapCity3(page) {

  await scrap(page, "Bochum");
  await scrap(page, "Stuttgart");
  await scrap(page, "Hamburg");

}

async function scrapCity4(page) {

  await scrap(page, "Köln");
  await scrap(page, "Berlin");

}

async function scrapAll(page) {
  await scrapCity1(page);
  //await scrapCity2(page);
  //await scrapCity3(page);
  //await scrapCity4(page);
  //scrapCity1(page);
}

//scrapGlassdoor(0, "IT Trainee", "Frankfurt", 2);
//testScrap();
scrapAll(1);

    /* schedule tasks to be run on the server
    cron.schedule(" 5 * * * * *", function() {
      scrapStepstone(0, "IT Junior", "Wien", 1);
    
  });

  */


