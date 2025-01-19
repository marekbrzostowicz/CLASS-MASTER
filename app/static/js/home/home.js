document.addEventListener('DOMContentLoaded', () => {
    fetchClasses(); 
});

document.addEventListener('click', (event) => {
    const field = document.getElementById('class-input');
    const bin = document.getElementById('bin');

    // Jeżeli panel z ikonami jest widoczny i kliknęliśmy poza nim i poza .options => chowamy panel
    if (field.style.display === 'block' && !field.contains(event.target) && !event.target.closest('.options')){
        hideIcons();
    }

    // Jeżeli kosz (bin) jest widoczny i kliknęliśmy poza nim => chowamy kosz
    if(isBinShown(bin) && !bin.contains(event.target)) {
        hideBin(bin)
    }
});

document.addEventListener('keydown', (event) => {
    const bin = document.getElementById('bin');
    if (event.key === 'Escape'){
        hideIcons();
        
        bin.classList.remove('bin-shown');
        bin.classList.add('bin-hidden');
    
    }
});

 
function lightMode(){
  // Twój kod trybu jasnego/ciemnego
  console.log('Light mode toggle');
}

// Funkcja do pokazywania div z ikonami
function showIcons() {
    
    const field = document.getElementById('class-input');
    const bin = document.getElementById('bin');

    if (field.style.display === 'none' || !field.style.display) {
        field.style.display = 'block';
        hideBin(bin)
    } else {
        field.style.display = 'none';
    }
}

// Funkcja do ukrywania div z ikonami
function hideIcons() {
    const field = document.getElementById('class-input');
    field.style.display = 'none';
}

let selectedIcon = null;

function showSave(iconName) {
    selectedIcon = iconName;
}

function addClass() {
    const name = document.getElementById("name").value.trim();
    
    if (!selectedIcon && !name) {
        alert('Wpisz nazwę klasy i wybierz ikonę');
    } else if (!name) {
        alert('Wpisz nazwę klasy');
    } else if (!selectedIcon) {
        alert('Wybierz ikonę');
    } else {
        fetch(`api/classes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                icon: selectedIcon,
            }),
        })
        .then(() => {
            fetchClasses();
            restartClassInput();
            hideIcons(); 
        });
    }
}

async function fetchClasses() {
    try {
        const response = await fetch('/api/classes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const classes = await response.json();
        showClasses(classes); 
        return classes;
    } catch (error) {
        console.error('Failed to fetch classes:', error);
        return [];
    }
}

function showClasses(classes) {
    const container = document.getElementById('class-container');
    container.innerHTML = ''; 

    classes.forEach((obj, index) => {
        const classWrapper = createClassElement(obj, index);
        container.appendChild(classWrapper); 
    });
}


function createClassElement(obj, index) {
    const classWrapper = document.createElement('div'); 
    const bin = document.getElementById('bin');
    
    classWrapper.classList.add('class-wrapper');

    // Prawy przycisk myszy => pokazuje kosz
    classWrapper.addEventListener('contextmenu', (event) => {
        event.preventDefault(); 
        showBin(bin, event.clientX, event.clientY)
        bin.dataset.classId = obj.id

    });
    
    // Kliknięcie na klasę
    classWrapper.addEventListener('click', (event) => {
        const bin = document.getElementById('bin');
        const field = document.getElementById('class-input');

        if(isBinShown(bin)) {
            hideBin(bin);
            return
        }
        

        if (field.style.display === 'block') {
            hideIcons();
            return; // Przerywamy dalsze działanie
        }

        // Jeżeli ani kosz, ani panel z ikonami nie są widoczne => przechodzimy do widoku klasy
        window.location.href = `/class/${obj.id}`;
    });

    // Struktura wewnątrz wrappera: ikona + nazwa klasy
    const classIcon = document.createElement('div');
    classIcon.id = 'classId';
    classIcon.innerHTML = `<i class="fas ${obj.icon} class-icon"></i>`;
    classIcon.style.fontSize = '45px';

    const classElement = document.createElement('div'); 
    classElement.textContent = `${obj.name}`;

    classWrapper.appendChild(classIcon);
    classWrapper.appendChild(classElement);
    
    return classWrapper;
}

function restartClassInput() {
    document.getElementById('name').value = '';
    selectedIcon = null;
}

function showBin(bin, x, y){
    bin.style.left = x - 65 +'px'
    bin.style.top = y + 'px'
    bin.classList.remove('bin-hidden')
    bin.classList.add('bin-shown')
}

function hideBin(bin){
    bin.classList.remove('bin-shown')
    bin.classList.add('bin-hidden')
}

function isBinShown(bin){
    return bin.classList.contains('bin-shown')
}



async function deleteClass(classId) {
    try {
        const response = await fetch(`/api/classes/${parseInt(classId, 10)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`)
        }
        return response.json()
    } catch (error){
        console.log('Failed to delete', error)
    }
}



const trashIcon = bin.querySelector('.fa-trash-alt'); // lub inny selektor
trashIcon.addEventListener('click', () => {
    const classIdToDelete = bin.dataset.classId; 
    if (!classIdToDelete) {
        console.warn('No class ID stored in bin');
        return;
    }
    deleteClass(classIdToDelete)
        .then(() => {
            // Po udanym usunięciu – np. odśwież listę klas:
            fetchClasses();
            
            hideBin(bin);
        });
});
