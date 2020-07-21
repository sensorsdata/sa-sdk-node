var loki = require('lokijs');

var db = new loki(__dirname + '/salog.db');
console.log(__dirname + '/salog.db');

// set up an initialize function for first load (when db hasn't been created yet)
function databaseInitialize() {
  var entries = db.getCollection("events");

  // Add our main example collection if this is first run.
  // This collection will save into a partition named quickstart3.db.0 (collection 0)  
  if (entries === null) {
    // first time run so add and configure collection with some arbitrary options
    entries = db.addCollection("events");
  }

}

// place any bootstrap logic which needs to be run after loadDatabase has completed
function runProgramLogic() {
  var events = db.getCollection("events");
  var entryCount = events.count();
  var now = new Date();

  console.log("old number of entries in database : " + entryCount);

 

  // manually save
  db.saveDatabase(function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("saved... it can now be loaded or reloaded with up to date data");
    }
  });
}

console.log("");
console.log("Loading database...");

// manual bootstrap
db.loadDatabase({}, function(err) {
  databaseInitialize();
  console.log("db initialized");
  var events = db.getCollection("events");
  var entryCount = events.count();
  console.log("old number of entries in database : " + entryCount);
  console.log(events);
  // events.find().forEach((v, i) => {
  //   console.log(v.message);
  //   // entries.remove(v)
  //   // manually save
  //   // db.saveDatabase(function(err) {
  //   //   if (err) {
  //   //     console.log(err);
  //   //   } else {
  //   //     console.log("saved... it can now be loaded or reloaded with up to date data");
  //   //   }
  //   // });
  //   console.log(i);
  // })
  // for (i = 0; i < 1000; i++) {
  // runProgramLogic();
  // }
  console.log("program logic run but it's save database probably not finished yet");
});

console.log("wait for it...");