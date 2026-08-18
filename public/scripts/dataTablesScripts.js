 $(document).ready(function () {
    $('#schoolYearsTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [4] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });

    $('#clearSearch').on('click', function () {
      $('#schoolYearsTable').DataTable().search('').draw();
    });
  });
  
  

  $(document).ready(function () {
    $('#departmentsTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ pupils per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [2] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });

    $('#clearSearch').on('click', function () {
      $('#departmentsTable').DataTable().search('').draw();
    });
  });
  
  
  $(document).ready(function () {
    $('#classTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [4] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });

    $('#clearSearch').on('click', function () {
      $('#classTable').DataTable().search('').draw();
    });
  });
  
  
  
  $(document).ready(function () {
    $('#classSubjectsTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [4] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });

    $('#clearSearch').on('click', function () {
      $('#classSubjectsTable').DataTable().search('').draw();
    });
  });



  $(document).ready(function () {
    $('#subjectsTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [2] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });

    $('#clearSearch').on('click', function () {
      $('#subjectsTable').DataTable().search('').draw();
    });
  });
  
  
 
  $(document).ready(function () {
    $('#viewClassSubjectsTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search Pupils...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ pupils per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [4] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });

    $('#clearSearch').on('click', function () {
      $('#viewClassSubjectsTable').DataTable().search('').draw();
    });
  });
  
  

  $(document).ready(function () {
    $('#viewGuardianTypeTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search Pupils...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ Records per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [2] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });

    $('#clearSearch').on('click', function () {
      $('#viewGuardianTypeTable').DataTable().search('').draw();
    });
  });



  $(document).ready(function () {
    $('#examsTable').DataTable({
      paging: false, // Enable pagination
      searching: false, // Enable search
      ordering: false, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ Records per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [2] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });

    $('#clearSearch').on('click', function () {
      $('#examsTable').DataTable().search('').draw();
    });
  });
  
  
  
$(document).ready(function () {
  try {
    $('#teacherTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      responsive: true,
      columnDefs: [
        { orderable: false, targets: [7, 8] }, // Disable sorting for Action columns
        { className: "text-center", targets: "_all" } // Center-align all columns
      ],
      order: [[0, 'asc']], // Default sorting by the first column (ID)
      language: {
        search: "Search Teachers:",
        lengthMenu: "Show _MENU_ teachers per page",
        info: "Showing _START_ to _END_ of _TOTAL_",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      }
    });

    // Clear search functionality
    $('#clearSearch').on('click', function () {
      $('#teacherTable').DataTable().search('').draw();
    });
  } catch (error) {
    console.error('Error initializing DataTable:', error);
  }
});



   $(document).ready(function () {
    $('#trDepartmentAllocation').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      language: {
        searchPlaceholder: "Search...",
        search: "_INPUT_", // Remove default search label
        lengthMenu: "Show _MENU_ teachers per page",
        info: "Showing _START_ to _END_ of _TOTAL_ teachers",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [4] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });
  });
  
  
  
  

 $(document).ready(function () {
  const table = $('#viewHodTable').DataTable({
    paging: true,
    searching: true,
    ordering: true,
    language: {
      searchPlaceholder: "Search...",
      search: "_INPUT_", // Remove default search label
    },
    columnDefs: [
        { orderable: false, targets: [2, 3] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
  });
});



  $(document).ready(function () {
    $('#pupilTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search Pupils...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ pupils per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [9, 10, 11] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });
    // $('#pupilTable_filter').append('<button id="clearSearch" class="btn btn-outline-secondary">Clear</button>');

    $('#clearSearch').on('click', function () {
      $('#pupilTable').DataTable().search('').draw();
    });
  });





  $(document).ready(function () {
    $('#guardianTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [5] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });

    $('#clearSearch').on('click', function () {
      $('#guardianTable').DataTable().search('').draw();
    });

  });




   $(document).ready(function () {
    const table = $('#subjectAllocationTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      language: {
        searchPlaceholder: "Search...",
        search: "_INPUT_", // Remove default search label
        lengthMenu: "Show _MENU_ teachers per page",
        info: "Showing _START_ to _END_ of _TOTAL_ teachers",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [3] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });
  });
  
  
  
  

   $(document).ready(function () {
    const table = $('#unAllocatedSubjectsTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      language: {
        searchPlaceholder: "Search...",
        search: "_INPUT_", // Remove default search label
        lengthMenu: "Show _MENU_ teachers per page",
        info: "Showing _START_ to _END_ of _TOTAL_ teachers",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [3] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });
  });
  
  
  

  $(document).ready(function () {
    $('#marksEntryTable').DataTable({
      paging: false, // Enable pagination
      searching: false, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        //{ orderable: false, targets: [] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });

    $('#clearSearch').on('click', function () {
      $('#marksEntryTable').DataTable().search('').draw();
    });
  });
  
  
  

  $(document).ready(function () {
    $('#allocateClassTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [5] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });
    $('#clearSearch').on('click', function () {
      $('#allocateClassTable').DataTable().search('').draw();
    });
  });



 
   $(document).ready(function () {
    const table = $('#departmentTrsTable').DataTable({
      paging: true,
      searching: true,
      ordering: true,
      language: {
        searchPlaceholder: "Search...",
        search: "_INPUT_", // Remove default search label
      },
      columnDefs: [
          { orderable: false, targets: [2] }, // Disable sorting for action columns
          { className: "text-center", targets: "_all" } // Center align all columns
        ],
    });
  });
  
  
  



  $(document).ready(function () {
    $('#allocateClassTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_ of _TOTAL_ records",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [5] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });
    // $('#pupilTable_filter').append('<button id="clearSearch" class="btn btn-outline-secondary">Clear</button>');

    $('#clearSearch').on('click', function () {
      $('#allocateClassTable').DataTable().search('').draw();
    });
  });
  
  
  
  $(document).ready(function () {
    $('#mySubjectsTable').DataTable({
      paging: false, // Enable pagination
      searching: false, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        //{ orderable: false, targets: [] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });
    // $('#pupilTable_filter').append('<button id="clearSearch" class="btn btn-outline-secondary">Clear</button>');

    $('#clearSearch').on('click', function () {
      $('#mySubjectsTable').DataTable().search('').draw();
    });
  });





  $(document).ready(function () {
    $('#studentSubjectListTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [3] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });
    // $('#pupilTable_filter').append('<button id="clearSearch" class="btn btn-outline-secondary">Clear</button>');

    $('#clearSearch').on('click', function () {
      $('#studentSubjectListTable').DataTable().search('').draw();
    });
  });
  
  

  $(document).ready(function () {
    $('#checkSubjectsTaughtTable').DataTable({
      paging: false, // Enable pagination
      searching: false, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [3] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });
    // $('#pupilTable_filter').append('<button id="clearSearch" class="btn btn-outline-secondary">Clear</button>');

    $('#clearSearch').on('click', function () {
      $('#checkSubjectsTaughtTable').DataTable().search('').draw();
    });
  });


 $(document).ready(function () {
    $('#termsTable').DataTable({
      paging: true, // Enable pagination
      searching: true, // Enable search
      ordering: true, // Enable column sorting
      language: {
        searchPlaceholder: "Search...", // Custom placeholder
        search: "_INPUT_", // Remove default search text
        lengthMenu: "Show _MENU_ records per page",
        info: "Showing _START_ to _END_ of _TOTAL_ pupils",
        paginate: {
          previous: "Previous",
          next: "Next"
        }
      },
      columnDefs: [
        { orderable: false, targets: [5] }, // Disable sorting for action columns
        { className: "text-center", targets: "_all" } // Center align all columns
      ],
    });
    // $('#pupilTable_filter').append('<button id="clearSearch" class="btn btn-outline-secondary">Clear</button>');

    $('#clearSearch').on('click', function () {
      $('#termsTable').DataTable().search('').draw();
    });
  });










  

  


  
  
