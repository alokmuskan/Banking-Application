-- Database: BankingMS
CREATE DATABASE IF NOT EXISTS BankingMS;
USE BankingMS;

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

-- 4. Accounts Table
CREATE TABLE Accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    branch_id INT,
    account_type ENUM('Savings', 'Current') NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    open_date DATE,
    status ENUM('Active', 'Closed', 'Dormant') DEFAULT 'Active',
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES Branches(branch_id) ON DELETE SET NULL
);

-- 5. Transactions Table
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

-- 6. Employees Table
CREATE TABLE Employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT,
    emp_name VARCHAR(100) NOT NULL,
    position VARCHAR(50),
    salary DECIMAL(10, 2),
    hire_date DATE,
    FOREIGN KEY (branch_id) REFERENCES Branches(branch_id)
);
