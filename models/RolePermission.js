const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * RolePermission model - Junction table for Role-Permission many-to-many relationship
 * @swagger
 * components:
 *   schemas:
 *     RolePermission:
 *       type: object
 *       required:
 *         - role_id
 *         - permission_id
 *       properties:
 *         id:
 *           type: integer
 *           description: RolePermission ID
 *         role_id:
 *           type: integer
 *           description: Role ID
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *         created_by:
 *           type: integer
 *           description: User ID who created this association
 *         updated_by:
 *           type: integer
 *           description: User ID who last updated this association
 */
const RolePermission = sequelize.define('RolePermission', {
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id',
    },
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'permissions',
      key: 'id',
    },
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'role_permissions',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['role_id', 'permission_id'],
    },
  ],
});

RolePermission.associate = (models) => {
  RolePermission.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
  
  RolePermission.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updater',
  });
};

module.exports = RolePermission;
```

## models/PersonalEmployeeData.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * PersonalEmployeeData model
 * @swagger
 * components:
 *   schemas:
 *     PersonalEmployeeData:
 *       type: object
 *       required:
 *         - user_id
 *         - location
 *         - education_level
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *         location:
 *           type: string
 *           description: Employee's home location
 *         education_level:
 *           type: string
 *           description: Employee's education level
 */
const PersonalEmployeeData = sequelize.define('PersonalEmployeeData', {
  location: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  education_level: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'personal_employee_data',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
PersonalEmployeeData.associate = (models) => {
  PersonalEmployeeData.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = PersonalEmployeeData;
```

## models/EmergencyContact.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * EmergencyContact model
 * @swagger
 * components:
 *   schemas:
 *     EmergencyContact:
 *       type: object
 *       required:
 *         - user_id
 *         - name
 *         - phone_number
 *         - relationship
 *       properties:
 *         id:
 *           type: integer
 *           description: Emergency contact ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         name:
 *           type: string
 *           description: Contact name
 *         phone_number:
 *           type: string
 *           description: Contact phone number
 *         relationship:
 *           type: string
 *           description: Relationship to employee
 */
const EmergencyContact = sequelize.define('EmergencyContact', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  relationship: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'emergency_contacts',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
EmergencyContact.associate = (models) => {
  EmergencyContact.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = EmergencyContact;
```

## models/NextOfKin.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * NextOfKin model
 * @swagger
 * components:
 *   schemas:
 *     NextOfKin:
 *       type: object
 *       required:
 *         - user_id
 *         - name
 *         - phone_number
 *         - percentage
 *         - relationship
 *       properties:
 *         id:
 *           type: integer
 *           description: Next of kin ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         name:
 *           type: string
 *           description: Next of kin name
 *         phone_number:
 *           type: string
 *           description: Next of kin phone number
 *         percentage:
 *           type: integer
 *           description: Percentage allocation (1-100)
 *         relationship:
 *           type: string
 *           description: Relationship to employee
 */
const NextOfKin = sequelize.define('NextOfKin', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  percentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100,
    },
  },
  relationship: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'next_of_kin',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
NextOfKin.associate = (models) => {
  NextOfKin.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = NextOfKin;
```

## models/WorkScheduler.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * WorkScheduler model
 * @swagger
 * components:
 *   schemas:
 *     WorkScheduler:
 *       type: object
 *       required:
 *         - day_of_week
 *         - start_time
 *         - end_time
 *       properties:
 *         id:
 *           type: integer
 *           description: Work scheduler ID
 *         day_of_week:
 *           type: string
 *           enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *           description: Day of the week
 *         start_time:
 *           type: string
 *           format: time
 *           description: Work start time
 *         end_time:
 *           type: string
 *           format: time
 *           description: Work end time
 */
const WorkScheduler = sequelize.define('WorkScheduler', {
  day_of_week: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
}, {
  tableName: 'work_scheduler',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = WorkScheduler;
```

## models/HolidayList.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * HolidayList model
 * @swagger
 * components:
 *   schemas:
 *     HolidayList:
 *       type: object
 *       required:
 *         - name
 *         - date
 *       properties:
 *         id:
 *           type: integer
 *           description: Holiday ID
 *         name:
 *           type: string
 *           description: Holiday name
 *         date:
 *           type: string
 *           format: date
 *           description: Holiday date
 *         status:
 *           type: string
 *           enum: [editable, non-editable]
 *           description: Whether the holiday can be edited
 *         is_workday:
 *           type: boolean
 *           description: Whether employees work on this holiday
 *         created_by:
 *           type: integer
 *           description: User ID who created this holiday
 *         updated_by:
 *           type: integer
 *           description: User ID who last updated this holiday
 */
const HolidayList = sequelize.define('HolidayList', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('editable', 'non-editable'),
    defaultValue: 'editable',
  },
  is_workday: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'holiday_list',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
HolidayList.associate = (models) => {
  HolidayList.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
  
  HolidayList.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updater',
  });
};

module.exports = HolidayList;
```

## models/FiscalYear.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * FiscalYear model
 * @swagger
 * components:
 *   schemas:
 *     FiscalYear:
 *       type: object
 *       required:
 *         - year
 *         - start_date
 *         - end_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Fiscal year ID
 *         year:
 *           type: string
 *           description: Fiscal year (e.g., "2024-2025")
 *         start_date:
 *           type: string
 *           format: date
 *           description: Start date of fiscal year
 *         end_date:
 *           type: string
 *           format: date
 *           description: End date of fiscal year
 *         status:
 *           type: string
 *           enum: [active, inactive, closed]
 *           description: Status of fiscal year
 *         created_by:
 *           type: integer
 *           description: User ID who created this fiscal year
 */
const FiscalYear = sequelize.define('FiscalYear', {
  year: {
    type: DataTypes.STRING(9),
    allowNull: false,
    unique: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'closed'),
    defaultValue: 'inactive',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'fiscal_years',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
FiscalYear.associate = (models) => {
  FiscalYear.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
  
  FiscalYear.hasMany(models.Quarter, {
    foreignKey: 'fiscal_year_id',
    as: 'quarters',
  });
  
  FiscalYear.hasMany(models.Objective, {
    foreignKey: 'fiscal_year_id',
    as: 'objectives',
  });
  
  FiscalYear.hasMany(models.Increment, {
    foreignKey: 'fiscal_year_id',
    as: 'increments',
  });
};

module.exports = FiscalYear;
```

## models/Quarter.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * Quarter model
 * @swagger
 * components:
 *   schemas:
 *     Quarter:
 *       type: object
 *       required:
 *         - fiscal_year_id
 *         - title
 *         - start_date
 *         - end_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Quarter ID
 *         fiscal_year_id:
 *           type: integer
 *           description: Fiscal year ID
 *         title:
 *           type: string
 *           description: Quarter title (e.g., "Q1")
 *         start_date:
 *           type: string
 *           format: date
 *           description: Start date of quarter
 *         end_date:
 *           type: string
 *           format: date
 *           description: End date of quarter
 */
const Quarter = sequelize.define('Quarter', {
  fiscal_year_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fiscal_years',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'quarters',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Quarter.associate = (models) => {
  Quarter.belongsTo(models.FiscalYear, {
    foreignKey: 'fiscal_year_id',
    as: 'fiscalYear',
  });
  
  Quarter.hasMany(models.Budget, {
    foreignKey: 'quarter_id',
    as: 'budgets',
  });
};

module.exports = Quarter;
```

## models/Objective.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * Objective model
 * @swagger
 * components:
 *   schemas:
 *     Objective:
 *       type: object
 *       required:
 *         - user_id
 *         - title
 *         - description
 *         - implementation_quarter
 *         - fiscal_year_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Objective ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         title:
 *           type: string
 *           description: Objective title
 *         description:
 *           type: string
 *           description: Objective description
 *         is_approved:
 *           type: boolean
 *           description: Whether objective is approved
 *         implementation_quarter:
 *           type: string
 *           enum: [Q1, Q2, Q3, Q4]
 *           description: Quarter for implementation
 *         fiscal_year_id:
 *           type: integer
 *           description: Fiscal year ID
 */
const Objective = sequelize.define('Objective', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  implementation_quarter: {
    type: DataTypes.ENUM('Q1', 'Q2', 'Q3', 'Q4'),
    allowNull: false,
  },
  fiscal_year_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fiscal_years',
      key: 'id',
    },
  },
}, {
  tableName: 'objectives',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Objective.associate = (models) => {
  Objective.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  
  Objective.belongsTo(models.FiscalYear, {
    foreignKey: 'fiscal_year_id',
    as: 'fiscalYear',
  });
  
  Objective.hasMany(models.AppraisalForm, {
    foreignKey: 'objective_id',
    as: 'appraisalForms',
  });
};

module.exports = Objective;
```

## models/AppraisalForm.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * AppraisalForm model
 * @swagger
 * components:
 *   schemas:
 *     AppraisalForm:
 *       type: object
 *       required:
 *         - user_id
 *         - objective_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Appraisal form ID
 *         user_id:
 *           type: integer
 *           description: User ID being appraised
 *         objective_id:
 *           type: integer
 *           description: Objective ID being appraised
 *         self_assessment:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Self-assessment score (1-10)
 *         self_comment:
 *           type: string
 *           description: Self-assessment comment
 *         peer_review:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Peer review score (1-10)
 *         peer_reviewer_id:
 *           type: integer
 *           description: User ID of peer reviewer
 *         peer_comment:
 *           type: string
 *           description: Peer review comment
 *         hr_review:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: HR review score (1-10)
 *         hr_reviewer_id:
 *           type: integer
 *           description: User ID of HR reviewer
 *         hr_comment:
 *           type: string
 *           description: HR review comment
 */
const AppraisalForm = sequelize.define('AppraisalForm', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  objective_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'objectives',
      key: 'id',
    },
  },
  self_assessment: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10,
    },
  },
  self_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  peer_review: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10,
    },
  },
  peer_reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  peer_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  hr_review: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10,
    },
  },
  hr_reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  hr_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'appraisal_forms',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
AppraisalForm.associate = (models) => {
  AppraisalForm.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  
  AppraisalForm.belongsTo(models.Objective, {
    foreignKey: 'objective_id',
    as: 'objective',
  });
  
  AppraisalForm.belongsTo(models.User, {
    foreignKey: 'peer_reviewer_id',
    as: 'peerReviewer',
  });
  
  AppraisalForm.belongsTo(models.User, {
    foreignKey: 'hr_reviewer_id',
    as: 'hrReviewer',
  });
};

module.exports = AppraisalForm;
```

## models/Budget.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * Budget model
 * @swagger
 * components:
 *   schemas:
 *     Budget:
 *       type: object
 *       required:
 *         - quarter_id
 *         - department_id
 *         - activity_name
 *         - responsible_person_id
 *         - amount
 *         - created_by
 *       properties:
 *         id:
 *           type: integer
 *           description: Budget ID
 *         quarter_id:
 *           type: integer
 *           description: Quarter ID
 *         department_id:
 *           type: integer
 *           description: Department ID
 *         activity_name:
 *           type: string
 *           description: Name of the activity
 *         responsible_person_id:
 *           type: integer
 *           description: User ID of responsible person
 *         description:
 *           type: string
 *           description: Budget description
 *         amount:
 *           type: number
 *           format: float
 *           description: Budget amount
 *         status:
 *           type: string
 *           enum: [draft, submitted, approved, rejected]
 *           description: Budget status
 *         created_by:
 *           type: integer
 *           description: User ID who created this budget
 *         approved_by:
 *           type: integer
 *           description: User ID who approved this budget
 */
const Budget = sequelize.define('Budget', {
  quarter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quarters',
      key: 'id',
    },
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id',
    },
  },
  activity_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  responsible_person_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
    defaultValue: 'draft',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'budgets',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Budget.associate = (models) => {
  Budget.belongsTo(models.Quarter, {
    foreignKey: 'quarter_id',
    as: 'quarter',
  });
  
  Budget.belongsTo(models.Department, {
    foreignKey: 'department_id',
    as: 'department',
  });
  
  Budget.belongsTo(models.User, {
    foreignKey: 'responsible_person_id',
    as: 'responsiblePerson',
  });
  
  Budget.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
  
  Budget.belongs