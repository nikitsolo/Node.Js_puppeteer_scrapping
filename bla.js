
    // index.js
    const cron = require("node-cron");
    const express = require("express");
    const fs = require("fs");
    require('main.js')();


    // schedule tasks to be run on the server
    cron.schedule("5 * * * * *", function() {
        print();
      
    });
