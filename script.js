let isAdmin = true;

/* ===== View Switching ===== */
function toggleMode() {
  const adminPages = document.querySelectorAll('.page');
  const staffPages = document.querySelectorAll('.staff-page');
  const adminMenu = document.querySelector('.admin-menu');
  const staffMenu = document.querySelector('.staff-menu');
  const headerTitle = document.getElementById('headerTitle');
  const sidebarName = document.getElementById('sidebarName');
  isAdmin = !isAdmin;

  if (isAdmin) {
    adminPages.forEach(p => p.classList.add('hidden'));
    staffPages.forEach(p => p.classList.remove('hidden'));
    adminMenu.classList.add('hidden');
    staffMenu.classList.remove('hidden');
    headerTitle.textContent = 'Staff';
    sidebarName.textContent = 'Staff Name';
    showStaffPage('staffHome');
  } else {
    checkFirstTimeLogin();
    staffPages.forEach(p => p.classList.add('hidden'));
    adminPages.forEach(p => p.classList.remove('hidden'));
    adminMenu.classList.remove('hidden');
    staffMenu.classList.add('hidden');
    headerTitle.textContent = 'Administrator';
    sidebarName.textContent = 'Admin Name';
    showAdminPage('home');
  }
}

let containerToRemove = null; // global pointer to the current container
let selectedOrderCard = null;
let hasChangedPassword = false; // ensures popup only appears the first time

// Show popup when switching to staff page the first time
function checkFirstTimeLogin() {
  if (!hasChangedPassword) {
    document.getElementById('changePasswordPopup').classList.remove('hidden');
  }
}

// Toggle requirements visibility when clicking info icon
document.getElementById('newPassInfo').addEventListener('click', () => {
  document.getElementById('passwordRequirements').classList.toggle('hidden');
});

// Validate password fields
function validatePassword() {
  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;

  const newPassError = document.getElementById('newPassError');
  const confirmPassError = document.getElementById('confirmPassError');
  const submitBtn = document.getElementById('changePasswordBtn');

  // Password requirements regex
  const passValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(newPass);

  // Check main password
  if (newPass.length > 0 && !passValid) {
    newPassError.classList.remove('hidden');
  } else {
    newPassError.classList.add('hidden');
  }

  // Check confirm password
  if (confirmPass.length > 0 && newPass !== confirmPass) {
    confirmPassError.classList.remove('hidden');
  } else {
    confirmPassError.classList.add('hidden');
  }

  // Enable button only if both are valid
  if (passValid && newPass === confirmPass) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

function validateMainPassword() {
  const newPass = document.getElementById('mainNewPassword').value;
  const confirmPass = document.getElementById('mainConfirmPassword').value;

  const newPassError = document.getElementById('mainNewPassError');
  const confirmPassError = document.getElementById('mainConfirmPassError');
  const submitBtn = document.getElementById('mainChangePasswordBtn');

  // Password validation regex
  const passValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(newPass);

  // Show X icon only if user typed something AND it's invalid
  if (newPass.length > 0 && !passValid) {
    newPassError.classList.remove('hidden');
  } else {
    newPassError.classList.add('hidden');
  }

  // Confirm password check
  if (confirmPass.length > 0 && newPass !== confirmPass) {
    confirmPassError.classList.remove('hidden');
  } else {
    confirmPassError.classList.add('hidden');
  }

  // Enable button only if both are valid
  if (passValid && newPass === confirmPass) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}


// Submit password change
function submitPasswordChange() {
  hasChangedPassword = true;
  document.getElementById('changePasswordPopup').classList.add('hidden');
  alert('Password successfully changed!');

  // Reset fields
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}

function submitMainPasswordChange() {
  alert('Password successfully changed!');
  document.getElementById('mainChangePasswordPopup').classList.add('hidden');

  // Clear fields
  document.getElementById('mainNewPassword').value = '';
  document.getElementById('mainConfirmPassword').value = '';

  // Hide error icons
  document.getElementById('mainNewPassError').classList.add('hidden');
  document.getElementById('mainConfirmPassError').classList.add('hidden');

  // Disable button again
  document.getElementById('mainChangePasswordBtn').disabled = true;
}


function updateHomeCounts() {
  const approvals = document.querySelectorAll('.approval-item');
  const withdraws = document.querySelectorAll('.withdraw-item');

  document.getElementById('approvalCount').textContent = approvals.length;
  document.getElementById('withdrawCount').textContent = withdraws.length;
}

function showAdminPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  // highlight the active admin link
  document.querySelectorAll('.admin-menu a').forEach(a => {
    a.classList.toggle('active', a.dataset.adminTarget === pageId);
  });
}

function showStaffPage(pageId) {
  document.querySelectorAll('.staff-page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  // highlight the active staff link
  document.querySelectorAll('.staff-menu a').forEach(a => {
    a.classList.toggle('active', a.dataset.staffTarget === pageId);
  });
}

/* Popups */
function openConfirmPopup() {
  document.getElementById('confirmPopup').classList.remove('hidden');
}

function openAddStaffPopup() {
  document.getElementById('addStaffPopup').classList.remove('hidden');
}

function showOrderDetails(orderId, element) {
  selectedOrderCard = element; // Save clicked order card
  document.getElementById('orderDetails').classList.remove('hidden');
  document.getElementById('selectedOrderTitle').textContent = `Order #${orderId}`;
  document.getElementById('selectedOrderDescription').textContent = `Summary for Order #${orderId}`;
}

// Open custom time popup
function openCustomTimePopup() {
  document.getElementById('customTimePopup').classList.remove('hidden');
}

// Handle submitting custom time
function submitCustomTime() {
  const hours = document.getElementById('customHours').value;
  const minutes = document.getElementById('customMinutes').value;
  alert(`Custom Delivery Time: ${hours} hours and ${minutes} minutes`);
  closePopup();
}

function confirmRemoval() {
  if (containerToRemove) {
    const orderId = containerToRemove.textContent.trim();
    containerToRemove.remove();

    // Hide order details if the selected one is removed
    const details = document.getElementById('orderDetails');
    if (details.querySelector('#selectedOrderTitle').textContent.includes(orderId)) {
      details.classList.add('hidden');
    }

    containerToRemove = null;
  }
  closePopup();
}

// Triggered when Approve, Deny, or Remove is clicked
function promptRemoval(button) {
  // Find the container that needs to be removed
  containerToRemove = button.closest('.approval-item, .withdraw-item, .list-item, .driver-item, .order-card');

  if (containerToRemove) {
    document.getElementById('confirmPopup').classList.remove('hidden');
  }
}

function promptOrderRemoval() {
  if (!selectedOrderCard) return;
  containerToRemove = selectedOrderCard; // Set selected card for removal
  document.getElementById('confirmPopup').classList.remove('hidden');
}

// If user cancels
function cancelRemoval() {
  containerToRemove = null; // reset so nothing gets removed
  closePopup();
}

// If user confirms
function confirmRemoval() {
  if (containerToRemove) {
    containerToRemove.remove();
    containerToRemove = null;

    // Update counts on the homepage
    updateHomeCounts();
    updateOrdersCount();
  }
  closePopup();
}

// Close popup utility
function closePopup() {
  document.getElementById('confirmPopup').classList.add('hidden');
  document.getElementById('addStaffPopup').classList.add('hidden');
  document.getElementById('addDriverPopup').classList.add('hidden');
  document.getElementById('customTimePopup').classList.add('hidden');
  document.getElementById('confirmPopup').classList.add('hidden');
  document.getElementById('mainChangePasswordPopup').classList.add('hidden');
}

function overlayClick(e) {
  if (e.target.classList.contains('popup-overlay')) {
    closePopup();
  }
}

function toggleWithdraw(headerElement) {
  const item = headerElement.parentElement;
  item.classList.toggle('open');
}

function openAddDriverPopup() {
  document.getElementById('addDriverPopup').classList.remove('hidden');
}

function toggleHelpBox(helpBoxId) {
  const helpBox = document.getElementById(helpBoxId);
  helpBox.classList.toggle('hidden');
}

function markAutoGenerate(btn) {
  btn.classList.add('is-used');
  btn.setAttribute('aria-pressed', 'true');
}

function removeContainer(button) {
  // Find the container element (closest div that represents a full item)
  const container = button.closest('.approval-item, .withdraw-item, .list-item, .driver-item');
  
  if (container) {
    container.remove(); // Deletes the entire element from the DOM
  }
}

// Add new Staff container
function addStaff() {
  const firstName = document.getElementById('staffFirstName').value.trim();
  const lastName = document.getElementById('staffLastName').value.trim();

  if (!firstName || !lastName) {
    alert('Please enter both first and last names.');
    return;
  }

  const fullName = `${firstName} ${lastName}`;

  // Create new staff item
  const staffList = document.getElementById('staffList');
  const newStaff = document.createElement('div');
  newStaff.className = 'list-item';
  newStaff.innerHTML = `
    <span>${fullName}</span>
    <div class="buttons">
      <button class="remove" onclick="promptRemoval(this)">Remove</button>
    </div>
  `;

  staffList.appendChild(newStaff); // Add to the bottom

  // Clear inputs and close popup
  document.getElementById('staffFirstName').value = '';
  document.getElementById('staffLastName').value = '';
  closePopup();
}

// Add new Driver container
function addDriver() {
  const firstName = document.getElementById('driverFirstName').value.trim();
  const lastName = document.getElementById('driverLastName').value.trim();

  if (!firstName || !lastName) {
    alert('Please enter both first and last names.');
    return;
  }

  const fullName = `${firstName} ${lastName}`;

  // Create new driver item
  const driverList = document.getElementById('driverList');
  const newDriver = document.createElement('div');
  newDriver.className = 'driver-item';
  newDriver.innerHTML = `
    <span>${fullName}</span>
    <div class="buttons">
      <button class="remove" onclick="promptRemoval(this)">Remove</button>
    </div>
  `;

  driverList.appendChild(newDriver); // Add to the bottom

  // Clear inputs and close popup
  document.getElementById('driverFirstName').value = '';
  document.getElementById('driverLastName').value = '';
  closePopup();
}

function addNewApproval() {
  const approvalList = document.getElementById('approvalList');
  const newApproval = document.createElement('div');
  newApproval.className = 'approval-item';
  newApproval.innerHTML = `
    <span class="restaurant-name">New Restaurant</span>
    <div class="buttons">
      <button class="approve" onclick="promptRemoval(this)">Approve</button>
      <button class="deny" onclick="promptRemoval(this)">Deny</button>
    </div>
  `;
  approvalList.appendChild(newApproval);

  // Update homepage count
  updateHomeCounts();
}

function addNewWithdraw() {
  const withdrawList = document.getElementById('withdrawList');
  const newWithdraw = document.createElement('div');
  newWithdraw.className = 'withdraw-item';
  newWithdraw.innerHTML = `
    <div class="withdraw-header" onclick="toggleWithdraw(this)">
      <span class="restaurant-name">New Restaurant</span>
      <span class="arrow">&#9662;</span>
    </div>
    <div class="withdraw-content">
      <textarea placeholder="Enter notes here..."></textarea>
      <div class="buttons">
        <button class="approve" onclick="promptRemoval(this)">Approve</button>
        <button class="deny" onclick="promptRemoval(this)">Deny</button>
      </div>
    </div>
  `;
  withdrawList.appendChild(newWithdraw);

  // Update homepage count
  updateHomeCounts();
}

function updateOrdersCount() {
  const total = document.querySelectorAll('#orderQueueList .order-card').length || 0;

  const dash = document.getElementById('ordersDashboardCount');
  if (dash) dash.textContent = total;

  const header = document.getElementById('ordersHeaderCount');
  if (header) header.textContent = total;
}

function openChangePasswordPopup() {
  document.getElementById('mainChangePasswordPopup').classList.remove('hidden');
}


document.addEventListener('DOMContentLoaded', () => {
  updateOrdersCount();
});

document.addEventListener('DOMContentLoaded', () => {
  updateHomeCounts();
});

/* Close popups with ESC key */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePopup();
});

// Turn sidebar items into links that call the switchers
document.addEventListener('DOMContentLoaded', () => {
  // Admin links
  document.querySelectorAll('.admin-menu a').forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const target = a.dataset.adminTarget;
      if (target) showAdminPage(target);
    });
  });

  // Staff links
  document.querySelectorAll('.staff-menu a').forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const target = a.dataset.staffTarget;
      if (target) showStaffPage(target);
    });
  });
});
