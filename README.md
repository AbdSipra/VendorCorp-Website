# VendorCorp Website

VendorCorp Website is an academic full-stack database systems project for managing vendors, users, purchase orders, contracts, budgets, compliance records, and notifications.

The project combines a MySQL database schema, an Express.js backend, and multiple role-based dashboard pages for different users in the procurement workflow.

## Core Modules

- User registration and login
- Vendor onboarding
- Role-based dashboard routing
- Purchase order tracking
- Contract management
- Budget monitoring
- Compliance audit records
- Notifications and task handling

## Roles Covered

- Vendor
- Vendor Team
- Procurement Manager
- Contract Team
- Department Head
- Finance Team

## Tech Stack

- Node.js
- Express.js
- MySQL
- HTML/CSS/JavaScript

## Main Files

- `user_reg.js` - primary backend application
- `sql_script.sql` - database schema and seed data
- dashboard HTML files - role-based frontends
- `package.json` - project dependencies

## Setup

```bash
npm install
node user_reg.js
```

Then open:

```text
http://localhost:8080
```

## Database Setup

1. Create the database using `sql_script.sql`
2. Update the MySQL connection settings in `user_reg.js`
3. Make sure the database name and credentials match your local environment

## Notes

- `user_reg.js` appears to be the main runnable backend file in this repository
- Some files in the repo are alternate or earlier versions of the project flow
- This is an academic prototype and is not production-hardened for security, sessions, or deployment
