# Database Migration Setup Guide

This application now uses Sequelize migrations for all database operations. This ensures consistent database schema across all environments and provides version control for database changes.

## Migration Files Created

### Core Tables (in order of creation):
1. **20250101000000-create-users.js** - Users table
2. **20250101000000-create-departments.js** - Departments table  
3. **20250101000001-create-permissions.js** - Permissions table
4. **20250101000002-create-basic-employee-data.js** - Employee data table
5. **20250101000003-add-department-foreign-key.js** - Foreign key constraints

### Feature Tables:
6. **20250101000000-create-asset-tables.js** - Asset management tables
7. **20250101000001-create-requisition-tables.js** - Purchase requisition tables
8. **20250101000002-create-payroll-tables.js** - Payroll management tables

## How to Use Migrations

### Initial Setup
```bash
# Run all migrations to create database tables
npm run migrate

# If you need to undo all migrations
npm run migrate:undo
```

### Development Workflow
```bash
# Create a new migration
npx sequelize-cli migration:generate --name migration-name

# Run pending migrations
npm run migrate

# Undo last migration
npm run migrate:undo
```

### Production Deployment
```bash
# Always run migrations before starting the application
npm run migrate
npm start
```

## Migration Commands

| Command | Description |
|---------|-------------|
| `npm run migrate` | Run all pending migrations |
| `npm run migrate:undo` | Undo the last migration |
| `npm run migrate:undo:all` | Undo all migrations |
| `npm run seed` | Run all seeders |
| `npm run seed:undo` | Undo all seeders |

## Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed)
- `first_name`
- `last_name`
- `role` (ENUM: user, admin, finance_manager, hr_manager, department_head)
- `is_active`
- `last_login`
- `department_id` (Foreign Key to departments)
- `created_at`
- `updated_at`

### Departments Table
- `id` (Primary Key)
- `department_name` (Unique)
- `description`
- `manager_id` (Foreign Key to users)
- `is_active`
- `created_at`
- `updated_at`

### Permissions Table
- `id` (Primary Key)
- `name`
- `module`
- `action` (ENUM: create, read, update, delete)
- `description`
- `created_at`
- `updated_at`

### Basic Employee Data Table
- `id` (Primary Key)
- `user_id` (Foreign Key to users, Unique)
- `employee_id` (Unique)
- `basic_salary`
- `position`
- `hire_date`
- `employment_type` (ENUM: full_time, part_time, contract, temporary)
- `tax_id`
- `bank_account`
- `bank_name`
- `is_active`
- `created_at`
- `updated_at`

## Important Notes

1. **Migration Order**: Migrations run in alphabetical order by filename. Ensure proper ordering with timestamps.

2. **Foreign Keys**: Foreign key constraints are added in separate migrations to avoid dependency issues.

3. **Data Consistency**: Always backup your database before running migrations in production.

4. **Model Updates**: When creating new migrations, ensure the corresponding models are updated to match the schema.

5. **Environment Variables**: Make sure your database credentials are properly set in environment variables.

## Troubleshooting

### Common Issues:

1. **Migration Already Applied**: If a migration shows as already applied but the table doesn't exist, check the `SequelizeMeta` table.

2. **Foreign Key Errors**: Ensure referenced tables exist before adding foreign key constraints.

3. **Column Type Mismatch**: If you get column type errors, you may need to create a new migration to modify the column.

### Reset Database (Development Only):
```bash
# Drop all tables and recreate
npm run migrate:undo:all
npm run migrate
npm run seed
```

## Best Practices

1. **Always test migrations** in a development environment first
2. **Use descriptive migration names** that explain what the migration does
3. **Keep migrations small and focused** on a single change
4. **Never modify existing migrations** that have been applied to production
5. **Always include both `up` and `down` methods** in migrations
6. **Use transactions** for complex migrations that modify multiple tables 