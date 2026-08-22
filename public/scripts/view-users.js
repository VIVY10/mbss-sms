let users = [];

const userData = async () => {
    return await (await fetch('/api/users/allusers')).json();
};

let state = {
    province: '', district: '', zone: '', school: '',
    role: '', search: '',
    page: 1, rows: 8,
    selected: new Set()
};

const els = {
    provinceSelect: document.getElementById('provinceSelect'),
    districtSelect: document.getElementById('districtSelect'),
    zoneSelect: document.getElementById('zoneSelect'),
    schoolSelect: document.getElementById('schoolSelect'),
    roleQuick: document.getElementById('roleQuick'),
    roleFilter: document.getElementById('roleFilter'),
    searchInput: document.getElementById('searchInput'),
    tableBody: document.getElementById('tableBody'),
    appliedChips: document.getElementById('appliedChips'),
    rowsPerPage: document.getElementById('rowsPerPage'),
    pageInfo: document.getElementById('pageInfo'),
    prevPage: document.getElementById('prevPage'),
    nextPage: document.getElementById('nextPage'),
    selectAll: document.getElementById('selectAll')
};

const ALLOWEDTOREGISTER = ['Super Admin', 'Provincial Admin', 'DESO', 'District Admin']
const userRoleElement = document.getElementById('user-role');
const userRole = userRoleElement.textContent.trim()

async function init() {

    const addUserBtn = document.getElementById('addUserBtn');

    if (ALLOWEDTOREGISTER.includes(userRole)) {
        addUserBtn.hidden = false;
    }

    const raw = await userData();

    users = raw.map(u => ({
        user_id: u.user_id,
        fname: u.fname || '',
        lname: u.lname || '',
        email: u.email || '',
        name: `${u.fname || ''} ${u.lname || ''}`.trim(),
        province: u.province_name || '',
        district: u.district_name || '',
        zone: u.zone_name || '',
        school: u.school_name || '',
        role: u.role_name || 'User', // fallback if no role
        active: true // or u.active if from API
    }));

    populateProvinceOptions();
    attachListeners();
    render();
}

/* ---------- Fixed Hierarchy Builder (Handles nulls) ---------- */
function buildHierarchy() {
    const tree = {};

    users.forEach(u => {
        const p = u.province || '(No Province)';
        const d = u.district || '(No District)';
        const z = u.zone || '(No Zone)';
        const s = u.school || '(No School)';

        // Ensure structure exists
        tree[p] ??= {};
        tree[p][d] ??= {};
        tree[p][d][z] ??= new Set();
        tree[p][d][z].add(s);
    });

    return tree;
}

function getOptions(level, parent1 = null, parent2 = null, parent3 = null) {
    const tree = buildHierarchy();
    let options = new Set();

    if (level === 'province') {
        Object.keys(tree).forEach(p => { if (p !== '(No Province)') options.add(p); });
        if ([...options].length === 1) return [...options]; // auto-select if only one
    }
    if (level === 'district' && parent1) {
        Object.keys(tree[parent1] || {}).forEach(d => { if (d !== '(No District)') options.add(d); });
    }
    if (level === 'zone' && parent1 && parent2) {
        Object.keys(tree[parent1][parent2] || {}).forEach(z => { if (z !== '(No Zone)') options.add(z); });
    }
    if (level === 'school' && parent1 && parent2 && parent3) {
        const set = tree[parent1]?.[parent2]?.[parent3];
        if (set) set.forEach(s => { if (s !== '(No School)') options.add(s); });
    }

    return [...options].sort();
}

/* ---------- Populate Dropdowns ---------- */
function populateProvinceOptions() {
    const provinces = getOptions('province');
    provinces.forEach(p => els.provinceSelect.add(new Option(p, p)));
}

function populateDistricts(province) {
    els.districtSelect.innerHTML = '<option value="">All districts</option>';
    els.zoneSelect.innerHTML = '<option value="">All zones</option>';
    els.schoolSelect.innerHTML = '<option value="">All schools</option>';
    els.zoneSelect.disabled = els.schoolSelect.disabled = true;

    if (!province) {
        els.districtSelect.disabled = true;
        return;
    }

    const districts = getOptions('district', province);
    districts.forEach(d => els.districtSelect.add(new Option(d, d)));
    els.districtSelect.disabled = false;
}

function populateZones(province, district) {
    els.zoneSelect.innerHTML = '<option value="">All zones</option>';
    els.schoolSelect.innerHTML = '<option value="">All schools</option>';
    els.schoolSelect.disabled = true;

    if (!province || !district) {
        els.zoneSelect.disabled = true;
        return;
    }

    const zones = getOptions('zone', province, district);
    zones.forEach(z => els.zoneSelect.add(new Option(z, z)));
    els.zoneSelect.disabled = zones.length === 0;
}

function populateSchools(province, district, zone) {
    els.schoolSelect.innerHTML = '<option value="">All schools</option>';

    if (!province || !district || !zone) {
        els.schoolSelect.disabled = true;
        return;
    }

    const schools = getOptions('school', province, district, zone);
    schools.forEach(s => els.schoolSelect.add(new Option(s, s)));
    els.schoolSelect.disabled = schools.length === 0;
}

/* populate roles */
const HIERARCHY = {
    'Super Admin': ['Provincial Admin', 'SESO', 'PESO', 'District Admin', 'DESO', 'ESO GI', 'ESO ODL', 'School Admin', 'Teacher', 'HOD'],
    'Provincial Admin': ['Provincial Admin', 'SESO', 'PESO', 'District Admin', 'DESO', 'ESO GI', 'ESO ODL', 'School Admin', 'Teacher', 'HOD'],
    'PESO': ['Provincial Admin', 'SESO', 'PESO', 'District Admin', 'DESO', 'ESO GI', 'ESO ODL', 'School Admin', 'Teacher', 'HOD'],
    'District Admin': ['District Admin', 'DESO', 'ESO GI', 'ESO ODL', 'School Admin', 'Teacher', 'HOD'],
    'DESO': ['District Admin', 'DESO', 'ESO GI', 'ESO ODL', 'School Admin', 'Teacher', 'HOD'],
    'School Admin': ['School Admin', 'Teacher', 'HOD']
};

const loadRoles = () => {

    let options = '';

    roleFilter.innerHTML = '<option selected disabled value="">all user roles...</option>';
    roleQuick.innerHTML = '<option selected disabled value="">Loading user roles...</option>';

    $.get('/api/roles/getRoles', function (data) {
        const userData = Array.isArray(data) ? data : [data];

        // Determine which categories the current user can see
        const allowedCategories = HIERARCHY[userRole] || [];

        // Filter roles by allowed categories
        const filteredRoles = userData.filter(r => allowedCategories.includes(r.role_name));

        // Build the <option> HTML
        options = filteredRoles.map(r => `<option value="${r.role_name}">${r.role_name}</option>`);

        // Update the selector
        roleFilter.innerHTML = '<option selected disabled value="">Choose role</option>' + options.join('');
        roleQuick.innerHTML = '<option selected disabled value="">Choose role</option>' + options.join('');
    });
};

// call loadRoles on page load
loadRoles()

/* ---------- Listeners & Render ---------- */
function attachListeners() {
    els.provinceSelect.addEventListener('change', e => {
        state.province = e.target.value;
        state.district = state.zone = state.school = '';
        state.page = 1;
        populateDistricts(state.province);
        render();
    });

    els.districtSelect.addEventListener('change', e => {
        state.district = e.target.value;
        state.zone = state.school = '';
        state.page = 1;
        populateZones(state.province, state.district);
        render();
    });

    els.zoneSelect.addEventListener('change', e => {
        state.zone = e.target.value;
        state.school = '';
        state.page = 1;
        populateSchools(state.province, state.district, state.zone);
        render();
    });

    els.schoolSelect.addEventListener('change', e => {
        state.school = e.target.value;
        state.page = 1;
        render();
    });

    els.roleQuick.addEventListener('change', e => {
        state.role = e.target.value;
        state.page = 1;
        render();
    });

    els.roleFilter.addEventListener('change', e => {
        state.role = e.target.value;
        state.page = 1;
        render();
    });

    els.searchInput.addEventListener('input', e => {
        state.search = e.target.value.trim();
        state.page = 1;
        render();
    });

    document.getElementById('clearFilters')?.addEventListener('click', () => {
        state = { ...state, province: '', district: '', zone: '', school: '', search: '', role: '', page: 1, selected: new Set() };
        Object.values(els).forEach(el => el && (el.value = ''));
        populateDistricts('');
        render();
    });

    els.rowsPerPage.addEventListener('change', e => {
        state.rows = parseInt(e.target.value) || 8;
        state.page = 1;
        render();
    });

    els.prevPage.addEventListener('click', () => { if (state.page > 1) state.page--, render(); });
    els.nextPage.addEventListener('click', () => { state.page++; render(); });

    els.selectAll.addEventListener('change', e => {
        const start = (state.page - 1) * state.rows;
        const end = start + state.rows;
        filterUsers().slice(start, end).forEach(u => {
            e.target.checked ? state.selected.add(String(u.user_id)) : state.selected.delete(String(u.user_id));
        });
        render();
    });

    document.getElementById('exportBtn').addEventListener('click', exportCSV)
    document.getElementById('addUserBtn').addEventListener('click', async () => {
        window.location = href = "/api/users/register";
    })
}

function filterUsers() {
    return users.filter(u => {
        if (state.province && u.province !== state.province) return false;
        if (state.district && u.district !== state.district) return false;
        if (state.zone && u.zone !== state.zone) return false;
        if (state.school && u.school !== state.school) return false;

        if (state.role && u.role !== state.role) return false;

        if (state.search) {
            const q = state.search;
            if (!u.name.includes(q) && !u.email.includes(q)) return false;
        }

        return true;
    });
}


function render() {
    const filtered = filterUsers();
    const total = filtered.length;
    const maxPages = Math.max(1, Math.ceil(total / state.rows));
    if (state.page > maxPages) state.page = maxPages;

    const start = (state.page - 1) * state.rows;
    const pageData = filtered.slice(start, start + state.rows);

    els.tableBody.innerHTML = '';
    pageData.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="rowSel" data-id="${u.user_id}" ${state.selected.has(String(u.user_id)) ? 'checked' : ''}></td>
            <td><strong>${u.name}</strong></td>
            <td class="muted">${u.email}</td>
            <td>${u.role}</td>
            <td class="muted">${[u.province, u.district, u.zone, u.school].filter(Boolean).join(' / ') || '—'}</td>
            <td><span class="badge ${u.active ? 'active-status' : 'inactive-status'}">${u.active ? 'Active' : 'Inactive'}</span></td>
            <td class="actions">
                <button data-id="${u.user_id}" data-action="toggle">${u.active ? 'Deactivate' : 'Activate'}</button>
                <button data-id="${u.user_id}" data-action="edit" class="ghost">Edit</button>
            </td>`;
        els.tableBody.appendChild(tr);
    });

    document.querySelectorAll('.rowSel').forEach(cb => {
        cb.addEventListener('change', () => {
            const id = cb.dataset.id;
            cb.checked ? state.selected.add(id) : state.selected.delete(id);
            render();
        });
    });

    document.querySelectorAll('[data-action="toggle"]').forEach(btn => {
        btn.onclick = () => {
            const user = users.find(x => x.user_id === +btn.dataset.id);
            if (user) user.active = !user.active;
            render();
        };
    });

    els.pageInfo.textContent = `Page ${state.page} of ${maxPages} — ${total} results`;
    els.prevPage.disabled = state.page === 1;
    els.nextPage.disabled = state.page === maxPages;
    els.selectAll.checked = pageData.length > 0 && pageData.every(u => state.selected.has(String(u.user_id)));
}


function exportCSV() {
    const filtered = filterUsers();
    if (filtered.length === 0) { alert('No rows to export'); return }
    const cols = ['user_id', 'name', 'email', 'role', 'province', 'district', 'zone', 'school', 'active'];
    const csv = [cols.join(',')].concat(filtered.map(r => cols.map(c => `"${String(r[c]).replace(/"/g, '""')}"`).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'users-export.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}


init();