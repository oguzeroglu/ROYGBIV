var express = require("express");
var http = require("http");

console.log("*******************************************")
console.log( " ____   _____   ______ ____ _____     __ ");
console.log( "|  _ \\ / _ \\ \\ / / ___| __ )_ _\\ \\   / / ");
console.log( "| |_) | | | \\ V / |  _|  _ \\| | \\ \\ / /  ");
console.log( "|  _ <| |_| || || |_| | |_) | |  \\   /   ");
console.log( "|_| \\_\\\\___/ |_| \\____|____/___|  \\_/    ");

console.log("\n*******************************************");

app = express();

app.get("/", function(req, res){
  console.log("[*] A new request received.");
	res.sendFile(__dirname + "/roygbiv.html");
});

app.use(express.static('./'));
server = http.Server(app);
server.listen(8085);
