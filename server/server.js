
'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug=require('debug');

var csvP=require(path.join(__dirname,'./csv_module/csv_parser'));
var neo4j=require(path.join(__dirname,'./neo4j_module/neo4j_funs'));
var nfvd=require(path.join(__dirname,'./nfvd_collector/component2Neo4j'));
//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

//client path
var client=path.join(__dirname, '/../client');
app.set('views', client+ '/views');

// view engine setup
app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'jade');

// Static resources
app.use('/bower_components',  express.static(client + '/bower_components'));
app.use('/css',  express.static(client + '/css'));
app.use('/js',  express.static(client + '/js'));
app.use('/views',  express.static(client + '/views'));
app.use('/images',  express.static(client + '/images'));
app.use('/hp-ui',  express.static(client + '/hp-ui'));
app.use(favicon(client + '/images/favicon.ico'));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


/***********************************************
 * routes
 */
// Home page
app.get('/', function (req, res) {
    res.render('index.html');
});


app.get('/test',function(req,res){
    //res.send(require('./data/test.json'));
    csvP.test(req,res);
});


//neo4j func
app.get('/getNodes/:type',function(req,res){
    //res.send(require('./data/test.json'));
    neo4j.getNodes(req,res);
});



// nfvd collector
app.post('/collect/nfvd/inti',function(req,res){
    nfvd.initNeo4j(req,res);
});

app.post('/collect/nfvd/component',function(req,res){
    nfvd.collectNFVComponent(req,res);
});

/***********************************************
 *  end routes
 */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
//  app.use(function(err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//      message: err.message,
//      error: err
//    });
//  });
//}
//
//// production error handler
//// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//  res.status(err.status || 500);
//  res.render('error', {
//    message: err.message,
//    error: {}
//  });
//});

var server = app.listen(3001, function () {

  var host = server.address().address;
  var port = server.address().port;
  var url = 'http://' + host + ':' + port;

  console.log('You can browse the MAM app at: ' + url);
});

