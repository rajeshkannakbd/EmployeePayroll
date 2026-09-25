# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payroll-system.spec.js >> Employee Payroll System - End to End >> 11 - Complete HR payroll workflow
- Location: tests\payroll-system.spec.js:447:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: locator('select[name="status"]')
Expected: "ACTIVE"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" locator('select[name="status"]') with timeout 5000ms
  - waiting for locator('select[name="status"]')

```

```yaml
- complementary:
  - img "Logo"
  - heading "ABC PVT.LTD" [level=1]
  - paragraph: Management Portal
  - text: P
  - paragraph: Priya Sharma
  - paragraph: EMP-1002
  - text: HR
  - navigation:
    - paragraph: Main Menu
    - link "Dashboard":
      - /url: /
    - link "Employee Management":
      - /url: /employees
    - link "Department Management":
      - /url: /departments
    - link "Salary Structure":
      - /url: /salary-structure
    - link "Attendance Management":
      - /url: /attendance
    - link "Payroll Generation":
      - /url: /payroll/generate
    - link "Payroll History":
      - /url: /payroll/history
  - paragraph: Employee Payroll System
  - paragraph: Version 1.0
- banner:
  - heading "ABC PVT.LTD" [level=2]
  - paragraph: Employee Payroll Management - Manage employees, attendance and payroll
  - button "P Priya Sharma HR":
    - text: P
    - paragraph: Priya Sharma
    - paragraph: HR
  - button "Logout"
- main:
  - heading "Employee Management" [level=1]
  - paragraph: Manage employee information and records
  - button "+ Add Employee"
  - paragraph: Total Employees
  - paragraph: "7"
  - paragraph: All employee records
  - paragraph: Active Employees
  - paragraph: "7"
  - paragraph: Currently active
  - paragraph: Inactive Employees
  - paragraph: "0"
  - paragraph: Currently inactive
  - heading "Employee Filters" [level=2]
  - paragraph: Search, filter and sort employee records.
  - button "Clear Filters"
  - text: Search
  - textbox "Search code, name, email, phone, designation..."
  - text: Department
  - combobox:
    - option "All Departments" [selected]
    - option "Finance"
    - option "HR"
    - option "IT"
    - option "Marketing"
    - option "Sales"
  - text: Status
  - combobox:
    - option "All Status" [selected]
    - option "ACTIVE"
    - option "INACTIVE"
  - text: Employment Type
  - combobox:
    - option "All Employment Types" [selected]
    - option "Full Time"
    - option "Part Time"
    - option "Contract"
    - option "Intern"
  - text: Location
  - combobox:
    - option "All Locations" [selected]
    - option "Chennai"
    - option "Trichy"
  - text: Sort By
  - combobox:
    - option "Employee Code A-Z" [selected]
    - option "Employee Code Z-A"
    - option "Employee Name A-Z"
    - option "Employee Name Z-A"
    - option "Newest Joining Date"
    - option "Oldest Joining Date"
    - option "Status"
  - paragraph: Showing 1-7 of 7 matching employees
  - text: Rows per page
  - combobox:
    - option "10" [selected]
    - option "25"
    - option "50"
  - heading "Employee Records" [level=2]
  - paragraph: 7 matching record(s)
  - table:
    - rowgroup:
      - row "Code Name Department Designation Email Location Status Actions":
        - columnheader "Code"
        - columnheader "Name"
        - columnheader "Department"
        - columnheader "Designation"
        - columnheader "Email"
        - columnheader "Location"
        - columnheader "Status"
        - columnheader "Actions"
    - rowgroup:
      - 'row "EMP-1001 Sanjai N ID #10 Sales Sales Executive Sanjai@gmail.com Chennai ACTIVE Edit Delete"':
        - cell "EMP-1001"
        - 'cell "Sanjai N ID #10"':
          - paragraph: Sanjai N
          - paragraph: "ID #10"
        - cell "Sales"
        - cell "Sales Executive"
        - cell "Sanjai@gmail.com"
        - cell "Chennai"
        - cell "ACTIVE"
        - cell "Edit Delete":
          - button "Edit"
          - button "Delete"
      - 'row "EMP-1002 Priya Sharma ID #9 HR HR Executive priya.sharma@gmail.com Trichy ACTIVE Edit Delete"':
        - cell "EMP-1002"
        - 'cell "Priya Sharma ID #9"':
          - paragraph: Priya Sharma
          - paragraph: "ID #9"
        - cell "HR"
        - cell "HR Executive"
        - cell "priya.sharma@gmail.com"
        - cell "Trichy"
        - cell "ACTIVE"
        - cell "Edit Delete":
          - button "Edit"
          - button "Delete"
      - 'row "EMP-1003 Rajesh Kanna ID #1 Sales DEVELOPER rajesh@gmail.com Trichy ACTIVE Edit Delete"':
        - cell "EMP-1003"
        - 'cell "Rajesh Kanna ID #1"':
          - paragraph: Rajesh Kanna
          - paragraph: "ID #1"
        - cell "Sales"
        - cell "DEVELOPER"
        - cell "rajesh@gmail.com"
        - cell "Trichy"
        - cell "ACTIVE"
        - cell "Edit Delete":
          - button "Edit"
          - button "Delete"
      - 'row "EMP-1005 Mohan M ID #14 IT Software Engineer mohan@123.com Chennai ACTIVE Edit Delete"':
        - cell "EMP-1005"
        - 'cell "Mohan M ID #14"':
          - paragraph: Mohan M
          - paragraph: "ID #14"
        - cell "IT"
        - cell "Software Engineer"
        - cell "mohan@123.com"
        - cell "Chennai"
        - cell "ACTIVE"
        - cell "Edit Delete":
          - button "Edit"
          - button "Delete"
      - 'row "EMP-1006 Arjun Mohan ID #15 HR Senior Software Developer arjun.mohan.test01@example.com Trichy ACTIVE Edit Delete"':
        - cell "EMP-1006"
        - 'cell "Arjun Mohan ID #15"':
          - paragraph: Arjun Mohan
          - paragraph: "ID #15"
        - cell "HR"
        - cell "Senior Software Developer"
        - cell "arjun.mohan.test01@example.com"
        - cell "Trichy"
        - cell "ACTIVE"
        - cell "Edit Delete":
          - button "Edit"
          - button "Delete"
      - 'row "EMP-1007 Guru 2 ID #16 HR Video Editor guru@gamil.com Trichy ACTIVE Edit Delete"':
        - cell "EMP-1007"
        - 'cell "Guru 2 ID #16"':
          - paragraph: Guru 2
          - paragraph: "ID #16"
        - cell "HR"
        - cell "Video Editor"
        - cell "guru@gamil.com"
        - cell "Trichy"
        - cell "ACTIVE"
        - cell "Edit Delete":
          - button "Edit"
          - button "Delete"
      - 'row "EMP-1008 Employee N ID #21 Marketing Software Engineer employee@gmailcom Trichy ACTIVE Edit Delete"':
        - cell "EMP-1008"
        - 'cell "Employee N ID #21"':
          - paragraph: Employee N
          - paragraph: "ID #21"
        - cell "Marketing"
        - cell "Software Engineer"
        - cell "employee@gmailcom"
        - cell "Trichy"
        - cell "ACTIVE"
        - cell "Edit Delete":
          - button "Edit"
          - button "Delete"
  - paragraph: Page 1 of 1
  - button "Previous" [disabled]
  - button "1"
  - button "Next" [disabled]
  - heading "Add Employee" [level=2]
  - paragraph: Create a new employee record
  - button "×"
  - heading "Basic Information" [level=3]
  - text: Employee Code *
  - textbox "EMP-1001": PW-012701
  - text: First Name *
  - textbox "Rajesh": Playwright
  - text: Last Name
  - textbox "Kumar": Tester
  - text: Email *
  - textbox "employee@example.com": playwright.1789998012701@example.com
  - text: Phone *
  - textbox "9876543210": "9998012701"
  - text: Designation *
  - textbox "Software Developer"
  - text: Joining Date *
  - textbox: 2026-09-21
  - text: Status *
  - textbox [disabled]: ACTIVE
  - paragraph: New employees are created with ACTIVE status.
  - text: Department *
  - combobox:
    - option "Select Department" [selected]
    - option "Finance"
    - option "HR"
    - option "IT"
    - option "Marketing"
    - option "Sales"
  - heading "Employment Information" [level=3]
  - text: Employment Type *
  - combobox:
    - option "Select Employment Type" [selected]
    - option "Full Time"
    - option "Part Time"
    - option "Contract"
    - option "Intern"
  - text: Location *
  - textbox "Trichy"
  - heading "Statutory & Payment Information" [level=3]
  - text: PAN Number *
  - textbox "ABCDE1234F"
  - text: UAN Number *
  - textbox "100200300400"
  - text: Bank Account Number *
  - textbox "123456789012"
  - text: IFSC Code *
  - textbox "HDFC0001234"
  - button "Cancel"
  - button "Add Employee"
```

# Test source

```ts
  403 |     await expect(
  404 |       page.getByRole("heading", {
  405 |         name: "Payroll History",
  406 |       })
  407 |     ).toBeVisible();
  408 | 
  409 |     await expect(
  410 |       page.getByLabel("Employee", {
  411 |         exact: true,
  412 |       })
  413 |     ).toBeVisible().catch(() => {});
  414 | 
  415 |     /*
  416 |      * The current page has these controls by their
  417 |      * associated UI structure. We use their names to
  418 |      * keep the test stable.
  419 |      */
  420 |     await expect(
  421 |       page.locator("select").nth(0)
  422 |     ).toBeVisible();
  423 | 
  424 |     await expect(
  425 |       page.locator("input[type='month']")
  426 |     ).toBeVisible();
  427 | 
  428 |     await expect(
  429 |       page.getByRole("button", {
  430 |         name: "Search",
  431 |         exact: true,
  432 |       })
  433 |     ).toBeVisible();
  434 | 
  435 |     await expect(
  436 |       page.getByRole("button", {
  437 |         name: "Clear",
  438 |         exact: true,
  439 |       })
  440 |     ).toBeVisible();
  441 |   });
  442 | 
  443 |   // ==========================================================
  444 |   // 7. COMPLETE BUSINESS WORKFLOW
  445 |   // ==========================================================
  446 | 
  447 |   test("11 - Complete HR payroll workflow", async ({ page }) => {
  448 | 
  449 |     const employee =
  450 |       createUniqueEmployeeData();
  451 | 
  452 |     // --------------------------------------------------------
  453 |     // LOGIN
  454 |     // --------------------------------------------------------
  455 | 
  456 |     await loginAsHR(page);
  457 | 
  458 |     // --------------------------------------------------------
  459 |     // CREATE EMPLOYEE
  460 |     // --------------------------------------------------------
  461 | 
  462 |     await openProtectedPage(page, "/employees");
  463 | 
  464 |     await page.getByRole("button", {
  465 |       name: "+ Add Employee",
  466 |       exact: true,
  467 |     }).click();
  468 | 
  469 |     await page.locator(
  470 |       'input[name="employeeCode"]'
  471 |     ).fill(employee.employeeCode);
  472 | 
  473 |     await page.locator(
  474 |       'input[name="firstName"]'
  475 |     ).fill(employee.firstName);
  476 | 
  477 |     await page.locator(
  478 |       'input[name="lastName"]'
  479 |     ).fill(employee.lastName);
  480 | 
  481 |     await page.locator(
  482 |       'input[name="email"]'
  483 |     ).fill(employee.email);
  484 | 
  485 |     await page.locator(
  486 |       'input[name="phone"]'
  487 |     ).fill(employee.phone);
  488 | 
  489 |     await page.locator(
  490 |       'input[name="designation"]'
  491 |     ).fill(employee.designation);
  492 | 
  493 |     await page.locator(
  494 |       'input[name="joiningDate"]'
  495 |     ).fill(employee.joiningDate);
  496 | 
  497 |     /*
  498 |      * Status must remain ACTIVE and disabled.
  499 |      */
  500 |     const statusField =
  501 |       page.locator('select[name="status"]');
  502 | 
> 503 |     await expect(statusField).toHaveValue("ACTIVE");
      |                               ^ Error: expect(locator).toHaveValue(expected) failed
  504 |     await expect(statusField).toBeDisabled();
  505 | 
  506 |     /*
  507 |      * Select first real department.
  508 |      */
  509 |     const departmentField =
  510 |       page.locator(
  511 |         'select[name="departmentId"]'
  512 |       );
  513 | 
  514 |     const departmentOptions =
  515 |       await departmentField.locator("option").count();
  516 | 
  517 |     expect(
  518 |       departmentOptions,
  519 |       "At least one department must exist for this test."
  520 |     ).toBeGreaterThan(1);
  521 | 
  522 |     await departmentField.selectOption({
  523 |       index: 1,
  524 |     });
  525 | 
  526 |     await page.locator(
  527 |       'input[name="panNumber"]'
  528 |     ).fill(employee.panNumber);
  529 | 
  530 |     await page.locator(
  531 |       'input[name="uanNumber"]'
  532 |     ).fill(employee.uanNumber);
  533 | 
  534 |     await page.locator(
  535 |       'input[name="bankAccountNumber"]'
  536 |     ).fill(employee.bankAccountNumber);
  537 | 
  538 |     await page.locator(
  539 |       'input[name="ifscCode"]'
  540 |     ).fill(employee.ifscCode);
  541 | 
  542 |     await page.locator(
  543 |       'select[name="employmentType"]'
  544 |     ).selectOption(
  545 |       employee.employmentType
  546 |     );
  547 | 
  548 |     await page.locator(
  549 |       'input[name="location"]'
  550 |     ).fill(employee.location);
  551 | 
  552 |     await page.getByRole("button", {
  553 |       name: "Add Employee",
  554 |       exact: true,
  555 |     }).click();
  556 | 
  557 |     /*
  558 |      * Modal should close and employee should appear.
  559 |      */
  560 |     await expect(
  561 |       page.getByRole("heading", {
  562 |         name: "Add Employee",
  563 |       })
  564 |     ).not.toBeVisible();
  565 | 
  566 |     await page.getByPlaceholder(
  567 |       "Search employee..."
  568 |     ).fill(employee.employeeCode);
  569 | 
  570 |     await expect(
  571 |       page.getByText(employee.employeeCode, {
  572 |         exact: true,
  573 |       })
  574 |     ).toBeVisible();
  575 | 
  576 |     // --------------------------------------------------------
  577 |     // CREATE SALARY STRUCTURE
  578 |     // --------------------------------------------------------
  579 | 
  580 |     await openProtectedPage(
  581 |       page,
  582 |       "/salary-structure"
  583 |     );
  584 | 
  585 |     await page.getByRole("button", {
  586 |       name: "+ Add Salary Structure",
  587 |       exact: true,
  588 |     }).click();
  589 | 
  590 |     const salaryEmployee =
  591 |       page.locator(
  592 |         'select[name="employeeId"]'
  593 |       );
  594 | 
  595 |     await salaryEmployee.selectOption({
  596 |       label:
  597 |         `${employee.employeeCode} - ${employee.firstName} ${employee.lastName}`,
  598 |     });
  599 | 
  600 |     await page.locator(
  601 |       'input[name="basicSalary"]'
  602 |     ).fill("20000");
  603 | 
```