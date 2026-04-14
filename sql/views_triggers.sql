USE BankingMS;

-- 1. VIEWS

-- View to show a summary of all accounts with customer names
CREATE VIEW v_AccountSummary AS
SELECT 
    a.account_id,
    c.name AS customer_name,
    b.branch_name,
    a.account_type,
    a.balance,
    a.status
FROM Accounts a
JOIN Customers c ON a.customer_id = c.customer_id
JOIN Branches b ON a.branch_id = b.branch_id;

-- View to show transaction history with account details
CREATE VIEW v_TransactionHistory AS
SELECT 
    t.transaction_id,
    t.timestamp,
    t.type,
    t.amount,
    f.account_type AS from_acc_type,
    tc.name AS to_customer_name,
    t.description
FROM Transactions t
LEFT JOIN Accounts f ON t.from_account_id = f.account_id
LEFT JOIN Accounts to_acc ON t.to_account_id = to_acc.account_id
LEFT JOIN Customers tc ON to_acc.customer_id = tc.customer_id;


-- 2. TRIGGERS

-- Trigger to prevent negative balance on withdrawals/transfers
DELIMITER //
CREATE TRIGGER trg_CheckBalanceBeforeTransaction
BEFORE INSERT ON Transactions
FOR EACH ROW
BEGIN
    DECLARE current_bal DECIMAL(15, 2);
    
    -- Only check for types that deduct money
    IF NEW.type IN ('Withdrawal', 'Transfer') THEN
        SELECT balance INTO current_bal FROM Accounts WHERE account_id = NEW.from_account_id;
        
        IF current_bal < NEW.amount THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance for this transaction.';
        END IF;
    END IF;
END //
DELIMITER ;

-- Trigger to automatically update Account Balance after a transaction
DELIMITER //
CREATE TRIGGER trg_UpdateBalanceAfterTransaction
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN
    -- Handle Withdrawal
    IF NEW.type = 'Withdrawal' THEN
        UPDATE Accounts SET balance = balance - NEW.amount WHERE account_id = NEW.from_account_id;
    
    -- Handle Deposit
    ELSEIF NEW.type = 'Deposit' THEN
        UPDATE Accounts SET balance = balance + NEW.amount WHERE account_id = NEW.to_account_id;
    
    -- Handle Transfer
    ELSEIF NEW.type = 'Transfer' THEN
        UPDATE Accounts SET balance = balance - NEW.amount WHERE account_id = NEW.from_account_id;
        UPDATE Accounts SET balance = balance + NEW.amount WHERE account_id = NEW.to_account_id;
    END IF;
END //
DELIMITER ;
