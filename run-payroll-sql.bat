@echo off
echo Executing Payroll Tables SQL Script...
mysql -u root -p < sql/payroll-tables.sql
echo.
echo Executing Additional Payroll Tables SQL Script...
mysql -u root -p < sql/additional-payroll-tables.sql
echo.
echo Executing Payroll Approvals and Deductions SQL Script...
mysql -u root -p < sql/payroll-approvals-deductions.sql
echo.
echo All payroll SQL scripts executed successfully!
pause 