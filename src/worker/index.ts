import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get("/api/", (c) => c.json({ 
  name: "Loan Management API", 
  version: "1.0.0",
  status: "operational" 
}));

// ===== CLIENT MANAGEMENT ENDPOINTS =====

// GET /api/clients - List all clients (with optional branch filter)
app.get("/api/clients", async (c) => {
  try {
    const branchId = c.req.query('branch_id');
    
    let query = `
      SELECT 
        client_id,
        branch_id,
        national_id,
        first_name,
        khmer_last_name,
        latin_last_name,
        sex,
        date_of_birth,
        primary_phone,
        alt_phone,
        email,
        village_commune_district_province,
        created_at,
        updated_at
      FROM client_kyc
    `;
    
    const params: any[] = [];
    
    if (branchId) {
      query += ` WHERE branch_id = ?`;
      params.push(branchId);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json(results);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return c.json({ error: 'Failed to fetch clients' }, 500);
  }
});

// GET /api/clients/:id - Get a specific client
app.get("/api/clients/:id", async (c) => {
  try {
    const clientId = c.req.param('id');
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        client_id,
        branch_id,
        national_id,
        first_name,
        khmer_last_name,
        latin_last_name,
        sex,
        date_of_birth,
        primary_phone,
        alt_phone,
        email,
        village_commune_district_province,
        created_at,
        updated_at
      FROM client_kyc 
      WHERE client_id = ?
    `).bind(clientId).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Client not found' }, 404);
    }
    
    return c.json(results[0]);
  } catch (error) {
    console.error('Error fetching client:', error);
    return c.json({ error: 'Failed to fetch client' }, 500);
  }
});

// POST /api/clients - Create a new client
app.post("/api/clients", async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['branch_id', 'national_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({ error: `Missing required field: ${field}` }, 400);
      }
    }
    
    // Check if national_id already exists
    const { results: existingClient } = await c.env.DB.prepare(`
      SELECT client_id FROM client_kyc WHERE national_id = ?
    `).bind(body.national_id).all();
    
    if (existingClient.length > 0) {
      return c.json({ error: 'Client with this national ID already exists' }, 409);
    }
    
    const now = new Date().toISOString();
    
    // Insert new client
    const { meta } = await c.env.DB.prepare(`
      INSERT INTO client_kyc (
        branch_id,
        national_id,
        first_name,
        khmer_last_name,
        latin_last_name,
        sex,
        date_of_birth,
        primary_phone,
        alt_phone,
        email,
        village_commune_district_province,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.branch_id,
      body.national_id,
      body.first_name || null,
      body.khmer_last_name || null,
      body.latin_last_name || null,
      body.sex || null,
      body.date_of_birth || null,
      body.primary_phone || null,
      body.alt_phone || null,
      body.email || null,
      body.village_commune_district_province || null,
      now,
      now
    ).run();
    
    // Fetch the created client
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM client_kyc WHERE client_id = ?
    `).bind(meta.last_row_id).all();
    
    return c.json(results[0], 201);
  } catch (error) {
    console.error('Error creating client:', error);
    return c.json({ error: 'Failed to create client' }, 500);
  }
});

// PUT /api/clients/:id - Update a client
app.put("/api/clients/:id", async (c) => {
  try {
    const clientId = c.req.param('id');
    const body = await c.req.json();
    
    // Check if client exists
    const { results: existingClient } = await c.env.DB.prepare(`
      SELECT client_id FROM client_kyc WHERE client_id = ?
    `).bind(clientId).all();
    
    if (existingClient.length === 0) {
      return c.json({ error: 'Client not found' }, 404);
    }
    
    // Build dynamic update query
    const updateFields = [];
    const params = [];
    
    const allowedFields = [
      'first_name', 'khmer_last_name', 'latin_last_name', 'sex', 
      'date_of_birth', 'primary_phone', 'alt_phone', 'email', 
      'village_commune_district_province'
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(body[field]);
      }
    }
    
    if (updateFields.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    // Add updated_at
    updateFields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(clientId);
    
    await c.env.DB.prepare(`
      UPDATE client_kyc 
      SET ${updateFields.join(', ')} 
      WHERE client_id = ?
    `).bind(...params).run();
    
    // Fetch updated client
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM client_kyc WHERE client_id = ?
    `).bind(clientId).all();
    
    return c.json(results[0]);
  } catch (error) {
    console.error('Error updating client:', error);
    return c.json({ error: 'Failed to update client' }, 500);
  }
});

// DELETE /api/clients/:id - Delete a client
app.delete("/api/clients/:id", async (c) => {
  try {
    const clientId = c.req.param('id');
    
    // Check if client exists
    const { results: existingClient } = await c.env.DB.prepare(`
      SELECT client_id FROM client_kyc WHERE client_id = ?
    `).bind(clientId).all();
    
    if (existingClient.length === 0) {
      return c.json({ error: 'Client not found' }, 404);
    }
    
    // Check if client has active loans
    const { results: activeLoans } = await c.env.DB.prepare(`
      SELECT loan_id FROM loan_account WHERE app_id IN (
        SELECT app_id FROM loan_application WHERE client_id = ?
      ) AND account_state = 'active'
    `).bind(clientId).all();
    
    if (activeLoans.length > 0) {
      return c.json({ 
        error: 'Cannot delete client with active loans',
        activeLoans: activeLoans.length 
      }, 409);
    }
    
    await c.env.DB.prepare(`
      DELETE FROM client_kyc WHERE client_id = ?
    `).bind(clientId).run();
    
    return c.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return c.json({ error: 'Failed to delete client' }, 500);
  }
});

// GET /api/clients/:id/socio-eco - Get client socio-economic data
app.get("/api/clients/:id/socio-eco", async (c) => {
  try {
    const clientId = c.req.param('id');
    
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM client_socio_eco WHERE client_id = ?
    `).bind(clientId).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Socio-economic data not found' }, 404);
    }
    
    return c.json(results[0]);
  } catch (error) {
    console.error('Error fetching socio-economic data:', error);
    return c.json({ error: 'Failed to fetch socio-economic data' }, 500);
  }
});

// PUT /api/clients/:id/socio-eco - Update client socio-economic data
app.put("/api/clients/:id/socio-eco", async (c) => {
  try {
    const clientId = c.req.param('id');
    const body = await c.req.json();
    
    // Check if client exists
    const { results: existingClient } = await c.env.DB.prepare(`
      SELECT client_id FROM client_kyc WHERE client_id = ?
    `).bind(clientId).all();
    
    if (existingClient.length === 0) {
      return c.json({ error: 'Client not found' }, 404);
    }
    
    // Check if socio-eco record exists
    const { results: existingSocioEco } = await c.env.DB.prepare(`
      SELECT client_id FROM client_socio_eco WHERE client_id = ?
    `).bind(clientId).all();
    
    if (existingSocioEco.length === 0) {
      // Insert new record
      await c.env.DB.prepare(`
        INSERT INTO client_socio_eco (
          client_id, occupation, employer_name, monthly_income_usd,
          household_size, education_level, cbc_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        clientId,
        body.occupation || null,
        body.employer_name || null,
        body.monthly_income_usd || null,
        body.household_size || null,
        body.education_level || null,
        body.cbc_score || null
      ).run();
    } else {
      // Update existing record
      const updateFields = [];
      const params = [];
      
      const allowedFields = [
        'occupation', 'employer_name', 'monthly_income_usd',
        'household_size', 'education_level', 'cbc_score'
      ];
      
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          params.push(body[field]);
        }
      }
      
      if (updateFields.length > 0) {
        params.push(clientId);
        await c.env.DB.prepare(`
          UPDATE client_socio_eco 
          SET ${updateFields.join(', ')} 
          WHERE client_id = ?
        `).bind(...params).run();
      }
    }
    
    // Fetch updated data
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM client_socio_eco WHERE client_id = ?
    `).bind(clientId).all();
    
    return c.json(results[0]);
  } catch (error) {
    console.error('Error updating socio-economic data:', error);
    return c.json({ error: 'Failed to update socio-economic data' }, 500);
  }
});

// LOAN APPLICATION ENDPOINTS

// GET /api/loan-products - Get all loan products
app.get("/api/loan-products", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM loan_products ORDER BY product_name
    `).all();
    
    return c.json(results);
  } catch (error) {
    console.error('Error fetching loan products:', error);
    return c.json({ error: 'Failed to fetch loan products' }, 500);
  }
});

// GET /api/loan-applications - Get all loan applications with optional filters
app.get("/api/loan-applications", async (c) => {
  try {
    const branchId = c.req.query('branch_id');
    const status = c.req.query('status');
    
    let query = `
      SELECT 
        la.*,
        ck.first_name,
        ck.khmer_last_name,
        ck.latin_last_name,
        ck.national_id,
        lp.product_name,
        lp.currency
      FROM loan_application la
      JOIN client_kyc ck ON la.client_id = ck.client_id
      JOIN loan_products lp ON la.product_id = lp.product_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branchId) {
      query += ` AND la.branch_id = ?`;
      params.push(branchId);
    }
    
    if (status) {
      query += ` AND la.application_status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY la.created_at DESC`;
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    return c.json({ error: 'Failed to fetch loan applications' }, 500);
  }
});

// GET /api/loan-applications/:id - Get a specific loan application
app.get("/api/loan-applications/:id", async (c) => {
  try {
    const appId = c.req.param('id');
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        la.*,
        ck.first_name,
        ck.khmer_last_name,
        ck.latin_last_name,
        ck.national_id,
        ck.primary_phone,
        lp.product_name,
        lp.currency,
        lp.interest_rate_pa,
        lp.min_term,
        lp.max_term
      FROM loan_application la
      JOIN client_kyc ck ON la.client_id = ck.client_id
      JOIN loan_products lp ON la.product_id = lp.product_id
      WHERE la.app_id = ?
    `).bind(appId).all();
    
    if (results.length === 0) {
      return c.json({ error: 'Loan application not found' }, 404);
    }
    
    return c.json(results[0]);
  } catch (error) {
    console.error('Error fetching loan application:', error);
    return c.json({ error: 'Failed to fetch loan application' }, 500);
  }
});

// POST /api/loan-applications - Create a new loan application
app.post("/api/loan-applications", async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['branch_id', 'client_id', 'product_id', 'requested_amount', 'requested_term_months'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({ error: `${field} is required` }, 400);
      }
    }
    
    // Validate client exists
    const { results: clientExists } = await c.env.DB.prepare(`
      SELECT client_id FROM client_kyc WHERE client_id = ?
    `).bind(body.client_id).all();
    
    if (clientExists.length === 0) {
      return c.json({ error: 'Client not found' }, 404);
    }
    
    // Validate product exists
    const { results: productExists } = await c.env.DB.prepare(`
      SELECT product_id, min_term, max_term FROM loan_products WHERE product_id = ?
    `).bind(body.product_id).all();
    
    if (productExists.length === 0) {
      return c.json({ error: 'Loan product not found' }, 404);
    }
    
    // Validate term is within product limits
    const product = productExists[0] as any;
    if (body.requested_term_months < product.min_term || body.requested_term_months > product.max_term) {
      return c.json({ 
        error: `Term must be between ${product.min_term} and ${product.max_term} months` 
      }, 400);
    }
    
    // Insert loan application
    const { results } = await c.env.DB.prepare(`
      INSERT INTO loan_application (
        branch_id, client_id, product_id, requested_amount, 
        purpose_code, requested_term_months, repayment_frequency, 
        application_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      body.branch_id,
      body.client_id,
      body.product_id,
      body.requested_amount,
      body.purpose_code || null,
      body.requested_term_months,
      body.repayment_frequency || 'monthly',
      body.application_status || 'draft'
    ).all();
    
    return c.json(results[0], 201);
  } catch (error) {
    console.error('Error creating loan application:', error);
    return c.json({ error: 'Failed to create loan application' }, 500);
  }
});

// PUT /api/loan-applications/:id - Update a loan application
app.put("/api/loan-applications/:id", async (c) => {
  try {
    const appId = c.req.param('id');
    const body = await c.req.json();
    
    // Check if application exists
    const { results: existingApp } = await c.env.DB.prepare(`
      SELECT app_id, application_status FROM loan_application WHERE app_id = ?
    `).bind(appId).all();
    
    if (existingApp.length === 0) {
      return c.json({ error: 'Loan application not found' }, 404);
    }
    
    // Build dynamic update query
    const updateFields = [];
    const params = [];
    
    const allowedFields = [
      'requested_amount', 'purpose_code', 'requested_term_months', 
      'repayment_frequency', 'application_status'
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(body[field]);
      }
    }
    
    if (updateFields.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    // Add updated_at
    updateFields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(appId);
    
    await c.env.DB.prepare(`
      UPDATE loan_application 
      SET ${updateFields.join(', ')} 
      WHERE app_id = ?
    `).bind(...params).run();
    
    // Fetch updated application
    const { results } = await c.env.DB.prepare(`
      SELECT 
        la.*,
        ck.first_name,
        ck.khmer_last_name,
        ck.latin_last_name,
        lp.product_name
      FROM loan_application la
      JOIN client_kyc ck ON la.client_id = ck.client_id
      JOIN loan_products lp ON la.product_id = lp.product_id
      WHERE la.app_id = ?
    `).bind(appId).all();
    
    return c.json(results[0]);
  } catch (error) {
    console.error('Error updating loan application:', error);
    return c.json({ error: 'Failed to update loan application' }, 500);
  }
});

// DELETE /api/loan-applications/:id - Delete a loan application
app.delete("/api/loan-applications/:id", async (c) => {
  try {
    const appId = c.req.param('id');
    
    // Check if application exists
    const { results: existingApp } = await c.env.DB.prepare(`
      SELECT app_id, application_status FROM loan_application WHERE app_id = ?
    `).bind(appId).all();
    
    if (existingApp.length === 0) {
      return c.json({ error: 'Loan application not found' }, 404);
    }
    
    // Check if application can be deleted (only draft/rejected applications)
    const app = existingApp[0] as any;
    if (!['draft', 'rejected'].includes(app.application_status)) {
      return c.json({ 
        error: 'Cannot delete approved or pending applications' 
      }, 409);
    }
    
    await c.env.DB.prepare(`
      DELETE FROM loan_application WHERE app_id = ?
    `).bind(appId).run();
    
    return c.json({ message: 'Loan application deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan application:', error);
    return c.json({ error: 'Failed to delete loan application' }, 500);
  }
});

// ===== PAYMENT MANAGEMENT ENDPOINTS =====

// GET /api/payment-schedules - Get payment schedules for Kanban board
app.get("/api/payment-schedules", async (c) => {
  try {
    const branchId = c.req.query('branch_id');
    const status = c.req.query('status'); // 'due', 'paid', 'late'
    const dateFilter = c.req.query('date_filter'); // 'today', 'overdue', 'upcoming'
    
    // Check if there are any active loan accounts
    const { results: accountCount } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM loan_account WHERE account_state = 'active'
    `).all();
    
    // If no active loans, return demo data as fallback
    if ((accountCount[0] as any).count === 0) {
      const demoData = [
        {
          schedule_id: 1,
          loan_id: 1,
          installment_no: 2,
          due_date: '2025-01-10',
          principal_due: 250.00,
          interest_due: 37.50,
          fee_due: 0.00,
          total_due: 287.50,
          status: 'due',
          client_id: 1,
          first_name: 'Demo',
          khmer_last_name: 'Client',
          latin_last_name: 'One',
          national_id: 'DEMO001',
          primary_phone: '+855-12-345678',
          branch_id: 'PP01',
          principal_outstanding: 2000.00,
          interest_accrued: 150.00,
          account_state: 'active',
          installment_amount: 287.50,
          product_name: 'Standard Loan',
          grace_period_days: 7,
          days_overdue: 5,
          client_name: 'Demo Client One',
          grace_period_remaining: 2,
          is_in_grace_period: true,
          payment_status: 'due'
        },
        {
          schedule_id: 2,
          loan_id: 1,
          installment_no: 3,
          due_date: '2025-01-12',
          principal_due: 250.00,
          interest_due: 37.50,
          fee_due: 0.00,
          total_due: 287.50,
          status: 'due',
          client_id: 1,
          first_name: 'Demo',
          khmer_last_name: 'Client',
          latin_last_name: 'One',
          national_id: 'DEMO001',
          primary_phone: '+855-12-345678',
          branch_id: 'PP01',
          principal_outstanding: 2000.00,
          interest_accrued: 150.00,
          account_state: 'active',
          installment_amount: 287.50,
          product_name: 'Standard Loan',
          grace_period_days: 7,
          days_overdue: 3,
          client_name: 'Demo Client One',
          grace_period_remaining: 4,
          is_in_grace_period: true,
          payment_status: 'due'
        },
        {
          schedule_id: 3,
          loan_id: 1,
          installment_no: 4,
          due_date: new Date().toISOString().split('T')[0],
          principal_due: 250.00,
          interest_due: 37.50,
          fee_due: 0.00,
          total_due: 287.50,
          status: 'due',
          client_id: 1,
          first_name: 'Demo',
          khmer_last_name: 'Client',
          latin_last_name: 'One',
          national_id: 'DEMO001',
          primary_phone: '+855-12-345678',
          branch_id: 'PP01',
          principal_outstanding: 2000.00,
          interest_accrued: 150.00,
          account_state: 'active',
          installment_amount: 287.50,
          product_name: 'Standard Loan',
          grace_period_days: 7,
          days_overdue: 0,
          client_name: 'Demo Client One',
          grace_period_remaining: 7,
          is_in_grace_period: false,
          payment_status: 'due'
        },
        {
          schedule_id: 4,
          loan_id: 2,
          installment_no: 1,
          due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          principal_due: 150.00,
          interest_due: 25.00,
          fee_due: 0.00,
          total_due: 175.00,
          status: 'due',
          client_id: 2,
          first_name: 'Test',
          khmer_last_name: 'Borrower',
          latin_last_name: 'Two',
          national_id: 'DEMO002',
          primary_phone: '+855-12-987654',
          branch_id: 'SR01',
          principal_outstanding: 1500.00,
          interest_accrued: 75.00,
          account_state: 'active',
          installment_amount: 175.00,
          product_name: 'Micro Loan',
          grace_period_days: 5,
          days_overdue: 0,
          client_name: 'Test Borrower Two',
          grace_period_remaining: 5,
          is_in_grace_period: false,
          payment_status: 'due'
        },
        {
          schedule_id: 5,
          loan_id: 3,
          installment_no: 1,
          due_date: '2025-02-15',
          principal_due: 300.00,
          interest_due: 45.00,
          fee_due: 0.00,
          total_due: 345.00,
          status: 'due',
          client_id: 3,
          first_name: 'Future',
          khmer_last_name: 'Payment',
          latin_last_name: 'Client',
          national_id: 'DEMO003',
          primary_phone: '+855-12-111222',
          branch_id: 'PP01',
          principal_outstanding: 3000.00,
          interest_accrued: 200.00,
          account_state: 'active',
          installment_amount: 345.00,
          product_name: 'Business Loan',
          grace_period_days: 10,
          days_overdue: 0,
          client_name: 'Future Payment Client',
          grace_period_remaining: 10,
          is_in_grace_period: false,
          payment_status: 'due'
        }
      ];
      
      // Apply filters to demo data
      let filteredData = demoData;
      
      if (branchId) {
        filteredData = filteredData.filter(item => item.branch_id === branchId);
      }
      
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filteredData = filteredData.filter(item => item.due_date === today);
      } else if (dateFilter === 'overdue') {
        const today = new Date().toISOString().split('T')[0];
        filteredData = filteredData.filter(item => item.due_date < today);
      } else if (dateFilter === 'upcoming') {
        const today = new Date().toISOString().split('T')[0];
        filteredData = filteredData.filter(item => item.due_date > today);
      }
      
      return c.json(filteredData);
    }
    
    // Use real data from database
    let query = `
      SELECT 
        rs.schedule_id,
        rs.loan_id,
        rs.installment_no,
        rs.due_date,
        rs.principal_due,
        rs.interest_due,
        rs.fee_due,
        rs.total_due,
        rs.status,
        
        -- Client info
        ck.client_id,
        ck.first_name,
        ck.khmer_last_name,
        ck.latin_last_name,
        ck.national_id,
        ck.primary_phone,
        
        -- Loan info
        la.loan_id,
        la.branch_id,
        la.principal_outstanding,
        la.interest_accrued,
        la.account_state,
        la.installment_amount,
        
        -- Loan product info  
        lp.product_name,
        lp.grace_period_days,
        
        -- Calculate days overdue
        CASE 
          WHEN date(rs.due_date) < date('now') AND rs.status = 'due' 
          THEN julianday('now') - julianday(rs.due_date)
          ELSE 0
        END as days_overdue
        
      FROM repayment_schedule rs
      JOIN loan_account la ON rs.loan_id = la.loan_id
      JOIN loan_application lapp ON la.app_id = lapp.app_id
      JOIN client_kyc ck ON lapp.client_id = ck.client_id
      JOIN loan_products lp ON lapp.product_id = lp.product_id
      WHERE la.account_state = 'active'
    `;
    
    const params = [];
    
    if (branchId) {
      query += ` AND la.branch_id = ?`;
      params.push(branchId);
    }
    
    if (status) {
      query += ` AND rs.status = ?`;
      params.push(status);
    }
    
    // Date filters for Kanban columns
    if (dateFilter === 'today') {
      query += ` AND date(rs.due_date) = date('now') AND rs.status = 'due'`;
    } else if (dateFilter === 'overdue') {
      query += ` AND date(rs.due_date) < date('now') AND rs.status = 'due'`;
    } else if (dateFilter === 'upcoming') {
      query += ` AND date(rs.due_date) > date('now') AND rs.status = 'due'`;
    }
    
    query += ` ORDER BY rs.due_date ASC, ck.first_name ASC`;
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    // Add calculated fields
    const enhancedResults = results.map((row: any) => ({
      ...row,
      client_name: [row.first_name, row.khmer_last_name, row.latin_last_name]
        .filter(Boolean)
        .join(' ') || 'Unknown Client',
      grace_period_remaining: Math.max(0, row.grace_period_days - row.days_overdue),
      is_in_grace_period: row.days_overdue > 0 && row.days_overdue <= row.grace_period_days,
      payment_status: row.status === 'due' && row.days_overdue > row.grace_period_days ? 'late' : row.status
    }));
    
    return c.json(enhancedResults);
  } catch (error) {
    console.error('Error fetching payment schedules:', error);
    return c.json({ error: 'Failed to fetch payment schedules' }, 500);
  }
});

// GET /api/loan-accounts - Get active loan accounts
app.get("/api/loan-accounts", async (c) => {
  try {
    const branchId = c.req.query('branch_id');
    
    let query = `
      SELECT 
        la.*,
        lapp.client_id,
        lapp.product_id,
        ck.first_name,
        ck.khmer_last_name,
        ck.latin_last_name,
        ck.national_id,
        lp.product_name,
        lp.currency
      FROM loan_account la
      JOIN loan_application lapp ON la.app_id = lapp.app_id
      JOIN client_kyc ck ON lapp.client_id = ck.client_id
      JOIN loan_products lp ON lapp.product_id = lp.product_id
      WHERE la.account_state = 'active'
    `;
    
    const params = [];
    
    if (branchId) {
      query += ` AND la.branch_id = ?`;
      params.push(branchId);
    }
    
    query += ` ORDER BY la.created_at DESC`;
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (error) {
    console.error('Error fetching loan accounts:', error);
    return c.json({ error: 'Failed to fetch loan accounts' }, 500);
  }
});

// POST /api/payments - Record a new payment
app.post("/api/payments", async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['loan_id', 'amount_paid', 'principal_paid', 'interest_paid'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({ error: `${field} is required` }, 400);
      }
    }
    
    // Validate loan exists and is active
    const { results: loanExists } = await c.env.DB.prepare(`
      SELECT loan_id, principal_outstanding, interest_accrued, account_state 
      FROM loan_account WHERE loan_id = ?
    `).bind(body.loan_id).all();
    
    if (loanExists.length === 0) {
      return c.json({ error: 'Loan not found' }, 404);
    }
    
    const loan = loanExists[0] as any;
    if (loan.account_state !== 'active') {
      return c.json({ error: 'Cannot record payment for inactive loan' }, 400);
    }
    
    // Validate payment amounts
    if (body.amount_paid !== (body.principal_paid + body.interest_paid + (body.fee_paid || 0))) {
      return c.json({ error: 'Total amount does not match sum of components' }, 400);
    }
    
    // Record the payment transaction
    const { meta } = await c.env.DB.prepare(`
      INSERT INTO payment_transactions (
        loan_id, payment_date, amount_paid, principal_paid, 
        interest_paid, fee_paid, payment_method, reference_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.loan_id,
      body.payment_date || new Date().toISOString(),
      body.amount_paid,
      body.principal_paid,
      body.interest_paid,
      body.fee_paid || 0,
      body.payment_method || null,
      body.reference_no || null
    ).run();
    
    // Update loan account balances
    const newPrincipalOutstanding = Math.max(0, loan.principal_outstanding - body.principal_paid);
    const newInterestAccrued = Math.max(0, loan.interest_accrued - body.interest_paid);
    
    await c.env.DB.prepare(`
      UPDATE loan_account 
      SET 
        principal_outstanding = ?,
        interest_accrued = ?,
        updated_at = ?
      WHERE loan_id = ?
    `).bind(
      newPrincipalOutstanding,
      newInterestAccrued,
      new Date().toISOString(),
      body.loan_id
    ).run();
    
    // Update repayment schedule (mark installments as paid)
    // Find the oldest unpaid installment(s) and mark them as paid
    const { results: unpaidSchedules } = await c.env.DB.prepare(`
      SELECT schedule_id, total_due 
      FROM repayment_schedule 
      WHERE loan_id = ? AND status = 'due'
      ORDER BY installment_no ASC
    `).bind(body.loan_id).all();
    
    let remainingPayment = body.amount_paid;
    for (const schedule of unpaidSchedules as any[]) {
      if (remainingPayment >= schedule.total_due) {
        // Fully pay this installment
        await c.env.DB.prepare(`
          UPDATE repayment_schedule 
          SET status = 'paid' 
          WHERE schedule_id = ?
        `).bind(schedule.schedule_id).run();
        
        remainingPayment -= schedule.total_due;
      } else if (remainingPayment > 0) {
        // Partial payment - keep as 'due' for now
        remainingPayment = 0;
        break;
      }
    }
    
    // Fetch the recorded payment
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM payment_transactions WHERE transaction_id = ?
    `).bind(meta.last_row_id).all();
    
    return c.json(results[0], 201);
  } catch (error) {
    console.error('Error recording payment:', error);
    return c.json({ error: 'Failed to record payment' }, 500);
  }
});

// GET /api/payments/:loanId - Get payment history for a loan
app.get("/api/payments/:loanId", async (c) => {
  try {
    const loanId = c.req.param('loanId');
    
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM payment_transactions 
      WHERE loan_id = ? 
      ORDER BY payment_date DESC
    `).bind(loanId).all();
    
    return c.json(results);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return c.json({ error: 'Failed to fetch payment history' }, 500);
  }
});

// GET /api/demo-payment-schedules - Get demo payment schedules for testing
// POST /api/setup-demo-loans - Create demo loan accounts and payment schedules
app.post("/api/setup-demo-loans", async (c) => {
  try {
    // Check if we already have active loan accounts
    const { results: existingLoans } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM loan_account WHERE account_state = 'active'
    `).all();
    
    if ((existingLoans[0] as any).count > 0) {
      return c.json({ message: 'Demo loans already exist', count: (existingLoans[0] as any).count });
    }
    
    // Get an approved loan application
    const { results: approvedApps } = await c.env.DB.prepare(`
      SELECT app_id, client_id, product_id, requested_amount, requested_term_months 
      FROM loan_application 
      WHERE application_status = 'approved' 
      LIMIT 1
    `).all();
    
    if (approvedApps.length === 0) {
      return c.json({ error: 'No approved loan applications found. Please create and approve a loan application first.' }, 400);
    }
    
    const app = approvedApps[0] as any;
    
    // Create a loan account
    const { meta: loanMeta } = await c.env.DB.prepare(`
      INSERT INTO loan_account (
        app_id, branch_id, principal_amount, principal_outstanding,
        interest_rate, installment_amount, total_installments,
        account_state, disbursement_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      app.app_id,
      'PP01',
      app.requested_amount,
      app.requested_amount,
      15.0, // 15% interest rate
      Math.round(app.requested_amount / app.requested_term_months),
      app.requested_term_months,
      'active',
      new Date().toISOString()
    ).run();
    
    const loanId = loanMeta.lastRowId;
    
    // Create payment schedules
    const installmentAmount = Math.round(app.requested_amount / app.requested_term_months);
    const monthlyInterest = (app.requested_amount * 0.15) / 12; // Monthly interest
    const monthlyPrincipal = installmentAmount - monthlyInterest;
    
    // Insert payment schedules for the next 3 months
    for (let i = 1; i <= 3; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      
      let status = 'due';
      if (i === 1) {
        // First payment is overdue
        dueDate.setDate(dueDate.getDate() - 5);
      } else if (i === 2) {
        // Second payment is due today
        dueDate.setTime(Date.now());
      }
      // Third payment is upcoming
      
      await c.env.DB.prepare(`
        INSERT INTO repayment_schedule (
          loan_id, installment_no, due_date, principal_due,
          interest_due, fee_due, total_due, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        loanId,
        i,
        dueDate.toISOString().split('T')[0],
        monthlyPrincipal,
        monthlyInterest,
        0,
        installmentAmount,
        status
      ).run();
    }
    
    return c.json({ 
      message: 'Demo loan and payment schedules created successfully',
      loan_id: loanId,
      schedules_created: 3
    });
    
  } catch (error) {
    console.error('Error setting up demo loans:', error);
    return c.json({ error: 'Failed to setup demo loans' }, 500);
  }
});

app.get("/api/demo-payment-schedules", async (c) => {
  try {
    const branchId = c.req.query('branch_id');
    const dateFilter = c.req.query('date_filter');
    
    const demoData = [
      {
        schedule_id: 1,
        loan_id: 1,
        installment_no: 2,
        due_date: '2025-01-10',
        principal_due: 250.00,
        interest_due: 37.50,
        total_due: 287.50,
        status: 'due',
        client_id: 1,
        first_name: 'Demo',
        khmer_last_name: 'Client',
        latin_last_name: 'One',
        national_id: 'DEMO001',
        primary_phone: '+855-12-345678',
        branch_id: 'PP01',
        principal_outstanding: 2000.00,
        interest_accrued: 150.00,
        account_state: 'active',
        installment_amount: 287.50,
        product_name: 'Standard Loan',
        grace_period_days: 7,
        days_overdue: 5,
        client_name: 'Demo Client One',
        grace_period_remaining: 2,
        is_in_grace_period: true,
        payment_status: 'due'
      },
      {
        schedule_id: 2,
        loan_id: 1,
        installment_no: 3,
        due_date: '2025-01-12',
        principal_due: 250.00,
        interest_due: 37.50,
        total_due: 287.50,
        status: 'due',
        client_id: 1,
        first_name: 'Demo',
        khmer_last_name: 'Client',
        latin_last_name: 'One',
        national_id: 'DEMO001',
        primary_phone: '+855-12-345678',
        branch_id: 'PP01',
        principal_outstanding: 2000.00,
        interest_accrued: 150.00,
        account_state: 'active',
        installment_amount: 287.50,
        product_name: 'Standard Loan',
        grace_period_days: 7,
        days_overdue: 3,
        client_name: 'Demo Client One',
        grace_period_remaining: 4,
        is_in_grace_period: true,
        payment_status: 'due'
      },
      {
        schedule_id: 3,
        loan_id: 1,
        installment_no: 4,
        due_date: new Date().toISOString().split('T')[0],
        principal_due: 250.00,
        interest_due: 37.50,
        total_due: 287.50,
        status: 'due',
        client_id: 1,
        first_name: 'Demo',
        khmer_last_name: 'Client',
        latin_last_name: 'One',
        national_id: 'DEMO001',
        primary_phone: '+855-12-345678',
        branch_id: 'PP01',
        principal_outstanding: 2000.00,
        interest_accrued: 150.00,
        account_state: 'active',
        installment_amount: 287.50,
        product_name: 'Standard Loan',
        grace_period_days: 7,
        days_overdue: 0,
        client_name: 'Demo Client One',
        grace_period_remaining: 7,
        is_in_grace_period: false,
        payment_status: 'due'
      },
      {
        schedule_id: 4,
        loan_id: 2,
        installment_no: 1,
        due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        principal_due: 150.00,
        interest_due: 25.00,
        total_due: 175.00,
        status: 'due',
        client_id: 2,
        first_name: 'Test',
        khmer_last_name: 'Borrower',
        latin_last_name: 'Two',
        national_id: 'DEMO002',
        primary_phone: '+855-12-987654',
        branch_id: 'SR01',
        principal_outstanding: 1500.00,
        interest_accrued: 75.00,
        account_state: 'active',
        installment_amount: 175.00,
        product_name: 'Micro Loan',
        grace_period_days: 5,
        days_overdue: 0,
        client_name: 'Test Borrower Two',
        grace_period_remaining: 5,
        is_in_grace_period: false,
        payment_status: 'due'
      },
      {
        schedule_id: 5,
        loan_id: 3,
        installment_no: 1,
        due_date: '2025-02-15',
        principal_due: 300.00,
        interest_due: 45.00,
        total_due: 345.00,
        status: 'due',
        client_id: 3,
        first_name: 'Future',
        khmer_last_name: 'Payment',
        latin_last_name: 'Client',
        national_id: 'DEMO003',
        primary_phone: '+855-12-111222',
        branch_id: 'PP01',
        principal_outstanding: 3000.00,
        interest_accrued: 200.00,
        account_state: 'active',
        installment_amount: 345.00,
        product_name: 'Business Loan',
        grace_period_days: 10,
        days_overdue: 0,
        client_name: 'Future Payment Client',
        grace_period_remaining: 10,
        is_in_grace_period: false,
        payment_status: 'due'
      }
    ];
    
    // Apply filters to demo data
    let filteredData = demoData;
    
    if (branchId) {
      filteredData = filteredData.filter(item => item.branch_id === branchId);
    }
    
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filteredData = filteredData.filter(item => item.due_date === today);
    } else if (dateFilter === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      filteredData = filteredData.filter(item => item.due_date < today);
    } else if (dateFilter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      filteredData = filteredData.filter(item => item.due_date > today);
    }
    
    return c.json(filteredData);
  } catch (error) {
    console.error('Error fetching demo payment schedules:', error);
    return c.json({ error: 'Failed to fetch demo payment schedules' }, 500);
  }
});

export default app;
