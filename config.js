/* config.js */

/* Globales Objekt, in dem die Schülerdaten gehalten werden.
   Struktur: { "Klasse A": [{name: "Anna", present: true}, …], … } */
let studentData = {};
let currentClass = "";

/* Initialisierung, wenn das DOM vollständig geladen ist */
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  loadStudentData();

  document.getElementById('btn-random').addEventListener('click', selectRandomStudent);
  document.getElementById('btn-group').addEventListener('click', groupAssignment);
  document.getElementById('classDropdown').addEventListener('change', onClassChange);
}

/* Lädt die Schülerdaten aus der separaten JSON-Datei */
function loadStudentData() {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      studentData = {};
      // Umwandeln der reinen Namen in Objekte mit default „present: true“
      for (let klasse in data) {
        studentData[klasse] = data[klasse].map(name => ({ name: name, present: true }));
      }
      populateClassDropdown();
    })
    .catch(error => {
      console.error("Error loading student data:", error);
    });
}

/* Befüllt das Dropdown mit den vorhandenen Klassen */
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
    displayStudentList();
  }
}

/* Event-Handler für den Klassenwechsel */
function onClassChange(event) {
  currentClass = event.target.value;
  displayStudentList();
}

/* Zeigt die Schülerliste der aktuellen Klasse mit Checkboxen an */
function displayStudentList() {
  const listContainer = document.getElementById('student-list');
  listContainer.innerHTML = ''; // Vorherige Liste löschen
  if (!studentData[currentClass]) return;

  studentData[currentClass].forEach((student, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'student-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = student.present;
    checkbox.id = `student-${index}`;
    // Aktualisiert das zugrundeliegende Objekt direkt
    checkbox.addEventListener('change', (e) => {
      student.present = e.target.checked;
    });

    const label = document.createElement('label');
    label.htmlFor = `student-${index}`;
    label.textContent = student.name;

    itemDiv.appendChild(checkbox);
    itemDiv.appendChild(label);
    listContainer.appendChild(itemDiv);
  });

  hideResultDisplays();
}

/* Blendet alle Ergebnisbereiche aus */
function hideResultDisplays() {
  document.getElementById('selected-student').classList.remove('visible');
  document.getElementById('selected-student').classList.add('hidden');
  document.getElementById('group-result').classList.remove('visible');
  document.getElementById('group-result').classList.add('hidden');
}

/* Wählt einen zufälligen anwesenden Schüler aus und zeigt diesen prominent an */
function selectRandomStudent() {
  hideResultDisplays();
  if (!studentData[currentClass]) return;

  const presentStudents = studentData[currentClass].filter(s => s.present);
  if (presentStudents.length === 0) {
    alert("Keine anwesenden Schüler in dieser Klasse!");
    return;
  }

  const randomIndex = Math.floor(Math.random() * presentStudents.length);
  const selected = presentStudents[randomIndex];

  // Anzeige des ausgewählten Schülers mit Animation
  const selectedContainer = document.getElementById('selected-student');
  document.getElementById('student-name').textContent = selected.name;
  
  selectedContainer.classList.remove('hidden');
  // Reflow erzwingen, um die Animation bei jedem Klick neu zu starten
  void selectedContainer.offsetWidth;
  selectedContainer.classList.add('visible');
}

/* Gruppeneinteilung basierend auf den Anwesenheitsdaten */
function groupAssignment() {
  hideResultDisplays();
  if (!studentData[currentClass]) return;
  
  // Erstellen eines Arrays mit den Namen der anwesenden Schüler
  const presentStudents = studentData[currentClass].filter(s => s.present).map(s => s.name);
  const anzahlAnwesend = presentStudents.length;
  
  if (anzahlAnwesend < 2) {
    alert("Zu wenige anwesende Schüler für die Gruppeneinteilung!");
    return;
  }
  
  // Gruppengrößen abfragen
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
  
  // Mischen der anwesenden Schüler (Fisher-Yates)
  const shuffled = presentStudents.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Gruppeneinteilungslogik (angelehnt an den VBA-Code)
  let anzahlGruppen1 = Math.floor(anzahlAnwesend / gruppenGroesse1);
  let restSchueler = anzahlAnwesend % gruppenGroesse1;
  
  // Optimierung: Reduziere primäre Gruppen, bis der Rest in sekundäre Gruppen passt
  while (restSchueler > 0 && (restSchueler % gruppenGroesse2 !== 0) && anzahlGruppen1 > 0) {
    anzahlGruppen1--;
    restSchueler += gruppenGroesse1;
  }
  
  if (restSchueler % gruppenGroesse2 !== 0) {
    alert("Keine sinnvolle Verteilung mit diesen Gruppengrößen möglich!");
    return;
  }
  
  const anzahlGruppen2 = restSchueler / gruppenGroesse2;
  
  // Aufbau der Gruppen
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
  
  displayGroupResult(groups, anzahlAnwesend, gruppenGroesse1, anzahlGruppen1, gruppenGroesse2, anzahlGruppen2);
}

/* Zeigt das Ergebnis der Gruppeneinteilung an */
function displayGroupResult(groups, anzahlAnwesend, gruppenGroesse1, anzahlGruppen1, gruppenGroesse2, anzahlGruppen2) {
  const groupOutput = document.getElementById('group-output');
  groupOutput.innerHTML = ''; // Vorherige Ergebnisse löschen
  
  groups.forEach(group => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group';
    
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
  
  const resultContainer = document.getElementById('group-result');
  resultContainer.classList.remove('hidden');
  // Reflow auslösen, um die Animation neu zu starten
  void resultContainer.offsetWidth;
  resultContainer.classList.add('visible');
  
  // Log-Ausgabe (optional)
  console.log(`Anwesend: ${anzahlAnwesend}`);
  console.log(`${gruppenGroesse1}er-Gruppen: ${anzahlGruppen1}`);
  console.log(`${gruppenGroesse2}er-Gruppen: ${anzahlGruppen2}`);
}
