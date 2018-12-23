const express = require('express');
const path = require('path');
const fs = require('fs');
const localeModule = require('locale-module');
const S = require('string');
const favicon = require('serve-favicon');
const morganLogger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const restController = require('publish-swagger-model/rest-controller');
const logger = require('logger');
const app = express();
const ssoModule = require('sso-module');
// app.use(ssoModule);
app.use(morganLogger('dev'));//we have to handle based on environment
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.get(['/APIPublish/', '/APIPublish/index.html'], function ( req, res , nex) {
    var htmlFile = fs.readFileSync(path.join('public', 'index.html'), {root: __dirname }).toString();
    //To-DO :: add some locale manipulation code
    //this is the place we can inject any application configuration into html file
    var localeProperties = {
        "properties" : localeModule.getAllProperties()
    };
    htmlFile = S(htmlFile).replaceAll('appConfigValue', JSON.stringify(localeProperties)).s;
    res.send(htmlFile)
});
app.use('/APIPublish/static', express.static(path.join(__dirname,  'node_modules')));
app.use('/APIPublish', express.static(path.join(__dirname, 'public')));
app.use('/APIPublish', restController).listen( process.env.PORT || 8083,function () {
    console.log('Server running in ' +  8083 );
});
process.on('uncaughtException', function(err) {
    logger.error(err);
});

