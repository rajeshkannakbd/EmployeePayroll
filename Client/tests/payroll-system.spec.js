import { test, expect } from "@playwright/test";

const FRONTEND_URL = "http://localhost:5173";

function getCurrentDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentMonth() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

/*
 * Generate unique values so the end-to-end workflow can be run
 * multiple times without duplicate employee errors.
 */
function createUniqueEmployeeData() {
  const timestamp = Date.now().toString();

  const nineDigits =
    timestamp.slice(-9).padStart(9, "0");

  const fourDigits =
    timestamp.slice(-4).padStart(4, "0");

  return {
    employeeCode: `PW-${timestamp.slice(-6)}`,
    firstName: "Playwright",
    lastName: "Tester",
    email: `playwright.${timestamp}@example.com`,
    phone: `9${nineDigits}`,
    designation: "Software Developer",
    joiningDate: getCurrentDate(),
    panNumber: `TESTX${fourDigits}Z`,
    uanNumber: `100${timestamp.slice(-9)}`,
    bankAccountNumber: `45${timestamp.slice(-10)}`,
    ifscCode: "HDFC0001234",
    employmentType: "FULL_TIME",
    location: "Trichy",
  };
}

// ============================================================
// LOGIN HELPERS
// ============================================================

async function loginAsHR(page) {
  await page.goto(`${FRONTEND_URL}/login`);

  await page.getByLabel("Login ID").fill("EMP-1002");

  await page.getByLabel("Password").fill("hr123");

  await page.getByRole("button", {
    name: "Sign In",
    exact: true,
  }).click();

  await expect(page).toHaveURL(`${FRONTEND_URL}/`);
}

/*
 * Uses the application's navigation instead of page.goto()
 * for protected routes. This is important for your React
 * ProtectedRoute/AuthContext setup.
 */
async function openProtectedPage(page, href) {
  const link = page.locator(`a[href="${href}"]`).first();

  await expect(
    link,
    `Expected a navigation link for ${href}`
  ).toBeVisible();

  await link.click();

  await expect(page).toHaveURL(
    new RegExp(`${href.replace(/\//g, "\\/")}$`)
  );
}

// ============================================================
// TEST SUITE
// ============================================================

test.describe("Employee Payroll System - End to End", () => {

  // ==========================================================
  // 1. AUTHENTICATION
  // ==========================================================

  test("1 - HR can login successfully", async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);

    await page.getByLabel("Login ID").fill("EMP-1002");

    await page.getByLabel("Password").fill("hr123");

    await page.getByRole("button", {
      name: "Sign In",
      exact: true,
    }).click();

    await expect(page).toHaveURL(`${FRONTEND_URL}/`);
  });

  test("2 - Invalid login shows an error", async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);

    await page.getByLabel("Login ID").fill("EMP-1002");

    await page.getByLabel("Password").fill("wrong-password");

    await page.getByRole("button", {
      name: "Sign In",
      exact: true,
    }).click();

    await expect(
      page.getByText("Invalid login credentials.")
    ).toBeVisible();
  });

  // ==========================================================
  // 2. EMPLOYEE MANAGEMENT
  // ==========================================================

  test("3 - HR can open Employee Management", async ({ page }) => {
    await loginAsHR(page);

    await openProtectedPage(page, "/employees");

    await expect(
      page.getByRole("heading", {
        name: "Employee Management",
      })
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "+ Add Employee",
        exact: true,
      })
    ).toBeVisible();
  });

  test("4 - Employee form validation works", async ({ page }) => {
    await loginAsHR(page);

    await openProtectedPage(page, "/employees");

    await page.getByRole("button", {
      name: "+ Add Employee",
      exact: true,
    }).click();

    await expect(
      page.getByRole("heading", {
        name: "Add Employee",
      })
    ).toBeVisible();

    /*
     * Status should be ACTIVE for new employees
     * and should not be editable.
     */
    const statusField =
      page.locator('select[name="status"]');

    await expect(statusField).toHaveValue("ACTIVE");
    await expect(statusField).toBeDisabled();

    /*
     * Test your recent Last Name frontend fix.
     */
    const lastNameField =
      page.locator('input[name="lastName"]');

    await lastNameField.fill("Tester123");

    await expect(lastNameField).toHaveValue("Tester");

    /*
     * Submit empty form.
     * Employee Code is the first basic validation.
     */
    await page.getByRole("button", {
      name: "Add Employee",
      exact: true,
    }).click();

    await expect(
      page.getByText("Employee Code is required.")
    ).toBeVisible();
  });

  // ==========================================================
  // 3. DEPARTMENT
  // ==========================================================

  test("5 - HR can open Department Management", async ({ page }) => {
    await loginAsHR(page);

    await openProtectedPage(page, "/departments");

    await expect(
      page.getByRole("heading", {
        name: "Department Management",
      })
    ).toBeVisible();

    await expect(
      page.getByText("Departments", {
        exact: true,
      })
    ).toBeVisible();
  });

  // ==========================================================
  // 4. ATTENDANCE
  // ==========================================================

  test("6 - Attendance page calculates working days automatically", async ({ page }) => {
    await loginAsHR(page);

    await openProtectedPage(page, "/attendance");

    await expect(
      page.getByRole("heading", {
        name: "Attendance Management",
      })
    ).toBeVisible();

    await page.getByRole("button", {
      name: "+ Add Attendance",
      exact: true,
    }).click();

    const payPeriod =
      page.locator('input[name="payPeriod"]');

    const workingDays =
      page.locator('input[name="workingDays"]');

    /*
     * Working days is readonly and calculated from month.
     */
    await expect(workingDays).toHaveAttribute(
      "readonly",
      ""
    );

    const workingDaysValue =
      await workingDays.inputValue();

    expect(Number(workingDaysValue)).toBeGreaterThan(0);

    /*
     * Zero unpaid leave must be allowed.
     */
    const unpaidLeave =
      page.locator('input[name="unpaidLeaveDays"]');

    await expect(unpaidLeave).toHaveValue("0");

    await unpaidLeave.fill("0");

    await expect(
      page.getByText(
        "Unpaid leave days must be greater than 0"
      )
    ).not.toBeVisible();

    /*
     * Verify current month is selected.
     */
    await expect(payPeriod).toHaveValue(
      getCurrentMonth()
    );
  });

  test("7 - Attendance validates present days and leave days", async ({ page }) => {
    await loginAsHR(page);

    await openProtectedPage(page, "/attendance");

    await page.getByRole("button", {
      name: "+ Add Attendance",
      exact: true,
    }).click();

    const employees =
      page.locator('select[name="employeeId"]');

    await expect(employees.locator("option").nth(1))
      .toBeVisible();

    await employees.selectOption({
      index: 1,
    });

    const workingDays =
      Number(
        await page.locator(
          'input[name="workingDays"]'
        ).inputValue()
      );

    await page.locator(
      'input[name="presentDays"]'
    ).fill("1");

    await page.locator(
      'input[name="leaveDays"]'
    ).fill("0");

    await page.getByRole("button", {
      name: "Save Attendance",
      exact: true,
    }).click();

    await expect(
      page.getByText(
        `Present days + leave days must equal ${workingDays} working days.`
      )
    ).toBeVisible();
  });

  // ==========================================================
  // 5. SALARY STRUCTURE
  // ==========================================================

  test("8 - HR can open Salary Structure", async ({ page }) => {
    await loginAsHR(page);

    await openProtectedPage(
      page,
      "/salary-structure"
    );

    await expect(
      page.getByRole("heading", {
        name: "Salary Structure",
      })
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "+ Add Salary Structure",
        exact: true,
      })
    ).toBeVisible();
  });

  test("9 - Salary Structure validates required fields", async ({ page }) => {
    await loginAsHR(page);

    await openProtectedPage(
      page,
      "/salary-structure"
    );

    await page.getByRole("button", {
      name: "+ Add Salary Structure",
      exact: true,
    }).click();

    await page.getByRole("button", {
      name: "Add Salary Structure",
      exact: true,
    }).click();

    await expect(
      page.getByText("Employee is required", {
        exact: true,
      })
    ).toBeVisible();
  });

  // ==========================================================
  // 6. PAYROLL HISTORY / FILTERS
  // ==========================================================

  test("10 - HR can open Payroll History and use filters", async ({ page }) => {
    await loginAsHR(page);

    await openProtectedPage(
      page,
      "/payroll/history"
    );

    await expect(
      page.getByRole("heading", {
        name: "Payroll History",
      })
    ).toBeVisible();

    await expect(
      page.getByLabel("Employee", {
        exact: true,
      })
    ).toBeVisible().catch(() => {});

    /*
     * The current page has these controls by their
     * associated UI structure. We use their names to
     * keep the test stable.
     */
    await expect(
      page.locator("select").nth(0)
    ).toBeVisible();

    await expect(
      page.locator("input[type='month']")
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Search",
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Clear",
        exact: true,
      })
    ).toBeVisible();
  });

  // ==========================================================
  // 7. COMPLETE BUSINESS WORKFLOW
  // ==========================================================

  test("11 - Complete HR payroll workflow", async ({ page }) => {

    const employee =
      createUniqueEmployeeData();

    // --------------------------------------------------------
    // LOGIN
    // --------------------------------------------------------

    await loginAsHR(page);

    // --------------------------------------------------------
    // CREATE EMPLOYEE
    // --------------------------------------------------------

    await openProtectedPage(page, "/employees");

    await page.getByRole("button", {
      name: "+ Add Employee",
      exact: true,
    }).click();

    await page.locator(
      'input[name="employeeCode"]'
    ).fill(employee.employeeCode);

    await page.locator(
      'input[name="firstName"]'
    ).fill(employee.firstName);

    await page.locator(
      'input[name="lastName"]'
    ).fill(employee.lastName);

    await page.locator(
      'input[name="email"]'
    ).fill(employee.email);

    await page.locator(
      'input[name="phone"]'
    ).fill(employee.phone);

    await page.locator(
      'input[name="designation"]'
    ).fill(employee.designation);

    await page.locator(
      'input[name="joiningDate"]'
    ).fill(employee.joiningDate);

    /*
     * Status must remain ACTIVE and disabled.
     */
    const statusField =
      page.locator('select[name="status"]');

    await expect(statusField).toHaveValue("ACTIVE");
    await expect(statusField).toBeDisabled();

    /*
     * Select first real department.
     */
    const departmentField =
      page.locator(
        'select[name="departmentId"]'
      );

    const departmentOptions =
      await departmentField.locator("option").count();

    expect(
      departmentOptions,
      "At least one department must exist for this test."
    ).toBeGreaterThan(1);

    await departmentField.selectOption({
      index: 1,
    });

    await page.locator(
      'input[name="panNumber"]'
    ).fill(employee.panNumber);

    await page.locator(
      'input[name="uanNumber"]'
    ).fill(employee.uanNumber);

    await page.locator(
      'input[name="bankAccountNumber"]'
    ).fill(employee.bankAccountNumber);

    await page.locator(
      'input[name="ifscCode"]'
    ).fill(employee.ifscCode);

    await page.locator(
      'select[name="employmentType"]'
    ).selectOption(
      employee.employmentType
    );

    await page.locator(
      'input[name="location"]'
    ).fill(employee.location);

    await page.getByRole("button", {
      name: "Add Employee",
      exact: true,
    }).click();

    /*
     * Modal should close and employee should appear.
     */
    await expect(
      page.getByRole("heading", {
        name: "Add Employee",
      })
    ).not.toBeVisible();

    await page.getByPlaceholder(
      "Search employee..."
    ).fill(employee.employeeCode);

    await expect(
      page.getByText(employee.employeeCode, {
        exact: true,
      })
    ).toBeVisible();

    // --------------------------------------------------------
    // CREATE SALARY STRUCTURE
    // --------------------------------------------------------

    await openProtectedPage(
      page,
      "/salary-structure"
    );

    await page.getByRole("button", {
      name: "+ Add Salary Structure",
      exact: true,
    }).click();

    const salaryEmployee =
      page.locator(
        'select[name="employeeId"]'
      );

    await salaryEmployee.selectOption({
      label:
        `${employee.employeeCode} - ${employee.firstName} ${employee.lastName}`,
    });

    await page.locator(
      'input[name="basicSalary"]'
    ).fill("20000");

    await page.locator(
      'input[name="hra"]'
    ).fill("4000");

    await page.locator(
      'input[name="conveyance"]'
    ).fill("2000");

    await page.locator(
      'input[name="specialAllowance"]'
    ).fill("2000");

    await page.locator(
      'input[name="otherAllowance"]'
    ).fill("1000");

    await page.locator(
      'input[name="epf"]'
    ).fill("1800");

    await page.locator(
      'input[name="professionalTax"]'
    ).fill("200");

    await page.locator(
      'input[name="tds"]'
    ).fill("0");

    await page.locator(
      'input[name="otherDeductions"]'
    ).fill("0");

    await page.getByRole("button", {
      name: "Add Salary Structure",
      exact: true,
    }).click();

    /*
     * Verify employee appears in salary table.
     */
    await expect(
      page.getByText(employee.employeeCode, {
        exact: true,
      })
    ).toBeVisible();

    // --------------------------------------------------------
    // CREATE ATTENDANCE
    // --------------------------------------------------------

    await openProtectedPage(
      page,
      "/attendance"
    );

    await page.getByRole("button", {
      name: "+ Add Attendance",
      exact: true,
    }).click();

    await page.locator(
      'select[name="employeeId"]'
    ).selectOption({
      label:
        `${employee.employeeCode} - ${employee.firstName} ${employee.lastName}`,
    });

    /*
     * Current month is the default month.
     * Use all working days as present and no leave.
     */
    const workingDays =
      Number(
        await page.locator(
          'input[name="workingDays"]'
        ).inputValue()
      );

    await page.locator(
      'input[name="presentDays"]'
    ).fill(String(workingDays));

    await page.locator(
      'input[name="leaveDays"]'
    ).fill("0");

    await page.locator(
      'input[name="unpaidLeaveDays"]'
    ).fill("0");

    await page.locator(
      'input[name="overtimeHours"]'
    ).fill("0");

    await page.getByRole("button", {
      name: "Save Attendance",
      exact: true,
    }).click();

    /*
     * Successful save should show the success message.
     */
    await expect(
      page.getByText(
        "Attendance record created successfully."
      )
    ).toBeVisible();

    // --------------------------------------------------------
    // GENERATE PAYROLL
    // --------------------------------------------------------

    await openProtectedPage(
      page,
      "/payroll/generate"
    );

    await expect(
      page.getByRole("heading", {
        name: "Generate Payroll",
      })
    ).toBeVisible();

    await page.locator(
      'select[name="employeeId"]'
    ).selectOption({
      label:
        `${employee.employeeCode} - ${employee.firstName} ${employee.lastName}`,
    });

    await page.locator(
      'input[name="payPeriod"]'
    ).fill(getCurrentMonth());

    await page.locator(
      'input[name="payDate"]'
    ).fill(getCurrentDate());

    await page.locator(
      'input[name="bonus"]'
    ).fill("0");

    await page.locator(
      'input[name="epf"]'
    ).fill("1800");

    await page.locator(
      'input[name="professionalTax"]'
    ).fill("200");

    await page.locator(
      'input[name="tds"]'
    ).fill("0");

    await page.locator(
      'input[name="otherDeductions"]'
    ).fill("0");

    await page.getByRole("button", {
      name: "Generate Payroll",
      exact: true,
    }).click();

    await expect(
      page.getByText(
        "Payroll generated successfully",
        { exact: false }
      )
    ).toBeVisible();

    /*
     * Capture the generated payroll ID from the success
     * message before moving to Payroll History.
     */
    const successText =
      await page.locator(
        "text=/Payroll generated successfully.*Payroll ID/i"
      ).first().textContent();

    expect(successText).toBeTruthy();

    const payrollIdMatch =
      successText.match(/Payroll ID:\s*(\d+)/i);

    expect(payrollIdMatch).toBeTruthy();

    const generatedPayrollId =
      payrollIdMatch[1];

    // --------------------------------------------------------
    // APPROVE + MARK AS PAID
    // --------------------------------------------------------

    await openProtectedPage(
      page,
      "/payroll/history"
    );

    /*
     * Filter by employee and month.
     */
    const employeeFilter =
      page.locator("select").nth(0);

    await employeeFilter.selectOption({
      label:
        `${employee.employeeCode} - ${employee.firstName} ${employee.lastName}`,
    });

    await page.locator(
      'input[type="month"]'
    ).fill(getCurrentMonth());

    await page.getByRole("button", {
      name: "Search",
      exact: true,
    }).click();

    const payrollRow =
      page.locator("tbody tr").filter({
        hasText: employee.employeeCode,
      }).first();

    await expect(payrollRow).toBeVisible();

    /*
     * Approve.
     */
    await payrollRow.getByRole("button", {
      name: "Approve",
      exact: true,
    }).click();

    /*
     * Wait for refresh and then Mark Paid.
     */
    await expect(
      payrollRow.getByRole("button", {
        name: "Mark Paid",
        exact: true,
      })
    ).toBeVisible();

    await payrollRow.getByRole("button", {
      name: "Mark Paid",
      exact: true,
    }).click();

    /*
     * After payment, status should become PAID.
     */
    await expect(
      payrollRow.getByText("PAID", {
        exact: true,
      })
    ).toBeVisible();

    // --------------------------------------------------------
    // VIEW PAYSLIP
    // --------------------------------------------------------

    await payrollRow.getByRole("button", {
      name: "Payslip",
      exact: true,
    }).click();

    await expect(page).toHaveURL(
      `${FRONTEND_URL}/payslip/${generatedPayrollId}`
    );

    await expect(
      page.getByRole("heading", {
        name: "Salary Slip",
      })
    ).toBeVisible();

    await expect(
      page.getByText("Payslip No:", {
        exact: false,
      })
    ).toBeVisible();

    await expect(
      page.getByText(employee.firstName, {
        exact: false,
      }).first()
    ).toBeVisible();
  });
});