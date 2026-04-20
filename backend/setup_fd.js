const db = require('./config/db');

async function createTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS FixedDeposits (
                fd_id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                linked_account_id INT NOT NULL,
                principal_amount DECIMAL(15, 2) NOT NULL,
                interest_rate DECIMAL(5, 2) NOT NULL,
                duration_months INT NOT NULL,
                maturity_amount DECIMAL(15, 2) NOT NULL,
                start_date DATE NOT NULL,
                maturity_date DATE NOT NULL,
                status ENUM('Active', 'Matured', 'Broken') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE,
                FOREIGN KEY (linked_account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE
            )
        `);
        console.log("FixedDeposits table created successfully!");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        process.exit();
    }
}

createTable();
