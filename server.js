/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Simple in-memory datastore, can't write to comments.json as in tutorial
var tickers = ["AAPL", "GOOGL", "NFLX", "MU","MSFT"];

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

io.on('connection', function (socket) {
  
  socket.on('connect_catchup', function () {
    console.log('catchup')
    socket.emit('connect_catchup_fromserver', tickers);
  });
  
  socket.on('delete_ticker', function (d) {
    if (tickers.indexOf(d) >= 0) tickers.splice(tickers.indexOf(d),1);
    socket.broadcast.emit('connect_catchup_fromserver', tickers);
    socket.emit('connect_catchup_fromserver', tickers);
  })
  socket.on('add_ticker', function (d) {
    console.log('adding ticker',d)
    tickers.push(d.toUpperCase())
    socket.broadcast.emit('connect_catchup_fromserver', tickers);
    socket.emit('connect_catchup_fromserver', tickers);
  })
})

server.listen(app.get('port'), function () {
  console.log('Server listening at port %d', app.get('port'));
});


// // Additional middleware which will set headers that we need on each request.
// app.use(function(req, res, next) {
//     // Set permissive CORS header - this allows this server to be used only as
//     // an API server in conjunction with something like webpack-dev-server.
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // Disable caching so we'll always get the latest comments.
//     res.setHeader('Cache-Control', 'no-cache');
//     next();
// });

// app.get('/api/tickers', function(req, res) {
//   res.send(tickers);
// });

// app.post('/api/tickers', function(req, res) {
//   // NOTE: In a real implementation, we would likely rely on a database or
//   // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
//   // treat Date.now() as unique-enough for our purposes.
//   if (tickers.indexOf(req.body.newticker) < -1) tickers.push(req.body.newticker);
// });
// app.delete('/api/tickers', function(req, res) {
//   // console.log(req.body,tickers)
//   if (tickers.indexOf(req.body.deleteticker) >= 0) tickers.splice(tickers.indexOf(req.body.deleteticker),1);
// });

// // app.listen(app.get('port'), function() {
// //   console.log('Server started on: ' + app.get('port'));
// // });