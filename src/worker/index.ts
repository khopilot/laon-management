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

export default app;
