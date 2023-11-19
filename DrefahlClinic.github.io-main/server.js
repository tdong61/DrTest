// backend/server.js
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const db = require('./database'); 
const app = express();
const PORT = 8081;
const { v4: uuidv4 } = require('uuid'); 

app.use(cors());
app.use(bodyParser.json());

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'Test';

// Create a new appointment
app.post('/api/appointments', (req, res) => {
  const { date, time, patientName, patientPhone, doctor, status, obs } = req.body;

  // Validate required fields
  if (!date || !time || !patientName || !patientPhone|| !doctor || !status || !obs) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const params = {
    TableName: tableName,
    Item: {
      Primary: uuidv4(),
      Date: date,
      Time: time,
      PatientName: patientName,
      PatientPhone: patientPhone,
      Doctor: doctor,
      Status: status,
      Observations: obs,
    },
  };

  dynamoDB.put(params, (error) => {
    if (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error });
    } else {
      res.json(params.Item);
    }
  });
});

// Get all appointments
app.get('/api/appointments', (req, res) => {
  const params = {
    TableName: tableName,
  };

  dynamoDB.scan(params, (error, data) => {
    if (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error });
    } else {
      res.json(data.Items);
    }
  });
});
// Add this endpoint to handle appointment deletion
app.delete('/api/appointments/:Primary', (req, res) => {
    const { Primary } = req.params;
    console.log('Appointment ID to delete:', Primary);
    const params = {
        TableName: tableName,
        Key: {
            Primary: Primary,
        },
    };

    // Check if the appointment exists before attempting to delete
    dynamoDB.get(params, (error, result) => {
        if (error) {
            console.error('Error checking appointment existence:', error);
            res.status(500).json({ error: 'Internal Server Error', details: error });
        } else {
            if (result.Item) {
                // Appointment exists, proceed with deletion
                dynamoDB.delete(params, (deleteError) => {
                    if (deleteError) {
                        console.error('Error deleting appointment:', deleteError);
                        res.status(500).json({ error: 'Internal Server Error', details: deleteError });
                    } else {
                        res.json({ message: 'Appointment deleted successfully' });
                    }
                });
            } else {
                // Appointment not found
                res.status(404).json({ error: 'Appointment not found' });
            }
        }
    });
});
// Add this endpoint to handle appointment status update
app.put('/api/appointments/:Primary', (req, res) => {
    const { Primary } = req.params;
    const { status } = req.body;

    const params = {
        TableName: tableName,
        Key: {
            Primary: Primary,
        },
        UpdateExpression: 'SET #Status = :statusValue',
        ExpressionAttributeNames: {
            '#Status': 'Status',
        },
        ExpressionAttributeValues: {
            ':statusValue': status,
        },
        ReturnValues: 'ALL_NEW',
    };

    dynamoDB.update(params, (error, data) => {
        if (error) {
            console.error('Error updating appointment status:', error);
            res.status(500).json({ error: 'Internal Server Error', details: error });
        } else {
            res.json(data.Attributes);
        }
    });
});

// Other CRUD operations (update, delete) can be added similarly
app.get('/generate-keys', (req, res) => {
    const randomKeys = generateRandomPrimaryKeys(100);
    res.json({ keys: randomKeys });
  });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
