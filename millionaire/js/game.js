let currentIndex = null;
const gameState = Array(15).fill(null);

let gameQuestions = [];

const lifelinesUsed = {
    phone: false,
    fifty: false,
    poll: false
};

const fiftyFiftyDisabled = new Set(); // Track which answer indices are disabled by 50/50

function triggerLoad() {
    document.getElementById('gameFileInput').click();
}
function loadGameFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            initializeGameFromJSON(data);
        } catch (err) {
            alert('Invalid game file.');
            console.error(err);
        }
    };

    reader.readAsText(file);
}

function initializeGameFromJSON(data) {
    if (!data.questions || data.questions.length !== 15) {
        alert('Game file must contain exactly 15 questions.');
        return;
    }

    gameQuestions = data.questions; // overwrite global questions
    currentQuestionIndex = 0;

    resetVisualState();

    loadQuestion(0);

    alert(`Loaded game: ${data.name}`);
}

function resetVisualState() {
    document.querySelectorAll('.money-row').forEach(row => {
        row.classList.remove('correct', 'wrong', 'active');
    });

    document.querySelectorAll('.answer-box').forEach(box => {
        box.classList.remove('correct', 'wrong', 'selected');
    });
}

function loadQuestion(index) {
    currentIndex = index;

    // Highlight ladder
    document.querySelectorAll('.ladder button').forEach((btn, i) => {
        btn.classList.remove('active');
        if (i === index) btn.classList.add('active');
    });

    // Pull question from loaded game
    const q = gameQuestions[index];

    if (!q) {
        document.getElementById('question').textContent = 'No question loaded';
        document.getElementById('question').classList.add('placeholder');
        return;
    }

    document.getElementById('question').textContent = q.question;
    document.getElementById('question').classList.remove('placeholder');

    const state = gameState[index];

    document.querySelectorAll('.answer').forEach((el, i) => {
        el.textContent = q.answers[i];
        el.classList.remove('placeholder', 'correct', 'wrong', 'disabled');

        // If answer is disabled by 50/50
        if (fiftyFiftyDisabled.has(i)) {
            el.classList.add('disabled');
        }

        // If this question has already been answered
        if (state) {
            el.classList.add('disabled');

            // Highlight selected answer
            if (i === state.selected) {
                el.classList.add(state.correct ? 'correct' : 'wrong');
            }

            // If wrong, also reveal correct answer
            if (!state.correct && i === q.correct) {
                el.classList.add('correct');
            }
        }
    });
}


function selectAnswer(answerIndex) {
    if (currentIndex === null) return;
    if (gameState[currentIndex]) return;
    if (fiftyFiftyDisabled.has(answerIndex)) return;

    const correctIndex = gameQuestions[currentIndex]?.correct;
    const isCorrect = answerIndex === correctIndex;

    gameState[currentIndex] = {
        answered: true,
        selected: answerIndex,
        correct: isCorrect
    };

    const ladderBtn = document.querySelectorAll('.ladder button')[currentIndex];
    ladderBtn.classList.add(isCorrect ? 'correct' : 'wrong');

    document.querySelectorAll('.answer').forEach((el, i) => {
        el.classList.add('disabled');

        if (i === answerIndex) {
            el.classList.add(isCorrect ? 'correct' : 'wrong');
        }

        // Highlight correct answer after a wrong guess
        if (!isCorrect && i === correctIndex) {
            el.classList.add('correct');
        }
    });
}

function resetGame() {
    // Clear state
    for (let i = 0; i < gameState.length; i++) {
        gameState[i] = null;
    }

    currentIndex = null;

    // Reset ladder
    document.querySelectorAll('.ladder button').forEach(btn => {
        btn.classList.remove('correct', 'wrong', 'active');
    });

    // Reset question view
    document.getElementById('question').textContent =
        "Select a dollar amount to begin";
    document.getElementById('question').classList.add('placeholder');

    document.querySelectorAll('.answer').forEach(el => {
        el.textContent = "";
        el.classList.remove('correct', 'wrong', 'disabled');
        el.classList.add('placeholder');
    });

    // Reset lifelines
    lifelinesUsed.phone = false;
    lifelinesUsed.fifty = false;
    lifelinesUsed.poll = false;
    fiftyFiftyDisabled.clear();

    updateLifelineButtons();
}

function useLifeline(type) {
    if (lifelinesUsed[type]) {
        alert('You have already used this lifeline!');
        return;
    }

    if (currentIndex === null) {
        alert('Please select a question first.');
        return;
    }

    lifelinesUsed[type] = true;

    if (type === 'fifty') {
        applyFiftyFifty();
    }

    updateLifelineButtons();
}

function applyFiftyFifty() {
    const correctIndex = gameQuestions[currentIndex]?.correct;
    const wrongAnswers = [0, 1, 2, 3].filter(i => i !== correctIndex);

    // Randomly select 2 of the 3 wrong answers to disable
    const toDisable = wrongAnswers.sort(() => 0.5 - Math.random()).slice(0, 2);

    toDisable.forEach(index => {
        fiftyFiftyDisabled.add(index);
    });

    // Reload the current question to show disabled answers
    loadQuestion(currentIndex);
}

function updateLifelineButtons() {
    document.getElementById('lifelinePhoneBtn').disabled = lifelinesUsed.phone;
    document.getElementById('lifeline50Btn').disabled = lifelinesUsed.fifty;
    document.getElementById('lifelinePollBtn').disabled = lifelinesUsed.poll;
}

document.getElementById('resetGameBtn').addEventListener('click', resetGame);
