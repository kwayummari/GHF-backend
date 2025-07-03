module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create suppliers table
    await queryInterface.createTable('suppliers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      contactPerson: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
      }
    });

    // Create purchase_requests table
    await queryInterface.createTable('purchase_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      requestNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departments',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      requestedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
      }
    });

    // Create purchase_request_items table
    await queryInterface.createTable('purchase_request_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      purchase_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'purchase_requests',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      itemName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
      }
    });

    // Create purchase_orders table
    await queryInterface.createTable('purchase_orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      purchase_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'purchase_requests',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'suppliers',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      orderNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      deliveryDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
      }
    });

    // Create purchase_order_items table
    await queryInterface.createTable('purchase_order_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      purchase_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'purchase_orders',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      purchase_request_item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'purchase_request_items',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
      }
    });

    // Add foreign key constraints
    await queryInterface.addConstraint('purchase_requests', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_purchase_requests_department',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('purchase_requests', {
      fields: ['requestedBy'],
      type: 'foreign key',
      name: 'fk_purchase_requests_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('purchase_request_items', {
      fields: ['purchase_request_id'],
      type: 'foreign key',
      name: 'fk_purchase_request_items_request',
      references: {
        table: 'purchase_requests',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('purchase_orders', {
      fields: ['purchase_request_id'],
      type: 'foreign key',
      name: 'fk_purchase_orders_request',
      references: {
        table: 'purchase_requests',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('purchase_orders', {
      fields: ['supplier_id'],
      type: 'foreign key',
      name: 'fk_purchase_orders_supplier',
      references: {
        table: 'suppliers',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('purchase_order_items', {
      fields: ['purchase_order_id'],
      type: 'foreign key',
      name: 'fk_purchase_order_items_order',
      references: {
        table: 'purchase_orders',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('purchase_order_items', {
      fields: ['purchase_request_item_id'],
      type: 'foreign key',
      name: 'fk_purchase_order_items_request_item',
      references: {
        table: 'purchase_request_items',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('purchase_requests', 'fk_purchase_requests_department');
    await queryInterface.removeConstraint('purchase_requests', 'fk_purchase_requests_user');
    await queryInterface.removeConstraint('purchase_request_items', 'fk_purchase_request_items_request');
    await queryInterface.removeConstraint('purchase_orders', 'fk_purchase_orders_request');
    await queryInterface.removeConstraint('purchase_orders', 'fk_purchase_orders_supplier');
    await queryInterface.removeConstraint('purchase_order_items', 'fk_purchase_order_items_order');
    await queryInterface.removeConstraint('purchase_order_items', 'fk_purchase_order_items_request_item');

    // Drop tables in reverse order
    await queryInterface.dropTable('purchase_order_items');
    await queryInterface.dropTable('purchase_orders');
    await queryInterface.dropTable('purchase_request_items');
    await queryInterface.dropTable('purchase_requests');
    await queryInterface.dropTable('suppliers');
  }
};
