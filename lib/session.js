import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import fs from 'fs';
import axios from 'axios';
const GITHUB_USERNAME = 'stormfiber';
async function SaveCreds(txt) {
    const __dirname = path.dirname(__filename);
    const gistId = txt.replace('MR YOUSAF BALOCH/YOUSAF-MD_', '');
    const gistUrl = `https://gist.githubusercontent.com/${GITHUB_USERNAME}/${gistId}/raw/creds.json`;
    try {
        const response = await axios.get(gistUrl);
        const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const sessionDir = path.join(process.cwd(), 'session');
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        const credsPath = path.join(sessionDir, 'creds.json');
        fs.writeFileSync(credsPath, data);
    }
    catch (error) {
        console.error('❌ Error downloading or saving credentials:', error.message);
        if (error.response) {
            console.error('❌ Status:', error.response.status);
            console.error('❌ Response:', error.response.data);
        }
        throw error;
    }
}
export default SaveCreds;

const GIST_TOKEN = process.env.GIST_TOKEN;
const GIST_ID = process.env.GIST_ID;

let lastBackupTime = 0;
async function backupCredsToGist() {
    if (!GIST_TOKEN || !GIST_ID) return;
    const now = Date.now();
    if (now - lastBackupTime < 5000) return;
    lastBackupTime = now;
    try {
        const credsPath = path.join(process.cwd(), 'session', 'creds.json');
        if (!fs.existsSync(credsPath)) return;
        const content = fs.readFileSync(credsPath, 'utf8');
        await axios.patch(`https://api.github.com/gists/${GIST_ID}`, {
            files: { 'creds.json': { content } }
        }, {
            headers: {
                Authorization: `token ${GIST_TOKEN}`,
                Accept: 'application/vnd.github+json'
            }
        });
        console.log('☁️ Session backed up to Gist');
    } catch (error) {
        console.error('❌ Failed to backup creds to Gist:', error.message);
    }
}

async function restoreCredsFromGist() {
    if (!GIST_TOKEN || !GIST_ID) return false;
    try {
        const res = await axios.get(`https://api.github.com/gists/${GIST_ID}`, {
            headers: { Authorization: `token ${GIST_TOKEN}` }
        });
        const fileData = res.data.files['creds.json'];
        if (!fileData || !fileData.content || fileData.content.trim() === '{}') return false;
        const sessionDir = path.join(process.cwd(), 'session');
        if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
        fs.writeFileSync(path.join(sessionDir, 'creds.json'), fileData.content);
        console.log('☁️ Session restored from Gist');
        return true;
    } catch (error) {
        console.error('❌ Failed to restore creds from Gist:', error.message);
        return false;
    }
}

export { backupCredsToGist, restoreCredsFromGist };
