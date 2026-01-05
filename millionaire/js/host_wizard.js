const TOTAL_QUESTIONS = 15;
let currentStep = 0;

const questions = [];

const answersContainer = document.getElementById('answersContainer');
const questionInput = document.getElementById('questionInput');
const stepTitle = document.getElementById('stepTitle');
const nextBtn = document.getElementById('nextBtn');

renderAnswers();
updateTitle();

nextBtn.addEventListener('click', nextStep);

function renderAnswers() {
    answersContainer.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        answersContainer.innerHTML += `
      <div class="answers">
        <input type="text" id="answer-${i}" placeholder="Answer ${i + 1}">
        <input type="radio" name="correct" value="${i}">
      </div>
    `;
    }
}

function updateTitle() {
    stepTitle.textContent = `Question ${currentStep + 1} of ${TOTAL_QUESTIONS}`;
}

function nextStep() {
    const question = questionInput.value.trim();
    const answers = [];
    let correct = null;

    for (let i = 0; i < 4; i++) {
        answers.push(document.getElementById(`answer-${i}`).value.trim());
    }

    document.querySelectorAll('input[name="correct"]').forEach(radio => {
        if (radio.checked) correct = Number(radio.value);
    });

    if (!question || answers.some(a => !a) || correct === null) {
        alert('Please complete the question and select the correct answer.');
        return;
    }

    questions.push({ question, answers, correct });

    questionInput.value = '';
    renderAnswers();

    currentStep++;

    if (currentStep < TOTAL_QUESTIONS) {
        updateTitle();
    } else {
        finishWizard();
    }
}

function finishWizard() {
    const gameName = prompt('Enter game name (e.g. "game night january")');
    if (!gameName) return;

    const gameData = {
        name: gameName,
        created: new Date().toISOString(),
        questions
    };

    const json = JSON.stringify(gameData, null, 2);

    downloadJSON(json, gameName);
}

function downloadJSON(json, gameName) {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Game number is user-managed for now (browser limitation)
    const fileName = `${gameName}-millionaire-game-${Date.now()}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
}
