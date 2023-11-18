// Get a reference to the form element
const form = document.querySelector('form');

// Get a reference to the table body where appointments will be added
const appointmentList = document.getElementById('appointment-list');

// Function to create a new row with "Delete" button and editable status dropdown
function createTableRow(date, time, patientName, doctor, status, obs, rowIndex) {
    // Create a new row for the table
    const newRow = document.createElement('tr');

    // Populate the row with data (excluding the "Observations" column)
    newRow.innerHTML = `
        <td>${date}</td>
        <td>${time}</td>
        <td>${patientName}</td>
        <td>${doctor}</td>
        <td class="status-cell" data-status="${status}">
            <select class="status-dropdown">
                option value="N/A">N/A</option>
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

    // Create a "Delete" button for the row
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button');

    // Attach a click event listener to the delete button
    deleteButton.addEventListener('click', function() {
        // Remove the row when the delete button is clicked
        newRow.remove();

        // Remove the corresponding appointment from local storage
        appointments.splice(rowIndex, 1);
        updateLocalStorage();

        // Update the table to reflect the deletion
        updateTable();
    });

    // Create an event listener to handle status changes
    statusDropdown.addEventListener('change', function() {
        const selectedStatus = statusDropdown.value;
        
        // Update the data-status attribute of the status cell
        newRow.getElementsByClassName('status-cell')[0].setAttribute('data-status', selectedStatus);
        
        // Update the corresponding appointment's status in local storage
        const rowIndex = appointments.findIndex(appointment => 
            appointment.date === date &&
            appointment.time === time &&
            appointment.patientName === patientName &&
            appointment.doctor === doctor
        );
    
        if (rowIndex !== -1) {
            appointments[rowIndex].status = selectedStatus;
            updateLocalStorage();
        }
    });

    const deleteButtonCell = document.createElement('td');
    deleteButtonCell.appendChild(deleteButton);
    newRow.appendChild(deleteButtonCell);

    return newRow;
}

// Function to create a new appointment object
function createAppointment(date, time, patientName, doctor, status, obs) {
    return {
        date,
        time,
        patientName,
        doctor,
        status,
        obs
    };
}

// Function to save appointments to local storage
function saveAppointments(appointments) {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

// Function to retrieve appointments from local storage
function getSavedAppointments() {
    const savedAppointments = localStorage.getItem('appointments');
    return savedAppointments ? JSON.parse(savedAppointments) : [];
}

// Initialize appointments from local storage
let appointments = getSavedAppointments();

// Function to update the table with appointments
function updateTable() {
    appointmentList.innerHTML = ''; // Clear the table

    for (const appointment of appointments) {
        const newRow = createTableRow(appointment.date, appointment.time, appointment.patientName, appointment.doctor, appointment.status, appointment.obs);
        appointmentList.appendChild(newRow);
    }
}

// Function to update local storage with current appointments
function updateLocalStorage() {
    saveAppointments(appointments);
}

// Add a submit event listener to the form for adding appointments
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form input values
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const patientName = document.getElementById('patient-name').value;
    const doctor = document.getElementById('doctor').value;
    const status = document.getElementById('status').value;
    const obs = document.getElementById('obs').value;

    // Create a new appointment object
    const newAppointment = createAppointment(date, time, patientName, doctor, status, obs);

    // Add the new appointment to the appointments array
    appointments.push(newAppointment);

    // Save the updated appointments to local storage
    updateLocalStorage();

    // Update the table with the new data
    updateTable();

    // Reset the form fields
    form.reset();
});

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

    // Get all rows from the table
    const rows = appointmentList.getElementsByTagName('tr');

    // Iterate through the rows and hide/show based on filters
    for (const row of rows) {
        const cells = row.getElementsByTagName('td');

        if (
            (dateFilter === '' || cells[0].textContent.includes(dateFilter)) &&
            (timeFilter === '' || cells[1].textContent.includes(timeFilter)) &&
            (nameFilter === '' || cells[2].textContent.toLowerCase().includes(nameFilter)) &&
            (doctorFilter === '' || cells[3].textContent.includes(doctorFilter)) &&
            (statusFilter === '' || cells[4].getAttribute('data-status') === statusFilter)
        ) {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    }
}

const sortDateButton = document.getElementById('sort-date');
sortDateButton.addEventListener('click', function() {
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
sortTimeButton.addEventListener('click', function() {
    // Get all rows from the table body
    const rows = Array.from(appointmentList.getElementsByTagName('tr'));

    // Sort the rows by time
    rows.sort((a, b) => {
        const timeA = a.cells[1].textContent;
        const timeB = b.cells[1].textContent;
        return timeA.localeCompare(timeB);
    });

    // Reorder the rows in the table
    rows.forEach(row => appointmentList.appendChild(row));
});

// Get a reference to the "Show All Appointments" button
const showAllAppointmentsButton = document.getElementById('show-all-appointments');

// Add a click event listener to the button
showAllAppointmentsButton.addEventListener('click', function () {
    updateTable();
});

// Rest of your code remains unchanged


// Initially apply filters to show all appointments
applyFilters();
