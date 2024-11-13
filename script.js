// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAdvRPTq1hBuhcpsCYoVaPwuCY06A301i6o",
    authDomain: "bancodetalentos-b5ba8.firebaseapp.com",
    projectId: "bancodetalentos-b5ba8",
    storageBucket: "bancodetalentos-b5ba8.appspot.com",
    messagingSenderId: "494101521109",
    appId: "1:494101521109:web:a547303ce2286b40ca385c",
    measurementId: "G-Z27371ZE7GG"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

document.addEventListener("DOMContentLoaded", function() {
    displayMembers();

    document.getElementById('search').addEventListener('input', () => {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        displayMembers(member => member.name.toLowerCase().includes(searchTerm));
    });

    document.getElementById('ageFilter').addEventListener('input', applyFilters);
    document.getElementById('courseFilter').addEventListener('input', applyFilters);
    document.getElementById('skillsFilter').addEventListener('input', applyFilters);

    document.getElementById('addButton').addEventListener('click', () => {
        openForm();
    });

    document.getElementById('toggleFiltersButton').addEventListener('click', () => {
        const filterContainer = document.querySelector('.filter-container');
        filterContainer.style.display = filterContainer.style.display === 'none' ? 'flex' : 'none';
    });
});

// Função applyFilters adicionada para evitar erros de referência
function applyFilters() {
    console.log("applyFilters chamada.");
}

// Função openForm para abrir e fechar o formulário de adição de membros
function openForm() {
    const form = document.getElementById('formContainer');
    form.style.display = form.style.display === 'none' || form.style.display === '' ? 'block' : 'none';
}

async function addMember() {
    const name = document.getElementById('nameInput').value;
    const age = parseInt(document.getElementById('ageInput').value);
    const skills = document.getElementById('skillsInput').value;
    const experience = document.getElementById('experienceInput').value;
    const phone = document.getElementById('phoneInput').value;
    const email = document.getElementById('emailInput').value;
    const course = document.getElementById('courseInput').value;
    const linkedin = document.getElementById('linkedinInput').value;
    const photoInput = document.getElementById('photoInput').files[0];
    const pdfInput = document.getElementById('pdfInput').files[0];

    let photoUrl = null;
    let pdfUrl = null;

    try {
        if (photoInput) {
            const photoRef = storage.ref().child('photos/' + photoInput.name);
            await photoRef.put(photoInput);
            photoUrl = await photoRef.getDownloadURL();
        }

        if (pdfInput) {
            const pdfRef = storage.ref().child('pdfs/' + pdfInput.name);
            await pdfRef.put(pdfInput);
            pdfUrl = await pdfRef.getDownloadURL();
        }

        await db.collection("members").add({
            name: name,
            age: age,
            skills: skills,
            experience: experience,
            phone: phone,
            email: email,
            course: course,
            linkedin: linkedin,
            photo: photoUrl,
            pdf: pdfUrl
        });
        
        alert("Membro adicionado com sucesso!");
        displayMembers();

    } catch (error) {
        console.error("Erro ao adicionar membro: ", error);
        alert("Erro ao adicionar membro. Verifique o console para mais informações.");
    }
}

async function displayMembers(filterFn = null) {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';

    const querySnapshot = await db.collection("members").get();
    const members = [];
    querySnapshot.forEach((doc) => {
        const memberData = doc.data();
        members.push(memberData);
    });

    members
        .filter(member => (filterFn ? filterFn(member) : true))
        .forEach((member, index) => createCard(member, index));
}

function createCard(member, index) {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        <div class="card-photo">
            ${member.photo ? `<img src="${member.photo}" alt="Foto de ${member.name}">` : 'Sem Foto'}
        </div>
        <div class="card-content">
            <div><strong>Nome:</strong> ${member.name}</div>
            <div><strong>Idade:</strong> ${member.age}</div>
            <div><strong>Habilidades:</strong> ${member.skills}</div>
            <div><strong>Experiência:</strong> ${member.experience}</div>
            <div><strong>Telefone:</strong> ${member.phone}</div>
            <div><strong>Email:</strong> ${member.email}</div>
            <div><strong>Curso:</strong> ${member.course}</div>
            <div><strong>LinkedIn:</strong> <a href="${member.linkedin}" target="_blank">${member.linkedin}</a></div>
            <div><strong>Currículo:</strong> ${member.pdf ? `<a href="${member.pdf}" download="Curriculo_${member.name}.pdf">Baixar PDF</a>` : 'Não disponível'}</div>
        </div>
        <div class="buttons">
            <button onclick="editMember(${index})">Editar</button>
            <button onclick="removeMember(${index})">Remover</button>
        </div>
    `;

    container.appendChild(card);
}
