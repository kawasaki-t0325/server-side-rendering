const express = require('express');
const http = require('http');
const _ = require('lodash');
const app = express();

let count = 0;
const countTemplate = `<span id='count'><%= count %></span>`;
const template = `
<div>
こんにちは、あなたは${countTemplate}番目のお客様です。
</div>
<button id='button'>count up</button>
<script>
const countCompiled = ${_.template(countTemplate)};
document.getElementById('button').addEventListener('click', () => {
    const req = new XMLHttpRequest();
    req.onload = (e) => {
        const count = document.getElementById('count');
        const result = JSON.parse(e.target.response);
        count.innerHTML = countCompiled(result);
    };
    req.open('GET', '/api/count');
    req.send();
});
</script>
`;

const compiled = _.template(template);

app.use('/api/count', (req, res, next) => {
    res.json({ count: count++ });
});

app.use((req, res, next) => {
    http.get({
        port: 3000,
        path: '/api/count'
    }, (response) => {
        let data = '';
        response.on('readable', () => {
            const chunk = response.read();
            if (chunk) {
                data += chunk;
            }
        });
        response.on('end', () => {
            console.log(data);
            res.send(compiled(JSON.parse(data)));
        })
    })
});

app.listen(3000);