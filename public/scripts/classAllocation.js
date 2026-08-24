const classAllocationBtn = document.getElementById("classAllocation");
const unallocatedClassSubjects = document.getElementById("unallocatedSubjects");

classAllocationBtn.addEventListener("click", subjectAllocationModal);

unallocatedClassSubjects.addEventListener("click", subjectAllocationModal2);

document
  .getElementById("allocationModalForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const termidInput = document.getElementById('termid');
    const termid = termidInput ? termidInput.value : null;

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("allocationModal"),
    );
    modal.hide();

    // Redirect with proper query parameter
    if (Number(termid)) {
        window.location.href = `/classAllocation?termid=${termid}`;
    } else {
        console.error('Term ID is required');
        alert('Please select a term');
    }
    
  });

document
  .getElementById("unallocatedClassSubjects")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const termid = this.termid2.value;
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("allocationModal2"),
    );
    modal.hide();

        // Redirect with proper query parameter
    if (Number(termid)) {
        window.location.href = `/unallocatedSubjects?termid=${termid}`;
    } else {
        console.error('Term ID is required');
        alert('Please select a term');
    }

    
  });

// utiltiy functions
async function subjectAllocationModal() {
  populateTerms();
  const modal = new bootstrap.Modal(
    document.getElementById("allocationModal"),
    {
      backdrop: "static", // Optional: Prevent closing by clicking outside
      keyboard: false, // Optional: Prevent closing with ESC key
    },
  );
  modal.show();
}

async function subjectAllocationModal2() {
  populateTerms2();
  const modal = new bootstrap.Modal(
    document.getElementById("allocationModal2"),
    {
      backdrop: "static", // Optional: Prevent closing by clicking outside
      keyboard: false, // Optional: Prevent closing with ESC key
    },
  );
  modal.show();
}

//populate assugnment types for schedule monitoring modal
async function populateTerms() {
  const response = await fetch("/fetchTerms");
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  const data = await response.json();

  // Populate assigned_to dropdown
  const allocationSelect = document.getElementById("termid");
  allocationSelect.innerHTML = '<option value="">Choose...</option>';
  data.forEach((allocation) => {
    const option = document.createElement("option");
    option.value = allocation.termid;
    option.textContent = allocation.termname;
    allocationSelect.appendChild(option);
  });
}

//populate assugnment types for schedule monitoring modal
async function populateTerms2() {
  const response = await fetch("/fetchTerms");
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  const data = await response.json();

  // Populate assigned_to dropdown
  const allocationSelect = document.getElementById("termid2");
  allocationSelect.innerHTML = '<option value="">Choose...</option>';
  data.forEach((allocation) => {
    const option = document.createElement("option");
    option.value = allocation.termid;
    option.textContent = allocation.termname;
    allocationSelect.appendChild(option);
  });
}
