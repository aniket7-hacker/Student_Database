const storageKey = 'edutrack-students-v1';
const studentRows = document.getElementById('studentRows');
const recentRows = document.getElementById('recentRows');
const search = document.getElementById('search');
const toast = document.getElementById('toast');
let students = loadStudents();
let editId = null;

function loadStudents() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}

function saveStudents() { localStorage.setItem(storageKey, JSON.stringify(students)); }
function initials(name) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
function escapeHtml(value) { const element = document.createElement('span'); element.textContent = value; return element.innerHTML; }
function studentRow(student) {
  const statusClass = student.status === 'Active' ? 'active-badge' : 'pending';
  return `<tr><td><div class="student"><span class="initial">${initials(student.name)}</span>${escapeHtml(student.name)}</div></td><td>${escapeHtml(student.id)}</td><td>${escapeHtml(student.department)}</td><td>${escapeHtml(student.year)}</td><td><span class="badge ${statusClass}">${student.status}</span></td><td><div class="table-actions"><button class="icon-button" type="button" data-edit="${escapeHtml(student.id)}">Edit</button><button class="icon-button delete" type="button" data-delete="${escapeHtml(student.id)}">Delete</button></div></td></tr>`;
}
function isNewThisMonth(student) { const date = new Date(student.createdAt); const now = new Date(); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); }

function updateStats() {
  const active = students.filter((student) => student.status === 'Active').length;
  const departments = new Set(students.map((student) => student.department.trim().toLowerCase()).filter(Boolean)).size;
  document.getElementById('totalStudents').textContent = students.length.toLocaleString();
  document.getElementById('activeStudents').textContent = active.toLocaleString();
  document.getElementById('newStudents').textContent = students.filter(isNewThisMonth).length.toLocaleString();
  document.getElementById('departmentCount').textContent = departments.toLocaleString();
  document.getElementById('reportActive').textContent = active;
  document.getElementById('reportPending').textContent = students.length - active;
  document.getElementById('reportDepartments').textContent = departments;
}
function renderStudents() {
  const query = (search?.value || '').trim().toLowerCase();
  const filtered = students.filter((student) => Object.values(student).some((value) => String(value).toLowerCase().includes(query)));
  studentRows.innerHTML = filtered.map(studentRow).join('');
  recentRows.innerHTML = students.slice(0, 5).map(studentRow).join('');
  document.getElementById('empty').hidden = filtered.length > 0;
  document.getElementById('recentEmpty').hidden = students.length > 0;
  updateStats();
}
function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2800); }
function changeView(view) {
  const viewElement = document.getElementById(`${view}View`);
  if (!viewElement) return;
  document.querySelectorAll('.view').forEach((element) => element.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach((element) => element.classList.toggle('active', element.dataset.view === view));
  viewElement.classList.add('active');
  const labels = { dashboard:['Dashboard','A clear view of your student database.'], students:['Students','Search, add, edit, or remove student records.'], courses:['Courses','Manage your institution’s course catalogue.'], reports:['Reports','Live summary of student records.'], settings:['Settings','Adjust your dashboard preferences.'], help:['Help Center','Quick guidance for using EduTrack.'] };
  document.getElementById('pageTitle').textContent = labels[view][0];
  document.getElementById('pageSubtitle').textContent = labels[view][1];
}

function openStudentForm(student = null) {
  editId = student?.id || null;
  const dialog = document.createElement('dialog');
  dialog.className = 'student-dialog';
  dialog.innerHTML = `<form class="student-form" id="studentForm"><div class="form-heading"><div><h2>${student ? 'Edit student' : 'Add student'}</h2><p>Complete all fields to save the record.</p></div><button class="close-button" type="button" aria-label="Close">×</button></div><label>Full name<input name="name" required value="${escapeHtml(student?.name || '')}" placeholder="e.g. Alex Morgan"></label><label>Student ID<input name="id" required value="${escapeHtml(student?.id || '')}" placeholder="e.g. STU-2026-0185" ${student ? 'readonly' : ''}></label><label>Department<input name="department" required value="${escapeHtml(student?.department || '')}" placeholder="e.g. Computer Science"></label><label>Year<select name="year"><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select></label><label>Status<select name="status"><option>Active</option><option>Pending</option></select></label><div class="form-actions"><button class="secondary-button" type="button">Cancel</button><button class="primary-button" type="submit">${student ? 'Save changes' : 'Add student'}</button></div></form>`;
  document.body.append(dialog);
  dialog.querySelector('[name="year"]').value = student?.year || '1st Year';
  dialog.querySelector('[name="status"]').value = student?.status || 'Active';
  dialog.showModal();
  dialog.querySelector('[name="name"]').focus();
  const close = () => dialog.close();
  dialog.querySelector('.close-button').addEventListener('click', close);
  dialog.querySelector('.secondary-button').addEventListener('click', close);
  dialog.addEventListener('close', () => dialog.remove());
  dialog.querySelector('#studentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const details = Object.fromEntries(new FormData(form));
    details.name = details.name.trim(); details.id = details.id.trim().toUpperCase(); details.department = details.department.trim();
    if (!editId && students.some((item) => item.id.toLowerCase() === details.id.toLowerCase())) { showToast('That Student ID already exists.'); return; }
    if (editId) { const index = students.findIndex((item) => item.id === editId); students[index] = { ...students[index], ...details }; showToast('Student details saved.'); }
    else { students.unshift({ ...details, createdAt: new Date().toISOString() }); showToast(`${details.name} was added successfully.`); }
    saveStudents(); renderStudents(); dialog.close();
  });
}
function deleteStudent(id) { const student = students.find((item) => item.id === id); if (!student || !window.confirm(`Delete ${student.name}?`)) return; students = students.filter((item) => item.id !== id); saveStudents(); renderStudents(); showToast('Student deleted.'); }
function downloadReport() { const text = ['EduTrack Student Report', `Generated: ${new Date().toLocaleString()}`, '', 'Name,Student ID,Department,Year,Status', ...students.map((s) => [s.name,s.id,s.department,s.year,s.status].map((v) => `"${v.replaceAll('"','""')}"`).join(','))].join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([text], { type:'text/csv' })); link.download = 'edutrack-students.csv'; link.click(); URL.revokeObjectURL(link.href); showToast('Report download started.'); }

document.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view]'); if (viewButton) { event.preventDefault(); changeView(viewButton.dataset.view); }
  if (event.target.closest('[data-open-form]')) openStudentForm();
  const edit = event.target.closest('[data-edit]'); if (edit) openStudentForm(students.find((item) => item.id === edit.dataset.edit));
  const remove = event.target.closest('[data-delete]'); if (remove) deleteStudent(remove.dataset.delete);
  const message = event.target.closest('[data-message]'); if (message) showToast(message.dataset.message);
});
search.addEventListener('input', renderStudents);
document.getElementById('downloadReport').addEventListener('click', downloadReport);
document.getElementById('compactRows').addEventListener('change', (event) => document.body.classList.toggle('compact', event.target.checked));
document.getElementById('resetData').addEventListener('click', () => { if (!window.confirm('Remove all saved student records?')) return; students = []; saveStudents(); renderStudents(); showToast('All student records were removed.'); });
const themeToggle = document.getElementById('themeToggle');
function setTheme(isDark) { document.body.classList.toggle('dark-theme', isDark); themeToggle.setAttribute('aria-pressed', isDark); themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`); themeToggle.querySelector('.theme-thumb').innerHTML = isDark ? '&#9790;' : '&#9728;'; localStorage.setItem('edutrack-theme', isDark ? 'dark' : 'light'); }
themeToggle.addEventListener('click', () => setTheme(!document.body.classList.contains('dark-theme')));
setTheme(localStorage.getItem('edutrack-theme') === 'dark');
renderStudents();
