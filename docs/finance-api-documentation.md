# 📊 Finance API Endpoints

## Budgets

### Create Budget
**POST** `/api/v1/finance/budgets`
```json
{
  "quarter_id": 1,
  "department_id": 2,
  "activity_name": "Staff Training",
  "responsible_person_id": 5,
  "description": "Annual staff training",
  "amount": 5000000
}
```
**Response:**
```json
201 Created
{
  "success": true,
  "data": { /* Budget object */ }
}
```

### Get All Budgets
**GET** `/api/v1/finance/budgets`
```json
{
  "success": true,
  "data": [ /* Array of Budget objects */ ]
}
```

---

## Expense Reports

### Create Expense Report
**POST** `/api/v1/finance/expense-reports`
```json
{
  "travel_advance_request_id": 1,
  "date": "2024-06-27",
  "expense_title": "Conference Expenses",
  "expense_amount": 1200000,
  "deadline": "2024-07-10",
  "description": "Expenses for conference trip"
}
```
**Response:**
```json
201 Created
{
  "success": true,
  "data": { /* ExpenseReport object */ }
}
```

### Get All Expense Reports
**GET** `/api/v1/finance/expense-reports`
```json
{
  "success": true,
  "data": [ /* Array of ExpenseReport objects */ ]
}
```

---

## Purchase Requests

### Create Purchase Request
**POST** `/api/v1/finance/purchase-requests`
```json
{
  "item": "Laptop",
  "budget_id": 3,
  "requester_id": 7,
  "quantity": 2,
  "estimated_cost": 4000000
}
```
**Response:**
```json
201 Created
{
  "success": true,
  "data": { /* PurchaseRequest object */ }
}
```

### Get All Purchase Requests
**GET** `/api/v1/finance/purchase-requests`
```json
{
  "success": true,
  "data": [ /* Array of PurchaseRequest objects */ ]
}
```

---

## Suppliers

### Create Supplier
**POST** `/api/v1/finance/suppliers`
```json
{
  "supplier_id": "SUP-001",
  "name": "ABC Supplies Ltd.",
  "type": "company",
  "tax_id": "TIN123456",
  "address": "123 Main St",
  "email": "info@abc.com",
  "phone_number": "+255123456789",
  "contact_person": "John Doe"
}
```
**Response:**
```json
201 Created
{
  "success": true,
  "data": { /* Supplier object */ }
}
```

### Get All Suppliers
**GET** `/api/v1/finance/suppliers`
```json
{
  "success": true,
  "data": [ /* Array of Supplier objects */ ]
}
```

---

## Quotations

### Create Quotation
**POST** `/api/v1/finance/quotations`
```json
{
  "supplier_id": 1,
  "date": "2024-06-27",
  "procurement_title": "Office Chairs",
  "amount": 2000000,
  "currency": "TZS",
  "description": "Quotation for office chairs",
  "submitted_by": 7
}
```
**Response:**
```json
201 Created
{
  "success": true,
  "data": { /* Quotation object */ }
}
```

### Get All Quotations
**GET** `/api/v1/finance/quotations`
```json
{
  "success": true,
  "data": [ /* Array of Quotation objects */ ]
}
```

---

## LPOs (Local Purchase Orders)

### Create LPO
**POST** `/api/v1/finance/lpos`
```json
{
  "po_number": "LPO-2024-001",
  "supplier_id": 1,
  "item_name": "Printer",
  "amount": 1500000,
  "currency": "TZS",
  "created_by": 7
}
```
**Response:**
```json
201 Created
{
  "success": true,
  "data": { /* LPO object */ }
}
```

### Get All LPOs
**GET** `/api/v1/finance/lpos`
```json
{
  "success": true,
  "data": [ /* Array of LPO objects */ ]
}
```

---

## Petty Cash

### Create Petty Cash Book
**POST** `/api/v1/finance/petty-cash-books`
```json
{
  "user_id": 7,
  "amount_received": 500000,
  "date": "2024-06-27",
  "balance": 500000
}
```
**Response:**
```json
201 Created
{
  "success": true,
  "data": { /* PettyCashBook object */ }
}
```

### Add Petty Cash Expense
**POST** `/api/v1/finance/petty-cash-expenses`
```json
{
  "petty_cash_book_id": 1,
  "date": "2024-06-27",
  "description": "Stationery",
  "amount": 20000,
  "created_by": 7
}
```
**Response:**
```json
201 Created
{
  "success": true,
  "data": { /* PettyCashExpense object */ }
}
```

---

## Travel Advance Requests

### Create Travel Advance Request
**POST** `/api/v1/finance/travel-advance-requests`
```json
{
  "user_id": 7,
  "departure_date": "2024-07-01",
  "return_date": "2024-07-05",
  "total_cost": 800000,
  "flat_rate_id": 2
}
```
**Response:**
```json
201 Created
{
  "success": true,
  "data": { /* TravelAdvanceRequest object */ }
}
```

### Get All Travel Advance Requests
**GET** `/api/v1/finance/travel-advance-requests`
```json
{
  "success": true,
  "data": [ /* Array of TravelAdvanceRequest objects */ ]
}
```

---

> **Note:** All endpoints require authentication and appropriate role/permission. The actual endpoints may vary depending on your implementation, but this structure follows your codebase conventions and model definitions. 