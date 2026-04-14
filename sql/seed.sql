USE BankingMS;

-- Insert Branches
INSERT INTO Branches (branch_name, city, address) VALUES 
('Main Branch', 'New York', '123 Wall St'),
('Sub Branch North', 'Boston', '456 Beacon St'),
('West Coast Hub', 'San Francisco', '789 Market St');

-- Insert Customers
INSERT INTO Customers (name, email, phone, address, dob) VALUES 
('Alice Johnson', 'alice@email.com', '555-0101', '10 Oak Lane', '1990-05-15'),
('Bob Smith', 'bob@email.com', '555-0102', '20 Pine St', '1985-11-20'),
('Charlie Brown', 'charlie@email.com', '555-0103', '30 Maple Ave', '1992-02-10');

-- Insert Accounts
INSERT INTO Accounts (customer_id, branch_id, account_type, balance, open_date) VALUES 
(1, 1, 'Savings', 5000.00, '2023-01-01'),
(1, 1, 'Current', 1200.00, '2023-06-15'),
(2, 2, 'Savings', 3500.00, '2023-03-20'),
(3, 3, 'Savings', 750.00, '2024-01-10');

-- Insert Employees
INSERT INTO Employees (branch_id, emp_name, position, salary, hire_date) VALUES 
(1, 'John Doe', 'Manager', 85000.00, '2020-01-01'),
(2, 'Jane Smith', 'Teller', 45000.00, '2021-05-15'),
(3, 'Mike Ross', 'Assistant Manager', 60000.00, '2022-09-10');

-- Insert Sample Transactions
INSERT INTO Transactions (from_account_id, to_account_id, amount, type, description) VALUES 
(NULL, 1, 5000.00, 'Deposit', 'Initial Deposit'),
(1, 3, 500.00, 'Transfer', 'Monthly Rent'),
(3, NULL, 50.00, 'Withdrawal', 'ATM Cash Withdrawal');
