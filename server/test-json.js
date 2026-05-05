
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'data', 'Main Quiz questions.json');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('File read successfully. Length:', content.length);
    const data = JSON.parse(content);
    console.log('JSON parsed successfully. Items:', data.length);
} catch (error) {
    console.error('Error parsing JSON:', error.message);
    if (error.at) {
        console.error('Error at:', error.at);
    }
}
