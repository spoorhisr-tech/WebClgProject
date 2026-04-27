import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import cors from 'cors';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'bookings.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory and file exist
async function initData() {
    try {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        try {
            await fs.access(DATA_FILE);
        } catch {
            await fs.writeFile(DATA_FILE, JSON.stringify([]));
        }
    } catch (err) {
        console.error('Initialization error:', err);
    }
}

// Routes
app.get('/api/bookings', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = {
            id: Date.now(),
            ...req.body,
            date_created: new Date().toISOString()
        };

        const data = await fs.readFile(DATA_FILE, 'utf8');
        const bookings = JSON.parse(data);
        bookings.push(newBooking);

        await fs.writeFile(DATA_FILE, JSON.stringify(bookings, null, 2));
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Serve the main app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
initData().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server is running!`);
        console.log(`🏠 Local:            http://localhost:${PORT}`);
        console.log(`🌐 On Your Network:  http://172.16.9.116:${PORT}`);
        console.log(`\nNote: Use the 'On Your Network' URL to access this from other devices.`);
    });
});
