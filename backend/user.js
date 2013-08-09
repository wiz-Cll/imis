var MD5 = require('MD5');

var dbo = require('./dbo');
var config = require('./config');

var User = dbo.Stu;
var Token = dbo.Token;

/* 
 * 登录流程：
 * 获取传递过来的no和pass，查询数据库并验证加盐的pass和数据库中存储的是否一致
 * 通过之后生成token并插入
 * 返回200 和 token
 */ 
function login( req, res ){
	var stuNo = req.body.no;
	var inputPass = req.param('password');

	if( !checkParam( stuNo, inputPass) ){
		var resObj = {
			code: 322,
			msg: 'wrong param: stuNo or pass is not valid'
		};
		res.send( resObj );
		return;
	}
    // console.log( req.param('no') );
    // console.log( req.params.no );
    // console.log( req.query.no );
	

	var query = { no: stuNo };

	User.findOne( query, 'password auth', function(err, data){
		if( err ){
			console.warn('query password err!' + stuNo + ' -:- ' + inputPass);
			var resObj = {
				code: 502,
				msg: 'query db err'
			};
		}
		else{
			var saltPre = stuNo.split('');
			var salt = 0;
			for(var i=0; i< 10; i++){
				salt += Number( saltPre[i] );
			}

			var passTocheck = MD5( inputPass + salt);

			if( !data ){
				var resObj = {
					code: 404,
					msg: 'user cannot found'
				};
				res.send( resObj );
				return;
			}
			else{
				if( passTocheck === data.password ){
					// 已经有token且没过期~ 延时并返回

					Token.findOne({no: stuNo}, function(err, data){
						if( err ){
							var resObj = {
								code: 200,
								token: req.token
							};
							res.send( resObj );
							return;
						}
						else if( data && data.token ){
							// 已有token 而且还没过期 那么延时
							if( (new Date()).valueOf() < data.expire ){
								req.token = data.token;
								extendToken( req, res, function(req, res){
									var resObj = {
										code: 200,
										token: req.token
									};
									res.send( resObj );
									return;
								});
							}
							// 有token  但是已过期 删除并重新付一个
							else{
								req.token = newToken( stuNo );
								var query = { _id: data._id };
								newValue = { token: req.token, expire: (new Date()).valueOf() };
								Token.update( query, newValue, function(err, data){
									var resObj = {};
									if( err ){
										resObj = {
											code: 500,
											msg: 'insert token err! db err'
										};
									}
									// data 此时为update影响的行数
									else if( data ){
										resObj = {
											code: 200,
											token: req.token
										};
									}
									res.send( resObj );
									return;
								})
							}
						}
						// 没有token 直接添加一条记录
						else{
							req.token = newToken( stuNo );
							addToken( req, res );
							return;
						}
					});
					return;
				}
				else{
					var resObj = {
						code: 333,
						msg: 'wrong password'
					};
				}
			}
		}
		res.send( resObj );
		return;
	});

/*
 * 这样一致添加，会导致token表堆积的问题
 * 一致都只添加，不删除，过期的token记录也存在表里面
 * 所以还是最好有非持久话的存储，在expire后自动删除
 */ 
	function addToken( req, res ){
		var newToken = new Token({
			token: req.token,
			expire: (new Date()).valueOf() + 600000,
			no: req.param('no')
		} );
		newToken.save(function(err, data){
			var resObj={};
			if( err ){
				resObj = {
					code: 500,
					msg: 'insert token err! db err'
				};
			}
			else if( data ){
				resObj = {
					code: 200,
					token: newToken.token
				};
			}
			else{
				resObj = {
					code: 500,
					msg: 'insert token err! data is null'
				};
			}
			res.send( resObj );
			return;
		});
	}


	function checkParam( stuNo, pass){
		if( stuNo && stuNo.length === 10 && pass.length === 32){
			return true;
		}
		else{
			return false;
		}
	}
}


function checkTokenValidtion( req, res, callback ){
	var token = req.param('token');
	if( token && token.length === 32 ){
		var query = {
			"token": token
		};
		var field = 'no';

		// 嵌套查询无法实现呀~  必须是完整的auth对象才能查出他的父亲和整条记录，只有token属性是不行的。
		// 所以还是新建里一个token表，用来存储token和no的对应
		Token.findOne( query, field, function(err, data){
			if( err ){
				var resObj = {
					code: 502,
					msg: 'query db error: query token validation'
				}
				res.send( resObj );
			}
			else if( data ){
				req.token = token;
				res.no = data.no;
				extendToken( req, res, callback);
			}
			else{
				var resObj = {
					code: 301,
					msg: 'token invalid'
				}
				res.send( resObj );
			}
		});
	}
	else{
		var resObj = {
			code: 301,
			msg: 'token invalid'
		}
		res.send( resObj );
	}
	return false;
}

// todo: 延时token失效的操作
function extendToken( req, res, callback ){
	var token = req.token;
	var updateToken = {
		'token': token,
		'expire': (new Date()).valueOf() + 600000
	};
	var query = { "token": token};
	Token.update(query, updateToken, function(err, data){
		if( err ){
			var resObj = {
				code: 502,
				msg: 'query db error: extendToken error'
			}
			res.send( resObj );
			return false;
		}
		else{
			if( data ){
				if( callback instanceof Function ){
					callback( req, res );
				}
			}
			else{

			}
			
		}
		return;
	});
}

function newToken( str ){
	return MD5( str + Math.random() );
}

/*
 * 检查token是否可用
 * 否则返回301
 * 是则继续进行 并且延时token
 * 
 */ 
function checkAuth( req, res, next ){
	console.log( req.path );
	if(  req.path.indexOf('/login') >= 0 ){
		next();
	}
	else{
		var token = req.param( 'token' );

		checkTokenValidtion( req, res, function(){
			next();
		} );
	}
	return;
}

exports.checkAuth = checkAuth;
exports.login = login;