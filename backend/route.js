var stuAPI = require('./stuAPI');
var user = require('./user');

var routes = [
// 用户登录
	{
		action: 'post',
		url: '/login',
		handler: function(req, res){
			console.log( 'your ' + req.param('no') + ' is received');
			user.login(req, res);
		}
	},

// 获取全部stu列表 全部信息
	{
		action: 'get',
		url: '/stu',
		handler: stuAPI.getAllStu
	},
	{
		action: 'get',
		url: '/stu/:no',
		handler: stuAPI.getSingalStu
	}
];

function init( app ){
	var routeLen = routes.length;

	for( var i=0; i<routeLen; i++){
		for(var j in routes[i]){
			var iterm = routes[i];
			iterm.url = '/app' + iterm.url;

			app[ iterm.action ]( iterm.url, iterm.handler );
		}
	}
}

exports.init = init;