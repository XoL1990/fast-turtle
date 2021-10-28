const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors('*'));


app.post('/save-image', (req, res) => {
    const base64Data = req.body.data.replace(/^data:image\/png;base64,/, "");

    fs.writeFile("out.png", base64Data, 'base64', function(err) {
        console.log(err);
    });

    res.send('ok');
});

server.listen(3000, () => {  console.log('listening on *:3000');});