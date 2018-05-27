const fs = require('fs');

const buffer = fs.readFileSync('file.in');
const lines = buffer.toString().split('\n');
const questions = {
    'questions': lines
};

fs.writeFileSync('questions.json', JSON.stringify(questions, null, 4));
