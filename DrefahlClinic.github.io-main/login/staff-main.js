function saveAppointments(appointments) {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }
  
  // Function to retrieve appointments from local storage
  function loadAppointments() {
    const savedAppointments = localStorage.getItem('appointments');
    return savedAppointments ? JSON.parse(savedAppointments) : [];
  }
  
  
  const form = document.querySelector('form');
  // Get a reference to the table body where appointments will be added
  const appointmentList = document.getElementById('appointment-list');

// Function to create a new row with "Delete" button and editable status dropdown
function createTableRow(date, time, patientName, patientPhone, doctor, status, obs, rowIndex) {
    // Create a new row for the table
    const newRow = document.createElement('tr');
  
    // Populate the row with data (excluding the "Observations" column)
    newRow.innerHTML = `
        <td>${date}</td>
        <td>${time}</td>
        <td>${patientName}</td>
        <td>${patientPhone}</td>
        <td>${doctor}</td>
        <td class="status-cell" data-status="${status}">
            <select class="status-dropdown">
                <option value="N/A">N/A</option>
                <option value="Agendada">Agendada</option>
                <option value="Retorno">Retorno</option>
                <option value="Curativo">Curativo</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Remarcada">Remarcada</option>
                <option value="Finalizada - Paga">Finalizada - Paga</option>
                <option value="Finalizada - não Paga">Finalizada - não paga</option>
            </select>
        </td>
        <td>${obs}</td>
    `;

    // Set the selected status in the dropdown
    const statusDropdown = newRow.querySelector('.status-dropdown');
    statusDropdown.value = status;
    // Create an event listener to handle status changes
  
    // Create a "Delete" button for the row
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button');
    
    // const uploadButton = document.createElement('button');
    // uploadButton.textContent = 'Upload';
    // uploadButton.classList.add('upload-button');
    // Add an event listener to the "Delete" button
    deleteButton.addEventListener('click', function () {
      // Remove the row when the delete button is clicked
      newRow.remove();
    
      // Remove the corresponding appointment from the API
      const idToDelete = appointments[rowIndex].primary;
    
      // Call the delete endpoint to remove the appointment from DynamoDB
      fetch(`http://13.59.63.158:8081/api/appointments/${idToDelete}`, {
        method: 'DELETE',
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error deleting appointment');
        }
        return response.json();
      })
      .then(() => {
        // Update the local appointments array
        appointments = appointments.filter(appointment => appointment.primary !== idToDelete);
    
        // Save the updated appointments to local storage
        saveAppointments(appointments);
    
        // Update the table with the new data
        updateTable();
      })
      .catch(error => {
        console.error('Error deleting appointment:', error);
        // Handle error as needed (e.g., show an error message to the user)
      });
    });


      // Add an event listener to the "Upload" button
  // uploadButton.addEventListener('click', function () {
  //   const fileInput = document.getElementById('pdfFileInput');
    
  //   if (pdfFile) {
  //     const bucketName = 'doctor-pdf';
  //     const sanitizedPatientName = patientName.replace(/\s+/g, '_');
  //     const key = `reports/${sanitizedPatientName}/${date}-${time}.pdf`; // Adjust the key as needed
  //     const uploadParams = {
  //       Bucket: bucketName,
  //       Key: key,
  //       Body: pdfFile,
  //       ContentType: 'application/pdf', // Adjust the content type as needed
  //     };

  //     const s3 = new AWS.S3(); // Assuming you have initialized AWS SDK

  //     s3.upload(uploadParams, function (err, data) {
  //       if (err) {
  //         console.error('Error uploading PDF to S3:', err);
  //         // Handle error as needed (e.g., show an error message to the user)
  //       } else {
  //         console.log('PDF uploaded to S3 successfully:', data);
  //         // You may want to perform additional actions after successful upload

  //         // Clear the file input after successful upload, if needed
  //         fileInput.value = '';
  //       }
  //     });
  //   } else {
  //     console.error('No file selected for upload');
  //     // Handle case where no file is selected
  //   }
  // });
  
  // Create an event listener to handle status changes
  statusDropdown.addEventListener('change', function () {
    const selectedStatus = statusDropdown.value;
  
    // Update the data-status attribute of the status cell
    newRow.getElementsByClassName('status-cell')[0].setAttribute('data-status', selectedStatus);
  
    // Update the corresponding appointment's status in the API
    const idToUpdate = appointments[rowIndex].primary; // Assuming primary is the ID property in DynamoDB
    updateAppointmentStatus(idToUpdate, selectedStatus);
  });

  const deleteButtonCell = document.createElement('td');
  deleteButtonCell.appendChild(deleteButton);
  newRow.appendChild(deleteButtonCell);

  // const uploadButtonCell = document.createElement('td');
  // uploadButtonCell.appendChild(uploadButton);
  // newRow.appendChild(uploadButtonCell);
  return newRow;
}

function getAppointmentsFromAPI() {
    return fetch('http://13.59.63.158:8081/api/appointments')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching appointments');
            }
            return response.json();
        })
        .then(apiResponse => {
            // Log the API response to the console for debugging
            console.log('API Response:', apiResponse);

            if (!Array.isArray(apiResponse)) {
                throw new Error('Invalid API response structure');
            }

            return apiResponse.map(item => ({
                primary: item.Primary,
                date: item.Date,
                time: item.Time,
                patientName: item.PatientName,
                patientPhone: item.PatientPhone,
                doctor: item.Doctor,
                status: item.Status,
                obs: item.Observations,
                // Add other properties as needed
            }));
        });
}
function updateAppointmentStatusInAPI(appointmentId, newStatus) {
    return fetch(`http://13.59.63.158:8081/api/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add any additional headers if needed
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error updating appointment status in API');
        }
        return response.json();
      })
      .catch(error => {
        console.error('Error updating appointment status in API:', error);
        throw error;
      });
  }
  
  function saveAppointmentToAPI(appointment) {
    return fetch('http://13.59.63.158:8081/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error saving appointment to API');
        }
        return response.json();
      })
      .catch(error => {
        console.error('Error saving appointment to API:', error);
        throw error; // Re-throw the error for further handling if needed
      });
  }
  let appointments = [];  // Declare and initialize the array

  // Function to update the table with appointments
function updateTable() {
  // Clear the table
  appointmentList.innerHTML = '';

  // Fetch appointments from the API
  getAppointmentsFromAPI()
    .then(apiAppointments => {
      // Update the local appointments array with data from the API
      appointments = apiAppointments || []; // Handle the case where apiAppointments is undefined

      // Save the updated appointments to local storage
      saveAppointments(appointments);

      // Iterate through the appointments and add rows to the table
      for (const [index, appointment] of appointments.entries()) {
        const newRow = createTableRow(appointment.date, appointment.time, appointment.patientName, appointment.patientPhone, appointment.doctor, appointment.status, appointment.obs, index);
        appointmentList.appendChild(newRow);
      }
      
      // Scroll to the bottom of the table to show the new entry
      appointmentList.scrollTop = appointmentList.scrollHeight;
    })
    .catch(error => {
      console.error('Error fetching appointments:', error);
      // Handle error as needed (e.g., show an error message to the user)
    });
}

// Function to delete an appointment from the API and update the table
function deleteAppointment(appointmentId) {
    const idToDelete = appointmentId;

    // Call the delete endpoint to remove the appointment from DynamoDB
    fetch(`http://13.59.63.158:8081/api/appointments/${idToDelete}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting appointment');
            }
            return response.json();
        })
        .then(() => {
            // Update the local appointments array
            appointments = appointments.filter(appointment => appointment.Primary !== idToDelete);

            // Save the updated appointments to local storage
            saveAppointments(appointments);

            // Update the table with the new data
            updateTable();
        })
        .catch(error => {
            console.error('Error deleting appointment:', error);
            // Handle error as needed (e.g., show an error message to the user)
        });
}


// Function to update the status of an appointment in the API and update the table
function updateAppointmentStatus(appointmentId, newStatus) {
    updateAppointmentStatusInAPI(appointmentId, newStatus)
      .then(updatedAppointment => {
        // Update the local appointments array
        appointments = appointments.map(appointment => (appointment.primary === appointmentId ? updatedAppointment : appointment));
  
        // Save the updated appointments to local storage
        saveAppointments(appointments);
  
        // Update the table with the new data
        updateTable();
      })
      .catch(error => {
        console.error('Error updating appointment status:', error);
        // Handle error as needed (e.g., show an error message to the user)
      });
  }
  

form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission
  
    try {
      // Get form input values
      const dateElement = document.getElementById('date');
      const timeElement = document.getElementById('time');
      const patientNameElement = document.getElementById('patient-name');
      const patientPhoneElement = document.getElementById('patient-phone');
      const doctorElement = document.getElementById('doctor');
      const statusElement = document.getElementById('status');
      const obsElement = document.getElementById('obs');
  
      console.log('Form elements:', { dateElement, timeElement, patientNameElement, patientPhoneElement, doctorElement, statusElement, obsElement });
  
      const date = dateElement.value;
      const time = timeElement.value;
      const patientName = patientNameElement.value;
      const patientPhone = patientPhoneElement.value;
      const doctor = doctorElement.value;
      const status = statusElement.value;
      const obs = obsElement.value;
  
      console.log('Form values:', { date, time, patientName, patientPhone, doctor, status, obs });
  
      // Create a new appointment object
      const newAppointment = {
        date: String(date),
        time: String(time),
        patientName: String(patientName),
        patientPhone: String(patientPhone),
        doctor: String(doctor),
        status: String(status),
        obs: String(obs)
      };
  
      // Save the new appointment to the API
      saveAppointmentToAPI(newAppointment)
        .then(savedAppointment => {
          // Add the new appointment to the local appointments array
          appointments.push(savedAppointment);
  
          // Save the updated appointments to local storage
          saveAppointments(appointments);
  
          // Update the table with the new data
          updateTable();
  
          // Reset the form fields
          form.reset();
        })
        .catch(error => {
          console.error('Error creating appointment:', error);
          // Handle error as needed (e.g., show an error message to the user)
        });
    } catch (error) {
      console.error('Form retrieval error:', error);
    }
  });
  

// Function to validate a 9-digit phone number
function validatePhoneNumber(phoneNumber) {
    const phoneNumberRegex = /^[0-9]{9}$/;
    return phoneNumberRegex.test(phoneNumber);
}

// Get a reference to the filter form elements
const filterDate = document.getElementById('filter-date');
const filterTime = document.getElementById('filter-time');
const filterName = document.getElementById('filter-name');
const filterDoctor = document.getElementById('filter-doctor');
const filterStatus = document.getElementById('filter-status');

// Add an input event listener to the filter elements
filterDate.addEventListener('input', applyFilters);
filterTime.addEventListener('input', applyFilters);
filterName.addEventListener('input', applyFilters);
filterDoctor.addEventListener('input', applyFilters);
filterStatus.addEventListener('input', applyFilters); 

// Function to apply filters and update the table
function applyFilters() {
  const dateFilter = filterDate.value;
  const timeFilter = filterTime.value;
  const nameFilter = filterName.value.toLowerCase();
  const doctorFilter = filterDoctor.value;
  const statusFilter = filterStatus.value;
  console.log('Filters:', { dateFilter, timeFilter, nameFilter, doctorFilter, statusFilter});
  // Get all rows from the table
  const rows = appointmentList.getElementsByTagName('tr');

  // Iterate through the rows and hide/show based on filters
  for (const row of rows) {
    const cells = row.getElementsByTagName('td');

    if (
      (dateFilter === '' || cells[0].textContent.includes(dateFilter)) &&
      (timeFilter === '' || cells[1].textContent.includes(timeFilter)) &&
      (nameFilter === '' || cells[2].textContent.toLowerCase().includes(nameFilter)) &&
      (doctorFilter === '' || cells[3].getAttribute('doctor-status') === doctorFilter) &&
      (statusFilter === '' || cells[4].getAttribute('data-status') === statusFilter)
    ) {
      row.style.display = 'table-row';
    } else {
      row.style.display = 'none';
    }
  }
}
const sortDateButton = document.getElementById('sort-date');
sortDateButton.addEventListener('click', function () {
  // Get all rows from the table body
  const rows = Array.from(appointmentList.getElementsByTagName('tr'));

  // Sort the rows by date
  rows.sort((a, b) => {
    const dateA = new Date(a.cells[0].textContent);
    const dateB = new Date(b.cells[0].textContent);
    return dateA - dateB;
  });

  // Reorder the rows in the table
  rows.forEach(row => appointmentList.appendChild(row));
});

const sortTimeButton = document.getElementById('sort-time');
sortTimeButton.addEventListener('click', function () {
  // Get all rows from the table body
  const rows = Array.from(appointmentList.getElementsByTagName('tr'));

  // Sort the rows by time
  rows.sort((a, b) => {
    const timeA = convertToMilitaryTime(a.cells[1].textContent);
    const timeB = convertToMilitaryTime(b.cells[1].textContent);
    return timeA.localeCompare(timeB);
  });

  // Reorder the rows in the table
  rows.forEach(row => appointmentList.appendChild(row));
});
function convertToMilitaryTime(time) {
    const [hours, minutes] = time.split(':');
    const parsedHours = parseInt(hours, 10);
    const isPM = hours.toLowerCase().includes('pm');
  
    if (isPM && parsedHours !== 12) {
      return `${parsedHours + 12}:${minutes}`;
    } else if (!isPM && parsedHours === 12) {
      return `00:${minutes}`;
    } else {
      return `${hours}:${minutes}`;
    }
  }
// Get a reference to the "Show All Appointments" button
const showAllAppointmentsButton = document.getElementById('show-all-appointments');

// Add a click event listener to the button
showAllAppointmentsButton.addEventListener('click', function () {
  updateTable();
});

// Initially apply filters to show all appointments
applyFilters();
