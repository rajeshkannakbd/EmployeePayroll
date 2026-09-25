# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payroll-system.spec.js >> Employee Payroll System - End to End >> 7 - Attendance validates present days and leave days
- Location: tests\payroll-system.spec.js:293:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('select[name="employeeId"]').locator('option').nth(1)
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" locator('select[name="employeeId"]').locator('option').nth(1) with timeout 5000ms
  - waiting for locator('select[name="employeeId"]').locator('option').nth(1)
    13 × locator resolved to <option value="1">EMP-1003 - Rajesh Kanna</option>
       - unexpected value "hidden"

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
  - heading "Attendance Management" [level=1]
  - paragraph: Manage employee attendance, leave and overtime
  - button "+ Add Attendance"
  - text: Search
  - textbox "Employee, code or designation..."
  - text: Attendance Month
  - combobox:
    - option "All Months" [selected]
    - option "September 2026"
    - option "August 2026"
    - option "July 2026"
    - option "June 2026"
  - text: Employee
  - combobox:
    - option "All Employees" [selected]
    - option "EMP-1001 - Sanjai N"
    - option "EMP-1002 - Priya Sharma"
    - option "EMP-1003 - Rajesh Kanna"
    - option "EMP-1005 - Mohan M"
    - option "EMP-1006 - Arjun Mohan"
    - option "EMP-1007 - Guru 2"
    - option "EMP-1008 - Employee N"
  - text: Sort By
  - combobox:
    - option "Newest Month" [selected]
    - option "Oldest Month"
    - option "Employee Code A-Z"
    - option "Employee Code Z-A"
    - option "Highest Attendance"
    - option "Lowest Attendance"
    - option "Highest Overtime"
    - option "Most Unpaid Leave"
  - paragraph: Showing 11 matching records • All Months
  - button "Reset Filters"
  - paragraph: Employees
  - paragraph: "5"
  - paragraph: Employees in current result
  - paragraph: Avg Attendance
  - paragraph: 74.4%
  - paragraph: Average of displayed records
  - paragraph: Unpaid Leave
  - paragraph: "10"
  - paragraph: Total days in current result
  - paragraph: Overtime
  - paragraph: "36.5"
  - paragraph: Total hours in current result
  - table:
    - rowgroup:
      - row "Employee Attendance Month Working Present Leave Unpaid Leave Overtime Attendance Action":
        - columnheader "Employee"
        - columnheader "Attendance Month"
        - columnheader "Working"
        - columnheader "Present"
        - columnheader "Leave"
        - columnheader "Unpaid Leave"
        - columnheader "Overtime"
        - columnheader "Attendance"
        - columnheader "Action"
    - rowgroup:
      - row "Sanjai N EMP-1001 • Sales Executive September 2026 2026-09 20 12 1 2 0 hrs 60.0% 12/20 View":
        - cell "Sanjai N EMP-1001 • Sales Executive":
          - paragraph: Sanjai N
          - paragraph: EMP-1001 • Sales Executive
        - cell "September 2026 2026-09":
          - paragraph: September 2026
          - paragraph: 2026-09
        - cell "20"
        - cell "12"
        - cell "1"
        - cell "2"
        - cell "0 hrs"
        - cell "60.0% 12/20"
        - cell "View":
          - button "View"
      - row "Priya Sharma EMP-1002 • HR Executive September 2026 2026-09 22 21 1 1 8 hrs 95.5% 21/22 View":
        - cell "Priya Sharma EMP-1002 • HR Executive":
          - paragraph: Priya Sharma
          - paragraph: EMP-1002 • HR Executive
        - cell "September 2026 2026-09":
          - paragraph: September 2026
          - paragraph: 2026-09
        - cell "22"
        - cell "21"
        - cell "1"
        - cell "1"
        - cell "8 hrs"
        - cell "95.5% 21/22"
        - cell "View":
          - button "View"
      - row "Rajesh Kanna EMP-1003 • DEVELOPER September 2026 2026-09 23 2 1 1 2 hrs 8.7% 2/23 View":
        - cell "Rajesh Kanna EMP-1003 • DEVELOPER":
          - paragraph: Rajesh Kanna
          - paragraph: EMP-1003 • DEVELOPER
        - cell "September 2026 2026-09":
          - paragraph: September 2026
          - paragraph: 2026-09
        - cell "23"
        - cell "2"
        - cell "1"
        - cell "1"
        - cell "2 hrs"
        - cell "8.7% 2/23"
        - cell "View":
          - button "View"
      - row "Mohan M EMP-1005 • Software Engineer September 2026 2026-09 26 24 2 1 1 hrs 92.3% 24/26 View":
        - cell "Mohan M EMP-1005 • Software Engineer":
          - paragraph: Mohan M
          - paragraph: EMP-1005 • Software Engineer
        - cell "September 2026 2026-09":
          - paragraph: September 2026
          - paragraph: 2026-09
        - cell "26"
        - cell "24"
        - cell "2"
        - cell "1"
        - cell "1 hrs"
        - cell "92.3% 24/26"
        - cell "View":
          - button "View"
      - row "Arjun Mohan EMP-1006 • Senior Software Developer September 2026 2026-09 26 24 2 1 12 hrs 92.3% 24/26 View":
        - cell "Arjun Mohan EMP-1006 • Senior Software Developer":
          - paragraph: Arjun Mohan
          - paragraph: EMP-1006 • Senior Software Developer
        - cell "September 2026 2026-09":
          - paragraph: September 2026
          - paragraph: 2026-09
        - cell "26"
        - cell "24"
        - cell "2"
        - cell "1"
        - cell "12 hrs"
        - cell "92.3% 24/26"
        - cell "View":
          - button "View"
      - row "Sanjai N EMP-1001 • Sales Executive August 2026 2026-08 34 30 4 2 12.5 hrs 88.2% 30/34 View":
        - cell "Sanjai N EMP-1001 • Sales Executive":
          - paragraph: Sanjai N
          - paragraph: EMP-1001 • Sales Executive
        - cell "August 2026 2026-08":
          - paragraph: August 2026
          - paragraph: 2026-08
        - cell "34"
        - cell "30"
        - cell "4"
        - cell "2"
        - cell "12.5 hrs"
        - cell "88.2% 30/34"
        - cell "View":
          - button "View"
      - row "Rajesh Kanna EMP-1003 • DEVELOPER August 2026 2026-08 26 24 2 1 0 hrs 92.3% 24/26 View":
        - cell "Rajesh Kanna EMP-1003 • DEVELOPER":
          - paragraph: Rajesh Kanna
          - paragraph: EMP-1003 • DEVELOPER
        - cell "August 2026 2026-08":
          - paragraph: August 2026
          - paragraph: 2026-08
        - cell "26"
        - cell "24"
        - cell "2"
        - cell "1"
        - cell "0 hrs"
        - cell "92.3% 24/26"
        - cell "View":
          - button "View"
      - row "Mohan M EMP-1005 • Software Engineer August 2026 2026-08 22 1 1 1 1 hrs 4.5% 1/22 View":
        - cell "Mohan M EMP-1005 • Software Engineer":
          - paragraph: Mohan M
          - paragraph: EMP-1005 • Software Engineer
        - cell "August 2026 2026-08":
          - paragraph: August 2026
          - paragraph: 2026-08
        - cell "22"
        - cell "1"
        - cell "1"
        - cell "1"
        - cell "1 hrs"
        - cell "4.5% 1/22"
        - cell "View":
          - button "View"
      - row "Arjun Mohan EMP-1006 • Senior Software Developer August 2026 2026-08 26 24 2 0 0 hrs 92.3% 24/26 View":
        - cell "Arjun Mohan EMP-1006 • Senior Software Developer":
          - paragraph: Arjun Mohan
          - paragraph: EMP-1006 • Senior Software Developer
        - cell "August 2026 2026-08":
          - paragraph: August 2026
          - paragraph: 2026-08
        - cell "26"
        - cell "24"
        - cell "2"
        - cell "0"
        - cell "0 hrs"
        - cell "92.3% 24/26"
        - cell "View":
          - button "View"
      - row "Rajesh Kanna EMP-1003 • DEVELOPER July 2026 2026-07 27 27 0 0 0 hrs 100.0% 27/27 View":
        - cell "Rajesh Kanna EMP-1003 • DEVELOPER":
          - paragraph: Rajesh Kanna
          - paragraph: EMP-1003 • DEVELOPER
        - cell "July 2026 2026-07":
          - paragraph: July 2026
          - paragraph: 2026-07
        - cell "27"
        - cell "27"
        - cell "0"
        - cell "0"
        - cell "0 hrs"
        - cell "100.0% 27/27"
        - cell "View":
          - button "View"
  - text: Rows per page
  - combobox:
    - option "10" [selected]
    - option "25"
    - option "50"
  - text: 1-10 of 11
  - button "Previous" [disabled]
  - button "1"
  - button "2"
  - button "Next"
  - heading "Add Attendance" [level=2]
  - paragraph: Record monthly attendance for an employee
  - button "×"
  - text: Employee *
  - combobox:
    - option "Select Employee" [selected]
    - option "EMP-1003 - Rajesh Kanna"
    - option "EMP-1002 - Priya Sharma"
    - option "EMP-1001 - Sanjai N"
    - option "EMP-1005 - Mohan M"
    - option "EMP-1006 - Arjun Mohan"
    - option "EMP-1007 - Guru 2"
    - option "EMP-1008 - Employee N"
  - text: Attendance Month *
  - textbox: 2026-09
  - paragraph: "Format: YYYY-MM"
  - text: Working Days
  - spinbutton: "26"
  - paragraph: Automatically calculated from the selected month, excluding Sundays.
  - text: Present Days *
  - spinbutton "24"
  - text: Leave Days *
  - spinbutton "2"
  - text: Unpaid Leave Days *
  - spinbutton "0"
  - paragraph: Use 0 when there is no unpaid leave. Used for payroll deduction.
  - text: Overtime Hours
  - spinbutton "10": "0"
  - paragraph: Payroll calculates overtime amount
  - button "Close"
  - button "Save Attendance"
```

# Test source

```ts
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
  282 |       )
  283 |     ).not.toBeVisible();
  284 | 
  285 |     /*
  286 |      * Verify current month is selected.
  287 |      */
  288 |     await expect(payPeriod).toHaveValue(
  289 |       getCurrentMonth()
  290 |     );
  291 |   });
  292 | 
  293 |   test("7 - Attendance validates present days and leave days", async ({ page }) => {
  294 |     await loginAsHR(page);
  295 | 
  296 |     await openProtectedPage(page, "/attendance");
  297 | 
  298 |     await page.getByRole("button", {
  299 |       name: "+ Add Attendance",
  300 |       exact: true,
  301 |     }).click();
  302 | 
  303 |     const employees =
  304 |       page.locator('select[name="employeeId"]');
  305 | 
  306 |     await expect(employees.locator("option").nth(1))
> 307 |       .toBeVisible();
      |        ^ Error: expect(locator).toBeVisible() failed
  308 | 
  309 |     await employees.selectOption({
  310 |       index: 1,
  311 |     });
  312 | 
  313 |     const workingDays =
  314 |       Number(
  315 |         await page.locator(
  316 |           'input[name="workingDays"]'
  317 |         ).inputValue()
  318 |       );
  319 | 
  320 |     await page.locator(
  321 |       'input[name="presentDays"]'
  322 |     ).fill("1");
  323 | 
  324 |     await page.locator(
  325 |       'input[name="leaveDays"]'
  326 |     ).fill("0");
  327 | 
  328 |     await page.getByRole("button", {
  329 |       name: "Save Attendance",
  330 |       exact: true,
  331 |     }).click();
  332 | 
  333 |     await expect(
  334 |       page.getByText(
  335 |         `Present days + leave days must equal ${workingDays} working days.`
  336 |       )
  337 |     ).toBeVisible();
  338 |   });
  339 | 
  340 |   // ==========================================================
  341 |   // 5. SALARY STRUCTURE
  342 |   // ==========================================================
  343 | 
  344 |   test("8 - HR can open Salary Structure", async ({ page }) => {
  345 |     await loginAsHR(page);
  346 | 
  347 |     await openProtectedPage(
  348 |       page,
  349 |       "/salary-structure"
  350 |     );
  351 | 
  352 |     await expect(
  353 |       page.getByRole("heading", {
  354 |         name: "Salary Structure",
  355 |       })
  356 |     ).toBeVisible();
  357 | 
  358 |     await expect(
  359 |       page.getByRole("button", {
  360 |         name: "+ Add Salary Structure",
  361 |         exact: true,
  362 |       })
  363 |     ).toBeVisible();
  364 |   });
  365 | 
  366 |   test("9 - Salary Structure validates required fields", async ({ page }) => {
  367 |     await loginAsHR(page);
  368 | 
  369 |     await openProtectedPage(
  370 |       page,
  371 |       "/salary-structure"
  372 |     );
  373 | 
  374 |     await page.getByRole("button", {
  375 |       name: "+ Add Salary Structure",
  376 |       exact: true,
  377 |     }).click();
  378 | 
  379 |     await page.getByRole("button", {
  380 |       name: "Add Salary Structure",
  381 |       exact: true,
  382 |     }).click();
  383 | 
  384 |     await expect(
  385 |       page.getByText("Employee is required", {
  386 |         exact: true,
  387 |       })
  388 |     ).toBeVisible();
  389 |   });
  390 | 
  391 |   // ==========================================================
  392 |   // 6. PAYROLL HISTORY / FILTERS
  393 |   // ==========================================================
  394 | 
  395 |   test("10 - HR can open Payroll History and use filters", async ({ page }) => {
  396 |     await loginAsHR(page);
  397 | 
  398 |     await openProtectedPage(
  399 |       page,
  400 |       "/payroll/history"
  401 |     );
  402 | 
  403 |     await expect(
  404 |       page.getByRole("heading", {
  405 |         name: "Payroll History",
  406 |       })
  407 |     ).toBeVisible();
```