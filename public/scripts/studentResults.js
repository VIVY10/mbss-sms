document
  .getElementById("selectSubjectcode")
  .addEventListener("change", function () {
    // Get the selected option
    var selectedOption = this.options[this.selectedIndex];
    // Get the classid, grade, and section from the data attributes
    var classid = selectedOption.getAttribute("data-classid");
    var grade = selectedOption.getAttribute("data-grade");
    var section = selectedOption.getAttribute("data-section");

    // Set the value of the hidden classid input field
    document.getElementById("selectClassid").value = classid;

    // Display the selected class in the div
    document.getElementById("selectedClassDisplay").textContent =
      `Selected Class: ${grade}${section}`;
  });

document.getElementById("term").addEventListener("change", function () {
  // Get the selected option
  var selectedOption = this.options[this.selectedIndex];
  // Get the classid, grade, and section from the data attributes
  var year = selectedOption.getAttribute("data-year");
  // Set the value of the hidden classid input field
  document.getElementById("selectYear").value = year;
});

// let formData = {}; // Global variable for form data
var data = []; // Global variable for form data
$(document).ready(function () {
  // Initial DataTable setup if needed
  var table = $("#example").DataTable({
    dom: "Bfrtip",
    buttons: [
      {
        extend: "copy",
        title: function () {
          return `Grade_${data[0].grade}${data[0].class}_${data[0].subjectname || "Subject"}_${data[0].exam_title || "Exam"}_Results`;
        },
        filename: function () {
          return `Grade_${data[0].grade} ${data[0].class}_${data[0].subjectname || "Subject"}_${data[0].exam_title || "Exam"}_Results`;
        },
        exportOptions: {
          columns: ":not(:nth-last-child(-n+2))", // Exclude the last two columns (Edit and Delete buttons)
        },
      },
      {
        extend: "excel",
        title: function () {
          return `Grade_${data[0].grade}${data[0].class}_${data[0].subjectname || "Subject"}_${data[0].exam_title || "Exam"}_Results`;
        },
        filename: function () {
          return `Grade_${data[0].grade} ${data[0].class}_${data[0].subjectname || "Subject"}_${data[0].exam_title || "Exam"}_Results`;
        },
        exportOptions: {
          columns: ":not(:nth-last-child(-n+2))",
        },
      },
      {
        extend: "pdf",
        title: function () {
          return `Grade_${data[0].grade}${data[0].class}_${data[0].subjectname || "Subject"}_${data[0].exam_title || "Exam"}_Results`;
        },
        filename: function () {
          return `Grade_${data[0].grade} ${data[0].class}_${data[0].subjectname || "Subject"}_${data[0].exam_title || "Exam"}_Results`;
        },
        // exportOptions: {
        //   columns: ":not(:nth-last-child(-n+2))",
        // },
        exportOptions: {
          columns: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        },

        customize: function (doc) {
          doc.styles.title = {
            fontSize: 12,
            bold: true,
            alignment: "center",
            margin: [0, 0, 0, 25],
          };
        },
      },
      {
        extend: "print",
        title: function () {
          return `Grade_${data[0].grade}${data[0].class}_${data[0].subjectname || "Subject"}_${data[0].exam_title || "Exam"}_Results`;
        },
        exportOptions: {
          columns: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        },
      },
    ],
    // data: [], // Initialize with empty data
    columns: [
      { data: "lname" },
      { data: "fname" },
      { data: "gender" },
      { data: "id" },
      { data: "grade" },
      { data: "class" },
      { data: "exam_title" },
      { data: "term" },
      { data: "score" },
      {
        defaultContent:
          '<div class="editResult"><span class="material-icons">edit</span></div>',
      },
      {
        defaultContent:
          '<div type="button" class="deleteResult"><span class="material-icons">delete</span></div>',
      },
    ],
    rowId: "id", // This will set the row ID attribute to the value of the 'id' field
  });

  $("#submit2").click(function (e) {
    e.preventDefault();

    const classData = $("#classInfo")[0];
    const formData = Object.fromEntries(new FormData(classData).entries());

    $("#loading").show(); // Show loading indicator

    var xmlhttp = new XMLHttpRequest();
    var url = "/classResults";
    xmlhttp.open("post", url, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(formData));

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4) {
        $("#loading").hide(); // Hide loading indicator

        if (this.status == 200) {
          data = JSON.parse(this.responseText);

          if (data.length === 0) {
          } else {
            $("#classInfo").css("display", "none");
            table.clear().rows.add(data).draw();
            $("#resultsTable").css("display", "block");
          }
          // const data = JSON.parse(this.responseText);
          // if (data.length === 0) {

          // } else {
          //     $("#classInfo").css('display', 'none');  // Hide the element with id 'classInfo'
          //     table.clear().rows.add(data).draw();      // Clear the table and add new data
          //     $("#resultsTable").css('display', 'block');   // Show the element with id 'example'

          // }
        } else if (this.status == 404) {
          // console.error("Route not found: /classInfo");
          alert("No results found");
          window.location.href = "/classResults";
        } else {
          alert("unexpected error occured");
          window.location.href = "/classResults";
        }
      }
    };
  });

  // Event delegation for dynamically added rows
  $("#example").on("click", ".deleteResult", function () {
    var row = $(this).closest("tr");
    var data_row = table.row(row).data();

    if (confirm("Are you sure you want to delete this record?")) {
      var xmlhttp = new XMLHttpRequest();
      var url = "/deleteResult"; // Update with your delete endpoint
      xmlhttp.open("POST", url, true);
      xmlhttp.setRequestHeader(
        "Content-Type",
        "application/json;charset=UTF-8",
      );
      // Send the ID relevant data to the server
      xmlhttp.send(JSON.stringify({ data: data_row })); // Adjust based on your data structure

      xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          // Optionally, handle the response here
          var response = JSON.parse(this.responseText);

          if (response.message === "Success") {
            table.row(row).remove().draw();
            // alert('Record deleted successfully.');
          } else {
            alert("Failed to delete record.");
          }
        }
      };
    }
  });

  // Event delegation for dynamically added rows
  $("#example").on("click", ".editResult", function () {
    var row = $(this).closest("tr");
    var data_row = table.row(row).data();

    // Update the modal content with data_row values
    $("#editModalLabel").text(
      "Edit Record: " + data_row.fname + " " + data_row.lname,
    );
    $("#editForm #lname").text(data_row.lname);
    $("#editForm #examno").text(data_row.id);

    $("#editForm #fname").text(data_row.fname);
    $("#editForm #gender").val(data_row.gender);
    $("#editForm #grade").val(data_row.grade);
    $("#editForm #class").val(data_row.class);
    $("#editForm #exam_title").val(data_row.exam_title);
    $("#editForm #term").val(data_row.term);
    $("#editForm #id").val(data_row.id); // Store the ID for updating
    $("#editForm #examid").val(data_row.examid);
    $("#editForm #subjectcode").val(data_row.subjectcode);
    $("#editForm #fname").val(data_row.fname);
    $("#editForm #examno").val(data_row.id);
    $("#editForm #lname").val(data_row.lname);

    // Show the modal
    $("#editModal").modal("show");

    // Handle form submission for updating

    $("#editForm").submit(function (e) {
      e.preventDefault();

      var updatedData = {
        lname: $("#editForm #lname").val(),
        fname: $("#editForm #fname").val(),
        gender: $("#editForm #gender").val(),
        id: $("#editForm #examno").val(),
        grade: $("#editForm #grade").val(),
        section: $("#editForm #class").val(),
        exam_title: $("#editForm #exam_title").val(),
        term: $("#editForm #term").val(),
        score: $("#editForm #score").val(),
        examid: $("#editForm #examid").val(),
        subjectcode: $("#editForm #subjectcode").val(),
      };

      var xmlhttp = new XMLHttpRequest();
      var url = "/updateResult";
      xmlhttp.open("POST", url, true);
      xmlhttp.setRequestHeader(
        "Content-Type",
        "application/json;charset=UTF-8",
      );
      xmlhttp.send(JSON.stringify(updatedData));

      xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          var response = JSON.parse(this.responseText);
          if (response.message === "Success") {
            var row = table.row("#" + updatedData.id); // Use the ID directly to find the row
            if (row.node()) {
              // Check if the row exists
              row.data(updatedData).draw();
              $("#editModal").modal("hide");
            } else {
              console.error("Row not found for ID: " + updatedData.id);
            }
          } else {
            $("#editModal").modal("hide");
            alert("Failed to update record.");
          }
        }
      };
    });
  });
});
