import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { DatabaseSync } from "node:sqlite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Initialize SQLite Database
  const db = new DatabaseSync("employee.db");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS Employee (
      emp_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      designation TEXT NOT NULL,
      daily_salary REAL NOT NULL,
      joining_date TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Attendance (
      attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_id INTEGER,
      attendance_date TEXT,
      status TEXT CHECK(status IN ('Present','Absent')),
      FOREIGN KEY(emp_id) REFERENCES Employee(emp_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS Payroll (
      payroll_id INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_id INTEGER,
      month INTEGER,
      year INTEGER,
      days_present INTEGER,
      gross_salary REAL,
      FOREIGN KEY(emp_id) REFERENCES Employee(emp_id)
    )
  `);

  // Single-process in-memory tracker for payment status to match strict database schema
  const PAID_PAYROLL_IDS = new Set<number>();
  const PAID_PAYROLL_DATES = new Map<number, string>();

  // 2. Seed Initial Employee and Attendance Data if newly created
  const checkEmp = db.prepare("SELECT COUNT(*) as count FROM Employee").get() as { count: number };
  if (checkEmp.count === 0) {
    console.log("Seeding initial high-fidelity employee data...");
    const sampleEmployees = [
      ["John Doe", "Engineering", "Senior Frontend Engineer", 350.0, "2024-01-15"],
      ["Sarah Jenkins", "Human Resources", "HR Director", 450.0, "2023-06-10"],
      ["Michael Chang", "Engineering", "VP of Engineering", 650.0, "2022-11-01"],
      ["Emily Rodriguez", "Marketing", "Brand Specialist", 220.0, "2025-02-20"],
      ["David Kim", "Product", "Senior Product Manager", 400.0, "2024-05-12"],
      ["Sophia Carter", "Sales", "Account Executive", 280.0, "2024-10-05"]
    ];

    const insertStmt = db.prepare(`
      INSERT INTO Employee (name, department, designation, daily_salary, joining_date)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const emp of sampleEmployees) {
      insertStmt.run(emp[0], emp[1], emp[2], emp[3], emp[4]);
    }

    // Seed recent attendance logs for the past 5 days (excluding weekend)
    const recentDays = ["2026-07-09", "2026-07-10", "2026-07-13"];
    const insertAtt = db.prepare(`
      INSERT INTO Attendance (emp_id, attendance_date, status)
      VALUES (?, ?, ?)
    `);

    const employeesList = db.prepare("SELECT emp_id FROM Employee").all() as { emp_id: number }[];

    for (const emp of employeesList) {
      for (const day of recentDays) {
        // Randomize attendance status
        const rand = Math.random();
        let status = "Present";

        if (rand > 0.8) {
          status = "Absent";
        }

        try {
          insertAtt.run(emp.emp_id, day, status);
        } catch (e) {
          // Ignore unique constraint safety
        }
      }
    }
  }

  // ==================== API ENDPOINTS ====================

  // Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", database: "SQLite Sync" });
  });

  // 1. Employee Management CRUD
  app.get("/api/employees", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM Employee ORDER BY emp_id DESC").all() as any[];
      const employees = rows.map(r => ({
        id: r.emp_id,
        name: r.name,
        email: `${r.name.toLowerCase().replace(/[^a-z]/g, "")}@company.com`,
        phone: "+1 555-0100",
        department: r.department,
        designation: r.designation,
        joining_date: r.joining_date,
        salary: Math.round(r.daily_salary * 30 * 100) / 100,
        status: "Active"
      }));
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/employees", (req, res) => {
    const { name, department, designation, joining_date, salary } = req.body;
    if (!name || !department || !designation || !joining_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const insert = db.prepare(`
        INSERT INTO Employee (name, department, designation, daily_salary, joining_date)
        VALUES (?, ?, ?, ?, ?)
      `);
      const daily_salary = (parseFloat(salary) || 0) / 30.0;
      const result = insert.run(
        name,
        department,
        designation,
        Math.round(daily_salary * 100) / 100,
        joining_date
      );
      res.status(201).json({ message: "Employee added successfully", id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/employees/:id", (req, res) => {
    const { id } = req.params;
    const { name, department, designation, joining_date, salary } = req.body;
    try {
      const update = db.prepare(`
        UPDATE Employee
        SET name = ?, department = ?, designation = ?, daily_salary = ?, joining_date = ?
        WHERE emp_id = ?
      `);
      const daily_salary = (parseFloat(salary) || 0) / 30.0;
      update.run(
        name,
        department,
        designation,
        Math.round(daily_salary * 100) / 100,
        joining_date,
        parseInt(id)
      );
      res.json({ message: "Employee updated successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/employees/:id", (req, res) => {
    const { id } = req.params;
    try {
      const del = db.prepare("DELETE FROM Employee WHERE emp_id = ?");
      del.run(parseInt(id));
      res.json({ message: "Employee deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Attendance Management
  app.get("/api/attendance", (req, res) => {
    const { date } = req.query;
    try {
      let queryStr = `
        SELECT a.attendance_id, a.emp_id, e.name as employee_name, e.department, a.attendance_date, a.status
        FROM Attendance a
        JOIN Employee e ON a.emp_id = e.emp_id
      `;
      let rows: any[];
      if (date) {
        queryStr += " WHERE a.attendance_date = ? ORDER BY e.name ASC";
        rows = db.prepare(queryStr).all(date as string) as any[];
      } else {
        queryStr += " ORDER BY a.attendance_date DESC, e.name ASC";
        rows = db.prepare(queryStr).all() as any[];
      }

      const mapped = rows.map(r => {
        const isPresent = r.status === "Present";
        return {
          id: r.attendance_id,
          employee_id: r.emp_id,
          employee_name: r.employee_name,
          department: r.department,
          date: r.attendance_date,
          status: r.status,
          check_in: isPresent ? "09:00" : "",
          check_out: isPresent ? "17:00" : ""
        };
      });
      res.json(mapped);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/attendance", (req, res) => {
    const { employee_id, date, status } = req.body;
    if (!employee_id || !date || !status) {
      return res.status(400).json({ error: "Missing employee_id, date, or status" });
    }
    // Map status to CHECK constraints
    const status_mapped = status === "Present" || status === "Late" ? "Present" : "Absent";
    try {
      // Find if exists
      const existing = db.prepare("SELECT attendance_id FROM Attendance WHERE emp_id = ? AND attendance_date = ?").get(parseInt(employee_id), date) as any;
      if (existing) {
        const update = db.prepare("UPDATE Attendance SET status = ? WHERE attendance_id = ?");
        update.run(status_mapped, existing.attendance_id);
      } else {
        const insert = db.prepare("INSERT INTO Attendance (emp_id, attendance_date, status) VALUES (?, ?, ?)");
        insert.run(parseInt(employee_id), date, status_mapped);
      }
      res.json({ message: "Attendance marked successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Payroll Management
  app.get("/api/payroll", (req, res) => {
    const { month } = req.query;
    try {
      let queryStr = `
        SELECT p.payroll_id, p.emp_id, e.name as employee_name, e.department, e.designation, p.month, p.year, p.days_present, p.gross_salary, e.daily_salary
        FROM Payroll p
        JOIN Employee e ON p.emp_id = e.emp_id
      `;
      let rows: any[];
      if (month && typeof month === "string" && month.includes("-")) {
        const parts = month.split("-");
        const yVal = parseInt(parts[0]);
        const mVal = parseInt(parts[1]);
        queryStr += " WHERE p.month = ? AND p.year = ? ORDER BY e.name ASC";
        rows = db.prepare(queryStr).all(mVal, yVal) as any[];
      } else {
        queryStr += " ORDER BY p.year DESC, p.month DESC, e.name ASC";
        rows = db.prepare(queryStr).all() as any[];
      }

      const mapped = rows.map(r => {
        const pId = r.payroll_id;
        const base_sal = Math.round(r.daily_salary * 30 * 100) / 100;
        const gross = r.gross_salary;
        const allowances = Math.round(gross * 0.1 * 100) / 100;
        const deductions = Math.max(0, Math.round((base_sal - gross) * 100) / 100);
        return {
          id: pId,
          employee_id: r.emp_id,
          employee_name: r.employee_name,
          department: r.department,
          designation: r.designation,
          month: `${r.year}-${String(r.month).padStart(2, "0")}`,
          base_salary: base_sal,
          allowances: allowances,
          deductions: deductions,
          net_salary: gross,
          status: PAID_PAYROLL_IDS.has(pId) ? "Paid" : "Unpaid",
          payment_date: PAID_PAYROLL_DATES.get(pId) || ""
        };
      });

      res.json(mapped);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payroll/generate", (req, res) => {
    const { month } = req.body;
    if (!month || typeof month !== "string" || !month.includes("-")) {
      return res.status(400).json({ error: "Missing or invalid month" });
    }
    try {
      const parts = month.split("-");
      const yVal = parseInt(parts[0]);
      const mVal = parseInt(parts[1]);

      const employees = db.prepare("SELECT emp_id, name, daily_salary FROM Employee").all() as any[];
      let count = 0;

      const checkPresent = db.prepare(`
        SELECT COUNT(*) as present_days 
        FROM Attendance 
        WHERE emp_id = ? AND status = 'Present' AND attendance_date LIKE ?
      `);

      for (const emp of employees) {
        // Look up actual attendance log
        const presentRes = checkPresent.get(emp.emp_id, `${month}%`) as { present_days: number };
        const days_present = presentRes ? presentRes.present_days : 0;

        // Formula: gross_salary = daily_salary * days_present
        const gross_salary = Math.round((emp.daily_salary * days_present) * 100) / 100;

        // Check if payroll item exists
        const existing = db.prepare("SELECT payroll_id FROM Payroll WHERE emp_id = ? AND month = ? AND year = ?").get(emp.emp_id, mVal, yVal) as any;
        if (existing) {
          const update = db.prepare("UPDATE Payroll SET days_present = ?, gross_salary = ? WHERE payroll_id = ?");
          update.run(days_present, gross_salary, existing.payroll_id);
        } else {
          const insert = db.prepare("INSERT INTO Payroll (emp_id, month, year, days_present, gross_salary) VALUES (?, ?, ?, ?, ?)");
          insert.run(emp.emp_id, mVal, yVal, days_present, gross_salary);
        }
        count++;
      }

      res.status(201).json({ message: `Generated payroll logs for ${count} active employees for ${month}.`, generated_count: count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payroll/:id/pay", (req, res) => {
    const { id } = req.params;
    const { payment_date } = req.body;
    try {
      const pId = parseInt(id);
      PAID_PAYROLL_IDS.add(pId);
      PAID_PAYROLL_DATES.set(pId, payment_date || new Date().toISOString().split("T")[0]);
      res.json({ message: "Payroll item paid successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Analytical Reports Endpoints
  
  // Attendance Percentage Report: Overall attendance rate (%) per employee
  app.get("/api/reports/attendance", (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT 
          e.emp_id, 
          e.name, 
          e.department,
          COUNT(a.attendance_id) as total_days,
          SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as active_days
        FROM Employee e
        LEFT JOIN Attendance a ON e.emp_id = a.emp_id
        GROUP BY e.emp_id
      `).all() as any[];

      const report = rows.map(r => {
        const total = r.total_days;
        const active = r.active_days || 0;
        const percentage = total > 0 ? Math.round((active / total * 100.0) * 10) / 10 : 100.0;
        return {
          id: r.emp_id,
          name: r.name,
          department: r.department,
          total_days: total,
          attended_days: active,
          percentage: percentage
        };
      });

      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Highest Paid Employee Report
  app.get("/api/reports/highest-paid", (req, res) => {
    try {
      const topPaidRows = db.prepare(`
        SELECT emp_id, name, department, designation, daily_salary
        FROM Employee
        ORDER BY daily_salary DESC
        LIMIT 10
      `).all() as any[];
      const topPaid = topPaidRows.map(r => ({
        id: r.emp_id,
        name: r.name,
        department: r.department,
        designation: r.designation,
        salary: Math.round(r.daily_salary * 30 * 100) / 100
      }));
      res.json(topPaid);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Department Summary Report
  app.get("/api/reports/departments", (req, res) => {
    try {
      const summary = db.prepare(`
        SELECT 
          department,
          COUNT(emp_id) as headcount,
          SUM(daily_salary * 30) as total_salary,
          AVG(daily_salary * 30) as avg_salary
        FROM Employee
        GROUP BY department
      `).all() as any[];

      const report = summary.map(s => ({
        department: s.department,
        headcount: s.headcount,
        total_salary: Math.round((s.total_salary || 0) * 100) / 100,
        avg_salary: Math.round((s.avg_salary || 0) * 100) / 100
      }));

      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // =======================================================

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

startServer();
