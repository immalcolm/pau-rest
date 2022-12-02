//create a nodejs module to be used
//modules allow function and data to be shared across different JS files
const MongoClient = require("mongodb").MongoClient;

//remembers which is being used
let _db = null;

//allow to connect to db of choice
//@param - url: connection string of the db
//@param - databaseName: name of the database
async function connect(url, databaseName){
    let client = await MongoClient.connect(url, {
        useUnifiedTopology:true
    })
    // set the selected database
    _db = client.db(databaseName);
}

function getDB() {
  return _db;
}

//share function connect,getDB
module.exports = { connect, getDB };
