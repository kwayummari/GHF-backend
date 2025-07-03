'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Sample assets
    const assets = [
      {
        asset_code: 'GHF-2024-001',
        asset_name: 'Dell Latitude 5520 Laptop',
        asset_tag: 'GHF-LT-001',
        category: 'IT Equipment',
        subcategory: 'Laptops',
        status: 'active',
        location: 'IT Department',
        department_id: 1, // Assuming IT department exists
        custodian_id: 1, // Assuming user ID 1 exists
        purchase_date: '2024-01-15',
        purchase_cost: 2500000.00,
        current_value: 2000000.00,
        supplier_id: 1, // Assuming supplier ID 1 exists
        warranty_expiry: '2027-01-15',
        serial_number: 'DL5520-2024-001',
        model: 'Latitude 5520',
        manufacturer: 'Dell Inc.',
        description: 'Business laptop for IT department',
        notes: 'Assigned to IT Manager',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        asset_code: 'GHF-2024-002',
        asset_name: 'HP LaserJet Pro M404n Printer',
        asset_tag: 'GHF-PR-001',
        category: 'IT Equipment',
        subcategory: 'Printers',
        status: 'active',
        location: 'Administration Office',
        department_id: 2, // Assuming Admin department exists
        custodian_id: 2, // Assuming user ID 2 exists
        purchase_date: '2024-02-01',
        purchase_cost: 800000.00,
        current_value: 700000.00,
        supplier_id: 1,
        warranty_expiry: '2026-02-01',
        serial_number: 'HP404N-2024-001',
        model: 'LaserJet Pro M404n',
        manufacturer: 'HP Inc.',
        description: 'Network printer for administration',
        notes: 'Shared printer for admin staff',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        asset_code: 'GHF-2024-003',
        asset_name: 'Office Desk Chair',
        asset_tag: 'GHF-FR-001',
        category: 'Furniture',
        subcategory: 'Office Chairs',
        status: 'active',
        location: 'HR Department',
        department_id: 3, // Assuming HR department exists
        custodian_id: 3, // Assuming user ID 3 exists
        purchase_date: '2024-01-20',
        purchase_cost: 150000.00,
        current_value: 120000.00,
        supplier_id: 2, // Assuming supplier ID 2 exists
        serial_number: 'ODC-2024-001',
        model: 'Executive Chair',
        manufacturer: 'Office Furniture Co.',
        description: 'Ergonomic office chair',
        notes: 'Assigned to HR Manager',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('assets', assets, {});

    // Sample maintenance records
    const maintenanceRecords = [
      {
        maintenance_number: 'MAINT-2024-001',
        asset_id: 1,
        maintenance_type: 'preventive',
        title: 'Quarterly System Maintenance',
        description: 'Regular system cleanup, antivirus update, and hardware inspection',
        scheduled_date: '2024-04-15',
        estimated_duration: '2 hours',
        estimated_cost: 50000.00,
        assigned_to: 'IT Team',
        vendor_id: 'internal',
        priority: 'medium',
        maintenance_category: 'system',
        status: 'completed',
        completion_percentage: 100,
        completed_date: '2024-04-15',
        actual_duration: '1.5 hours',
        actual_cost: 45000.00,
        completion_notes: 'All tasks completed successfully. System running optimally.',
        created_by: 1,
        completed_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        maintenance_number: 'MAINT-2024-002',
        asset_id: 2,
        maintenance_type: 'preventive',
        title: 'Printer Maintenance and Cleaning',
        description: 'Regular printer cleaning, toner replacement, and firmware update',
        scheduled_date: '2024-05-01',
        estimated_duration: '1 hour',
        estimated_cost: 30000.00,
        assigned_to: 'IT Team',
        vendor_id: 'internal',
        priority: 'low',
        maintenance_category: 'hardware',
        status: 'scheduled',
        completion_percentage: 0,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        maintenance_number: 'MAINT-2024-003',
        asset_id: 1,
        maintenance_type: 'corrective',
        title: 'Laptop Battery Replacement',
        description: 'Replace faulty laptop battery that is not holding charge',
        scheduled_date: '2024-06-01',
        estimated_duration: '30 minutes',
        estimated_cost: 150000.00,
        assigned_to: 'External Technician',
        vendor_id: 'external',
        priority: 'high',
        maintenance_category: 'hardware',
        status: 'in_progress',
        completion_percentage: 50,
        notes: 'Battery ordered from supplier. Will be installed next week.',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('asset_maintenance', maintenanceRecords, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove sample data in reverse order
    await queryInterface.bulkDelete('asset_maintenance', null, {});
    await queryInterface.bulkDelete('assets', null, {});
  }
}; 