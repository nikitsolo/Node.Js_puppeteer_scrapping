const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 10,
    password: 'SCelch1995',
    user: 'USER400574_scpr2',
    database: 'db_400574_9',
    host: 'wahlprojektwebapp.lima-db.de',
    port: '3306'
});


let goDB = {};

// Show all 
goDB.showAll = () => {
    return new Promise((resolve, value) => {
        pool.query(`select * from application `, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

// Show the double Person, and add the search Term in Case its matches multiple (Data and IT for example) 
goDB.showDoubleInf = (Date_, title, company_name, WHAT_TEXT) => {
    return new Promise((resolve, value) => {
        pool.query(`select * from application WHERE 
        date_created = ? AND title = ? AND company_name = ? AND search <> ?`, [Date_, title, company_name, WHAT_TEXT], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

// =========================== CREATE ===========================

// Create Application
goDB.createApplication = (title, city,  descr, company_name, company_id, site_indeed, site_stepstone, site_glassdoor, url, date_created, word, date_diff) => {
    return new Promise((resolve, reject) => {
        pool.query(`insert into application ( title, city,  descr, company_name, company_id, site_indeed, site_stepstone, site_glassdoor, source_url, date_created, search, max_days) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [title, city,  descr, company_name, company_id, site_indeed, site_stepstone,  site_glassdoor, url, date_created, word, date_diff], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

// create DOUBLE
goDB.createDouble = (title, city,  descr, company_name, company_id, site_indeed, site_stepstone, site_glassdoor, url, date_created, word, double, date_diff) => {
    return new Promise((resolve, reject) => {
        pool.query(`insert into application ( title, city,  descr, company_name, company_id, site_indeed, site_stepstone, site_glassdoor, source_url, date_created, search, double_appl, max_days) values (?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?)`, [title, city,  descr, company_name, company_id, site_indeed, site_stepstone, site_glassdoor, url, date_created, word, double, date_diff], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

// Create Log
goDB.createLog = (text, search_website, search_term, search_city, search_pages, double, saved, saved_descr, saved_site, failed_counter) => {
    return new Promise((resolve, reject) => {
        pool.query(`insert into log(text, search_website, search_term, search_city, search_pages, double_count, saved_count, saved_descr_count, saved_site, failed_counter ) values (?,?,?,?,?,?,?,?,?,?)`, [text, search_website, search_term, search_city, search_pages, double, saved, saved_descr, saved_site, failed_counter], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};



//==============================================================


//count amount of Logs
goDB.lastAppl = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT application_id FROM application ORDER BY application_id DESC`,  (err, results) => {
            if (err) {
                return reject(err);
            }
                return resolve(results[0]);
            
        });
    });
};



// check descr
goDB.checkDescr = (DESCR) => {
    return new Promise((resolve, reject) => {
        pool.query(`select * from application WHERE 
                    descr = ? `, [ DESCR], (err, results) => {
            if (err) {
                return reject(err);
            }   
            return resolve(results);           
        });
    });
};

// check  date title and company 
goDB.checkInfo = ( title, company_name) => {
    return new Promise((resolve, reject) => {
        pool.query(`select * from application WHERE 
                      title = ? AND company_name = ?`, [ title, company_name], (err, results) => {
            if (err) {
                return reject(err);
            }
            
            return resolve(results);
        });
    });
};


// check  date title and company 
goDB.checkSite = ( DESCR , site_indeed, site_stepstone, site_glassdoor) => {
    return new Promise((resolve, reject) => {
        pool.query(`select * from application WHERE 
        descr = ? AND site_indeed = ? AND site_stepstone = ? AND site_glassdoor = ? `, [ DESCR, site_indeed, site_stepstone, site_glassdoor], (err, results) => {
            if (err) {
                return reject(err);
            }
            
            return resolve(results);
        });
    });
};

// check
goDB.checkGlassdoor = ( DESCR , site_indeed, site_stepstone, site_glassdoor) => {
    return new Promise((resolve, reject) => {
        pool.query(`select * from application WHERE 
        descr = ? AND site_indeed = ? AND site_stepstone = ? AND site_glassdoor = ? `, [ DESCR, site_indeed, site_stepstone, site_glassdoor], (err, results) => {
            if (err) {
                return reject(err);
            }
            
            return resolve(results);
        });
    });
};

// =========================== UPDATE ===========================

// check  date title and company 
goDB.update_apl = (search, app_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE application SET search = ? WHERE user_id = ?`, [search, app_id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

// check  date title and company 
goDB.update_apl_days = (days, app_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE application SET max_days = ? WHERE application_id = ?`, [days, app_id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};




module.exports = goDB;
