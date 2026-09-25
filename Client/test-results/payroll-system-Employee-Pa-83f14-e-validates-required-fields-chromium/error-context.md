# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payroll-system.spec.js >> Employee Payroll System - End to End >> 9 - Salary Structure validates required fields
- Location: tests\payroll-system.spec.js:366:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Add Salary Structure', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e6]:
      - img "Logo" [ref=e8]
      - generic [ref=e9]:
        - heading "ABC PVT.LTD" [level=1] [ref=e10]
        - paragraph [ref=e11]: Management Portal
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: P
        - generic [ref=e15]:
          - paragraph [ref=e16]: Priya Sharma
          - paragraph [ref=e17]: EMP-1002
      - generic [ref=e18]: HR
    - navigation [ref=e20]:
      - paragraph [ref=e21]: Main Menu
      - link "Dashboard" [ref=e22] [cursor=pointer]:
        - /url: /
      - link "Employee Management" [ref=e23] [cursor=pointer]:
        - /url: /employees
      - link "Department Management" [ref=e24] [cursor=pointer]:
        - /url: /departments
      - link "Salary Structure" [ref=e25] [cursor=pointer]:
        - /url: /salary-structure
      - link "Attendance Management" [ref=e26] [cursor=pointer]:
        - /url: /attendance
      - link "Payroll Generation" [ref=e27] [cursor=pointer]:
        - /url: /payroll/generate
      - link "Payroll History" [ref=e28] [cursor=pointer]:
        - /url: /payroll/history
    - generic [ref=e29]:
      - paragraph [ref=e30]: Employee Payroll System
      - paragraph [ref=e31]: Version 1.0
  - generic [ref=e32]:
    - banner [ref=e33]:
      - generic [ref=e34]:
        - generic [ref=e35]:
          - heading "ABC PVT.LTD" [level=2] [ref=e36]
          - paragraph [ref=e37]: Employee Payroll Management - Manage employees, attendance and payroll
        - generic [ref=e38]:
          - button "P Priya Sharma HR" [ref=e39] [cursor=pointer]:
            - generic [ref=e40]: P
            - generic [ref=e41]:
              - paragraph [ref=e42]: Priya Sharma
              - paragraph [ref=e43]: HR
          - button "Logout" [ref=e44] [cursor=pointer]
    - main [ref=e45]:
      - generic [ref=e47]:
        - generic [ref=e48]:
          - generic [ref=e49]:
            - heading "Salary Structure" [level=1] [ref=e50]
            - paragraph [ref=e51]: Manage employee monthly salary components
          - button "+ Add Salary Structure" [active] [ref=e52] [cursor=pointer]
        - generic [ref=e54]:
          - textbox "Search employee..." [ref=e55]
          - paragraph [ref=e56]: 4 salary structure(s)
        - table [ref=e59]:
          - rowgroup [ref=e60]:
            - row [ref=e61]:
              - columnheader "Employee" [ref=e62]
              - columnheader "Basic" [ref=e63]
              - columnheader "HRA" [ref=e64]
              - columnheader "Conveyance" [ref=e65]
              - columnheader "Special" [ref=e66]
              - columnheader "Other" [ref=e67]
              - columnheader "Total" [ref=e68]
              - columnheader "Actions" [ref=e69]
          - rowgroup [ref=e70]:
            - row [ref=e71]:
              - cell [ref=e72]:
                - paragraph [ref=e73]: Rajesh Kanna
                - paragraph [ref=e74]: EMP-1003
              - cell "₹10,000.00" [ref=e75]
              - cell "₹1,500.00" [ref=e76]
              - cell "₹1,000.00" [ref=e77]
              - cell "₹500.00" [ref=e78]
              - cell "₹0.00" [ref=e79]
              - cell "₹13,000.00" [ref=e80]
              - cell [ref=e81]:
                - generic [ref=e82]:
                  - button "Edit" [ref=e83] [cursor=pointer]
                  - button "Delete" [ref=e84] [cursor=pointer]
            - row [ref=e85]:
              - cell [ref=e86]:
                - paragraph [ref=e87]: Priya Sharma
                - paragraph [ref=e88]: EMP-1002
              - cell "₹20,000.00" [ref=e89]
              - cell "₹4,000.00" [ref=e90]
              - cell "₹2,000.00" [ref=e91]
              - cell "₹2,000.00" [ref=e92]
              - cell "₹1,000.00" [ref=e93]
              - cell "₹29,000.00" [ref=e94]
              - cell [ref=e95]:
                - generic [ref=e96]:
                  - button "Edit" [ref=e97] [cursor=pointer]
                  - button "Delete" [ref=e98] [cursor=pointer]
            - row [ref=e99]:
              - cell [ref=e100]:
                - paragraph [ref=e101]: Arjun Mohan
                - paragraph [ref=e102]: EMP-1006
              - cell "₹20,000.00" [ref=e103]
              - cell "₹4,000.00" [ref=e104]
              - cell "₹2,000.00" [ref=e105]
              - cell "₹2,000.00" [ref=e106]
              - cell "₹1,000.00" [ref=e107]
              - cell "₹29,000.00" [ref=e108]
              - cell [ref=e109]:
                - generic [ref=e110]:
                  - button "Edit" [ref=e111] [cursor=pointer]
                  - button "Delete" [ref=e112] [cursor=pointer]
            - row [ref=e113]:
              - cell [ref=e114]:
                - paragraph [ref=e115]: Employee N
                - paragraph [ref=e116]: EMP-1008
              - cell "₹20,000.00" [ref=e117]
              - cell "₹4,000.00" [ref=e118]
              - cell "₹2,000.00" [ref=e119]
              - cell "₹2,000.00" [ref=e120]
              - cell "₹1,000.00" [ref=e121]
              - cell "₹29,000.00" [ref=e122]
              - cell [ref=e123]:
                - generic [ref=e124]:
                  - button "Edit" [ref=e125] [cursor=pointer]
                  - button "Delete" [ref=e126] [cursor=pointer]
        - generic [ref=e128]:
          - generic [ref=e129]:
            - generic [ref=e130]:
              - heading "Add Salary Structure" [level=2] [ref=e131]
              - paragraph [ref=e132]: Define the employee's monthly salary components
            - button "×" [ref=e133] [cursor=pointer]
          - generic [ref=e134]:
            - generic [ref=e135]:
              - generic [ref=e136]: Employee*
              - combobox [ref=e137]:
                - option "Select Employee" [selected]
                - option "EMP-1003 - Rajesh Kanna"
                - option "EMP-1002 - Priya Sharma"
                - option "EMP-1001 - Sanjai N"
                - option "EMP-1005 - Mohan M"
                - option "EMP-1006 - Arjun Mohan"
                - option "EMP-1007 - Guru 2"
                - option "EMP-1008 - Employee N"
            - generic [ref=e138]:
              - generic [ref=e139]:
                - generic [ref=e140]: Quick Salary Template
                - paragraph [ref=e141]: Select a predefined salary structure to automatically fill the salary fields. You can edit every value before saving.
              - combobox [ref=e142]:
                - option "Select salary template" [selected]
                - option "Trainee"
                - option "1 Year Experience"
                - option "2 Years Experience"
                - option "3+ Years Experience"
              - paragraph [ref=e143]: Trainee is shown first. Template values are examples and can be changed before saving.
            - generic [ref=e144]:
              - generic [ref=e145]:
                - generic [ref=e146]: Basic Salary*
                - generic [ref=e147]:
                  - generic [ref=e148]: ₹
                  - spinbutton "0.00" [ref=e149]
              - generic [ref=e150]:
                - generic [ref=e151]: HRA
                - generic [ref=e152]:
                  - generic [ref=e153]: ₹
                  - spinbutton "0.00" [ref=e154]
              - generic [ref=e155]:
                - generic [ref=e156]: Conveyance
                - generic [ref=e157]:
                  - generic [ref=e158]: ₹
                  - spinbutton "0.00" [ref=e159]
              - generic [ref=e160]:
                - generic [ref=e161]: Special Allowance
                - generic [ref=e162]:
                  - generic [ref=e163]: ₹
                  - spinbutton "0.00" [ref=e164]
              - generic [ref=e165]:
                - generic [ref=e166]: Other Allowance
                - generic [ref=e167]:
                  - generic [ref=e168]: ₹
                  - spinbutton "0.00" [ref=e169]
              - generic [ref=e170]:
                - generic [ref=e171]: EPF
                - generic [ref=e172]:
                  - generic [ref=e173]: ₹
                  - spinbutton "0.00" [ref=e174]
              - generic [ref=e175]:
                - generic [ref=e176]: Professional Tax
                - generic [ref=e177]:
                  - generic [ref=e178]: ₹
                  - spinbutton "0.00" [ref=e179]
              - generic [ref=e180]:
                - generic [ref=e181]: TDS
                - generic [ref=e182]:
                  - generic [ref=e183]: ₹
                  - spinbutton "0.00" [ref=e184]
              - generic [ref=e185]:
                - generic [ref=e186]: Other Deductions
                - generic [ref=e187]:
                  - generic [ref=e188]: ₹
                  - spinbutton "0.00" [ref=e189]
            - generic [ref=e191]:
              - generic [ref=e192]: Monthly Salary Structure
              - generic [ref=e193]: ₹0.00
            - generic [ref=e194]:
              - button "Cancel" [ref=e195] [cursor=pointer]
              - button "Save Salary" [ref=e196] [cursor=pointer]
```

# Test source

```ts
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
  307 |       .toBeVisible();
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
> 382 |     }).click();
      |        ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
```