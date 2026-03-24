//user_reg.js
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const port = 8080;

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(__dirname));

// Routes to serve static HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "welcome.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "user_login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "user_reg.html"));
});

app.get("/vendor-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "vendor-dashboard.html"));
});

app.get("/vendor-team-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "vendor-team-dashboard.html"));
});

app.get("/procurement-manager-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "procurement-manager-dashboard.html"));
});

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "vendorcorp",
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to the database.");
});

// Route to register a new user
app.post("/register", (req, res) => {
  const {
    Name,
    Email,
    Password,
    Role,
    VendorName,
    ServiceCategory,
    ContactEmail,
    ContactPhone,
    Address,
    ComplianceCertifications,
    PerformanceRating,
  } = req.body;

  // Validate required fields
  if (!Name || !Email || !Password || !Role) {
    res.status(400).send("All fields are required.");
    return;
  }

  // Check if the role is Vendor and additional fields are provided
  if (
    Role === "Vendor" &&
    (!VendorName || !ContactEmail || !ContactPhone || !Address)
  ) {
    res.status(400).send("Vendor-specific fields are incomplete.");
    return;
  }

  // Insert user into the User table
  const userSql = `
    INSERT INTO User (Name, Email, PasswordHash, Role)
    VALUES (?, ?, ?, ?)
  `;

  db.query(userSql, [Name, Email, Password, Role], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        res.status(400).send("Email already exists.");
      } else {
        console.error("Error registering user:", err.message);
        res.status(500).send("Failed to register user.");
      }
      return;
    }

    // If the role is Vendor, insert vendor details into the Vendor table
    if (Role === "Vendor") {
      const vendorSql = `
        INSERT INTO Vendor (
          VendorName,
          ServiceCategory,
          ContactEmail,
          ContactPhone,
          Address,
          ComplianceCertifications,
          PerformanceRating,
          RegistrationDate,
          IsActive
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)
      `;

      db.query(
        vendorSql,
        [
          VendorName,
          ServiceCategory,
          ContactEmail,
          ContactPhone,
          Address,
          ComplianceCertifications,
          PerformanceRating,
        ],
        (err) => {
          if (err) {
            console.error("Error registering vendor:", err.message);
            res.status(500).send("Failed to register vendor.");
          } else {
            res.send("User and Vendor registered successfully!");
          }
        }
      );
    } else {
      res.send("User registered successfully!");
    }
  });
});

// Route to log in an existing user
app.post("/login", (req, res) => {
  const { Email, Password } = req.body;

  // Validate input
  if (!Email || !Password) {
    res.status(400).send("All fields are required.");
    return;
  }

  // Query to fetch user details
  const sql = "SELECT * FROM User WHERE Email = ?";
  db.query(sql, [Email], (err, results) => {
    if (err) {
      console.error("Error logging in:", err.message);
      return res.status(500).send("Error logging in.");
    }

    if (results.length === 0) {
      return res.status(401).send("Invalid email or password.");
    }

    const user = results[0];

    // Check if the password matches
    if (user.PasswordHash === Password) {
      // Update last login timestamp
      const updateLoginSql =
        "UPDATE User SET LastLogin = NOW() WHERE UserID = ?";
      db.query(updateLoginSql, [user.UserID], (updateErr) => {
        if (updateErr) {
          console.error("Error updating last login:", updateErr.message);
        }
      });

      // Redirect to the appropriate dashboard based on role
      switch (user.Role) {
        case "Vendor":
          res.redirect("/vendor-dashboard");
          break;
        case "Vendor Team":
          res.redirect("/vendor-team-dashboard");
          break;
        case "Procurement Manager":
          res.redirect("/procurement-manager-dashboard");
          break;
        case "Contract Team":
          res.redirect("/contract-dashboard.html");
          break;
        case "Department Head":
          res.redirect("/department-head-dashboard.html");
          break;
        case "Finance Team":
          res.redirect("/finance-dashboard.html");
          break;
        default:
          res.status(400).send("Role not recognized.");
      }
    } else {
      res.status(401).send("Invalid email or password.");
    }
  });
});

// --------PROCUREMENT MANAGER DASHBOARD ------------
// Fetch Active Vendors
app.get("/procurement/vendors", (req, res) => {
  const sql = `
    SELECT VendorID, VendorName, ServiceCategory, ContactEmail, ContactPhone, Address, 
           ComplianceCertifications, PerformanceRating, RegistrationDate, IsActive
    FROM Vendor
    WHERE IsActive = TRUE
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching vendors:", err.message);
      return res.status(500).json({ error: "Failed to fetch vendors." });
    }
    res.status(200).json(results);
  });
});

// Add New Vendor
app.post("/procurement/vendors/add", (req, res) => {
  const {
    VendorName,
    ServiceCategory,
    ContactEmail,
    ContactPhone,
    Address,
    ComplianceCertifications = null,
    PerformanceRating = 0,
    Password,
  } = req.body;

  if (!VendorName || !ServiceCategory || !ContactEmail || !ContactPhone || !Address || !Password) {
    return res.status(400).json({ error: "All fields are required for vendor registration." });
  }

  const Role = "Vendor";

  // Insert into User table
  const userSql = `
    INSERT INTO User (Name, Email, PasswordHash, Role, CreatedAt)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(userSql, [VendorName, ContactEmail, Password, Role], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Email already exists." });
      }
      console.error("Error registering user:", err.message);
      return res.status(500).json({ error: "Failed to register user." });
    }

    // Insert into Vendor table
    const vendorSql = `
      INSERT INTO Vendor (
        VendorName, ServiceCategory, ContactEmail, ContactPhone, Address, 
        ComplianceCertifications, PerformanceRating, RegistrationDate, IsActive
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)
    `;

    db.query(
      vendorSql,
      [VendorName, ServiceCategory, ContactEmail, ContactPhone, Address, ComplianceCertifications, PerformanceRating],
      (err) => {
        if (err) {
          console.error("Error registering vendor:", err.message);
          return res.status(500).json({ error: "Failed to register vendor." });
        }
        res.status(201).json({ message: "User and Vendor registered successfully!" });
      }
    );
  });
});

// Fetch Purchase Orders// Fetch Purchase Orders
app.get("/procurement/purchase-orders", (req, res) => {
  const sql = `
    SELECT 
      POID AS ID, 
      VendorID, 
      CreatedBy, 
      DepartmentID, 
      ItemDetails, 
      TotalCost, 
      OrderStatus AS Status, 
      BudgetApproved, 
      CreatedAt, 
      UpdatedAt
    FROM PurchaseOrder
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching purchase orders:", err.message);
      return res.status(500).json({ error: "Failed to fetch purchase orders." });
    }
    res.status(200).json(results);
  });
});



// Update Purchase Order Status
app.post("/procurement/purchase-orders/status", (req, res) => {
  const { POID, OrderStatus } = req.body;

  if (!["Approved", "Rejected"].includes(OrderStatus)) {
    return res.status(400).json({ error: "Invalid status provided." });
  }

  const sql = `
    UPDATE PurchaseOrder 
    SET OrderStatus = ?
    WHERE POID = ?
  `;

  db.query(sql, [OrderStatus, POID], (err, result) => {
    if (err) {
      console.error("Error updating PO status:", err.message);
      return res.status(500).json({ error: "Failed to update PO status." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Purchase Order not found." });
    }
    res.status(200).json({ message: "PO status updated successfully." });
  });
});

// Fetch Active Contracts
app.get("/procurement/contracts", (req, res) => {
  const sql = `
    SELECT ContractID, VendorID, CreatedBy, DepartmentID, StartDate, EndDate, TermsAndConditions, 
           SpecialClauses, RenewalDate, IsActive, ArchivedDate, CreatedAt
    FROM Contract
    WHERE IsActive = TRUE
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching contracts:", err.message);
      return res.status(500).json({ error: "Failed to fetch contracts." });
    }
    res.status(200).json(results);
  });
});

// Add New Contract
app.post("/procurement/contracts/new", (req, res) => {
  const {
    VendorID,
    CreatedBy,
    DepartmentID,
    StartDate,
    EndDate,
    TermsAndConditions,
    SpecialClauses = null,
    RenewalDate = null,
  } = req.body;

  if (!VendorID || !CreatedBy || !DepartmentID || !StartDate || !EndDate || !TermsAndConditions) {
    return res.status(400).json({ error: "Missing required fields for creating a contract." });
  }

  const sql = `
    INSERT INTO Contract (
      VendorID, CreatedBy, DepartmentID, StartDate, EndDate, TermsAndConditions, 
      SpecialClauses, RenewalDate, IsActive, CreatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW())
  `;

  db.query(
    sql,
    [VendorID, CreatedBy, DepartmentID, StartDate, EndDate, TermsAndConditions, SpecialClauses, RenewalDate],
    (err) => {
      if (err) {
        console.error("Error initiating contract:", err.message);
        return res.status(500).json({ error: "Failed to initiate contract." });
      }
      res.status(201).json({ message: "Contract initiated successfully." });
    }
  );
});



// --------------- CONTRACT DASHBOARD -----------------
 
// Fetch Vendor Contracts
// Fetch All Contracts
// Fetch All Contracts
app.get("/contract/contracts", (req, res) => {
  const sql = `
    SELECT ContractID, VendorID, CreatedBy, DepartmentID, StartDate, EndDate, TermsAndConditions, 
           SpecialClauses, RenewalDate, IsActive, ArchivedDate, CreatedAt 
    FROM Contract
    WHERE IsActive = TRUE
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching all contracts:", err.message);
      return res.status(500).json({ error: "Failed to fetch all contracts." });
    }
    res.status(200).json(results); // Return all active contracts
  });
});

app.put("/contract/edit/:contractId", (req, res) => {
  const { contractId } = req.params;
  const { StartDate, EndDate, TermsAndConditions, SpecialClauses } = req.body;

  if (!StartDate || !EndDate) {
    return res.status(400).json({ error: "Start date and end date are required." });
  }

  const sql = `
    UPDATE Contract
    SET StartDate = ?, EndDate = ?, TermsAndConditions = ?, SpecialClauses = ?
    WHERE ContractID = ?
  `;

  db.query(
    sql,
    [StartDate, EndDate, TermsAndConditions, SpecialClauses, contractId],
    (err, result) => {
      if (err) {
        console.error("Error updating contract:", err.message);
        return res.status(500).json({ error: "Failed to update contract." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Contract not found." });
      }
      res.status(200).json({ message: "Contract updated successfully." });
    }
  );
});




// Fetch Compliance Data
app.get("/contract/compliance", (req, res) => {
  const sql = `
    SELECT ContractID, VendorID, RenewalDate, IsActive, ArchivedDate 
    FROM Contract
    WHERE IsActive = TRUE
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching compliance data:", err.message);
      return res.status(500).json({ error: "Failed to fetch compliance data." });
    }
    res.status(200).json(results);
  });
});

// Add New Contract
app.post("/vendor/contracts", (req, res) => {
  const {
    VendorID,
    CreatedBy,
    DepartmentID,
    StartDate,
    EndDate,
    TermsAndConditions,
    SpecialClauses,
    RenewalDate,
  } = req.body;

  if (!VendorID || !CreatedBy || !DepartmentID || !StartDate || !EndDate) {
    return res.status(400).json({ error: "Missing required fields for creating a contract." });
  }

  const sql = `
    INSERT INTO Contract (VendorID, CreatedBy, DepartmentID, StartDate, EndDate, TermsAndConditions, 
                          SpecialClauses, RenewalDate, IsActive, CreatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW())
  `;

  db.query(
    sql,
    [VendorID, CreatedBy, DepartmentID, StartDate, EndDate, TermsAndConditions, SpecialClauses, RenewalDate],
    (err) => {
      if (err) {
        console.error("Error adding contract:", err.message);
        return res.status(500).json({ error: "Failed to add contract." });
      }
      res.status(201).json({ message: "Contract added successfully." });
    }
  );
});

// Edit Contract
app.put("/contract/edit/:contractId", (req, res) => {
  const { contractId } = req.params;
  const { StartDate, EndDate, TermsAndConditions, SpecialClauses } = req.body;

  if (!StartDate || !EndDate) {
    return res.status(400).json({ error: "Start date and end date are required for updating a contract." });
  }

  const sql = `
    UPDATE Contract
    SET StartDate = ?, EndDate = ?, TermsAndConditions = ?, SpecialClauses = ?
    WHERE ContractID = ?
  `;

  db.query(sql, [StartDate, EndDate, TermsAndConditions, SpecialClauses, contractId], (err, result) => {
    if (err) {
      console.error("Error updating contract:", err.message);
      return res.status(500).json({ error: "Failed to update contract." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Contract not found." });
    }
    res.status(200).json({ message: "Contract updated successfully." });
  });
});

// Fetch Compliance Data
app.get("/contract/compliance", (req, res) => {
  const sql = `
    SELECT ContractID, VendorID, RenewalDate, IsActive, ArchivedDate
    FROM Contract
    WHERE IsActive = TRUE
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching compliance data:", err.message);
      return res.status(500).json({ error: "Failed to fetch compliance data." });
    }
    res.status(200).json(results);
  });
});




// ------------ FINANCE TEAM DASHBOARD -----------------

// Finance Team - Fetch Budgets
app.get("/finance-team/budgets", (req, res) => {
  const sql = "SELECT * FROM Budget";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching budgets:", err.message);
      return res.status(500).send("Failed to fetch budgets.");
    }
    res.json(results);
  });
});

// Finance Team - Fetch Approved Purchase Orders
app.get("/finance-team/approved-purchase-orders", (req, res) => {
  const sql = "SELECT * FROM PurchaseOrder WHERE OrderStatus = 'Approved'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching approved POs:", err.message);
      return res.status(500).send("Failed to fetch approved purchase orders.");
    }
    res.json(results);
  });
});

// Finance Team - Mark Purchase Order as Fulfilled
app.put("/finance-team/purchase-orders/mark-fulfilled/:poID", (req, res) => {
  const { poID } = req.params;

  const sql = `
    UPDATE PurchaseOrder
    SET OrderStatus = 'Fulfilled'
    WHERE POID = ?
  `;
  db.query(sql, [poID], (err, results) => {
    if (err) {
      console.error("Error updating purchase order status:", err.message);
      return res.status(500).send("Failed to update purchase order status.");
    } else if (results.affectedRows === 0) {
      res.status(404).send("Purchase order not found.");
    } else {
      res.json({ message: "Purchase order marked as fulfilled." });
    }
  });
});

// Finance Team - Update Budget
app.put("/finance-team/budgets/:budgetID", (req, res) => {
  const { budgetID } = req.params;
  const { AllocatedAmount, SpentAmount } = req.body;

  const sql = `
    UPDATE Budget
    SET AllocatedAmount = ?, SpentAmount = ?
    WHERE BudgetID = ?
  `;
  db.query(sql, [AllocatedAmount, SpentAmount, budgetID], (err, results) => {
    if (err) {
      console.error("Error updating budget:", err.message);
      return res.status(500).send("Failed to update budget.");
    } else if (results.affectedRows === 0) {
      res.status(404).send("Budget not found.");
    } else {
      res.json({ message: "Budget updated successfully!" });
    }
  });
});

// ------------ DEPT HEAD Dashboard ------------------

// Budget Overview - Get All Budget Details for Department
app.get("/dept-head/budget", (req, res) => {
  const { DepartmentID } = req.query;

  if (!DepartmentID) {
    return res.status(400).json({ error: "DepartmentID is required." });
  }

  const sql = `
    SELECT BudgetID, DepartmentID, AllocatedAmount, SpentAmount, AllocatedAmount - SpentAmount AS RemainingAmount, UpdatedBy, LastUpdated
    FROM Budget
    WHERE DepartmentID = ?`;

  db.query(sql, [DepartmentID], (err, results) => {
    if (err) {
      console.error("Error fetching budget details:", err.message);
      res.status(500).json({ error: "Failed to fetch budget details." });
    } else {
      res.status(200).json(results); // Return all rows
    }
  });
});

// Submit Budget Change Request
app.post("/dept-head/budget/request-change", (req, res) => {
  const { DepartmentID, RequestedAmount, UserID } = req.body;

  if (!DepartmentID || !RequestedAmount || !UserID) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const sql = `
    INSERT INTO Notifications (RecipientID, NotificationType, Message)
    VALUES (?, 'Budget Alert', ?)`;

  const message = `Department ID ${DepartmentID} requested an additional budget of $${RequestedAmount}.`;

  db.query(sql, [UserID, message], (err) => {
    if (err) {
      console.error("Error submitting budget change request:", err.message);
      res.status(500).json({ error: "Failed to submit budget change request." });
    } else {
      res.status(201).json({ message: "Budget change request submitted successfully." });
    }
  });
});

// Purchase Orders - Get All POs for Department
app.get("/dept-head/purchase-orders", (req, res) => {
  const { DepartmentID } = req.query;

  if (!DepartmentID) {
    return res.status(400).json({ error: "DepartmentID is required." });
  }

  const sql = `
    SELECT POID, VendorID, CreatedBy, DepartmentID, ItemDetails, TotalCost, OrderStatus, BudgetApproved, CreatedAt, UpdatedAt
    FROM PurchaseOrder
    WHERE DepartmentID = ?`;

  db.query(sql, [DepartmentID], (err, results) => {
    if (err) {
      console.error("Error fetching purchase orders:", err.message);
      res.status(500).json({ error: "Failed to fetch purchase orders." });
    } else {
      res.status(200).json(results); // Return all rows
    }
  });
});

// Approve/Reject Purchase Order
app.post("/dept-head/purchase-orders/decision", (req, res) => {
  const { POID, Decision } = req.body;

  if (!POID || !Decision || !["Approved", "Rejected"].includes(Decision)) {
    return res.status(400).json({ error: "Invalid POID or Decision." });
  }

  const sql = `
    UPDATE PurchaseOrder
    SET OrderStatus = ?
    WHERE POID = ?`;

  db.query(sql, [Decision, POID], (err, result) => {
    if (err) {
      console.error("Error updating purchase order status:", err.message);
      res.status(500).json({ error: "Failed to update purchase order status." });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: "Purchase order not found." });
    } else {
      res.status(200).json({ message: `Purchase order ${Decision.toLowerCase()} successfully.` });
    }
  });
});

// Task Management - Get All Tasks for Department
app.get("/dept-head/tasks", (req, res) => {
  const { DepartmentID } = req.query;

  if (!DepartmentID) {
    return res.status(400).json({ error: "DepartmentID is required." });
  }

  const sql = `
    SELECT TaskID, AssignedTo, TaskDescription, Status, RelatedPOID, DueDate, CreatedAt
    FROM Task
    WHERE RelatedPOID IN (
      SELECT POID FROM PurchaseOrder WHERE DepartmentID = ?
    )`;

  db.query(sql, [DepartmentID], (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err.message);
      res.status(500).json({ error: "Failed to fetch tasks." });
    } else {
      res.status(200).json(results); // Return all rows
    }
  });
});

// Update Task Status
app.post("/dept-head/tasks/update", (req, res) => {
  const { TaskID, Status } = req.body;

  if (!TaskID || !Status || !["Pending", "In Progress", "Completed"].includes(Status)) {
    return res.status(400).json({ error: "Invalid TaskID or Status." });
  }

  const sql = `
    UPDATE Task
    SET Status = ?
    WHERE TaskID = ?`;

  db.query(sql, [Status, TaskID], (err, result) => {
    if (err) {
      console.error("Error updating task status:", err.message);
      res.status(500).json({ error: "Failed to update task status." });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: "Task not found." });
    } else {
      res.status(200).json({ message: "Task status updated successfully." });
    }
  });
});

// Reports - Vendor Performance Only
app.get("/dept-head/reports", (req, res) => {
  const { DepartmentID } = req.query;

  if (!DepartmentID) {
    return res.status(400).json({ error: "DepartmentID is required." });
  }

  const sql = `
    SELECT v.VendorName, vp.DeliveryTimelinessScore, vp.ServiceQualityScore, vp.ComplianceScore
    FROM VendorPerformance vp
    JOIN Vendor v ON vp.VendorID = v.VendorID
    WHERE v.VendorID IN (
      SELECT VendorID FROM PurchaseOrder WHERE DepartmentID = ?
    )`;

  db.query(sql, [DepartmentID], (err, results) => {
    if (err) {
      console.error("Error generating report:", err.message);
      res.status(500).json({ error: "Failed to generate report." });
    } else {
      res.status(200).json(results); // Return all rows
    }
  });
});

// --------- VENDOR TEAM DASHBOARD -------------
;



// Routes

// Fetch Vendors
app.get("/vendor-team/vendors", (req, res) => {
  const sql = "SELECT * FROM Vendor WHERE IsActive = TRUE";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching vendors:", err.message);
      return res.status(500).json({ error: "Failed to fetch vendors." });
    }
    res.status(200).json(results);
  });
});

// Update Vendor Information
app.post("/vendor-team/vendors/update", (req, res) => {
  const {
    VendorID,
    VendorName,
    ServiceCategory,
    ContactEmail,
    ContactPhone,
    Address,
    ComplianceCertifications,
    PerformanceRating,
  } = req.body;

  if (!VendorID) {
    return res.status(400).json({ error: "VendorID is required to update the vendor." });
  }

  let parsedCertifications;
  if (ComplianceCertifications) {
    try {
      parsedCertifications = JSON.stringify(JSON.parse(ComplianceCertifications));
    } catch {
      return res.status(400).json({ error: "Invalid JSON format for ComplianceCertifications." });
    }
  }

  const sql = `
    UPDATE Vendor
    SET 
      VendorName = COALESCE(?, VendorName),
      ServiceCategory = COALESCE(?, ServiceCategory),
      ContactEmail = COALESCE(?, ContactEmail),
      ContactPhone = COALESCE(?, ContactPhone),
      Address = COALESCE(?, Address),
      ComplianceCertifications = COALESCE(?, ComplianceCertifications),
      PerformanceRating = COALESCE(?, PerformanceRating)
    WHERE VendorID = ?
  `;

  db.query(
    sql,
    [
      VendorName,
      ServiceCategory,
      ContactEmail,
      ContactPhone,
      Address,
      parsedCertifications,
      PerformanceRating,
      VendorID,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating vendor:", err.message);
        return res.status(500).json({ error: "Failed to update vendor." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Vendor not found." });
      }

      res.status(200).json({ message: "Vendor updated successfully." });
    }
  );
});

// Fetch Purchase Orders
app.get("/vendor-team/purchase-orders", (req, res) => {
  const sql = "SELECT * FROM PurchaseOrder";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching purchase orders:", err.message);
      return res.status(500).json({ error: "Failed to fetch purchase orders." });
    }
    res.status(200).json(results);
  });
});

// Update Purchase Order Status
app.post("/vendor-team/purchase-orders/status", (req, res) => {
  const { POID, Status } = req.body;

  if (!POID || !["Pending", "Approved", "Fulfilled"].includes(Status)) {
    return res.status(400).json({ error: "Invalid POID or Status." });
  }

  const sql = "UPDATE PurchaseOrder SET OrderStatus = ? WHERE POID = ?";

  db.query(sql, [Status, POID], (err, result) => {
    if (err) {
      console.error("Error updating PO status:", err.message);
      return res.status(500).json({ error: "Failed to update PO status." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Purchase order not found." });
    }
    res.status(200).json({ message: `Purchase order status updated to ${Status}.` });
  });
});

// Fetch Contracts
app.get("/vendor-team/contracts", (req, res) => {
  const sql = "SELECT * FROM Contract WHERE IsActive = TRUE";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching contracts:", err.message);
      return res.status(500).json({ error: "Failed to fetch contracts." });
    }
    res.status(200).json(results);
  });
});

// Upload Compliance Certificates
app.post("/vendor-team/compliance/upload", (req, res) => {
  const { VendorID, ComplianceCertificates } = req.body;

  if (!VendorID || !ComplianceCertificates) {
    return res.status(400).json({ error: "VendorID and ComplianceCertificates are required." });
  }

  let parsedCertifications;
  try {
    parsedCertifications = JSON.stringify(JSON.parse(ComplianceCertificates));
  } catch {
    return res.status(400).json({ error: "Invalid JSON format for ComplianceCertificates." });
  }

  const sql = `
    UPDATE Vendor
    SET ComplianceCertifications = ?
    WHERE VendorID = ?
  `;

  db.query(sql, [parsedCertifications, VendorID], (err, result) => {
    if (err) {
      console.error("Error uploading compliance certificates:", err.message);
      return res.status(500).json({ error: "Failed to upload compliance certificates." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vendor not found." });
    }
    res.status(200).json({ message: "Compliance certificates uploaded successfully." });
  });
});

// Fetch Performance Scores
app.get("/vendor-team/performance", (req, res) => {
  const sql = "SELECT * FROM VendorPerformance";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching performance scores:", err.message);
      return res.status(500).json({ error: "Failed to fetch performance scores." });
    }
    res.status(200).json(results);
  });
});

// Fetch Notifications
app.get("/vendor-team/notifications", (req, res) => {
  const sql = "SELECT * FROM Notifications";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err.message);
      return res.status(500).json({ error: "Failed to fetch notifications." });
    }
    res.status(200).json(results);
  });
});


// ---------- VENDOR DASHBOARD ------
// Get Active Contracts for a Vendor
app.get("/vendor/contracts", (req, res) => {
  const { VendorID } = req.query;

  if (!VendorID) {
    return res.status(400).json({ error: "VendorID is required." });
  }

  const sql = `
    SELECT ContractID, DepartmentID, StartDate, EndDate, TermsAndConditions, SpecialClauses, RenewalDate
    FROM Contract
    WHERE VendorID = ? AND IsActive = TRUE
  `;

  db.query(sql, [VendorID], (err, results) => {
    if (err) {
      console.error("Error fetching contracts:", err.message);
      return res.status(500).json({ error: "Failed to fetch contracts." });
    }
    res.status(200).json(results);
  });
});

// Upload Compliance Certificates
app.post("/vendor/compliance/upload", (req, res) => {
  const { VendorID, ComplianceCertificates } = req.body;

  if (!VendorID || !ComplianceCertificates) {
    return res.status(400).json({ error: "VendorID and ComplianceCertificates are required." });
  }

  const sql = `
    UPDATE Vendor
    SET ComplianceCertifications = ?
    WHERE VendorID = ?
  `;

  db.query(sql, [JSON.stringify(ComplianceCertificates), VendorID], (err, result) => {
    if (err) {
      console.error("Error uploading compliance certificates:", err.message);
      return res.status(500).json({ error: "Failed to upload compliance certificates." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vendor not found." });
    }
    res.status(200).json({ message: "Compliance certificates uploaded successfully." });
  });
});

// Get Vendor Performance
app.get("/vendor/performance", (req, res) => {
  const { VendorID } = req.query;

  if (!VendorID) {
    return res.status(400).json({ error: "VendorID is required." });
  }

  const sql = `
    SELECT DeliveryTimelinessScore, ServiceQualityScore, ComplianceScore, EvaluationDate
    FROM VendorPerformance
    WHERE VendorID = ?
  `;

  db.query(sql, [VendorID], (err, results) => {
    if (err) {
      console.error("Error fetching performance data:", err.message);
      return res.status(500).json({ error: "Failed to fetch performance data." });
    }
    res.status(200).json(results);
  });
});

// Get Notifications for a Vendor
app.get("/vendor/notifications", (req, res) => {
  const { RecipientID } = req.query;

  if (!RecipientID) {
    return res.status(400).json({ error: "RecipientID is required." });
  }

  const sql = `
    SELECT NotificationType, Message, IsRead, CreatedAt
    FROM Notifications
    WHERE RecipientID = ?
  `;

  db.query(sql, [RecipientID], (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err.message);
      return res.status(500).json({ error: "Failed to fetch notifications." });
    }
    res.status(200).json(results);
  });
});

// Get Purchase Orders for a Vendor
app.get("/vendor/purchase-orders", (req, res) => {
  const { VendorID } = req.query;

  if (!VendorID) {
    return res.status(400).json({ error: "VendorID is required." });
  }

  const sql = `
    SELECT POID, ItemDetails, TotalCost, OrderStatus, CreatedAt
    FROM PurchaseOrder
    WHERE VendorID = ?
  `;

  db.query(sql, [VendorID], (err, results) => {
    if (err) {
      console.error("Error fetching purchase orders:", err.message);
      return res.status(500).json({ error: "Failed to fetch purchase orders." });
    }
    res.status(200).json(results);
  });
});

// Accept or Decline Purchase Order
// Accept or Decline Purchase Order
app.post("/vendor/purchase-orders/decision", (req, res) => {
  const { POID, Decision } = req.body;

  // Validation for required fields
  if (!POID || !["Accepted", "Declined"].includes(Decision)) {
    return res.status(400).json({ error: "Invalid POID or Decision." });
  }

  // SQL query to update the status
  const sql = `
    UPDATE PurchaseOrder
    SET OrderStatus = ?
    WHERE POID = ?
  `;

  db.query(sql, [Decision, POID], (err, result) => {
    if (err) {
      console.error("Error updating purchase order status:", err.message);
      return res.status(500).json({ error: "Failed to update purchase order status." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Purchase order not found." });
    }

    res.status(200).json({ message: `Purchase order ${Decision.toLowerCase()} successfully.` });
  });
});


// Update Purchase Order Fulfillment Status
app.post("/vendor/purchase-orders/status", (req, res) => {
  const { POID, Status } = req.body;

  if (!POID || !["Pending", "Fulfilled", "Delayed"].includes(Status)) {
    return res.status(400).json({ error: "Invalid POID or Status." });
  }

  const sql = `
    UPDATE PurchaseOrder
    SET OrderStatus = ?
    WHERE POID = ?
  `;

  db.query(sql, [Status, POID], (err, result) => {
    if (err) {
      console.error("Error updating order status:", err.message);
      return res.status(500).json({ error: "Failed to update order status." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Purchase order not found." });
    }
    res.status(200).json({ message: `Order status updated to ${Status}.` });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

