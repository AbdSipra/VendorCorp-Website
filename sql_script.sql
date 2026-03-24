create database vendorcorp;
use vendorcorp;


-- Vendor Table
CREATE TABLE IF NOT EXISTS Vendor (
  VendorID INT AUTO_INCREMENT PRIMARY KEY,
  VendorName VARCHAR(100) NOT NULL,
  ServiceCategory VARCHAR(100),
  ContactEmail VARCHAR(100),
  ContactPhone VARCHAR(15),
  Address TEXT,
  ComplianceCertifications JSON,
  PerformanceRating DECIMAL(3, 2) DEFAULT 0,
  RegistrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  IsActive BOOLEAN DEFAULT TRUE
);

INSERT INTO Vendor (VendorName, ServiceCategory, ContactEmail, ContactPhone, Address, ComplianceCertifications, PerformanceRating) VALUES
('Vendor A', 'IT Services', 'contact@vendora.com', '1234567890', '123 Street, City', '{"ISO": "9001"}', 4.5),
('Vendor B', 'Construction', 'contact@vendorb.com', '1234567891', '456 Avenue, City', '{"ISO": "14001"}', 3.8),
('Vendor C', 'Logistics', 'contact@vendorc.com', '1234567892', '789 Boulevard, City', '{"ISO": "27001"}', 4.0),
('Vendor D', 'Consulting', 'contact@vendord.com', '1234567893', '101 Road, City', '{"ISO": "20000"}', 4.2),
('Vendor E', 'Marketing', 'contact@vendore.com', '1234567894', '202 Lane, City', '{"ISO": "9001"}', 4.7);

-- User Table
CREATE TABLE IF NOT EXISTS User (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Email VARCHAR(100) UNIQUE NOT NULL,
  PasswordHash VARCHAR(255) NOT NULL,
  Role ENUM('Procurement Manager', 'Contract Team', 'Vendor Team', 'Department Head', 'Finance Team', 'Vendor') NOT NULL,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  LastLogin TIMESTAMP
);

INSERT INTO User (Name, Email, PasswordHash, Role) VALUES
('John Doe', 'johndoe@example.com', 'hashed_password1', 'Procurement Manager'),
('Jane Smith', 'janesmith@example.com', 'hashed_password2', 'Contract Team'),
('Alice Johnson', 'alicej@example.com', 'hashed_password3', 'Vendor Team'),
('Bob Brown', 'bobbrown@example.com', 'hashed_password4', 'Department Head'),
('Charlie Davis', 'charlied@example.com', 'hashed_password5', 'Finance Team');

-- Department Table
CREATE TABLE IF NOT EXISTS Department (
  DepartmentID INT AUTO_INCREMENT PRIMARY KEY,
  DepartmentName VARCHAR(100) NOT NULL,
  ManagerID INT,
  AllocatedBudget DECIMAL(10, 2),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ManagerID) REFERENCES User(UserID)
);

INSERT INTO Department (DepartmentName, ManagerID, AllocatedBudget) VALUES
('IT', 1, 50000.00),
('Construction', 2, 100000.00),
('Logistics', 3, 75000.00),
('Consulting', 4, 40000.00),
('Marketing', 5, 30000.00);

-- Contract Table
CREATE TABLE IF NOT EXISTS Contract (
  ContractID INT AUTO_INCREMENT PRIMARY KEY,
  VendorID INT,
  CreatedBy INT,
  DepartmentID INT,
  StartDate DATE,
  EndDate DATE,
  TermsAndConditions TEXT,
  SpecialClauses TEXT,
  RenewalDate DATE,
  IsActive BOOLEAN DEFAULT TRUE,
  ArchivedDate DATE,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID),
  FOREIGN KEY (CreatedBy) REFERENCES User(UserID),
  FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);

INSERT INTO Contract (VendorID, CreatedBy, DepartmentID, StartDate, EndDate, TermsAndConditions, SpecialClauses, RenewalDate) VALUES
(1, 1, 1, '2024-01-01', '2025-01-01', 'Standard contract terms', 'No special clauses', '2025-01-01'),
(2, 2, 2, '2024-02-01', '2025-02-01', 'Standard construction terms', 'Penalties for delays', '2025-02-01'),
(3, 3, 3, '2024-03-01', '2025-03-01', 'Logistics contract', 'Delivery must be within 7 days', '2025-03-01'),
(4, 4, 4, '2024-04-01', '2025-04-01', 'Consulting terms', 'Exclusive rights for consulting', '2025-04-01'),
(5, 5, 5, '2024-05-01', '2025-05-01', 'Marketing agreement', 'Quarterly reports required', '2025-05-01');

-- PurchaseOrder Table
CREATE TABLE IF NOT EXISTS PurchaseOrder (
  POID INT AUTO_INCREMENT PRIMARY KEY,
  VendorID INT,
  CreatedBy INT,
  DepartmentID INT,
  ItemDetails JSON,
  TotalCost DECIMAL(10, 2),
  OrderStatus ENUM('Pending', 'Approved', 'Fulfilled') DEFAULT 'Pending',
  BudgetApproved BOOLEAN DEFAULT FALSE,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID),
  FOREIGN KEY (CreatedBy) REFERENCES User(UserID),
  FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);

INSERT INTO PurchaseOrder (VendorID, CreatedBy, DepartmentID, ItemDetails, TotalCost) VALUES
(1, 1, 1, '{"Item": "Laptops", "Quantity": 10}', 5000.00),
(2, 2, 2, '{"Item": "Bricks", "Quantity": 1000}', 15000.00),
(3, 3, 3, '{"Item": "Trucks", "Quantity": 5}', 25000.00),
(4, 4, 4, '{"Item": "Consulting Hours", "Quantity": 100}', 20000.00),
(5, 5, 5, '{"Item": "Advertising", "Quantity": 1}', 10000.00);

-- Budget Table
CREATE TABLE IF NOT EXISTS Budget (
  BudgetID INT AUTO_INCREMENT PRIMARY KEY,
  DepartmentID INT,
  AllocatedAmount DECIMAL(10, 2),
  SpentAmount DECIMAL(10, 2),
  RemainingAmount DECIMAL(10, 2) AS (AllocatedAmount - SpentAmount),
  UpdatedBy INT,
  LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID),
  FOREIGN KEY (UpdatedBy) REFERENCES User(UserID)
);

INSERT INTO Budget (DepartmentID, AllocatedAmount, SpentAmount, UpdatedBy) VALUES
(1, 50000.00, 20000.00, 1),
(2, 100000.00, 40000.00, 2),
(3, 75000.00, 30000.00, 3),
(4, 40000.00, 10000.00, 4),
(5, 30000.00, 5000.00, 5);

-- VendorPerformance Table
CREATE TABLE IF NOT EXISTS VendorPerformance (
  PerformanceID INT AUTO_INCREMENT PRIMARY KEY,
  VendorID INT NOT NULL,
  EvaluatorID INT NOT NULL,
  DeliveryTimelinessScore DECIMAL(3, 1),
  ServiceQualityScore DECIMAL(3, 1),
  ComplianceScore DECIMAL(3, 1),
  EvaluationDate DATE,
  FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID),
  FOREIGN KEY (EvaluatorID) REFERENCES User(UserID)
);

INSERT INTO VendorPerformance (VendorID, EvaluatorID, DeliveryTimelinessScore, ServiceQualityScore, ComplianceScore, EvaluationDate) VALUES
(1, 1, 4.5, 4.7, 4.8, '2024-11-01'),
(2, 2, 3.8, 4.0, 3.9, '2024-11-02'),
(3, 3, 4.0, 4.1, 4.3, '2024-11-03'),
(4, 4, 4.2, 4.4, 4.5, '2024-11-04'),
(5, 5, 4.7, 4.8, 4.9, '2024-11-05');

-- Task Table
CREATE TABLE IF NOT EXISTS Task (
  TaskID INT AUTO_INCREMENT PRIMARY KEY,
  AssignedTo INT,
  TaskDescription TEXT,
  Status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
  RelatedPOID INT,
  DueDate DATE,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (AssignedTo) REFERENCES User(UserID),
  FOREIGN KEY (RelatedPOID) REFERENCES PurchaseOrder(POID)
);

INSERT INTO Task (AssignedTo, TaskDescription, RelatedPOID, DueDate) VALUES
(1, 'Approve PO for Laptops', 1, '2024-11-10'),
(2, 'Verify construction material order', 2, '2024-11-15'),
(3, 'Schedule truck deliveries', 3, '2024-11-20'),
(4, 'Review consulting agreement', 4, '2024-11-25'),
(5, 'Approve advertising campaign', 5, '2024-11-30');

-- Notifications Table
CREATE TABLE IF NOT EXISTS Notifications (
  NotificationID INT AUTO_INCREMENT PRIMARY KEY,
  RecipientID INT,
  NotificationType ENUM('Contract Renewal', 'Budget Alert', 'PO Update'),
  Message TEXT,
  IsRead BOOLEAN DEFAULT FALSE,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (RecipientID) REFERENCES User(UserID)
);

INSERT INTO Notifications (RecipientID, NotificationType, Message) VALUES
(1, 'Contract Renewal', 'Vendor A contract is up for renewal.'),
(2, 'Budget Alert', 'Your department budget has been updated.'),
(3, 'PO Update', 'PO for Logistics has been approved.'),
(4, 'Contract Renewal', 'Consulting contract renewal reminder.'),
(5, 'Budget Alert', 'Marketing department budget reduced.');

-- ComplianceAudit Table
CREATE TABLE IF NOT EXISTS ComplianceAudit (
  AuditID INT AUTO_INCREMENT PRIMARY KEY,
  VendorID INT,
  AuditorID INT,
  AuditDate DATE,
  AuditFindings TEXT,
  ComplianceStatus ENUM('Compliant', 'Non-Compliant'),
  Recommendations TEXT,
  FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID),
  FOREIGN KEY (AuditorID) REFERENCES User(UserID)
);

INSERT INTO ComplianceAudit (VendorID, AuditorID, AuditDate, AuditFindings, ComplianceStatus, Recommendations) VALUES
(1, 1, '2024-11-01', 'Compliant with all standards', 'Compliant', 'No action required'),
(2, 2, '2024-11-02', 'Minor delays in delivery', 'Non-Compliant', 'Improved delivery processes'),
(3, 3, '2024-11-03', 'Compliance with quality standards', 'Compliant', 'No action required'),
(4, 4, '2024-11-04', 'Non-compliance with reporting', 'Non-Compliant', 'Regular reports required'),
(5, 5, '2024-11-05', 'Compliant with all standards', 'Compliant', 'No action required');





SELECT * FROM Vendor;
SELECT * FROM User;
SELECT * FROM Department;
SELECT * FROM Contract;
SELECT * FROM PurchaseOrder;
SELECT * FROM Budget;
SELECT * FROM VendorPerformance;
SELECT * FROM Task;
SELECT * FROM Notifications;
SELECT * FROM ComplianceAudit;
 
