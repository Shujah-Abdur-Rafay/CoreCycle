
import fs from 'fs';
import path from 'path';
import https from 'https';

// Load .env
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envConfig.match(/VITE_GEMINI_API_KEY="?([^"\n\r]+)"?/);
const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

if (!apiKey) {
    console.error('API Key not found in .env');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(rawData);
            if (parsed.models) {
                const names = parsed.models.map(m => m.name);
                fs.writeFileSync('./tmp/all_models.json', JSON.stringify(names, null, 2));
                console.log(`Saved ${names.length} models to ./tmp/all_models.json`);
            } else {
                console.log(JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
            console.error('Error parsing response:', e.message);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching models:', err.message);
});
