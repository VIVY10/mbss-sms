
$('#studentInfoBtn').on('click', function(event) {
    event.preventDefault();

    const form = document.getElementById('studentReg');
    const formData = new FormData(form); // Automatically handles file uploads

    jQuery.ajax({
        url: "/register",
        data: formData,
        type: "POST",
        processData: false,  // Required for FormData
        contentType: false,  // Required for FormData
        success: function(data) {
            alert(data.message);
            window.location.href = "/register";
        },
        error: function(err) {
            alert("Registration failed");
            window.location.href = "/register";
        }
    });
});





let currentRequest = null; // Track ongoing request
let debounceTimeout;

function checkExamno() {
    const examno = $("#examno").val();
    
    const examnoStr = String(examno);

    if (examnoStr.length < 12) {
        $("#check-examno").html("<span id='errorMsg'>Exam number must be at least 12 digits.</span>");
        return;
    }

    // Abort any ongoing request
    if (currentRequest) {
        currentRequest.abort();
    }

    currentRequest = $.ajax({
        url: "/checkExamno",
        type: "POST",
        data: { examno },
        success: function (response) {
            $("#check-examno").html(`<span id="successMsg">${response.message}</span>`);
        },
        error: function () {
            $("#check-examno").html("<span id='errorMsg'>An unexpected error occurred.</span>");
        },
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const examnoInput = document.getElementById("examno");
    if (examnoInput) {
        examnoInput.addEventListener("input", () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(checkExamno, 300); // Delay of 300ms
        });
    }
});



    


   document.getElementById('selectedClass').addEventListener('change', function() {
        // Get the selected option
        var selectedOption = this.options[this.selectedIndex];
        // Get the classid, grade, and section from the data attributes
        var yearlevel = selectedOption.getAttribute('data-levelid');
        // Set the value of the hidden levelorder input field
        document.getElementById('yearlevel').value = yearlevel;
    });


    $('#editStudentInfoBtn').on('click', function(event) {
        event.preventDefault();
    
        const form = document.getElementById('editStudentForm');
        const formData = Object.fromEntries(new FormData(form).entries()); //get form entries
    
        // console.log(formData)    
        jQuery.ajax({
            url: "/updatePupilRecord",
            data: formData,
            type: "POST",
            success: function(data) {
                alert(data.message);
                window.location.href = "/viewPupils";
            },
            error: function() {
                alert("Update failed");
                window.location.href = "/viewPupils";
            }
        });
    });