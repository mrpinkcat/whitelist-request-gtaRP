let dotenv = require('dotenv');
dotenv.config();

const _PORT = process.env.PORT || 3000;

var auth = require('http-auth'),
  express = require('express'), // express
  app = require('express')(),
  server = require('http').createServer(app),
  JsonDB = require('node-json-db'), // npm node-json-db
  db = new JsonDB("./db/db", true, true), // npm chargement de la db
  io = require('socket.io')(server),
  fs = require('fs');

var basic = auth.basic({
  realm: "No Brain Panel",
  file: __dirname + "/panel.htpasswd"
});

server.listen(_PORT, function() {
  console.log('Server up on :' + _PORT);
});

app.use('/css', express.static(__dirname + '/web/css/'));
app.use('/js', express.static(__dirname + '/web/js/'));
app.use('/img', express.static(__dirname + '/web/img/'));

app.use('/panel/css', express.static(__dirname + '/web-panel/css/'));
app.use('/panel/js', express.static(__dirname + '/web-panel/js/'));
app.use('/panel/img', express.static(__dirname + '/web-panel/img/'));

app.get('/', (req, res) => {
  res.sendFile('web/index.html', {
    root: __dirname
  });
});
app.get('/panel', auth.connect(basic), (req, res) => {
  res.sendFile('web-panel/index.html', {
    root: __dirname
  });
});

function getDataCheck(path) {
  db.reload();
  try {
    var data = db.getData(path);
  }
  catch (error) {
    return error;
  }
  return data;
}

io.on('connection', function(socket) {
  console.log('Connection détécté. Envois des informations de configuration.')
  socket.emit('config-info', getDataCheck('/recaptcha'), getDataCheck('/server-name'), getDataCheck('/server-ip'), getDataCheck('/requirement'));
  socket.on('send-ip-exp', function(ip, exp) {
    console.log('Demande recu !');
    var obj = {
      "ip": ip,
      "exp": exp,
      "status": "waiting"
    };
    db.push('/ip/' + ip, obj);
    socket.emit('send-ip-exp-waiting');
    io.emit('notif-admin');
    io.emit('add-req', ip, exp);
  });

  socket.on('admin-connect', function() {
    console.log('Connection admin');
    socket.emit('send-db', getDataCheck('/ip'), getDataCheck('/recaptcha'), getDataCheck('/server-name'), getDataCheck('/server-ip'), getDataCheck('/requirement'));
  });

  socket.on('ok-id-db', function(id) {
    db.push('/ip/' + id + '/status', 'accepted');
    fs.readFile('./server.lua', 'utf8', function(err, data) {
      if (err) {
        return console.log(err);
      }
      var result = data.replace(/local whitelist = {/g, 'local whitelist = {\n    "' + id + '",');

      fs.writeFile('./server.lua', result, 'utf8', function(err) {
        if (err) return console.log(err);
      });
    });
    io.emit('remove-id-panel', id);
  });

  socket.on('denie-id-db', function(id) {
    db.delete('/ip/' + id);
    io.emit('remove-id-panel', id);
  });

  socket.on('status-ip', function(ip) {
    socket.emit('res-status-ip', getDataCheck('/ip/' + ip + '/status'));
  });

  socket.on('db-push', function(data) {
    db.push('/', data);
    socket.emit('db-push-ok');
  });

  socket.on('remove-id-db', function(ip) {
    db.push('/ip/' + ip + '/status', 'denie');
    fs.readFile('./server.lua', 'utf8', function(err, data) {
      if (err) {
        return console.log(err);
      }
      var result = data.replace('/"' + ip + '"/g', '');

      fs.writeFile('./server.lua', result, 'utf8', function(err) {
        if (err) return console.log(err);
      });
    });
    io.emit('remove-id-panel', ip);
  });
});
