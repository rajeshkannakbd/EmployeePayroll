# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payroll-system.spec.js >> Employee Payroll System - End to End >> 2 - Invalid login shows an error
- Location: tests\payroll-system.spec.js:118:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Invalid login credentials.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Invalid login credentials.') with timeout 5000ms
  - waiting for getByText('Invalid login credentials.')

```

```yaml
- img "Logo"
- heading "ABC PVT.LTD" [level=1]
- paragraph: Management Portal
- paragraph: EMPLOYEE PAYROLL MANAGEMENT
- heading "Manage your workforce and payroll in one place." [level=2]
- paragraph: Manage employees, salary structures, attendance, payroll processing and payslips through a single system.
- text: Secure employee payroll management system
- heading "Welcome back" [level=2]
- paragraph: Sign in to access your payroll dashboard.
- paragraph: Invalid login credentials
- text: Login ID
- textbox "Login ID":
  - /placeholder: Employee Code, Mobile or Email
  - text: EMP-1002
- paragraph: You can use any one of your registered login identifiers.
- text: Password
- textbox "Password":
  - /placeholder: Enter your password
  - text: wrong-password
- button "Show"
- button "Sign In"
- paragraph: Login access is provided by the system administrator. There is no self-registration.
- paragraph:
  - text: Don't have an account?
  - link "Create Account":
    - /url: /signup
- paragraph: Employee Payroll Management System
```

# Test source

```ts
  32  |     timestamp.slice(-9).padStart(9, "0");
  33  | 
  34  |   const fourDigits =
  35  |     timestamp.slice(-4).padStart(4, "0");
  36  | 
  37  |   return {
  38  |     employeeCode: `PW-${timestamp.slice(-6)}`,
  39  |     firstName: "Playwright",
  40  |     lastName: "Tester",
  41  |     email: `playwright.${timestamp}@example.com`,
  42  |     phone: `9${nineDigits}`,
  43  |     designation: "Software Developer",
  44  |     joiningDate: getCurrentDate(),
  45  |     panNumber: `TESTX${fourDigits}Z`,
  46  |     uanNumber: `100${timestamp.slice(-9)}`,
  47  |     bankAccountNumber: `45${timestamp.slice(-10)}`,
  48  |     ifscCode: "HDFC0001234",
  49  |     employmentType: "FULL_TIME",
  50  |     location: "Trichy",
  51  |   };
  52  | }
  53  | 
  54  | // ============================================================
  55  | // LOGIN HELPERS
  56  | // ============================================================
  57  | 
  58  | async function loginAsHR(page) {
  59  |   await page.goto(`${FRONTEND_URL}/login`);
  60  | 
  61  |   await page.getByLabel("Login ID").fill("EMP-1002");
  62  | 
  63  |   await page.getByLabel("Password").fill("hr123");
  64  | 
  65  |   await page.getByRole("button", {
  66  |     name: "Sign In",
  67  |     exact: true,
  68  |   }).click();
  69  | 
  70  |   await expect(page).toHaveURL(`${FRONTEND_URL}/`);
  71  | }
  72  | 
  73  | /*
  74  |  * Uses the application's navigation instead of page.goto()
  75  |  * for protected routes. This is important for your React
  76  |  * ProtectedRoute/AuthContext setup.
  77  |  */
  78  | async function openProtectedPage(page, href) {
  79  |   const link = page.locator(`a[href="${href}"]`).first();
  80  | 
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
> 132 |     ).toBeVisible();
      |       ^ Error: expect(locator).toBeVisible() failed
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
  181 |     await expect(statusField).toHaveValue("ACTIVE");
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
```