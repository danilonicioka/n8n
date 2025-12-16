const express = require('express');
const bodyParser = require('body-parser');
// Assuming your converted script is in a file named 'selenium-script.js'
const { runScript } = require('./selenium-script'); 

const app = express();
const port = 6000; // Choose a port

// Middleware to parse JSON body
app.use(bodyParser.json());

app.post('/api/run-selenium', async (req, res) => {
    console.log('API call received. Starting Selenium script...');

    // **IMPORTANT SECURITY NOTE:**
    // You should validate or securely pass any input parameters (like username/password)
    // that you might receive in req.body. For simplicity, this example just runs the script.

    try {
        // Execute the main function from your script
        const result = await runScript(); 

        // Send the result back to n8n
        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        console.error('Selenium execution failed:', error);
        // Send error details back
        res.status(500).json({ status: 'error', message: error.message || 'Unknown error' });
    }
});

app.listen(port, () => {
    console.log(`Selenium API listening on http://localhost:${port}`);
});
