
const fs = require('fs');
const path = require('path');
const doAsync = require('doasync');
const asyncFs = doAsync(fs);

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';

module.exports.config = {
    cache_task_data: false
};

module.exports.taskData = function (args, callback) {
    generateTaskData(args.task).then(function ({privateData, publicData}) {
        // TODO: cache privateData
        callback(null, publicData);
    }).catch(function (error) {
        console.error(error);
        callback(error);
    });
};

async function generateTaskData(task) {
    const baseDir = path.join(__dirname, "task_data");
    const taskText = await asyncFs.readFile(path.join(baseDir, "task.txt"), 'utf8');
    const hintsText = await asyncFs.readFile(path.join(baseDir, "hints.txt"), 'utf8');
    const plainText = await asyncFs.readFile(path.join(baseDir, "plain.txt"), 'utf8');
    const answerText = await asyncFs.readFile(path.join(baseDir, "answer.txt"), 'utf8');
    const taskLines = taskText.trim().split('\n');
    const gridPos = taskLines.length - 5;
    const cipherText = taskLines.slice(0, 2).join('\n');
    const firstname = taskLines[2];
    const allHints = parseGrid(hintsText);
    const initialGrid = taskLines.slice(gridPos).join('\n');
    const initialHints = parseGrid(initialGrid);
    const privateData = {
        alphabet,
        plainText,
        cipherText,
        answerText,
        firstname,
        allHints,
        initialHints
    };
    const hints = parseGrid(initialGrid);
    for (let hint of JSON.parse(task.hints_requested)) {
        console.log('hint', hint);
        hints[hint.row][hint.col] = {'q': 'hint', 'l': hint.rank};
    }
    const publicData = {
        alphabet,
        cipherText,
        firstname,
        hints,
    };
    return {privateData, publicData};
}

function parseGrid(text) {
    const chars = text.split(/\s+/);
    const hints = chars.map(function (c) {
        const i = alphabet.indexOf(c);
        return i == -1 ? {'q': 'unknown'} : {'q': 'hint', 'l': i};
    });
    const span = 5;
    const rows = [];
    for (let i = 0; i < chars.length; i += 5) {
        rows.push(hints.slice(i, i + 5));
    }
    return rows;
}

module.exports.requestHint = function (args, callback) {
    generateTaskData(args.task).then(function ({privateData, publicData}) {
        if (args.request.type === 'grid') {
            const {row, col} = args.request;
            const rank = privateData.allHints[row][col].l;
            for (let hint of JSON.parse(args.task.hints_requested)) {
                if (hint.rank === rank) {
                    return callback(new Error('hint already requested'));
                }
            }
            return callback(null, {...args.request, rank, letter: publicData.alphabet[rank]});
        }
        if (args.request.type === 'alphabet') {
            const {rank} = args.request;
            const hints = privateData.allHints;
            for (let row = 0; row < hints.length; row++) {
                for (let col = 0; col < hints[row].length; col++) {
                    if (hints[row][col].l === rank) {
                        return callback(null, {...args.request, row, col, letter: publicData.alphabet[rank]});
                    }
                }
            }
            return callback(new Error('requested letter is not in grid'));
        }
        return callback(new Error('invalid hint type'));
    });
};

module.exports.gradeAnswer = function (args, task_data, callback) {
    // args.random_seed // 2
    // JSON.parse(args.hints_requested) // [{}]
    // JSON.parse(args.answer.value).gridEdits // [[{letter: 'A'}]]
    // args.min_score // 0
    // args.max_score // 40
    // args.no_score // 0
    // task_data.alphabet // 'ABCDEFGHIJKLMNOPQRSTUVXYZ',
    // task_data.cipherText // 'QS EIKF EIKFISQVI CIRH…'
    callback(null, {
        score: 0,
        message: "TODO",
    });
};

/*
!function () {
    module.exports.gradeAnswer({
        task: {random_seed: 300348454218987061, params: {version: '2'}, hints_requested: "[]"},
        answer: {value: '{"rotors":[[2,7,13,18,1,25,15,24,16,0,10,3,12,20,23,4,9,5,17,21,22,6,11,14,19,8],[16,23,2,20,4,8,11,10,6,5,-1,14,19,12,13,18,17,7,9,21,15,22,-1,25,3,24]]}'}
    }, {}, function (err, result) {
        if (err) { console.log(err); return; }
        console.log(JSON.stringify(result, null, 2));
    });
}();
*/

/*
import os
import random
import re
from unidecode import unidecode
from difflib import SequenceMatcher
from decimal import Decimal

INITIAL_SCORE = 500


def get_task(index):


def task_file(dir, name):
    full_path = os.path.join(dir, name)
    if not os.path.isfile(full_path):
        raise RuntimeError("missing file: {}".format(full_path))
    return full_path




def get_hint(task, query):
    try:
        if query['type'] == 'grid':
            return get_grid_hint(task, int(query['row']), int(query['col']))
        if query['type'] == 'alphabet':
            return get_alphabet_hint(task, int(query['rank']))
        return False
    except KeyError:
        return False


def get_grid_hint(task, row, col):
    if task['score'] < 10:
        return False
    try:
        dst_hints = task['team_data']['hints']
        if 'l' in dst_hints[row][col]:
            return False
        src_hints = task['full_data']['hints']
        cell = src_hints[row][col]
        dst_hints[row][col] = cell
        task['score'] -= 10
        return True
    except IndexError:
        return False


def get_alphabet_hint(task, rank):
    if task['score'] < 10:
        return False
    src_hints = task['full_data']['hints']
    dst_hints = task['team_data']['hints']
    for row, row_cells in enumerate(src_hints):
        for col, cell in enumerate(row_cells):
            if cell['l'] == rank and 'l' not in dst_hints[row][col]:
                task['score'] -= 10
                dst_hints[row][col] = cell
                return True
    return False


def print_hints(hints):
    for row_cells in hints:
        for cell in row_cells:
            if 'l' in cell:
                print(ALPHABET[cell['l']], end=' ')
            else:
                print(' ', end=' ')
        print('')


def reset_hints(task):
    task['score'] = INITIAL_SCORE
    task['team_data']['hints'] = task['full_data']['initial_hints']


def fix_hints(hints):
    for row_cells in hints:
        for cell in row_cells:
            q = cell.get('q')
            if q == 'hint':
                return False
            if q == 'confirmed':
                cell['q'] = 'hint'
    return True


def fix_task(task):
    # Use a binary or to always check all three grids.
    return (fix_hints(task['full_data']['hints']) |
            fix_hints(task['full_data']['initial_hints']) |
            fix_hints(task['team_data']['hints']))


def canon_number(input):
    return re.sub('[^0-9]*', '', input)


def canon_address(input):
    # Map to ASCII, strip, uppercase.
    input = unidecode(input).strip().upper()
    # Remove all non-alphanum characters.
    input = re.sub('[^0-9A-Z]*', '', input)
    input = re.sub('W', 'V', input)
    input = re.sub('X', '', input)
    return input


def grade(task, data):

    base_score = task['score']

    # Scores above score_threshold are considered solutions.
    score_threshold = Decimal('10')

    in_n1 = canon_number(data.get('n1', ''))
    in_n2 = canon_number(data.get('n2', ''))
    in_ad = canon_address(data.get('a', ''))

    if len(in_ad) > 100 or len(in_n1) > 2 or len(in_n2) > 3:
        return None
    if len(in_ad) == 0 and len(in_n1) == 0 and len(in_n2) == 0:
        return None

    (ex_n1, ex_n2, ex_ad) = task['full_data']['answer_txt'].split('\n')
    ex_n1 = canon_number(ex_n1)
    ex_n2 = canon_number(ex_n2)
    ex_ad = canon_address(ex_ad)

    numbers_equal = Decimal(int(ex_n1 == in_n1 and ex_n2 == in_n2))
    address_ratio = Decimal(str(SequenceMatcher(None, ex_ad, in_ad).ratio()))
    address_errors = round((Decimal(len(ex_ad)) - address_ratio * Decimal(len(ex_ad))) * Decimal(2))

    score_factor = (numbers_equal * Decimal('0.5') +
                    Decimal(int(in_ad == ex_ad)) * Decimal('0.5'))
    score = Decimal(base_score) * score_factor
    is_solution = score > score_threshold
    is_full_solution = score_factor == Decimal('1')

    return {
        'input': {'n1': in_n1, 'n2': in_n2, 'ad': in_ad},
        'expected': {'n1': ex_n1, 'n2': ex_n2, 'ad': ex_ad},
        'hints': task['team_data']['hints'],
        'base_score': str(base_score),
        'actual_score': str(score),
        'is_solution': score >= score_threshold,
        'is_full_solution': is_full_solution,
        'numbers_equal': str(numbers_equal),
        'address_ratio': str(address_ratio),
        'address_errors': str(address_errors),
        'feedback': {
            'address': address_errors == Decimal(0),
            'numbers': numbers_equal == Decimal(1)
        }
    }


def test_grader():
    print(grade(
        {'full_data': {'answer.txt': "14\n449\n134 avenue de Wagram"},
         'team_data': {'score': 490}},
        {"n1": '14', "n2": '449', 'a': "134 avenue de Vagram"}))


if __name__ == '__main__':
    task = get_task('/home/sebc/alkindi/tasks/playfair/INDEX')
    print('fixed? {}'.format(fix_task(task)))
    print('fixed again? {}'.format(fix_task(task)))
    print_hints(task['team_data']['hints'])
    print("Initial score={}\n".format(task['score']))

    print("Getting a grid hint:")
    get_hint(task, {'type': 'grid', 'row': 0, 'col': 0})
    print_hints(task['team_data']['hints'])
    print("New score={}\n".format(task['score']))

    print("Getting an alphabet hint:")
    get_hint(task, {'type': 'alphabet', 'rank': 4})
    print_hints(task['team_data']['hints'])
    print("New score={}\n".format(task['score']))
*/
