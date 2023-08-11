// Import constants, views, and data
import {
  ANSWERS_LIST_ID,
  NEXT_QUESTION_BUTTON_ID,
  USER_INTERFACE_ID,
  FINISH_QUIZ_BUTTON_ID,
  SCORE_TABLE_ID,
  SHOW_ANSWER_BUTTON_ID,
} from '../constants.js';
import { createQuestionElement } from '../views/questionView.js';
import { createAnswerElement } from '../views/answerView.js';
import { createScoreElement } from '../views/scoreView.js';
import { quizData } from '../data.js';
import { initWelcomePage } from './welcomePage.js';

// Function to retrieve current quiz data from session storage
const getCurrentQuizData = () => JSON.parse(window.sessionStorage.getItem('quizData'));

// Function to update quiz data in session storage
const updateQuizData = (quizData) => {
  window.sessionStorage.setItem('quizData', JSON.stringify(quizData));
};

// Function to add a CSS class to an element by its ID
const addClassToElement = (elementId, className) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add(className);
  }
};

// Initialize the question page
export const initQuestionPage = () => {
  const currentQuizData = getCurrentQuizData();
  const userInterface = document.getElementById(USER_INTERFACE_ID);

  // Clear the user interface and apply fade-in animation
  userInterface.innerHTML = '';
  userInterface.classList.remove('fade-out');
  userInterface.classList.add('fade-in');

  // Get the current question and create question element
  const currentQuestion = currentQuizData.questions[currentQuizData.currentQuestionIndex];
  const questionElement = createQuestionElement(currentQuestion.text);

  // Calculate and display the current score
  const currentScore = calculateScore(currentQuizData);
  const scoreElement = createScoreElement(currentScore);
  const scoreDiv = document.createElement('div');
  scoreDiv.id = SCORE_TABLE_ID;
  scoreDiv.appendChild(scoreElement);
  userInterface.appendChild(scoreDiv);

  // Display the question and answers
  userInterface.appendChild(questionElement);
  const answersListElement = document.getElementById(ANSWERS_LIST_ID);
  for (const [key, answerText] of Object.entries(currentQuestion.answers)) {
    const answerElement = createAnswerElement(key, answerText);
    answersListElement.appendChild(answerElement);
  }

  // Attach click event listeners to option buttons
  for (let element of document.getElementsByClassName('option')) {
    element.addEventListener('click', () => selectAnswer(element.id));
  }

  // Update the "Next Question" button to "Finish Quiz" if necessary
  const nextButton = document.getElementById(NEXT_QUESTION_BUTTON_ID);
  const finishButtonId = currentQuizData.currentQuestionIndex === currentQuizData.questions.length - 1
    ? FINISH_QUIZ_BUTTON_ID
    : NEXT_QUESTION_BUTTON_ID;
  nextButton.innerText = finishButtonId === FINISH_QUIZ_BUTTON_ID ? 'Finish Quiz' : 'Next Question';
  nextButton.id = finishButtonId;
  nextButton.addEventListener('click', finishButtonId === FINISH_QUIZ_BUTTON_ID ? finishQuiz : nextQuestion);

  // Highlight selected and correct answers
  const selectedAnswer = currentQuestion.selected;
  const correctAnswer = currentQuestion.correct;
  if (selectedAnswer !== null && selectedAnswer !== 'passed') {
    addClassToElement(selectedAnswer, selectedAnswer === correctAnswer ? 'correct-answer' : 'wrong-answer');
    addClassToElement(correctAnswer, 'correct-answer');
  }
  if (selectedAnswer === 'passed') {
    addClassToElement(correctAnswer, 'correct-answer');
  }

  // Add a progress bar
  const progressContainer = document.createElement('div');
  progressContainer.id = 'progress-container';
  const progressElement = document.createElement('div');
  progressElement.id = 'progress-bar';
  scoreDiv.appendChild(progressContainer);
  progressContainer.appendChild(progressElement);

  // Calculate and set progress percentage
  const progressPercentage = ((currentQuizData.currentQuestionIndex + 1) / currentQuizData.questions.length) * 100;
  progressElement.style.width = `${progressPercentage}%`;

  // Attach click event listener to "Show Answer" button
  const showAnswerBtn = document.getElementById(SHOW_ANSWER_BUTTON_ID);
  showAnswerBtn.addEventListener('click', () => {
    const currentQuizData = getCurrentQuizData();
    const question = currentQuizData.questions[currentQuizData.currentQuestionIndex];
    
    if (question.selected == null) {
      addClassToElement(question.correct, 'correct-answer');
      question.selected = 'passed';
      updateQuizData(currentQuizData);
    }
  });
};

// Function to proceed to the next question
const nextQuestion = () => {
  const currentQuizData = getCurrentQuizData();
  currentQuizData.currentQuestionIndex += 1;
  updateQuizData(currentQuizData);

  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.classList.remove('fade-in');
  userInterface.classList.add('fade-out');

  // Wait for the fade-out animation to complete before loading the new question
  window.setTimeout(() => {
    initQuestionPage();
  }, 200);
};

// Function to handle selecting an answer
const selectAnswer = (optionId) => {
  const currentQuizData = getCurrentQuizData();
  const question = currentQuizData.questions[currentQuizData.currentQuestionIndex];

  if (question.selected === null) {
    question.selected = optionId;
    const isCorrect = question.correct === optionId;

    addClassToElement(optionId, isCorrect ? 'correct-answer' : 'wrong-answer');
    addClassToElement(question.correct, 'correct-answer');

    const quizScore = calculateScore(currentQuizData);
    const scoreElement = createScoreElement(quizScore);

    const progressContainer = document.getElementById('progress-container');
    const scoreDiv = document.getElementById(SCORE_TABLE_ID);

    scoreDiv.innerHTML = '';
    scoreDiv.appendChild(scoreElement);
    scoreDiv.appendChild(progressContainer);

    updateQuizData(currentQuizData);
  }
};

// Function to finish the quiz
const finishQuiz = () => {
  const currentQuizData = getCurrentQuizData();
  const quizScore = calculateScore(currentQuizData);
  const scoreElement = createScoreElement(quizScore);

  const userInterface = document.getElementById(USER_INTERFACE_ID);
  userInterface.innerHTML = '';
  userInterface.appendChild(scoreElement);

  // Remove quiz data from session storage
  window.sessionStorage.removeItem('quizData');

  // Add a restart button
  const restartBtn = document.createElement('button');
  restartBtn.innerHTML = 'RESTART';
  userInterface.appendChild(restartBtn);
  restartBtn.setAttribute('id', 'restart-button');
  restartBtn.addEventListener('click', initWelcomePage);
};

// Function to calculate the current score
const calculateScore = (quizData) => {
  let quizScore = 0;

  quizData.questions.forEach((question) => {
    if (question.correct === question.selected) {
      quizScore += 1;
    }
  });

  return quizScore;
};
