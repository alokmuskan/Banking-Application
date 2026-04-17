const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        console.log('✅ Connection successful!');
        const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
        console.log('Result:', rows[0].solution);
        await connection.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

testConnection();
