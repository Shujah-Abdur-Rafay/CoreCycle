
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
            console.log('Available Models:');
            if (parsed.models) {
                parsed.models.forEach(m => {
                    console.log(`- ${m.name}`);
                });
            } else {
                console.log(JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
            console.error('Error parsing response:', e.message);
            console.log(rawData);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching models:', err.message);
});
