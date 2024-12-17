const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'mysql.sqlpub.com',
    user: 'mutx163',
    password: '865xqu8GKm0crj9N',
    database: 'mutx163',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool; 