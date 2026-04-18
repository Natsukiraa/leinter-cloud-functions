const functions = require('@google-cloud/functions-framework');
const https = require('https');

functions.http('discordNotifier', async (req, res) => {
    const card = req.body;
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.error('DISCORD_WEBHOOK_URL is not set');
        res.status(500).send('Missing webhook URL');
        return;
    }

    const message = {
        content: null,
        embeds: [
            {
                title: 'New Leitner Card Created',
                color: 0x5865f2,
                fields: [
                    { name: 'Question', value: card.question ?? 'N/A', inline: false },
                    { name: 'Answer', value: card.answer ?? 'N/A', inline: false },
                    { name: 'Tag', value: card.tag ?? 'N/A', inline: true },
                    { name: 'Category', value: card.category ?? 'FIRST', inline: true },
                ],
            },
        ],
    };

    await postJson(webhookUrl, message);
    res.status(200).send('OK');
});

function postJson(url, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const parsed = new URL(url);
        const options = {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
        };

        const req = https.request(options, (res) => {
            res.resume();
            res.on('end', resolve);
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}
