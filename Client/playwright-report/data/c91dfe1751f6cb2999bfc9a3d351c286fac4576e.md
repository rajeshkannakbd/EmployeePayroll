# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payroll-system.spec.js >> Employee Payroll System - End to End >> 4 - Employee form validation works
- Location: tests\payroll-system.spec.js:158:3

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
  - textbox "EMP-1001"
  - text: First Name *
  - textbox "Rajesh"
  - text: Last Name
  - textbox "Kumar"
  - text: Email *
  - textbox "employee@example.com"
  - text: Phone *
  - textbox "9876543210"
  - text: Designation *
  - textbox "Software Developer"
  - text: Joining Date *
  - textbox
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
  81  |   await expect(
  82  |     link,
  83  |     `Expected a navigation link for ${href}`
  84  |   ).toBeVisible();
  85  | 
  86  |   await link.click();
  87  | 
  88  |   await expect(page).toHaveURL(
  89  |     new RegExp(`${href.replace(/\//g, "\\/")}$`)
  90  |   );
  91  | }
  92  | 
  93  | // ============================================================
  94  | // TEST SUITE
  95  | // ============================================================
  96  | 
  97  | test.describe("Employee Payroll System - End to End", () => {
  98  | 
  99  |   // ==========================================================
  100 |   // 1. AUTHENTICATION
  101 |   // ==========================================================
  102 | 
  103 |   test("1 - HR can login successfully", async ({ page }) => {
  104 |     await page.goto(`${FRONTEND_URL}/login`);
  105 | 
  106 |     await page.getByLabel("Login ID").fill("EMP-1002");
  107 | 
  108 |     await page.getByLabel("Password").fill("hr123");
  109 | 
  110 |     await page.getByRole("button", {
  111 |       name: "Sign In",
  112 |       exact: true,
  113 |     }).click();
  114 | 
  115 |     await expect(page).toHaveURL(`${FRONTEND_URL}/`);
  116 |   });
  117 | 
  118 |   test("2 - Invalid login shows an error", async ({ page }) => {
  119 |     await page.goto(`${FRONTEND_URL}/login`);
  120 | 
  121 |     await page.getByLabel("Login ID").fill("EMP-1002");
  122 | 
  123 |     await page.getByLabel("Password").fill("wrong-password");
  124 | 
  125 |     await page.getByRole("button", {
  126 |       name: "Sign In",
  127 |       exact: true,
  128 |     }).click();
  129 | 
  130 |     await expect(
  131 |       page.getByText("Invalid login credentials.")
  132 |     ).toBeVisible();
  133 |   });
  134 | 
  135 |   // ==========================================================
  136 |   // 2. EMPLOYEE MANAGEMENT
  137 |   // ==========================================================
  138 | 
  139 |   test("3 - HR can open Employee Management", async ({ page }) => {
  140 |     await loginAsHR(page);
  141 | 
  142 |     await openProtectedPage(page, "/employees");
  143 | 
  144 |     await expect(
  145 |       page.getByRole("heading", {
  146 |         name: "Employee Management",
  147 |       })
  148 |     ).toBeVisible();
  149 | 
  150 |     await expect(
  151 |       page.getByRole("button", {
  152 |         name: "+ Add Employee",
  153 |         exact: true,
  154 |       })
  155 |     ).toBeVisible();
  156 |   });
  157 | 
  158 |   test("4 - Employee form validation works", async ({ page }) => {
  159 |     await loginAsHR(page);
  160 | 
  161 |     await openProtectedPage(page, "/employees");
  162 | 
  163 |     await page.getByRole("button", {
  164 |       name: "+ Add Employee",
  165 |       exact: true,
  166 |     }).click();
  167 | 
  168 |     await expect(
  169 |       page.getByRole("heading", {
  170 |         name: "Add Employee",
  171 |       })
  172 |     ).toBeVisible();
  173 | 
  174 |     /*
  175 |      * Status should be ACTIVE for new employees
  176 |      * and should not be editable.
  177 |      */
  178 |     const statusField =
  179 |       page.locator('select[name="status"]');
  180 | 
> 181 |     await expect(statusField).toHaveValue("ACTIVE");
      |                               ^ Error: expect(locator).toHaveValue(expected) failed
  182 |     await expect(statusField).toBeDisabled();
  183 | 
  184 |     /*
  185 |      * Test your recent Last Name frontend fix.
  186 |      */
  187 |     const lastNameField =
  188 |       page.locator('input[name="lastName"]');
  189 | 
  190 |     await lastNameField.fill("Tester123");
  191 | 
  192 |     await expect(lastNameField).toHaveValue("Tester");
  193 | 
  194 |     /*
  195 |      * Submit empty form.
  196 |      * Employee Code is the first basic validation.
  197 |      */
  198 |     await page.getByRole("button", {
  199 |       name: "Add Employee",
  200 |       exact: true,
  201 |     }).click();
  202 | 
  203 |     await expect(
  204 |       page.getByText("Employee Code is required.")
  205 |     ).toBeVisible();
  206 |   });
  207 | 
  208 |   // ==========================================================
  209 |   // 3. DEPARTMENT
  210 |   // ==========================================================
  211 | 
  212 |   test("5 - HR can open Department Management", async ({ page }) => {
  213 |     await loginAsHR(page);
  214 | 
  215 |     await openProtectedPage(page, "/departments");
  216 | 
  217 |     await expect(
  218 |       page.getByRole("heading", {
  219 |         name: "Department Management",
  220 |       })
  221 |     ).toBeVisible();
  222 | 
  223 |     await expect(
  224 |       page.getByText("Departments", {
  225 |         exact: true,
  226 |       })
  227 |     ).toBeVisible();
  228 |   });
  229 | 
  230 |   // ==========================================================
  231 |   // 4. ATTENDANCE
  232 |   // ==========================================================
  233 | 
  234 |   test("6 - Attendance page calculates working days automatically", async ({ page }) => {
  235 |     await loginAsHR(page);
  236 | 
  237 |     await openProtectedPage(page, "/attendance");
  238 | 
  239 |     await expect(
  240 |       page.getByRole("heading", {
  241 |         name: "Attendance Management",
  242 |       })
  243 |     ).toBeVisible();
  244 | 
  245 |     await page.getByRole("button", {
  246 |       name: "+ Add Attendance",
  247 |       exact: true,
  248 |     }).click();
  249 | 
  250 |     const payPeriod =
  251 |       page.locator('input[name="payPeriod"]');
  252 | 
  253 |     const workingDays =
  254 |       page.locator('input[name="workingDays"]');
  255 | 
  256 |     /*
  257 |      * Working days is readonly and calculated from month.
  258 |      */
  259 |     await expect(workingDays).toHaveAttribute(
  260 |       "readonly",
  261 |       ""
  262 |     );
  263 | 
  264 |     const workingDaysValue =
  265 |       await workingDays.inputValue();
  266 | 
  267 |     expect(Number(workingDaysValue)).toBeGreaterThan(0);
  268 | 
  269 |     /*
  270 |      * Zero unpaid leave must be allowed.
  271 |      */
  272 |     const unpaidLeave =
  273 |       page.locator('input[name="unpaidLeaveDays"]');
  274 | 
  275 |     await expect(unpaidLeave).toHaveValue("0");
  276 | 
  277 |     await unpaidLeave.fill("0");
  278 | 
  279 |     await expect(
  280 |       page.getByText(
  281 |         "Unpaid leave days must be greater than 0"
```