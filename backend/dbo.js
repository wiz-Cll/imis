var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/imis');

var stuSchema = mongoose.Schema({
	no: String,
	name: String,
	password: String,
	avatar: String,
	birthday: Date,
	hometown: String,
	workcity: String,
	company: String,
	job: String,
	livingplace: String
});

var Stu = mongoose.model('Stu', stuSchema);

var tokenSchema = mongoose.Schema({
	token: String,
	expire: Number,
	no: String
});

var Token = mongoose.model('Token', tokenSchema);

function dbInit(){
	var stuArr = [
		{
			"no": "0901050301",
			"name": "曹华覃",
			"hometown": "聊城",
			"job": "homedun"
		},
		{
			"no": "0901050302",
			"name": "chenllos",
			"hometown": "泰安",
			"job": "Font-End Developer"
		},
		{
			"no": "0901050303",
			"name": "池振方",
			"hometown": "聊城",
			"job": "php Developer"
		},
		{
			"no": "0901050304",
			"name": "单锦芳",
			"hometown": "聊城",
			"job": "homedun"
		}
	];
	for( var k=0; k< stuArr.length; k++){
		var stu = new Stu(stuArr[k]);
		
		stu.save( function(err){
			if(!err){
				console.log('save succed -:- ' + k);
			}
		} );
	}
}

// dbInit();

exports.Stu = Stu;
exports.Token = Token;