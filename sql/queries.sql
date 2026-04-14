USE BankingMS;

-- 1. Basic SELECT queries
-- Get all customers
SELECT * FROM Customers;

-- Get all active accounts
SELECT * FROM Accounts WHERE status = 'Active';


-- 2. JOIN queries (at least 3)
-- Join Customers and Accounts to see who owns what
SELECT C.name, A.account_type, A.balance 
FROM Customers C
JOIN Accounts A ON C.customer_id = A.customer_id;

-- Join Employees and Branches to see where staff works
SELECT E.emp_name, E.position, B.branch_name, B.city
FROM Employees E
JOIN Branches B ON E.branch_id = B.branch_id;

-- Join Transactions with Accounts to see from/to details
SELECT T.transaction_id, T.amount, T.type, A1.account_id AS from_acc, A2.account_id AS to_acc
FROM Transactions T
LEFT JOIN Accounts A1 ON T.from_account_id = A1.account_id
LEFT JOIN Accounts A2 ON T.to_account_id = A2.account_id;


-- 3. Aggregate queries (SUM, COUNT, AVG)
-- Total balance in the bank
SELECT SUM(balance) AS total_bank_deposits FROM Accounts;

-- Count of accounts per branch
SELECT branch_id, COUNT(*) AS account_count FROM Accounts GROUP BY branch_id;

-- Average salary of employees
SELECT AVG(salary) AS average_salary FROM Employees;


-- 4. Complex queries (nested queries)
-- Customers who have a balance higher than the average balance of all accounts
SELECT name, email FROM Customers 
WHERE customer_id IN (
    SELECT customer_id FROM Accounts WHERE balance > (SELECT AVG(balance) FROM Accounts)
);

-- Find branches that have more than 5 accounts (using subquery)
SELECT branch_name FROM Branches 
WHERE branch_id IN (
    SELECT branch_id FROM Accounts GROUP BY branch_id HAVING COUNT(*) > 5
);
