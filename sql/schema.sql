-- Database: BankingMS
CREATE DATABASE IF NOT EXISTS BankingMS;
USE BankingMS;

-- Drop existing tables in reverse order of dependencies to avoid foreign key errors
DROP TABLE IF EXISTS SupportTickets;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Cards;
DROP TABLE IF EXISTS Transactions;
DROP TABLE IF EXISTS Beneficiaries;
DROP TABLE IF EXISTS Loans;
DROP TABLE IF EXISTS Employees;
DROP TABLE IF EXISTS Accounts;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Branches;

-- 1. Branches Table
CREATE TABLE Branches (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address TEXT
);

-- 2. Users Table
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teller', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customers Table
CREATE TABLE Customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    perm_village VARCHAR(100),
    perm_district VARCHAR(100),
    perm_city VARCHAR(100),
    perm_state VARCHAR(100),
    perm_pincode VARCHAR(10),
    temp_village VARCHAR(100),
    temp_district VARCHAR(100),
    temp_city VARCHAR(100),
    temp_state VARCHAR(100),
    temp_pincode VARCHAR(10),
    dob DATE,
    gender ENUM('Male', 'Female', 'Other'),
    occupation VARCHAR(100),
    annual_income DECIMAL(15, 2),
    nationality VARCHAR(50) DEFAULT 'Indian',
    kyc_document_type VARCHAR(50),
    kyc_document_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 4. Beneficiaries Table
CREATE TABLE Beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    payee_name VARCHAR(100) NOT NULL,
    payee_account_no INT NOT NULL,
    bank_name VARCHAR(100) DEFAULT 'NexusBank',
    ifsc_code VARCHAR(20),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE
);

-- 5. Accounts Table
CREATE TABLE Accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    branch_id INT,
    account_type ENUM('Savings', 'Current') NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    open_date DATE,
    status ENUM('Pending', 'Active', 'Closed', 'Dormant', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES Branches(branch_id) ON DELETE SET NULL
);

-- 6. Cards Table
CREATE TABLE Cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    account_id INT NOT NULL,
    card_number VARCHAR(16) UNIQUE NOT NULL,
    expiry_date VARCHAR(5) NOT NULL,
    cvv VARCHAR(3) NOT NULL,
    type ENUM('Debit', 'Credit') DEFAULT 'Debit',
    status ENUM('Pending', 'Active', 'Blocked', 'Frozen', 'Rejected') DEFAULT 'Pending',
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES Accounts(account_id) ON DELETE CASCADE
);

-- 7. Loans Table
CREATE TABLE Loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    principal DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    term_months INT NOT NULL,
    status ENUM('Pending', 'Approved', 'Active', 'Settled', 'Rejected') DEFAULT 'Pending',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE
);

-- 8. Transactions Table
CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    from_account_id INT,
    to_account_id INT,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('Deposit', 'Withdrawal', 'Transfer') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (from_account_id) REFERENCES Accounts(account_id),
    FOREIGN KEY (to_account_id) REFERENCES Accounts(account_id)
);

-- 9. Employees Table
CREATE TABLE Employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT,
    emp_name VARCHAR(100) NOT NULL,
    position VARCHAR(50),
    salary DECIMAL(10, 2),
    hire_date DATE,
    FOREIGN KEY (branch_id) REFERENCES Branches(branch_id)
);

-- 10. Notifications Table
CREATE TABLE Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE
);

-- 11. SupportTickets Table
CREATE TABLE SupportTickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    category ENUM('Dispute', 'Lost Card', 'Account Issue', 'Other') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Open', 'In Progress', 'Resolved') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE
);

-- ============================================
-- 12. Insert Default Branches (Seed Data)
-- ============================================
INSERT INTO Branches (branch_name, city, address) VALUES 
('Main Headquarters', 'Mumbai', 'Nariman Point, Mumbai, Maharashtra 400021'),
('Jubilee Hills Branch', 'Hyderabad', 'Road No 36, Jubilee Hills, Telangana 500033'),
('Connaught Place Branch', 'New Delhi', 'Inner Circle, CP, New Delhi 110001'),
('Indiranagar Branch', 'Bengaluru', '100 Feet Road, Indiranagar, Karnataka 560038');
