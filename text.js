// wenn werbung angezeigt wird, klick sie weg--------------------------------------
function daysToDate1(days) {
  console.log(days);
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

  if (days.indexOf("minutes") !== -1 || days.indexOf("Minuten") !== -1 || days.indexOf("minute") !== -1 || days.indexOf("Minute") !== -1) {
    var days1 = 0;

    var d = new Date();
    d.setDate(d.getDate() - days1);
  }

  if (days.indexOf("hours") !== -1 || days.indexOf("Stunden") !== -1 || days.indexOf("hour") !== -1 || days.indexOf("Stunde") !== -1) {
    var days1 = days.match(/(\d+)/)[0];

    var d = new Date();
    d.setHours(d.getHours() - days1);

  }

  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-');

} // end of clickIfAv--------------------------------------------------------------





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
    return 1900 - 01 - 01;
  }

}


function testAnz(seitenAnz) {



}


//console.log(daysToDate("2 week ago"));
//console.log(daysToDate("1 day ago"));
console.log(daysToDate("HOT↵24 Std."));
  //daysToDate("15 hours ago");




      let Title = document.querySelector(title_slctr).innerText;
      let Company;
      let City;
      let Descr = document.querySelector("div.listing-content.js-listing-content.listing-content-liquiddesign > div:nth-child(4) > div");
      if (Descr != null) {
        Descr = Descr.innerText.replace(/\r\n|\n|\r/gm, "  ");
      } else {
        Descr = document.querySelector("div.js-app-ld-ContentBlock").innerText.replace(/\r\n|\n|\r/gm, "  ");
      }