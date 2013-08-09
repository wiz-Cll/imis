var http = require('http');
var express = require('express');

var bdo = require('./dbo');
var route = require('./route');
var user = require('./user');

var app = express();
var port = 2009;

app.init = function(){
	app.use( express.bodyParser() );
	app.use( express.cookieParser('my secret here') );
	app.use( user.checkAuth );
	route.init(app);
};

app.init();
app.listen( port );
console.log( 'app is listening at ' + port);

