const db = require("../db/DBQueries");


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
            saved_count++;
  
          } else if (uniqueDescr.length == 0) {
            // Das titel und die Gesellschaft passt zueinander, aber verschiedene Texte
  
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

  
/**
 * a and b are javascript Date objects
 * 
 * 
 *  */ 
async function dateDiffInDays(date) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;

  a = new Date(date)
  b = new Date()
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}


  module.exports = {

    save: async (data, WHAT_TEXT, WHERE_TEXT, PAGES_INT, website, fail_counter) => {
      return await saveDataDB(data, WHAT_TEXT, WHERE_TEXT, PAGES_INT, website, fail_counter);
    }
  };