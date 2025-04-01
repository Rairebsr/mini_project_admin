
// Add Student Form Submission
document.getElementById("addStudentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let studentData = {
        univ_no: document.getElementById("univ_no").value,
        name: document.getElementById("name").value,
        reg_no: document.getElementById("reg_no").value,
        batch: document.getElementById("batch").value,
        dept_code:document.getElementById("dept_code").value
    };

    fetch("/submit_student_data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                alert("Student added successfully!");
                location.reload(); // Refresh the page
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch((error) => console.error("Error adding student:", error));
});

function sendstudentData(data) {
    fetch('/submit_student_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ students: data })
    })
    .then(response => response.json())
    .then(data => console.log('Data submitted successfully:', data))
    .catch(error => console.error('Error submitting data:', error));
}


// Search Students
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".search-btn").addEventListener("click", function () {
        let batch = document.getElementById("search_batch").value.trim();
        let dept_code = document.getElementById("search_dept_code").value.trim();
        let univ_no = document.getElementById("search_univ_no").value.trim();

        console.log("Searching students with:", { batch, dept_code, univ_no });

        fetch(`/search_students?batch=${encodeURIComponent(batch)}&dept_code=${encodeURIComponent(dept_code)}&univ_no=${encodeURIComponent(univ_no)}`)
            .then(response => response.json())
            .then(data => {
                let resultsDiv = document.getElementById("student-results");
                resultsDiv.innerHTML = ""; // Clear previous results

                if (!Array.isArray(data) || data.length === 0) {
                    resultsDiv.innerHTML = "<p>No students found.</p>";
                    return;
                }

                let table = `<div class="table-responsive">
                <table border="1" id="studentTable">
                    <thead>
                        <tr>
                            <th>University No</th>
                            <th>Name</th>
                            <th>Registration No</th>
                            <th>Batch</th>
                            <th>Semester</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${data.map(student => {
                        console.log("Processing student:", student); // Debugging log
                        return `
                            <tr data-id="${student._id}">
                                <td>${student.univ_no}</td>
                                <td>${student.name}</td>
                                <td>${student.reg_no}</td>
                                <td>${student.batch}</td>
                                <td>${student.semester}</td>
                                <td>
                                    <button class="edit-btn" data-id="${student._id}">Edit</button>
                                    <button class="delete-btn" data-id="${student._id}">Delete</button>
                                </td>
                            </tr>`;
                    }).join("")}
                </tbody>

                </table>
            </div>`;


                resultsDiv.innerHTML = table;
            })
            .catch(error => {
                console.error("Error searching students:", error);
                document.getElementById("student-results").innerHTML = "<p>Error retrieving student data.</p>";
            });
    });

    // Attach event listeners for dynamically generated buttons
    document.getElementById("student-results").addEventListener("click", function (event) {
        if (event.target.classList.contains("edit-btn")) {
            let studentId = event.target.getAttribute("data-id"); // Correctly fetch student ID
            console.log("Edit button clicked. Student ID:", studentId);
    
            if (studentId && studentId !== "undefined") {
                openEditModal(studentId);
            } else {
                console.error("Error: Student ID is missing or undefined.");
            }
        }
    });
    
});

// 🔹 Open Edit Modal and Fetch Data
function openEditModal(studentId) {
    console.log("Opening edit modal for student:", studentId);  // Debugging log

    fetch(`/get_student/${studentId}`)
        .then(response => response.json())
        .then(student => {
            console.log("Student data received:", student);  // Debugging log

            if (!student || student.error) {
                console.error("Error fetching student:", student.error || "Unknown error");
                return;
            }

            document.getElementById("edit_name").value = student.name || "";
            document.getElementById("edit_reg_no").value = student.reg_no || "";
            document.getElementById("edit_batch").value = student.batch || "";
            document.getElementById("edit_univ_no").value = student.univ_no || "";
            document.getElementById("edit_dept_code").value = student.dept_code || "";

            document.getElementById("editStudentForm").dataset.studentId = studentId;
            document.getElementById("editModal").style.display = "block";
        })
        .catch(error => console.error("Error fetching student details:", error));
}


// 🔹 Close Edit Modal
function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}


// Edit Student
function editstudent(studentId) {
    fetch(`/get_student/${studentId}`)
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("edit_univ_no").value = data.univ_no;
            document.getElementById("edit_name").value = data.name;
            document.getElementById("edit_reg_no").value = data.reg_no;
            document.getElementById("edit_batch").value = data.batch;
            document.getElementById("edit_dept_code").value = data.dept_code;
            document.getElementById("editStudentForm").dataset.studentId = data._id; // Store ID
            document.getElementById("editModal").style.display = "block";
        })
        .catch((error) => console.error("Error fetching student:", error));
}


// Save Edited Student
document.getElementById("editStudentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const studentId = document.getElementById("editStudentForm").dataset.studentId; // Get the MongoDB ID
    const updatedData = {
        name: document.getElementById("edit_name").value,
        reg_no: document.getElementById("edit_reg_no").value,
        batch: document.getElementById("edit_batch").value,
        dept_code: document.getElementById("edit_dept_code").value,
        univ_no: document.getElementById("edit_univ_no").value,
    };

    fetch(`/update_student/${studentId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                alert("Student updated successfully!");
                location.reload(); // Refresh the page
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch((error) => console.error("Error updating student:", error));
});
// Attach event listeners for dynamically generated buttons
document.getElementById("student-results").addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-btn")) {
        let studentId = event.target.getAttribute("data-id");
        if (studentId && studentId !== "undefined") {
            openEditModal(studentId);
        } else {
            console.error("Error: Student ID is missing or undefined.");
        }
    }

    if (event.target.classList.contains("delete-btn")) {
        let studentId = event.target.getAttribute("data-id");
        if (studentId && studentId !== "undefined") {
            deletestudent(studentId);
        } else {
            console.error("Error: Student ID is missing or undefined.");
        }
    }
});

// Delete Student
function deletestudent(studentId) {
    if (confirm("Are you sure you want to delete this student?")) {
        fetch(`/delete_student/${studentId}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    alert("Student deleted successfully!");
                    location.reload(); // Refresh the page
                } else {
                    alert("Error: " + data.error);
                }
            })
            .catch((error) => console.error("Error deleting student:", error));
    }
}

function savestudent() {
    const studentId = document.getElementById('student-id').value;
    const updatedData = {
        reg_no: document.getElementById('edit-reg-no').value,
        name: document.getElementById('edit-name').value,
        dept_code: document.getElementById('edit-dept-code').value,
        batch: document.getElementById('edit-batch').value,
        univ_no: document.getElementById('edit-univ-no').value,
        univ_code: document.getElementById('edit-univ-code').value,
        clg_id: document.getElementById('edit-clg-id').value
    };

    fetch(`/update_student/${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Faculty updated successfully!");
            location.reload();
        } else {
            alert("Error updating student.");
        }
    })
    .catch(error => console.error("Error updating faculty:", error));
}


// Close Edit Modal
function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

// Download CSV Template
function downloadTemplate() {
    const csvContent = "univ_no,name,reg_no\n"; // CSV header
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_upload_template.csv");
    link.click();
}
