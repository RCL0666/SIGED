const STORAGE_KEY = "aulapro_state_v1";

const seedState = {
  students: [
    { id: "stu-1", name: "Sofia Martinez", course: "4 Medio A" },
    { id: "stu-2", name: "Benjamin Rojas", course: "4 Medio A" },
    { id: "stu-3", name: "Valentina Silva", course: "4 Medio B" },
    { id: "stu-4", name: "Matias Fernandez", course: "4 Medio B" },
    { id: "stu-5", name: "Isidora Vargas", course: "3 Medio A" }
  ],
  grades: [
    { id: "grade-1", studentId: "stu-1", subject: "Matematicas", name: "Funciones", score: 6.5, date: "2026-06-10" },
    { id: "grade-2", studentId: "stu-2", subject: "Lenguaje", name: "Ensayo", score: 5.8, date: "2026-06-12" },
    { id: "grade-3", studentId: "stu-3", subject: "Ciencias", name: "Laboratorio", score: 6.8, date: "2026-06-16" },
    { id: "grade-4", studentId: "stu-4", subject: "Historia", name: "Debate", score: 4.9, date: "2026-06-18" },
    { id: "grade-5", studentId: "stu-5", subject: "Ingles", name: "Speaking", score: 6.1, date: "2026-06-20" }
  ],
  attendance: {
    "2026-06-24": { "stu-1": "present", "stu-2": "late", "stu-3": "present", "stu-4": "absent", "stu-5": "present" },
    "2026-06-25": { "stu-1": "present", "stu-2": "present", "stu-3": "present", "stu-4": "present", "stu-5": "late" }
  },
  events: [
    {
      id: "event-1",
      studentId: "stu-1",
      title: "Presentacion de proyecto",
      description: "Preparar una exposicion de 5 minutos con avances y fuentes utilizadas.",
      date: "2026-07-02"
    },
    {
      id: "event-2",
      studentId: "stu-3",
      title: "Tutoria de ciencias",
      description: "Sesion de apoyo para revisar informe de laboratorio.",
      date: "2026-06-30"
    }
  ]
};

let state = loadState();
let currentRole = "teacher";
let currentView = "dashboard";

const els = {
  teacherRoleBtn: document.getElementById("teacherRoleBtn"),
  studentRoleBtn: document.getElementById("studentRoleBtn"),
  studentPickerWrap: document.getElementById("studentPickerWrap"),
  studentViewSelect: document.getElementById("studentViewSelect"),
  pageTitle: document.getElementById("pageTitle"),
  todayText: document.getElementById("todayText"),
  totalStudents: document.getElementById("totalStudents"),
  globalAverage: document.getElementById("globalAverage"),
  attendanceRate: document.getElementById("attendanceRate"),
  activeEvents: document.getElementById("activeEvents"),
  rankingTable: document.getElementById("rankingTable"),
  dashboardEvents: document.getElementById("dashboardEvents"),
  gradeForm: document.getElementById("gradeForm"),
  gradeStudent: document.getElementById("gradeStudent"),
  gradeSubject: document.getElementById("gradeSubject"),
  gradeName: document.getElementById("gradeName"),
  gradeScore: document.getElementById("gradeScore"),
  gradesTable: document.getElementById("gradesTable"),
  attendanceDate: document.getElementById("attendanceDate"),
  attendanceTable: document.getElementById("attendanceTable"),
  attendanceTitle: document.getElementById("attendanceTitle"),
  eventForm: document.getElementById("eventForm"),
  eventStudent: document.getElementById("eventStudent"),
  eventDate: document.getElementById("eventDate"),
  eventTitle: document.getElementById("eventTitle"),
  eventDescription: document.getElementById("eventDescription"),
  eventsList: document.getElementById("eventsList"),
  studentGradesTitle: document.getElementById("studentGradesTitle"),
  studentAverage: document.getElementById("studentAverage"),
  studentGradesTable: document.getElementById("studentGradesTable"),
  studentEventsList: document.getElementById("studentEventsList"),
  resetDemoBtn: document.getElementById("resetDemoBtn"),
  toast: document.getElementById("appToast"),
  toastMessage: document.getElementById("toastMessage")
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  const today = new Date();
  const todayIso = toIsoDate(today);
  els.todayText.textContent = today.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  els.attendanceDate.value = todayIso;
  els.eventDate.value = todayIso;

  fillStudentSelects();
  bindEvents();
  setRole("teacher");
  render();
}

function bindEvents() {
  els.teacherRoleBtn.addEventListener("click", () => setRole("teacher"));
  els.studentRoleBtn.addEventListener("click", () => setRole("student"));
  els.studentViewSelect.addEventListener("change", render);
  els.attendanceDate.addEventListener("change", renderAttendance);
  els.resetDemoBtn.addEventListener("click", resetDemo);

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  els.gradeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const score = Number(els.gradeScore.value);

    if (score < 1 || score > 7) {
      showToast("La nota debe estar entre 1.0 y 7.0.");
      return;
    }

    state.grades.push({
      id: createId("grade"),
      studentId: els.gradeStudent.value,
      subject: els.gradeSubject.value,
      name: els.gradeName.value.trim(),
      score,
      date: toIsoDate(new Date())
    });

    saveState();
    els.gradeForm.reset();
    els.gradeSubject.value = "Matematicas";
    showToast("Nota guardada correctamente.");
    render();
  });

  els.eventForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.events.push({
      id: createId("event"),
      studentId: els.eventStudent.value,
      title: els.eventTitle.value.trim(),
      description: els.eventDescription.value.trim(),
      date: els.eventDate.value
    });

    saveState();
    els.eventForm.reset();
    els.eventDate.value = toIsoDate(new Date());
    showToast("Evento asignado al alumno.");
    render();
  });
}

function setRole(role) {
  currentRole = role;
  els.teacherRoleBtn.classList.toggle("active", role === "teacher");
  els.studentRoleBtn.classList.toggle("active", role === "student");
  els.studentPickerWrap.classList.toggle("hidden", role !== "student");

  document.querySelectorAll(".teacher-only").forEach((el) => el.classList.toggle("hidden", role !== "teacher"));
  document.querySelectorAll(".student-only").forEach((el) => el.classList.toggle("hidden", role !== "student"));

  if (role === "teacher" && ["studentGrades", "studentEvents"].includes(currentView)) {
    setView("dashboard");
  } else if (role === "student" && ["grades", "events"].includes(currentView)) {
    setView("studentGrades");
  } else {
    render();
  }
}

function setView(view) {
  currentView = view;
  document.querySelectorAll(".view").forEach((el) => el.classList.remove("active"));
  document.getElementById(`${view}View`).classList.add("active");
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  const titles = {
    dashboard: "Gestion de alumnos",
    grades: "Asignar notas",
    attendance: "Registro de asistencia",
    events: "Eventos para alumnos",
    studentGrades: "Mis notas",
    studentEvents: "Mis eventos"
  };
  els.pageTitle.textContent = titles[view];
  render();
}

function render() {
  renderDashboard();
  renderGrades();
  renderAttendance();
  renderEvents();
  renderStudentArea();
}

function fillStudentSelects() {
  const options = state.students
    .map((student) => `<option value="${student.id}">${student.name} - ${student.course}</option>`)
    .join("");

  els.studentViewSelect.innerHTML = options;
  els.gradeStudent.innerHTML = options;
  els.eventStudent.innerHTML = `<option value="all">Todos los alumnos</option>${options}`;
}

function renderDashboard() {
  els.totalStudents.textContent = state.students.length;
  els.globalAverage.textContent = formatAverage(average(state.grades.map((grade) => grade.score)));
  els.attendanceRate.textContent = `${calculateAttendanceRate()}%`;
  els.activeEvents.textContent = state.events.length;

  const ranking = [...state.students].sort((a, b) => studentAverage(b.id) - studentAverage(a.id));
  els.rankingTable.innerHTML = ranking.map((student) => {
    const avg = studentAverage(student.id);
    return `
      <tr>
        <td>${studentLabel(student)}</td>
        <td>${student.course}</td>
        <td><strong>${formatAverage(avg)}</strong></td>
        <td>${statusBadge(avg)}</td>
      </tr>
    `;
  }).join("");

  renderEventList(els.dashboardEvents, sortedEvents().slice(0, 4));
}

function renderGrades() {
  els.gradesTable.innerHTML = state.grades.map((grade) => {
    const student = findStudent(grade.studentId);
    return `
      <tr>
        <td>${student ? studentLabel(student) : "Alumno eliminado"}</td>
        <td>${grade.subject}</td>
        <td>${grade.name}</td>
        <td><span class="badge-soft ${grade.score >= 4 ? "badge-ok" : "badge-danger"}">${grade.score.toFixed(1)}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" type="button" aria-label="Eliminar nota" onclick="deleteGrade('${grade.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderAttendance() {
  const date = els.attendanceDate.value || toIsoDate(new Date());
  const selectedStudentId = els.studentViewSelect.value;
  const visibleStudents = currentRole === "student"
    ? state.students.filter((student) => student.id === selectedStudentId)
    : state.students;

  els.attendanceTitle.textContent = currentRole === "student" ? "Mi asistencia" : "Registro de asistencia";
  els.attendanceTable.innerHTML = visibleStudents.map((student) => {
    const status = state.attendance[date]?.[student.id] || "pending";
    return `
      <tr>
        <td>${studentLabel(student)}</td>
        <td>${student.course}</td>
        <td>${attendanceControls(student.id, status)}</td>
        <td>${attendanceSummary(student.id)}</td>
      </tr>
    `;
  }).join("");
}

function renderEvents() {
  renderEventList(els.eventsList, sortedEvents(), true);
}

function renderStudentArea() {
  const student = findStudent(els.studentViewSelect.value) || state.students[0];
  if (!student) return;

  const grades = state.grades.filter((grade) => grade.studentId === student.id);
  const avg = average(grades.map((grade) => grade.score));
  els.studentGradesTitle.textContent = `Notas de ${student.name}`;
  els.studentAverage.textContent = `Promedio ${formatAverage(avg)}`;

  els.studentGradesTable.innerHTML = grades.length ? grades.map((grade) => `
    <tr>
      <td>${grade.subject}</td>
      <td>${grade.name}</td>
      <td><strong>${grade.score.toFixed(1)}</strong></td>
      <td>${formatDate(grade.date)}</td>
    </tr>
  `).join("") : emptyRow("Aun no hay notas registradas.");

  const events = sortedEvents().filter((event) => event.studentId === student.id || event.studentId === "all");
  renderEventList(els.studentEventsList, events);
}

function attendanceControls(studentId, status) {
  if (currentRole === "student") {
    return attendanceBadge(status);
  }

  return `
    <div class="attendance-actions">
      <button class="btn btn-sm ${status === "present" ? "btn-success" : "btn-outline-success"}" onclick="markAttendance('${studentId}', 'present')" type="button">P</button>
      <button class="btn btn-sm ${status === "late" ? "btn-warning" : "btn-outline-warning"}" onclick="markAttendance('${studentId}', 'late')" type="button">T</button>
      <button class="btn btn-sm ${status === "absent" ? "btn-danger" : "btn-outline-danger"}" onclick="markAttendance('${studentId}', 'absent')" type="button">A</button>
    </div>
  `;
}

function renderEventList(container, events, withDelete = false) {
  if (!events.length) {
    container.innerHTML = `<div class="empty-state">No hay eventos para mostrar.</div>`;
    return;
  }

  container.innerHTML = events.map((event) => {
    const student = event.studentId === "all" ? null : findStudent(event.studentId);
    const recipient = event.studentId === "all" ? "Todos los alumnos" : student?.name || "Alumno eliminado";
    return `
      <article class="event-item">
        <header>
          <div>
            <h3>${event.title}</h3>
            <p>${recipient}</p>
          </div>
          <span class="event-date"><i class="bi bi-calendar-event"></i>${formatDate(event.date)}</span>
        </header>
        <p>${event.description}</p>
        ${withDelete ? `
          <button class="btn btn-sm btn-outline-danger mt-3" type="button" onclick="deleteEvent('${event.id}')">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        ` : ""}
      </article>
    `;
  }).join("");
}

function markAttendance(studentId, status) {
  const date = els.attendanceDate.value || toIsoDate(new Date());
  state.attendance[date] = state.attendance[date] || {};
  state.attendance[date][studentId] = status;
  saveState();
  render();
}

function deleteGrade(id) {
  state.grades = state.grades.filter((grade) => grade.id !== id);
  saveState();
  showToast("Nota eliminada.");
  render();
}

function deleteEvent(id) {
  state.events = state.events.filter((event) => event.id !== id);
  saveState();
  showToast("Evento eliminado.");
  render();
}

function resetDemo() {
  state = cloneData(seedState);
  saveState();
  fillStudentSelects();
  showToast("Datos demo reiniciados.");
  render();
}

function studentAverage(studentId) {
  return average(state.grades.filter((grade) => grade.studentId === studentId).map((grade) => grade.score));
}

function calculateAttendanceRate() {
  const records = Object.values(state.attendance).flatMap((day) => Object.values(day));
  if (!records.length) return 0;
  const positive = records.filter((status) => status === "present" || status === "late").length;
  return Math.round((positive / records.length) * 100);
}

function attendanceSummary(studentId) {
  const records = Object.values(state.attendance).map((day) => day[studentId]).filter(Boolean);
  if (!records.length) return "Sin registros";

  const present = records.filter((status) => status === "present").length;
  const late = records.filter((status) => status === "late").length;
  const absent = records.filter((status) => status === "absent").length;
  return `${present} presentes · ${late} tardanzas · ${absent} ausencias`;
}

function attendanceBadge(status) {
  const map = {
    present: ["badge-ok", "Presente"],
    late: ["badge-warn", "Tarde"],
    absent: ["badge-danger", "Ausente"],
    pending: ["badge-warn", "Pendiente"]
  };
  const [className, label] = map[status] || map.pending;
  return `<span class="badge-soft ${className}">${label}</span>`;
}

function statusBadge(avg) {
  if (!avg) return `<span class="badge-soft badge-warn">Sin notas</span>`;
  if (avg >= 5.5) return `<span class="badge-soft badge-ok">Destacado</span>`;
  if (avg >= 4) return `<span class="badge-soft badge-warn">En progreso</span>`;
  return `<span class="badge-soft badge-danger">Apoyo requerido</span>`;
}

function sortedEvents() {
  return [...state.events].sort((a, b) => a.date.localeCompare(b.date));
}

function average(numbers) {
  if (!numbers.length) return 0;
  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

function formatAverage(value) {
  return value ? value.toFixed(1) : "0.0";
}

function studentLabel(student) {
  const initials = student.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return `<span class="student-avatar">${initials}</span><strong>${student.name}</strong>`;
}

function findStudent(id) {
  return state.students.find((student) => student.id === id);
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function emptyRow(message) {
  return `<tr><td colspan="4"><div class="empty-state">${message}</div></td></tr>`;
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : cloneData(seedState);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showToast(message) {
  els.toastMessage.textContent = message;
  bootstrap.Toast.getOrCreateInstance(els.toast).show();
}

function createId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneData(data) {
  if (window.structuredClone) {
    return window.structuredClone(data);
  }

  return JSON.parse(JSON.stringify(data));
}

window.markAttendance = markAttendance;
window.deleteGrade = deleteGrade;
window.deleteEvent = deleteEvent;
