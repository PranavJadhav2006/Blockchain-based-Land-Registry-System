// API Configuration
const API_BASE_URL = 'http://localhost:9090/api';
let currentUser = null;
const admins = ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];

// DOM Elements
const sections = {
  home: document.getElementById('home'),
  search: document.getElementById('search'),
  'land-detail': document.getElementById('land-detail'),
  register: document.getElementById('register'),
  'my-lands': document.getElementById('my-lands'),
  admin: document.getElementById('admin')
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  showSection('home');
  document.getElementById('connect-wallet').addEventListener('click', connectWallet);
  document.getElementById('search-form').addEventListener('submit', handleSearch);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  toggleAdminLink(false);
  toggleMyLandsLink(false);
});

// Navigation
function showSection(sectionId) {
  Object.values(sections).forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });
  
  const section = sections[sectionId];
  if (section) {
    section.classList.add('active');
    section.style.display = 'block';
  }
  
  if (sectionId === 'my-lands') loadMyLands();
  if (sectionId === 'admin') loadAdminDashboard();
}

// Wallet Connection (mock)
function connectWallet() {
  currentUser = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  document.getElementById('wallet-display').querySelector('.wallet-address').textContent = 
    `${currentUser.substring(0, 6)}...${currentUser.substring(currentUser.length - 4)}`;
  document.getElementById('connect-wallet').style.display = 'none';
  toggleAdminLink(admins.includes(currentUser));
  toggleMyLandsLink(true);
}

function toggleAdminLink(show) {
  document.getElementById('admin-link').style.display = show ? 'block' : 'none';
}

function toggleMyLandsLink(show) {
  document.getElementById('my-lands-link').style.display = show ? 'block' : 'none';
}

// API Functions
async function fetchLands(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/lands?${queryString}`);
  if (!response.ok) throw new Error('Failed to fetch lands');
  return await response.json();
}

async function fetchLandById(id) {
  const response = await fetch(`${API_BASE_URL}/lands/${id}`);
  if (!response.ok) throw new Error('Failed to fetch land details');
  return await response.json();
}

async function registerLand(landData) {
  const response = await fetch(`${API_BASE_URL}/lands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(landData)
  });
  if (!response.ok) throw new Error('Registration failed');
  return await response.json();
}

async function updateLandStatus(id, status, details = '') {
  const url = `${API_BASE_URL}/lands/${id}/status?status=${status}`;
  const fullUrl = details ? `${url}&disputeDetails=${encodeURIComponent(details)}` : url;
  
  const response = await fetch(fullUrl, { method: 'PUT' });
  if (!response.ok) throw new Error('Status update failed');
  return await response.json();
}

// Search Functionality
async function handleSearch(e) {
  e.preventDefault();
  try {
    const searchType = document.getElementById('search-type').value;
    const searchTerm = document.getElementById('search-term').value;
    const lands = await fetchLands({ [searchType]: searchTerm });
    displaySearchResults(lands);
  } catch (error) {
    console.error('Search error:', error);
    alert('Search failed. Please try again.');
  }
}

function displaySearchResults(lands) {
  const resultsContainer = document.getElementById('results-grid');
  resultsContainer.innerHTML = lands.length === 0 
    ? '<p>No matching land records found</p>'
    : lands.map(land => `
        <div class="land-card ${land.status === 'disputed' ? 'has-dispute' : ''}">
          <h4>${land.surveyNumber}</h4>
          <p><strong>Location:</strong> ${land.location}</p>
          <p><strong>Owner:</strong> ${land.owner.substring(0, 6)}...${land.owner.substring(land.owner.length - 4)}</p>
          <p><strong>Status:</strong> 
            <span class="badge ${land.status === 'clear' ? 'badge-success' : 'badge-danger'}">
              ${land.status === 'clear' ? 'Clear' : 'Disputed'}
            </span>
          </p>
          <button class="btn btn-secondary" onclick="viewLandDetail('${land.id}')">
            View Details
          </button>
        </div>
      `).join('');
  
  document.getElementById('search-results').style.display = 'block';
}

// Land Detail View
async function viewLandDetail(landId) {
  try {
    const land = await fetchLandById(landId);
    const isOwner = currentUser && currentUser.toLowerCase() === land.owner.toLowerCase();
    const isAdminUser = admins.includes(currentUser);
    
    const html = `
      <div class="container">
        <div class="card">
          <div class="land-header">
            <h2 class="card-title">${land.surveyNumber}</h2>
            <span class="badge ${land.status === 'clear' ? 'badge-success' : 'badge-danger'}">
              ${land.status === 'clear' ? 'Clear' : 'Disputed'}
            </span>
          </div>
          
          <div class="land-grid">
            <div class="land-info">
              <div class="info-item"><strong>Location:</strong> ${land.location}</div>
              <div class="info-item"><strong>Coordinates:</strong> ${land.coordinates}</div>
              <div class="info-item"><strong>Size:</strong> ${land.size}</div>
              <div class="info-item"><strong>Registered:</strong> ${land.registrationDate}</div>
              <div class="info-item">
                <strong>Owner:</strong> 
                <span class="${isOwner ? 'owner-you' : ''}">
                  ${land.owner.substring(0, 6)}...${land.owner.substring(land.owner.length - 4)}
                  ${isOwner ? ' (You)' : ''}
                </span>
              </div>
              
              ${isOwner && land.status === 'clear' ? `
                <button class="btn btn-primary" onclick="initiateTransfer('${land.id}')">
                  Initiate Transfer
                </button>
              ` : ''}
            </div>
            
            <div class="land-qr">
              <h4>Land Verification QR</h4>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${
                encodeURIComponent(JSON.stringify({
                  id: land.id,
                  surveyNumber: land.surveyNumber,
                  owner: land.owner,
                  status: land.status
                }))
              }" alt="QR Code" />
              <p>Scan to verify</p>
            </div>
          </div>
        </div>
        
        ${land.status === 'disputed' ? `
          <div class="card dispute-alert">
            <h3 class="card-title">⚠️ Dispute Details</h3>
            <p>${land.disputeDetails || 'No additional details available'}</p>
          </div>
        ` : ''}
        
        ${isAdminUser ? `
          <div class="card admin-actions">
            <h3>Admin Actions</h3>
            <button onclick="showStatusUpdateForm('${land.id}')" class="btn btn-primary">
              Update Status
            </button>
          </div>
        ` : ''}
      </div>
    `;
    
    document.getElementById('land-detail').innerHTML = html;
    showSection('land-detail');
  } catch (error) {
    console.error('Failed to load land details:', error);
    alert('Failed to load land details. Please try again.');
  }
}

// Status Update Functions
function showStatusUpdateForm(landId) {
  const container = document.querySelector('#land-detail .container');
  container.insertAdjacentHTML('beforeend', `
    <div class="card status-update-form">
      <h3>Update Land Status</h3>
      <form onsubmit="handleStatusUpdate(event, '${landId}')">
        <div class="form-group">
          <label>Status</label>
          <select id="status-select" class="form-control" required>
            <option value="clear">Clear</option>
            <option value="disputed" selected>Disputed</option>
          </select>
        </div>
        
        <div id="dispute-fields">
          <div class="form-group">
            <label>Dispute Details</label>
            <textarea id="dispute-details" class="form-control" required></textarea>
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary">Update</button>
        <button type="button" onclick="this.closest('.status-update-form').remove()" class="btn btn-secondary">
          Cancel
        </button>
      </form>
    </div>
  `);
}

async function handleStatusUpdate(e, landId) {
  e.preventDefault();
  try {
    const status = document.getElementById('status-select').value;
    const details = status === 'disputed' ? document.getElementById('dispute-details').value : '';
    
    await updateLandStatus(landId, status, details);
    alert('Status updated successfully!');
    viewLandDetail(landId);
  } catch (error) {
    console.error('Status update failed:', error);
    alert('Failed to update status. Please try again.');
  }
}

// Registration
async function handleRegister(e) {
  e.preventDefault();
  
  if (!currentUser) {
    alert('Please connect your wallet first');
    return;
  }

  try {
    const landData = {
      surveyNumber: document.getElementById('survey-number').value,
      location: document.getElementById('location').value,
      coordinates: document.getElementById('coordinates').value,
      size: document.getElementById('size').value,
      owner: currentUser,
      status: 'clear',
      registrationDate: new Date().toISOString().split('T')[0]
    };
    
    await registerLand(landData);
    e.target.reset();
    alert(`Land ${landData.surveyNumber} registered successfully!`);
  } catch (error) {
    console.error('Registration failed:', error);
    alert('Registration failed. Please try again.');
  }
}

// My Lands
async function loadMyLands() {
  if (!currentUser) return;
  
  try {
    const lands = await fetchLands({ owner: currentUser });
    const container = document.getElementById('my-lands-container');
    
    container.innerHTML = lands.length === 0
      ? '<p>You don\'t own any registered lands yet</p>'
      : `
        <div class="lands-grid">
          ${lands.map(land => `
            <div class="land-card">
              <h3>${land.surveyNumber}</h3>
              <p><strong>Location:</strong> ${land.location}</p>
              <p><strong>Status:</strong> 
                <span class="badge ${land.status === 'clear' ? 'badge-success' : 'badge-danger'}">
                  ${land.status === 'clear' ? 'Clear' : 'Disputed'}
                </span>
              </p>
              <button class="btn btn-secondary" onclick="viewLandDetail('${land.id}')">
                View Details
              </button>
            </div>
          `).join('')}
        </div>
      `;
  } catch (error) {
    console.error('Failed to load your lands:', error);
    alert('Failed to load your lands. Please try again.');
  }
}

// Admin Dashboard
async function loadAdminDashboard() {
  if (!currentUser || !admins.includes(currentUser)) return;
  
  try {
    const lands = await fetchLands();
    const tableBody = document.getElementById('admin-lands-table');
    
    tableBody.innerHTML = lands.map(land => `
      <tr>
        <td>${land.surveyNumber}</td>
        <td>${land.location}</td>
        <td>${land.owner.substring(0, 6)}...${land.owner.substring(land.owner.length - 4)}</td>
        <td>
          <span class="badge ${land.status === 'clear' ? 'badge-success' : 'badge-danger'}">
            ${land.status === 'clear' ? 'Clear' : 'Disputed'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="showStatusUpdateForm('${land.id}')">
            Update
          </button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load admin dashboard:', error);
    alert('Failed to load admin data. Please try again.');
  }
}

// Transfer Functions (mock)
function initiateTransfer(landId) {
  alert(`In a real implementation, this would initiate transfer for land ${landId}`);
}

// Make functions available globally
window.viewLandDetail = viewLandDetail;
window.initiateTransfer = initiateTransfer;
window.showStatusUpdateForm = showStatusUpdateForm;
window.handleStatusUpdate = handleStatusUpdate;