 


///////analysis datatable
$("#submit6").click(function (e) {  
	e.preventDefault();
	const analysisData = $("#subjectAnalysisForm")[0];
	const formData = Object.fromEntries(new FormData(analysisData).entries());
	const grade = formData.grade;

	if(grade > 9){
	$.ajax({
    url: '/g12subjectAnalysis',
    data: formData,
    type: "POST",
    success: function(data) {
        if (data.length > 0) {
            let title = data[0].subjectname + " RESULTS ANALYSIS";
            $("#title").html(title.toUpperCase());
            $("#card").prop('hidden', false);
			$("#seniorTable").prop('hidden', false);

            // Helper function to calculate total for male or female
            function calculateTotal(data, prefix) {
                return parseInt(data[prefix + 'one']) +
                       parseInt(data[prefix + 'two']) +
                       parseInt(data[prefix + 'three']) +
                       parseInt(data[prefix + 'four']) +
                       parseInt(data[prefix + 'five']) +
                       parseInt(data[prefix + 'six']) +
                       parseInt(data[prefix + 'seven']) +
                       parseInt(data[prefix + 'eight']);
            }

            // Helper function to calculate pass/fail rates
            function calculateRate(part, total) {
                return total > 0 ? ((part / total) * 100).toFixed(2) : 0;
            }

            // Initialize DataTable
			$('#g12analysisTable').DataTable({
				dom: 'Bfrtip',
				buttons: [
					'copy', 
					{
						extend: 'csvHtml5',
						header: true,
						customize: function(csvData) {
							let firstHeader = ',  ,No. Reg, , , No. Sat, , ,No Absent, , , One, , , Two, , , Three, , , Four, , , Five, , , Six, , , Seven, , , Eight, , , Nine, , , Fail, , , Pass, , , Fail %, , , Pass %\r\n';
							return firstHeader + csvData;
						}
					}, 
					{
						extend: 'excel',
						download: 'download',
						title: title.toUpperCase(),
						pageSize: 'A4',
						orientation: 'landscape'
					}, 
					{
						extend: 'pdf',
						text: 'pdf',
						title: title.toUpperCase(),
						pageSize: 'A4',
						orientation: 'landscape',
						customize: function(pdfDocument) {
							let firstHeaderRow = [];
							$('#g12analysisTable').find("thead>tr:first-child>th").each(
								function(index, element) {
									let colSpan = element.getAttribute("colspan");
									firstHeaderRow.push({
										text: element.innerHTML,
										style: "tableHeader",
										colSpan: colSpan
									});
									for (let i = 0; i < colSpan - 1; i++) {
										firstHeaderRow.push({});
									}
								}
							);
							pdfDocument.content[1].table.body.unshift(firstHeaderRow);
						}
					},
				],
				destroy: true,
				data: data,
				columns: [
					{ data: 'subjectname' }, // Subject Name
					{ data: 'maleenrol' },   // Male Enrol
					{ data: 'femaleenrol' }, // Female Enrol
					{ data: null, render: data => parseInt(data.maleenrol) + parseInt(data.femaleenrol) }, // Total Enrol
					{ data: 'malesat' },     // Male Sat
					{ data: 'femalesat' },   // Female Sat
					{ data: null, render: data => parseInt(data.malesat) + parseInt(data.femalesat) }, // Total Sat
					{ data: null, render: data => parseInt(data.maleenrol) - parseInt(data.malesat) }, // Male Not Sat
					{ data: null, render: data => parseInt(data.femaleenrol) - parseInt(data.femalesat) }, // Female Not Sat
					{ data: null, render: data => (parseInt(data.maleenrol) - parseInt(data.malesat)) + (parseInt(data.femaleenrol) - parseInt(data.femalesat)) }, // Total Not Sat
					// Remaining Columns for Grades One to Nine
					{ data: 'maleone' },
					{ data: 'femaleone' },
					{ data: null, render: data => parseInt(data.maleone) + parseInt(data.femaleone) },
					{ data: 'maletwo' },
					{ data: 'femaletwo' },
					{ data: null, render: data => parseInt(data.maletwo) + parseInt(data.femaletwo) },
					{ data: 'malethree' },
					{ data: 'femalethree' },
					{ data: null, render: data => parseInt(data.malethree) + parseInt(data.femalethree) },
					{ data: 'malefour' },
					{ data: 'femalefour' },
					{ data: null, render: data => parseInt(data.malefour) + parseInt(data.femalefour) },
					{ data: 'malefive' },
					{ data: 'femalefive' },
					{ data: null, render: data => parseInt(data.malefive) + parseInt(data.femalefive) },
					{ data: 'malesix' },
					{ data: 'femalesix' },
					{ data: null, render: data => parseInt(data.malesix) + parseInt(data.femalesix) },
					{ data: 'maleseven' },
					{ data: 'femaleseven' },
					{ data: null, render: data => parseInt(data.maleseven) + parseInt(data.femaleseven) },
					{ data: 'maleeight' },
					{ data: 'femaleeight' },
					{ data: null, render: data => parseInt(data.maleeight) + parseInt(data.femaleeight) },
					{ data: 'malenine' },
					{ data: 'femalenine' },
					{ data: null, render: data => parseInt(data.malenine) + parseInt(data.femalenine) },
					// Fail & Pass Calculations
					{ data: null, render: data => {
						let maleNumFailed = parseInt(data.malesat) - calculateTotal(data, 'male');
						return maleNumFailed;
					}},
					{ data: null, render: data => {
						let totalFemaleFailed = parseInt(data.femalesat) - calculateTotal(data, 'female');
						return totalFemaleFailed;
					}},
					{ data: null, render: (data, type, row) => {
						let totalFail = parseInt(row.malesat) - calculateTotal(row, 'male') + parseInt(row.femalesat) - calculateTotal(row, 'female');
						return totalFail;
					}},
					{ data: null, render: data => calculateTotal(data, 'male') },
					{ data: null, render: data => calculateTotal(data, 'female') },
					{ data: null, render: (data, type, row) => calculateTotal(row, 'male') + calculateTotal(row, 'female') },
					{ data: null, render: data => calculateRate(parseInt(data.malesat) - calculateTotal(data, 'male'), parseInt(data.malesat)) },
					{ data: null, render: data => calculateRate(parseInt(data.femalesat) - calculateTotal(data, 'female'), parseInt(data.femalesat)) },
					{ data: null, render: (data, type, row) => {
						let totalSat = parseInt(row.malesat) + parseInt(row.femalesat);
						let totalFail = parseInt(row.malesat) - calculateTotal(row, 'male') + parseInt(row.femalesat) - calculateTotal(row, 'female');
						return calculateRate(totalFail, totalSat);
					}},
					{ data: null, render: data => calculateRate(calculateTotal(data, 'male'), parseInt(data.malesat)) },
					{ data: null, render: data => calculateRate(calculateTotal(data, 'female'), parseInt(data.femalesat)) },
					{ data: null, render: (data, type, row) => {
						let totalSat = parseInt(row.malesat) + parseInt(row.femalesat);
						let totalPass = calculateTotal(row, 'male') + calculateTotal(row, 'female');
						return calculateRate(totalPass, totalSat);
					}}
				]
			});
			$("#subjectAnalysisForm").css('display', 'none')
			$("#g12analysisTable").css('display', 'block')
        } else {
            $("#title").html('');
            $("#card").prop('hidden', true);
            toastr.error("No data available.");
        }
    },
    error: function(jqXHR, textStatus, err) {
        toastr.error(`Error ${jqXHR.status}: ${err}`);
        window.location.replace('/dashboard');
    }
});
	

}else{

	$.ajax({
    url: '/g9subjectAnalysis',
    data: formData,
    type: "POST",
    success: function(data) {
		
        if (data.length > 0) {
            let title = data[0].subjectname + " RESULTS ANALYSIS";
            $("#title").html(title.toUpperCase());
            $("#card").prop('hidden', false);
			$("#juniorTable").prop('hidden', false);

            // Helper function to calculate total for male or female
            function calculateTotal(data, prefix) {
                return parseInt(data[prefix + 'one']) +
                       parseInt(data[prefix + 'two']) +
                       parseInt(data[prefix + 'three']) +
                       parseInt(data[prefix + 'four']);
            }

            // Helper function to calculate pass/fail rates
            function calculateRate(part, total) {
                return total > 0 ? ((part / total) * 100).toFixed(2) : 0;
            }

            // Initialize DataTable
			$('#g9analysisTable').DataTable({
				dom: 'Bfrtip',
				buttons: [
					'copy', 
					{
						extend: 'csvHtml5',
						header: true,
						customize: function(csvData) {
							let firstHeader = ',  ,No. Reg, , , No. Sat, , ,No Absent, , , One, , , Two, , , Three, , , Four, , , Fail, , , Pass, , , Fail %, , , Pass %\r\n';
							return firstHeader + csvData;
						}
					}, 
					{
						extend: 'excel',
						download: 'download',
						title: title.toUpperCase(),
						pageSize: 'A4',
						orientation: 'landscape'
					}, 
					{
						extend: 'pdf',
						text: 'pdf',
						title: title.toUpperCase(),
						pageSize: 'A4',
						orientation: 'landscape',
						customize: function(pdfDocument) {
							let firstHeaderRow = [];
							$('#g9analysisTable').find("thead>tr:first-child>th").each(
								function(index, element) {
									let colSpan = element.getAttribute("colspan");
									firstHeaderRow.push({
										text: element.innerHTML,
										style: "tableHeader",
										colSpan: colSpan
									});
									for (let i = 0; i < colSpan - 1; i++) {
										firstHeaderRow.push({});
									}
								}
							);
							pdfDocument.content[1].table.body.unshift(firstHeaderRow);
						}
					},
				],
				destroy: true,
				data: data,
				columns: [
					{ data: 'subjectname' }, // Subject Name
					{ data: 'maleenrol' },   // Male Enrol
					{ data: 'femaleenrol' }, // Female Enrol
					{ data: null, render: data => parseInt(data.maleenrol) + parseInt(data.femaleenrol) }, // Total Enrol
					{ data: 'malesat' },     // Male Sat
					{ data: 'femalesat' },   // Female Sat
					{ data: null, render: data => parseInt(data.malesat) + parseInt(data.femalesat) }, // Total Sat
					{ data: null, render: data => parseInt(data.maleenrol) - parseInt(data.malesat) }, // Male Not Sat
					{ data: null, render: data => parseInt(data.femaleenrol) - parseInt(data.femalesat) }, // Female Not Sat
					{ data: null, render: data => (parseInt(data.maleenrol) - parseInt(data.malesat)) + (parseInt(data.femaleenrol) - parseInt(data.femalesat)) }, // Total Not Sat
					// Remaining Columns for Grades One to Nine
					{ data: 'maleone' },
					{ data: 'femaleone' },
					{ data: null, render: data => parseInt(data.maleone) + parseInt(data.femaleone) },
					{ data: 'maletwo' },
					{ data: 'femaletwo' },
					{ data: null, render: data => parseInt(data.maletwo) + parseInt(data.femaletwo) },
					{ data: 'malethree' },
					{ data: 'femalethree' },
					{ data: null, render: data => parseInt(data.malethree) + parseInt(data.femalethree) },
					{ data: 'malefour' },
					{ data: 'femalefour' },
					{ data: null, render: data => parseInt(data.malefour) + parseInt(data.femalefour) },
					// Fail & Pass Calculations
					{ data: null, render: data => {
						let maleNumFailed = parseInt(data.malesat) - calculateTotal(data, 'male');
						return maleNumFailed;
					}},
					{ data: null, render: data => {
						let totalFemaleFailed = parseInt(data.femalesat) - calculateTotal(data, 'female');
						return totalFemaleFailed;
					}},
					{ data: null, render: (data, type, row) => {
						let totalFail = parseInt(row.malesat) - calculateTotal(row, 'male') + parseInt(row.femalesat) - calculateTotal(row, 'female');
						return totalFail;
					}},
					{ data: null, render: data => calculateTotal(data, 'male') },
					{ data: null, render: data => calculateTotal(data, 'female') },
					{ data: null, render: (data, type, row) => calculateTotal(row, 'male') + calculateTotal(row, 'female') },
					{ data: null, render: data => calculateRate(parseInt(data.malesat) - calculateTotal(data, 'male'), parseInt(data.malesat)) },
					{ data: null, render: data => calculateRate(parseInt(data.femalesat) - calculateTotal(data, 'female'), parseInt(data.femalesat)) },
					{ data: null, render: (data, type, row) => {
						let totalSat = parseInt(row.malesat) + parseInt(row.femalesat);
						let totalFail = parseInt(row.malesat) - calculateTotal(row, 'male') + parseInt(row.femalesat) - calculateTotal(row, 'female');
						return calculateRate(totalFail, totalSat);
					}},
					{ data: null, render: data => calculateRate(calculateTotal(data, 'male'), parseInt(data.malesat)) },
					{ data: null, render: data => calculateRate(calculateTotal(data, 'female'), parseInt(data.femalesat)) },
					{ data: null, render: (data, type, row) => {
						let totalSat = parseInt(row.malesat) + parseInt(row.femalesat);
						let totalPass = calculateTotal(row, 'male') + calculateTotal(row, 'female');
						return calculateRate(totalPass, totalSat);
					}}
				]
			});
			$("#subjectAnalysisForm").css('display', 'none')
			$("#g9analysisTable").css('display', 'block')
        } else {
            $("#title").html('');
            $("#card").prop('hidden', true);
            toastr.error("No data available.");
        }
    },
    error: function(jqXHR, textStatus, err) {
        toastr.error(`Error ${jqXHR.status}: ${err}`);
        window.location.replace('/dashboard');
    }
});
	}
});
		

/////////////////////////check pupil data function/////////////////
function checkPupilData(event) {
    const form = document.getElementById('subjectRegistration');
   

    const subjectcode = $("#subjectcode").val(); // Assuming subjectcode is an input/select element
    const pupilData = [];

    // Collecting data only for selected students
    $('#studentSubjectTable tr').each(function() { // Updated selector
        const isSelected = $(this).find('input[type="checkbox"]').is(':checked'); // Adjust this selector if your checkbox input has a specific name/class
     

        if (isSelected) {
            const examno = $(this).find('input[name="examno"]').val(); // Assuming the exam number input has name="examno"
            if (examno) {
                pupilData.push({ examno, subjectcode });
            }
        }
    });


    if (pupilData.length > 0) {
        jQuery.ajax({
            url: "/EnrollStudentSubject",
            data: JSON.stringify(pupilData),
            type: "POST",
            contentType: "application/json",
            success: function(data) {
                alert(data);
                window.location.href = "/studentSubject";
            },
            error: function() {
                alert("Registration failed");
                window.location.href = "/studentSubject";
            }
        });
    } else {
        alert("No students selected for enrollment.");
    }
}

	
///////////////////////////////handle submit marks///////////////////////////////////////////////
window.addEventListener("DOMContentLoaded", (event) => {
	
    // Ensure the element exists before attaching the event listener
    const submitButton = document.getElementById('marksheetsubmit');
    if (!submitButton) {
        return;
    }

	submitButton.addEventListener('click', function (event) {
        event.preventDefault();	 
		// Get the exam ID and subject code values
			const examids = document.querySelector("#examid").value;
			const subjectcodes = document.querySelector("#subjectcode").value;
			const schoolyearid = document.querySelector("#yearid").value;
			const termid = document.querySelector("#termid").value;

			// Get all elements with exam numbers and scores
			const examnoElements = document.querySelectorAll("#marksEntryForm [name='examno[]']");
			const scoreElements = document.querySelectorAll("#marksEntryForm [name='score[]']");

			// Map each exam number to its corresponding score, and filter out entries where the score is empty
			const examData = Array.from(examnoElements).map((examnoElement, index) => {
			return {
				examno: examnoElement.value,
				score: scoreElements[index].value
			};
			}).filter(item => item.score !== "" && item.score !== null);

			// Prepare the data object to send
			const formData = {
					examid: examids,
					subjectcode: subjectcodes,
					yearid: schoolyearid,
					termid: termid,
					examData: examData // Contains the array of objects with examno and score, excluding empty scores
				};

			console.log(formData)
		  
		// Make AJAX request
		fetch('/enterMarks',{
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify(formData)
		})
		.then(response => response.json())
		.then(data => {
			alert(data.message);
		  	window.location.href = "/Dashboard";
		})
		.catch(() => {
		  alert("Online marks entry failed");
		    window.location.href = "/Dashboard";
		});
	  });
	})
	  


////////////////////////////////*send email function*//////////////////////////////////////////////
		  function sendEmail(){
			const form = document.getElementById('sendEmailForm');
			const formData = Object.fromEntries(new FormData(form).entries());
				jQuery.ajax({
					url: "/sendMail",
					data: formData,
					type: "POST",
					success: function(data){
						// alert(data);
						// window.location.href = "/Dashboard"; 
					},
						error:function (){
							alert("error message not sent");
						}
					});	
				}

