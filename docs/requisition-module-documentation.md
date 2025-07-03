# 📋 Requisition Module Documentation

## Overview

The Requisition Module is a comprehensive purchase request management system that handles the entire requisition lifecycle from creation to approval and procurement. This module integrates with the finance and procurement systems to provide a complete workflow solution.

## Features

### ✅ Core Features
- **Complete CRUD Operations** - Create, read, update, delete purchase requests
- **Workflow Management** - Multi-stage approval process with role-based permissions
- **Item Management** - Support for multiple items per requisition with detailed specifications
- **Attachment Support** - File uploads for supporting documents
- **Search & Filtering** - Advanced search with multiple filter criteria
- **Reporting & Analytics** - Comprehensive statistics and reporting
- **Bulk Operations** - Bulk approve/delete functionality
- **Validation** - Comprehensive input validation and error handling

### 🔐 Security Features
- **Authentication** - JWT-based authentication required for all endpoints
- **Authorization** - Role-based access control (Admin, Finance Manager, Department Head, User)
- **Input Validation** - Joi-based validation for all inputs
- **SQL Injection Protection** - Parameterized queries and ORM usage
- **XSS Protection** - Input sanitization and validation

## Database Schema

### PurchaseRequest Table
```sql
CREATE TABLE purchase_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requisition_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  department_id INT NOT NULL,
  requested_by INT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  required_date DATE NOT NULL,
  estimated_cost DECIMAL(15,2) NOT NULL,
  actual_cost DECIMAL(15,2),
  status ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled') DEFAULT 'draft',
  approval_stage INT DEFAULT 0,
  total_stages INT DEFAULT 1,
  budget_id INT,
  justification TEXT,
  notes TEXT,
  approved_by INT,
  approved_date DATETIME,
  rejected_by INT,
  rejected_date DATETIME,
  rejection_reason TEXT,
  submitted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (requested_by) REFERENCES users(id),
  FOREIGN KEY (budget_id) REFERENCES budgets(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (rejected_by) REFERENCES users(id)
);
```

### RequisitionItem Table
```sql
CREATE TABLE requisition_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  purchase_request_id INT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INT NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  specifications TEXT,
  category VARCHAR(100),
  supplier_preference VARCHAR(255),
  brand VARCHAR(100),
  model VARCHAR(100),
  unit_of_measure VARCHAR(50) DEFAULT 'piece',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE
);
```

### RequisitionAttachment Table
```sql
CREATE TABLE requisition_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  purchase_request_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100),
  description VARCHAR(500),
  category VARCHAR(100),
  uploaded_by INT NOT NULL,
  upload_date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

### RequisitionWorkflow Table
```sql
CREATE TABLE requisition_workflows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  purchase_request_id INT NOT NULL,
  stage INT NOT NULL,
  stage_name VARCHAR(100) NOT NULL,
  approver_role VARCHAR(100) NOT NULL,
  approver_id INT NOT NULL,
  action ENUM('approved', 'rejected', 'returned', 'forwarded') NOT NULL,
  comments TEXT,
  conditions TEXT,
  next_approver_id INT,
  completed_date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id),
  FOREIGN KEY (next_approver_id) REFERENCES users(id)
);
```

## API Endpoints

### Base URL
```
/api/v1/requisitions
```

### Core CRUD Operations

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all purchase requests | ✅ | All |
| GET | `/:id` | Get purchase request by ID | ✅ | All |
| POST | `/` | Create purchase request | ✅ | All |
| PUT | `/:id` | Update purchase request | ✅ | Owner/Admin |
| DELETE | `/:id` | Delete purchase request | ✅ | Owner/Admin/Finance |

### Workflow Operations

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| PUT | `/:id/submit` | Submit for approval | ✅ | Owner |
| PUT | `/:id/approve` | Approve request | ✅ | Admin/Finance/Dept Head |
| PUT | `/:id/reject` | Reject request | ✅ | Admin/Finance/Dept Head |
| GET | `/:id/workflow` | Get approval workflow | ✅ | All |

### Search & Analytics

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/search` | Search purchase requests | ✅ | All |
| GET | `/statistics` | Get statistics | ✅ | All |

### Bulk Operations

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/bulk-approve` | Bulk approve requests | ✅ | Admin/Finance |
| POST | `/bulk-delete` | Bulk delete requests | ✅ | Admin/Finance |

## Request/Response Examples

### Create Purchase Request
```bash
POST /api/v1/requisitions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Office Laptops Purchase",
  "description": "Purchase of 10 laptops for new employees",
  "department_id": 2,
  "priority": "high",
  "required_date": "2024-08-15",
  "budget_id": 3,
  "estimated_cost": 12000000,
  "justification": "New employees need laptops for work",
  "notes": "Please expedite this request",
  "items": [
    {
      "item_name": "Dell Latitude 5520",
      "description": "Business laptop with 16GB RAM",
      "quantity": 10,
      "unit_price": 1200000,
      "specifications": "Intel i7, 16GB RAM, 512GB SSD",
      "category": "Electronics",
      "supplier_preference": "Dell Technologies"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase request created successfully",
  "data": {
    "id": 1,
    "requisition_number": "REQ-2024-001",
    "status": "draft",
    "created_date": "2024-06-15T10:30:00Z"
  }
}
```

### Get All Purchase Requests
```bash
GET /api/v1/requisitions?page=1&limit=10&status=pending&priority=high
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requisitions": [
      {
        "id": 1,
        "requisition_number": "REQ-2024-001",
        "title": "Office Laptops Purchase",
        "department_name": "IT Department",
        "requester_name": "John Doe",
        "priority": "high",
        "status": "pending",
        "estimated_cost": 12000000,
        "items_count": 1
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_records": 48,
      "per_page": 10
    }
  }
}
```

## Workflow Process

### 1. Draft Stage
- User creates purchase request
- Status: `draft`
- Can be edited and deleted by owner

### 2. Submission
- User submits for approval
- Status: `pending`
- Approval stage: 1

### 3. Approval Process
- Multi-stage approval based on organizational hierarchy
- Each stage can: approve, reject, or forward to next stage
- Workflow history is maintained

### 4. Final Status
- **Approved**: Ready for procurement
- **Rejected**: Requires resubmission or cancellation
- **Cancelled**: Request withdrawn

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `WORKFLOW_ERROR` - Invalid workflow action
- `BUDGET_EXCEEDED` - Budget limit exceeded
- `DUPLICATE_REQUEST` - Duplicate requisition detected

## Security Considerations

### Authentication
- All endpoints require valid JWT token
- Token must be included in Authorization header: `Bearer <token>`

### Authorization
- Role-based access control implemented
- Users can only modify their own requests (unless admin/finance)
- Approval actions restricted to authorized roles

### Input Validation
- All inputs validated using Joi schemas
- SQL injection protection through ORM
- XSS protection through input sanitization

### File Upload Security
- File type validation
- File size limits (10MB max)
- Secure file storage with unique names
- Virus scanning recommended for production

## Performance Considerations

### Database Indexes
- Primary keys on all tables
- Indexes on frequently queried fields:
  - `requisition_number`
  - `status`
  - `department_id`
  - `requested_by`
  - `priority`
  - `required_date`

### Pagination
- Default: 10 items per page
- Maximum: 100 items per page
- Efficient querying with LIMIT and OFFSET

### Caching
- Consider Redis caching for frequently accessed data
- Cache statistics and reports
- Implement cache invalidation on updates

## Testing

### Unit Tests
- Test all controller methods
- Test validation schemas
- Test utility functions

### Integration Tests
- Test complete workflow
- Test database operations
- Test authentication/authorization

### API Tests
- Test all endpoints
- Test error scenarios
- Test performance under load

## Deployment

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ghf_backend
DB_USER=ghf_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# File Upload
UPLOAD_PATH=/uploads/requisitions
MAX_FILE_SIZE=10485760
```

### Database Migration
```bash
# Run migrations
npx sequelize-cli db:migrate

# Seed data (optional)
npx sequelize-cli db:seed:all
```

### Production Considerations
- Use HTTPS in production
- Implement rate limiting
- Set up monitoring and logging
- Configure backup strategy
- Use CDN for file storage
- Implement proper error tracking

## Future Enhancements

### Planned Features
- Email notifications for status changes
- Mobile app support
- Advanced reporting dashboard
- Integration with accounting systems
- Automated approval workflows
- Supplier portal integration

### Technical Improvements
- GraphQL API
- Real-time notifications (WebSocket)
- Advanced search with Elasticsearch
- Microservices architecture
- Containerization with Docker

## Support

For technical support or questions about the Requisition Module:

1. Check the API documentation at `/api-docs`
2. Review the error logs
3. Contact the development team
4. Create an issue in the project repository

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Complete CRUD operations
- Workflow management
- Search and filtering
- Reporting and analytics
- Bulk operations
- File attachments
- Comprehensive validation
- Security features 