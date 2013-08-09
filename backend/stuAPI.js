
var dbo = require('./dbo');

var Stu = dbo.Stu;

function getAllStu(req, res){
	Stu.find( {},'no name hometown job company workcity avatar livingplace', function(err, data){
		if(err){
			res.send('err occured while query db');
			return;
		}
		else{
			res.send(data);
			res.end();
			return;
		}
	} );
}

function getSingalStu(req, res){
	var stuNo = req.params.no;
	console.log( stuNo );
	if( stuNo.length === 10 ){
		Stu.findOne( {no: stuNo}, function( err, data ){
			if( err ){
				res.send('err while query ' + stuNo + ' stutent');
				return;
			}
			else{
				res.send( data );
				return;
			}
		} )
	}
}

function updateStu( req, res ){

}

exports.getAllStu = getAllStu;
exports.getSingalStu = getSingalStu;