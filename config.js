/* config.js */

/* Globales Objekt für die Schülerdaten:
   Struktur: { "Klasse A": [{name: "Anna", present: true}, ...], ... } */
let studentData = {};
let currentClass = "";

/* Initialisierung, wenn das DOM geladen wurde */
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  loadStudentData();

  document.getElementById('btn-random').addEventListener('click', selectRandomStudent);
  document.getElementById('btn-group').addEventListener('click', groupAssignment);

  document.getElementById('toggle-attendance').addEventListener('click', toggleAttendanceDropdown);
  document.getElementById('close-attendance').addEventListener('click', toggleAttendanceDropdown);

  // Schließen der Modals
  document.getElementById('close-selected').addEventListener('click', () => closeModal('modal-selected'));
  document.getElementById('close-group').addEventListener('click', () => closeModal('modal-group'));
}

/* Lädt die Schülerdaten aus data.json */
function loadStudentData() {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      studentData = {};
      // Konvertiere reine Namen in Objekte (mit default present: true)
      for (let klasse in data) {
        studentData[klasse] = data[klasse].map(name => ({ name: name, present: true }));
      }
      populateClassDropdown();
    })
    .catch(error => {
      console.error("Fehler beim Laden der Schülerdaten:", error);
    });
}

/* Befüllt das Dropdown mit Klassen */
function populateClassDropdown() {
  const dropdown = document.getElementById('classDropdown');
  dropdown.innerHTML = '';

  for (let klasse in studentData) {
    const option = document.createElement('option');
    option.value = klasse;
    option.textContent = klasse;
    dropdown.appendChild(option);
  }

  // Standardmäßig die erste Klasse auswählen
  if (dropdown.options.length > 0) {
    currentClass = dropdown.options[0].value;
    updateAttendanceList();
  }
}

/* Beim Klassenwechsel */
document.getElementById('classDropdown').addEventListener('change', function(event) {
  currentClass = event.target.value;
  updateAttendanceList();
});

/* Aktualisiert den Inhalt des Anwesenheits-Dropdowns */
function updateAttendanceList() {
  const attendanceList = document.getElementById('attendance-list');
  attendanceList.innerHTML = '';

  if (!studentData[currentClass]) return;

  studentData[currentClass].forEach((student, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'attendance-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = student.present;
    checkbox.id = `attend-${index}`;
    checkbox.addEventListener('change', (e) => {
      student.present = e.target.checked;
    });

    const label = document.createElement('label');
    label.htmlFor = `attend-${index}`;
    label.textContent = student.name;

    itemDiv.appendChild(checkbox);
    itemDiv.appendChild(label);
    attendanceList.appendChild(itemDiv);
  });
}

/* Toggle für Anwesenheits-Dropdown */
function toggleAttendanceDropdown() {
  const dropdown = document.getElementById('attendance-dropdown');
  dropdown.classList.toggle('hidden');
}

/* Öffnet ein Modal anhand seiner ID */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'flex';
  modal.classList.remove('hidden');
}

/* Schließt ein Modal (durch ID) */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'none';
  modal.classList.add('hidden');
}

/* Wählt einen zufälligen anwesenden Schüler und zeigt diesen in einem Modal an */
function selectRandomStudent() {
  if (!studentData[currentClass]) return;

  const presentStudents = studentData[currentClass].filter(s => s.present);
  if (presentStudents.length === 0) {
    alert("Keine anwesenden Schüler in dieser Klasse!");
    return;
  }

  const randomIndex = Math.floor(Math.random() * presentStudents.length);
  const selected = presentStudents[randomIndex];

  document.getElementById('student-name').textContent = selected.name;

  openModal('modal-selected');
}

/* Gruppeneinteilung basierend auf Anwesenheit */
function groupAssignment() {
  if (!studentData[currentClass]) return;
  
  // Array der anwesenden Schülernamen
  const presentStudents = studentData[currentClass].filter(s => s.present).map(s => s.name);
  const anzahlAnwesend = presentStudents.length;
  
  if (anzahlAnwesend < 2) {
    alert("Zu wenige anwesende Schüler für die Gruppeneinteilung!");
    return;
  }
  
  let gruppenGroesse1 = parseInt(prompt("Primäre Gruppengröße (z.B. 3):", "3"), 10);
  if (isNaN(gruppenGroesse1) || gruppenGroesse1 <= 0 || gruppenGroesse1 > anzahlAnwesend) {
    alert("Ungültige primäre Gruppengröße!");
    return;
  }
  
  let gruppenGroesse2 = parseInt(prompt("Sekundäre Gruppengröße (z.B. 2):", "2"), 10);
  if (isNaN(gruppenGroesse2) || gruppenGroesse2 <= 0 || gruppenGroesse2 > anzahlAnwesend) {
    alert("Ungültige sekundäre Gruppengröße!");
    return;
  }
  
  // Mischen (Fisher-Yates)
  const shuffled = presentStudents.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  let anzahlGruppen1 = Math.floor(anzahlAnwesend / gruppenGroesse1);
  let restSchueler = anzahlAnwesend % gruppenGroesse1;
  
  while (restSchueler > 0 && (restSchueler % gruppenGroesse2 !== 0) && anzahlGruppen1 > 0) {
    anzahlGruppen1--;
    restSchueler += gruppenGroesse1;
  }
  
  if (restSchueler % gruppenGroesse2 !== 0) {
    alert("Keine sinnvolle Verteilung mit diesen Gruppengrößen möglich!");
    return;
  }
  
  const anzahlGruppen2 = restSchueler / gruppenGroesse2;
  const groups = [];
  let groupNumber = 1;
  let index = 0;
  
  // Primäre Gruppen
  for (let i = 0; i < anzahlGruppen1; i++) {
    const groupStudents = shuffled.slice(index, index + gruppenGroesse1);
    groups.push({ groupName: `Gruppe ${groupNumber} (${gruppenGroesse1}er)`, students: groupStudents });
    index += gruppenGroesse1;
    groupNumber++;
  }
  
  // Sekundäre Gruppen
  for (let i = 0; i < anzahlGruppen2; i++) {
    const groupStudents = shuffled.slice(index, index + gruppenGroesse2);
    groups.push({ groupName: `Gruppe ${groupNumber} (${gruppenGroesse2}er)`, students: groupStudents });
    index += gruppenGroesse2;
    groupNumber++;
  }
  
  displayGroupResult(groups);
}

/* Zeigt die Gruppeneinteilung in einem Modal (Raster) an */
function displayGroupResult(groups) {
  const groupOutput = document.getElementById('group-output');
  groupOutput.innerHTML = ''; // Vorherige Ergebnisse löschen
  
  groups.forEach(group => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group-box';
    
    const groupTitle = document.createElement('h3');
    groupTitle.textContent = group.groupName;
    groupDiv.appendChild(groupTitle);
    
    const ul = document.createElement('ul');
    group.students.forEach(studentName => {
      const li = document.createElement('li');
      li.textContent = studentName;
      ul.appendChild(li);
    });
    groupDiv.appendChild(ul);
    groupOutput.appendChild(groupDiv);
  });
  
  openModal('modal-group');
}
