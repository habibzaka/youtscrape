const ig = require('./insta');


(async() => {

    await ig.initialize();
    await ig.login();
    await ig.getVideoProcess(['anwar', 'adamw']);



})()