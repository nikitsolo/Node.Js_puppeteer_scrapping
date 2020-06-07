const indeed = require("./indeed.js");
const stepstone = require("./stepstone.js");
const db = require("./db");



async function scrapIndeed(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT) {
  console.log("text: " + WHAT_TEXT + ", where: " + WHERE_TEXT + ", counter"+fail_counter);
  if (fail_counter == 200) {
    return;
  }

  try {
/*
    //stepstone
    let data_stepstone = await stepstone
      .doStepstone(WHAT_TEXT, WHERE_TEXT, PAGES_INT)
      .then(result => {
        return result;
      })
    .catch(err => {
      console.log(err);
    });
     

   
*/
    //indeed
    let data_Indeed = await indeed
      .doIndeed(WHAT_TEXT, WHERE_TEXT, PAGES_INT)
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });

      await saveDataDB(data_Indeed, WHAT_TEXT, WHERE_TEXT, PAGES_INT, fail_counter);


  } catch (e) {
    fail_counter++;
    console.log("Fail-Counter:" + fail_counter)
    console.log(e)
    await scrapIndeed(fail_counter, WHAT_TEXT, WHERE_TEXT, PAGES_INT);

  }

  return true;
} // end of scrapIndeed ------------------------------------






async function saveDataDB(data, WHAT_TEXT, WHERE_TEXT, PAGES_INT, fail_counter) {

  var text = "";
  var double_count = 0;
  var saved_count = 0;
  var saved_descr_count = 0;
  var firstRow = 0;
  var lastRow = 0;

  firstRow = await db.lastAppl();

  // In DB speichern
  for (i = 0; i < data.length; i++) {
    for (j = 0; j < data[i].length; j++) {

      try {

        //const ss_application_id = "";

        // Überprüfung nach der descr
        let uniqueDescr = await db.checkDouble(
          data[i][j][0].Descr
        );
        
        // title, company_name
        let uniqueInfo = await db.checkInf(
          data[i][j][0].Title,
          data[i][j][0].Company
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
            1,
            data[i][j][0].URL,
            data[i][j][0].Days,
            WHAT_TEXT,
            dateDiff
          );
          //var results = await db.showAll();
          saved_count++;

        } else {

          // Das titel und die gesellschaft passt zueinander, aber verschiedene Texte
          if (uniqueDescr.length == 0) {

            await db.createDouble(
              data[i][j][0].Title,
              data[i][j][0].City,
              data[i][j][0].Descr,
              data[i][j][0].Company,
              1,
              1,
              data[i][j][0].URL,
              data[i][j][0].Days,
              WHAT_TEXT,
              "gleiche Daten, aber verschiedene Beschriftung",
              dateDiff
            );
            saved_descr_count++;

          } else {

            var dateDiffnew = await dateDiffInDays(uniqueDescr[0].date_created);
          
            db.update_apl_days(dateDiffnew, uniqueDescr[0].application_id);

            double_count++;
          }

        }
      }
      catch (e) {
        console.log("es geht nicht weiter");
        console.log(e)
      }
    }
  }

  lastRow = await db.lastAppl();
  text = "First ID: " + firstRow.application_id + " - Last ID: " + lastRow.application_id;

  await db.createLog(
    text,
    search_website = "Indeed",
    search_term = WHAT_TEXT,
    search_city = WHERE_TEXT,
    search_pages = PAGES_INT,
    double_count,
    saved_count,
    saved_descr_count,
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

async function scrap(page, city) {

  await scrapIndeed(0, "IT Junior", city, page);
  await scrapIndeed(0, "Data Mining", city, page);
  await scrapIndeed(0, "IT Trainee", city, page);
  await scrapIndeed(0, "data trainee", city, page);
  await scrapIndeed(0, "Data Junior", city, page);
  await scrapIndeed(0, "Data Analyst", city, page);
  await scrapIndeed(0, "Data Science", city, page);
  await scrapIndeed(0, "Data Science", city, page);

}

async function scrap1(page) {

  await scrap(page, "Wien");
  await scrap(page, "Frankfurt");
  await scrap(page, "Wiesbaden");
  await scrap(page, "Mainz");
  

}

async function scrap2(page) {

  await scrap(page, "München");
  await scrap(page, "Köln");
  await scrap(page, "Berlin");

}

async function scrap3(page) {

  await scrap(page, "Bochum");
  await scrap(page, "Stuttgart");
  await scrap(page, "Hamburg");
}

async function scrapAll(page) {

  await scrap1(page);
  //await scrap2(page);
  //await scrap3(page);

}


scrapAll(200);
