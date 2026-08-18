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

    // Add Clear Search button
    $('#teacherTable_filter').append('<button id="clearSearch" class="btn btn-outline-secondary ml-2">Clear</button>');

    // Clear search functionality
    $('#clearSearch').on('click', function () {
      $('#teacherTable').DataTable().search('').draw();
    });
  } catch (error) {
    console.error('Error initializing DataTable:', error);
  }
});
