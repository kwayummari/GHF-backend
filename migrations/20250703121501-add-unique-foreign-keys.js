module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Appraisal Forms
    await queryInterface.addConstraint('appraisal_forms', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_appraisal_forms_user_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('appraisal_forms', {
      fields: ['objective_id'],
      type: 'foreign key',
      name: 'fk_appraisal_forms_objective_20250703',
      references: { table: 'objectives', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('appraisal_forms', {
      fields: ['peer_reviewer_id'],
      type: 'foreign key',
      name: 'fk_appraisal_forms_peer_reviewer_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('appraisal_forms', {
      fields: ['hr_reviewer_id'],
      type: 'foreign key',
      name: 'fk_appraisal_forms_hr_reviewer_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Budgets
    await queryInterface.addConstraint('budgets', {
      fields: ['quarter_id'],
      type: 'foreign key',
      name: 'fk_budgets_quarter_20250703',
      references: { table: 'quarters', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('budgets', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_budgets_department_20250703',
      references: { table: 'departments', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('budgets', {
      fields: ['responsible_person_id'],
      type: 'foreign key',
      name: 'fk_budgets_responsible_person_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('budgets', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_budgets_creator_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('budgets', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'fk_budgets_approver_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Budget Expenses
    await queryInterface.addConstraint('budget_expenses', {
      fields: ['budget_id'],
      type: 'foreign key',
      name: 'fk_budget_expenses_budget_20250703',
      references: { table: 'budgets', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('budget_expenses', {
      fields: ['expense_report_id'],
      type: 'foreign key',
      name: 'fk_budget_expenses_report_20250703',
      references: { table: 'expense_reports', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Expense Reports
    await queryInterface.addConstraint('expense_reports', {
      fields: ['travel_advance_request_id'],
      type: 'foreign key',
      name: 'fk_expense_reports_advance_request_20250703',
      references: { table: 'travel_advance_requests', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('expense_reports', {
      fields: ['document_id'],
      type: 'foreign key',
      name: 'fk_expense_reports_document_20250703',
      references: { table: 'documents', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('expense_reports', {
      fields: ['receipt_document_id'],
      type: 'foreign key',
      name: 'fk_expense_reports_receipt_20250703',
      references: { table: 'documents', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('expense_reports', {
      fields: ['submitted_by'],
      type: 'foreign key',
      name: 'fk_expense_reports_submitter_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('expense_reports', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'fk_expense_reports_approver_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('expense_reports', {
      fields: ['rejected_by'],
      type: 'foreign key',
      name: 'fk_expense_reports_rejector_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Expense Lines
    await queryInterface.addConstraint('expense_lines', {
      fields: ['document_id'],
      type: 'foreign key',
      name: 'fk_expense_lines_document_20250703',
      references: { table: 'documents', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('expense_lines', {
      fields: ['expense_report_id'],
      type: 'foreign key',
      name: 'fk_expense_lines_report_20250703',
      references: { table: 'expense_reports', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Documents
    await queryInterface.addConstraint('documents', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_documents_owner_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('documents', {
      fields: ['uploaded_by'],
      type: 'foreign key',
      name: 'fk_documents_uploader_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Assets
    await queryInterface.addConstraint('assets', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_assets_department_20250703',
      references: { table: 'departments', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('assets', {
      fields: ['custodian_id'],
      type: 'foreign key',
      name: 'fk_assets_custodian_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('assets', {
      fields: ['supplier_id'],
      type: 'foreign key',
      name: 'fk_assets_supplier_20250703',
      references: { table: 'vendors', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('assets', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_assets_creator_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Asset Maintenance
    await queryInterface.addConstraint('asset_maintenance', {
      fields: ['asset_id'],
      type: 'foreign key',
      name: 'fk_asset_maintenance_asset_20250703',
      references: { table: 'assets', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('asset_maintenance', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_asset_maintenance_creator_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('asset_maintenance', {
      fields: ['completed_by'],
      type: 'foreign key',
      name: 'fk_asset_maintenance_completer_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Attendance
    await queryInterface.addConstraint('attendance', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_attendance_employee_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('attendance', {
      fields: ['submitted_by'],
      type: 'foreign key',
      name: 'fk_attendance_submitter_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('attendance', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'fk_attendance_approver_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('attendance', {
      fields: ['rejected_by'],
      type: 'foreign key',
      name: 'fk_attendance_rejector_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Attendance Records
    await queryInterface.addConstraint('attendance_records', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_attendance_records_employee_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Bonus Records
    await queryInterface.addConstraint('bonus_records', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_bonus_records_employee_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('bonus_records', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'fk_bonus_records_approver_20250703',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all foreign keys in reverse order
    await queryInterface.removeConstraint('bonus_records', 'fk_bonus_records_approver_20250703');
    await queryInterface.removeConstraint('bonus_records', 'fk_bonus_records_employee_20250703');
    await queryInterface.removeConstraint('attendance_records', 'fk_attendance_records_employee_20250703');
    await queryInterface.removeConstraint('attendance', 'fk_attendance_rejector_20250703');
    await queryInterface.removeConstraint('attendance', 'fk_attendance_approver_20250703');
    await queryInterface.removeConstraint('attendance', 'fk_attendance_submitter_20250703');
    await queryInterface.removeConstraint('attendance', 'fk_attendance_employee_20250703');
    await queryInterface.removeConstraint('asset_maintenance', 'fk_asset_maintenance_completer_20250703');
    await queryInterface.removeConstraint('asset_maintenance', 'fk_asset_maintenance_creator_20250703');
    await queryInterface.removeConstraint('asset_maintenance', 'fk_asset_maintenance_asset_20250703');
    await queryInterface.removeConstraint('assets', 'fk_assets_creator_20250703');
    await queryInterface.removeConstraint('assets', 'fk_assets_supplier_20250703');
    await queryInterface.removeConstraint('assets', 'fk_assets_custodian_20250703');
    await queryInterface.removeConstraint('assets', 'fk_assets_department_20250703');
    await queryInterface.removeConstraint('documents', 'fk_documents_uploader_20250703');
    await queryInterface.removeConstraint('documents', 'fk_documents_owner_20250703');
    await queryInterface.removeConstraint('expense_lines', 'fk_expense_lines_report_20250703');
    await queryInterface.removeConstraint('expense_lines', 'fk_expense_lines_document_20250703');
    await queryInterface.removeConstraint('expense_reports', 'fk_expense_reports_rejector_20250703');
    await queryInterface.removeConstraint('expense_reports', 'fk_expense_reports_approver_20250703');
    await queryInterface.removeConstraint('expense_reports', 'fk_expense_reports_submitter_20250703');
    await queryInterface.removeConstraint('expense_reports', 'fk_expense_reports_receipt_20250703');
    await queryInterface.removeConstraint('expense_reports', 'fk_expense_reports_document_20250703');
    await queryInterface.removeConstraint('expense_reports', 'fk_expense_reports_advance_request_20250703');
    await queryInterface.removeConstraint('budget_expenses', 'fk_budget_expenses_report_20250703');
    await queryInterface.removeConstraint('budget_expenses', 'fk_budget_expenses_budget_20250703');
    await queryInterface.removeConstraint('budgets', 'fk_budgets_approver_20250703');
    await queryInterface.removeConstraint('budgets', 'fk_budgets_creator_20250703');
    await queryInterface.removeConstraint('budgets', 'fk_budgets_responsible_person_20250703');
    await queryInterface.removeConstraint('budgets', 'fk_budgets_department_20250703');
    await queryInterface.removeConstraint('budgets', 'fk_budgets_quarter_20250703');
    await queryInterface.removeConstraint('appraisal_forms', 'fk_appraisal_forms_hr_reviewer_20250703');
    await queryInterface.removeConstraint('appraisal_forms', 'fk_appraisal_forms_peer_reviewer_20250703');
    await queryInterface.removeConstraint('appraisal_forms', 'fk_appraisal_forms_objective_20250703');
    await queryInterface.removeConstraint('appraisal_forms', 'fk_appraisal_forms_user_20250703');
  }
};
