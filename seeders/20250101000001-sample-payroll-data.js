'use strict';

/**
 * Seeder: Sample Payroll Data
 * Creates sample departments, employee data, and salary components
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Insert sample departments
      const departments = await queryInterface.bulkInsert('departments', [
        {
          department_name: 'IT Department',
          description: 'Information Technology Department',
          manager_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          department_name: 'Finance Department',
          description: 'Finance and Accounting Department',
          manager_id: 2,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          department_name: 'Human Resources',
          description: 'Human Resources Department',
          manager_id: 3,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          department_name: 'Operations',
          description: 'Operations Department',
          manager_id: 4,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          department_name: 'Marketing',
          description: 'Marketing Department',
          manager_id: 5,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], { 
        returning: true,
        transaction 
      });

      // Update users with department assignments
      await queryInterface.bulkUpdate('users', [
        { department_id: 1, updated_at: new Date() }, // IT Department
        { department_id: 2, updated_at: new Date() }, // Finance Department
        { department_id: 3, updated_at: new Date() }, // HR Department
        { department_id: 4, updated_at: new Date() }, // Operations Department
        { department_id: 5, updated_at: new Date() }  // Marketing Department
      ], {
        id: [1, 2, 3, 4, 5]
      }, { transaction });

      // Insert sample basic employee data
      await queryInterface.bulkInsert('basic_employee_data', [
        {
          user_id: 1,
          employee_id: 'EMP001',
          basic_salary: 2500000.00,
          position: 'IT Manager',
          hire_date: '2023-01-15',
          employment_type: 'full_time',
          tax_id: 'TAX001',
          bank_account: '1234567890',
          bank_name: 'CRDB Bank',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 2,
          employee_id: 'EMP002',
          basic_salary: 2200000.00,
          position: 'Finance Manager',
          hire_date: '2023-02-01',
          employment_type: 'full_time',
          tax_id: 'TAX002',
          bank_account: '0987654321',
          bank_name: 'NMB Bank',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 3,
          employee_id: 'EMP003',
          basic_salary: 2000000.00,
          position: 'HR Manager',
          hire_date: '2023-03-10',
          employment_type: 'full_time',
          tax_id: 'TAX003',
          bank_account: '1122334455',
          bank_name: 'NBC Bank',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 4,
          employee_id: 'EMP004',
          basic_salary: 1800000.00,
          position: 'Operations Manager',
          hire_date: '2023-04-05',
          employment_type: 'full_time',
          tax_id: 'TAX004',
          bank_account: '5566778899',
          bank_name: 'CRDB Bank',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 5,
          employee_id: 'EMP005',
          basic_salary: 1900000.00,
          position: 'Marketing Manager',
          hire_date: '2023-05-20',
          employment_type: 'full_time',
          tax_id: 'TAX005',
          bank_account: '9988776655',
          bank_name: 'NMB Bank',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], { transaction });

      // Insert sample salary components
      await queryInterface.bulkInsert('salary_components', [
        // Housing Allowance for all employees
        {
          user_id: 1,
          name: 'Housing Allowance',
          type: 'allowance',
          amount: 400000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly housing allowance',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 2,
          name: 'Housing Allowance',
          type: 'allowance',
          amount: 400000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly housing allowance',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 3,
          name: 'Housing Allowance',
          type: 'allowance',
          amount: 400000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly housing allowance',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 4,
          name: 'Housing Allowance',
          type: 'allowance',
          amount: 400000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly housing allowance',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 5,
          name: 'Housing Allowance',
          type: 'allowance',
          amount: 400000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly housing allowance',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        // Transport Allowance
        {
          user_id: 1,
          name: 'Transport Allowance',
          type: 'allowance',
          amount: 50000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly transport allowance',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 2,
          name: 'Transport Allowance',
          type: 'allowance',
          amount: 50000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly transport allowance',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 3,
          name: 'Transport Allowance',
          type: 'allowance',
          amount: 50000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly transport allowance',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 4,
          name: 'Transport Allowance',
          type: 'allowance',
          amount: 50000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly transport allowance',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 5,
          name: 'Transport Allowance',
          type: 'allowance',
          amount: 50000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly transport allowance',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        // Lunch Allowance
        {
          user_id: 1,
          name: 'Lunch Allowance',
          type: 'allowance',
          amount: 110000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly lunch allowance (22 days x 5000)',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 2,
          name: 'Lunch Allowance',
          type: 'allowance',
          amount: 110000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly lunch allowance (22 days x 5000)',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 3,
          name: 'Lunch Allowance',
          type: 'allowance',
          amount: 110000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly lunch allowance (22 days x 5000)',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 4,
          name: 'Lunch Allowance',
          type: 'allowance',
          amount: 110000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly lunch allowance (22 days x 5000)',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 5,
          name: 'Lunch Allowance',
          type: 'allowance',
          amount: 110000.00,
          percentage: null,
          is_percentage: false,
          description: 'Monthly lunch allowance (22 days x 5000)',
          effective_date: '2024-01-01',
          end_date: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove sample data in reverse order
      await queryInterface.bulkDelete('salary_components', null, { transaction });
      await queryInterface.bulkDelete('basic_employee_data', null, { transaction });
      
      // Reset department assignments
      await queryInterface.bulkUpdate('users', [
        { department_id: null, updated_at: new Date() },
        { department_id: null, updated_at: new Date() },
        { department_id: null, updated_at: new Date() },
        { department_id: null, updated_at: new Date() },
        { department_id: null, updated_at: new Date() }
      ], {
        id: [1, 2, 3, 4, 5]
      }, { transaction });
      
      await queryInterface.bulkDelete('departments', null, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}; 