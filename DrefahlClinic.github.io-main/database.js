// db.js
require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// const AWS = require('/.config'); // Adjust the path based on your file structure
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid'); // Import UUID library

function createAppointment(appointmentData) {
    const params = {
        TableName: 'Test', // Replace with your actual table name
        Item: {
            Primary: uuidv4(),
            Date: appointmentData.Date,
            Time: appointmentData.Time,
            PatientName: appointmentData.PatientName,
            PatientPhone: appointmentData.PatientPhone,
            Doctor: appointmentData.Doctor,
            Status: appointmentData.Status,
            Observations: appointmentData.Observations,
            // Add other attributes as needed
        },
    };

    return dynamoDB.put(params).promise();
}

function getAppointment(appointmentId) {
    const params = {
        TableName: 'Test', // Replace with your actual table name
        Key: {
            Primary: appointmentId,
        },
    };

    return dynamoDB.get(params).promise();
}

function updateAppointment(appointmentId, updatedData) {
    const params = {
        TableName: 'Test',
        Key: {
            Primary: appointmentId,
        },
        UpdateExpression: 'SET #attrName = :attrValue',
        ExpressionAttributeNames: {
            '#attrName': 'UpdatedAttribute',
        },
        ExpressionAttributeValues: {
            ':attrValue': updatedData,
        },
        ReturnValues: 'ALL_NEW', // Optional, specify what values should be returned after the update
    };

    return dynamoDB.update(params).promise()
        .catch(error => {
            console.error('Error updating appointment:', error);
            throw error;
        });
}

function deleteAppointment(appointmentId) {
    const params = {
        TableName: 'Test',
        Key: {
            Primary: appointmentId,
        },
    };

    return dynamoDB.delete(params).promise()
        .catch(error => {
            console.error('Error deleting appointment:', error);
            throw error;
        });
}

module.exports = {
    createAppointment,
    getAppointment,
    updateAppointment,
    deleteAppointment,
};
