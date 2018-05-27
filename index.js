const keys = require('./keys');
const telegram = require('node-telegram-bot-api');
const questions = require('./questions.json');
const nodeSchedule = require('node-schedule');
const bot = new telegram(keys.TOKEN, { polling: true });

const READY_ICON = String.fromCodePoint(9989);

const getRandomQuestion = () => {
    const q_length = questions.questions.length;
    return questions.questions[Math.round(Math.random()*q_length)];
};

let games = new Map();
let id = 1;

const MSG = {
    'never': '¡Yo nunca!',
    'ever': '¡Culpable!'
};

const ICONS = {
    'never': String.fromCodePoint(128516),
    'ever': String.fromCodePoint(128517)
};

const GAME_BTNS = id => JSON.stringify({
    inline_keyboard: [
        [
            { text: '¡Yo nunca!', callback_data: `never#${id}` },
            { text: '¡Culpable!', callback_data: `ever#${id}` }
        ]
    ]
});

const formatGameMessage = game => {
    const users = [...game.users.values()].reduce((acc, user) => {
        return `${acc}[${user.name}](tg://user?id=${user.id}) ${ICONS[user.decision]} ${MSG[user.decision]}\n`;
    }, "");
    return `*${game.question}*\n\n${users}`;
};

bot.onText(/^\!game$/i, async(msg, match) => {
    const new_game = {
        id,
        question: getRandomQuestion(),
        users: new Map()
    };
    games.set(id, new_game);
    id++;
    await bot.sendMessage(msg.chat.id, formatGameMessage(new_game), { parse_mode: 'Markdown', reply_markup: GAME_BTNS(new_game.id) });
});

bot.on('callback_query', async(query) => {
    const [type, id] = query.data.split('#');
    const game = games.get(Number(id));
    if(!game){
        console.log('unexpected error');
        return;
    }
    if(type === 'never'){
        game.users.set(query.from.id, { name: `${query.from.first_name} ${query.from.last_name}`, id: query.from.id, decision: 'never' });
        await bot.editMessageText(formatGameMessage(game), {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            parse_mode: 'Markdown',
            reply_markup: GAME_BTNS(game.id)
        });
    }
    else{
        game.users.set(query.from.id, { name: `${query.from.first_name} ${query.from.last_name}`, id: query.from.id, decision: 'ever' });
        await bot.editMessageText(formatGameMessage(game), {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            parse_mode: 'Markdown',
            reply_markup: GAME_BTNS(game.id)
        });
    }

});

console.log('OK, NHIE BOT IS RUNNING');
