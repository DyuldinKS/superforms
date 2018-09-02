import assert from 'assert';
import Form from 'Server/models/Form';

describe('Form model', () => {
  describe('checkAnswers()', () => {
    const items = {
      'string types': {
        itemType: 'delimeter',
      },
      string: {
        type: 'text',
        itemType: 'input',
        required: true,
      },
      paragraph: {
        type: 'text',
        itemType: 'input',
        required: true,
        multiline: true,
      },
      'number types': {
        itemType: 'delimeter',
      },
      int: {
        type: 'number',
        integer: true,
        itemType: 'input',
        required: true,
      },
      float: {
        type: 'number',
        itemType: 'input',
        required: true,
      },
      'select types': {
        itemType: 'delimeter',
      },
      simpleSelect: {
        type: 'select',
        options: ['opt1', 'opt2', 'opt3'],
        itemType: 'input',
        multiple: false,
        optionOther: true,
      },
      multiSelect: {
        type: 'select',
        options: ['opt1', 'opt2', 'opt3', 'opt4'],
        itemType: 'input',
        multiple: true,
        selectmax: '',
        optionOther: true,
      },
      'datetime types': {
        itemType: 'delimeter',
      },
      date: {
        type: 'date',
        itemType: 'input',
        required: true,
      },
      time: {
        type: 'time',
        itemType: 'input',
        required: true,
      },
    };

    const order = [
      'string types',
      'string',
      'paragraph',
      'number types',
      'int',
      'float',
      'select types',
      'simpleSelect',
      'multiSelect',
      'datetime types',
      'date',
      'time',
    ];
    const questions = order.filter(id => items[id].itemType === 'input');

    const form = new Form({
      id: 117,
      title: 'all types',
      scheme: { items, order },
    });

    const CORRECT = {
      string: 'hello',
      paragraph: 'long long text ...',
      int: 328,
      float: 23.324,
      simpleSelect: { 0: true },
      multiSelect: { 1: true, 3: true },
      date: '2016-07-17',
      time: '15:23:11',
    };

    it('should NOT return error', () => {
      assert.doesNotThrow(() => form.checkAnswers(CORRECT));
    });

    const textTest = {
      // #1 string
      good: ['-82', '0', 'it works!', 'abcd'.repeat(499)],
      bad: ['', null, NaN, undefined, {}, Array, 'abcd'.repeat(500)],
    };

    const intTest = {
      good: [-82, 0, 2131, 2918328193801928309182093],
      bad: [123.38, -Infinity, '', null, NaN, undefined, {}, Array, '12.382'],
    };

    const floatTest = {
      good: [-82, 123.38, 0, 2131, 2918328193801928309182093, -0.00001],
      bad: [-Infinity, '', null, NaN, undefined, {}, Array, '12.382'],
    };

    const selectTest = {
      good: [{ 0: true }, { 1: true }, { 2: true }, { other: 'my option' }],
      bad: [
        {},
        { 0: false },
        { 1: 0 },
        { 1: 1 },
        { 2: 'foo' },
        { 4: true }, // out of range
        { 7: true },
      ],
    };

    const simpleSelectTest = {
      ...selectTest,
      bad: [
        ...selectTest.bad,
        { 0: true, 1: true },
        { 1: true, other: 'hello' },
      ],
    };

    const multiSelectTest = {
      ...selectTest,
      good: [
        ...selectTest.good,
        { 0: true, 1: true },
        { 1: true, other: 'hello' },
        { 0: true, 1: true, 2: true, other: 'hello' },
      ],
    };

    const dateTest = {
      good: ['2012-08-16', '2018-12-31', '2018-01-01'],
      bad: ['1823-1-13', '12-12-12', 132, '2012.01.12', '12-01-2012', '1917-30-02',
        -Infinity, '', null, NaN, undefined, {}, Function, 12.382],
    };

    const timeTest = {
      good: ['11:37', '07:45:55', '7:3:9', '13'],
      bad: ['08:87', '25:34', 13, -Infinity, '', null, NaN, undefined, {}, Function, 12.382],
    };

    const testsByQuestionId = {
      string: textTest,
      paragraph: textTest,
      int: intTest,
      float: floatTest,
      simpleSelect: simpleSelectTest,
      multiSelect: multiSelectTest,
      date: dateTest,
      time: timeTest,
    };

    questions.forEach((id, i) => {
      const index = i + 1;
      const tests = testsByQuestionId[id];
      const qstn = items[id];
      const opts = ['multiline', 'integer', 'multiple', 'optionOther'].filter(
        key => qstn[key],
      );

      describe(`${qstn.type} [${opts}] question #${index}`, () => {
        it('should NOT throw error on good answers', () => {
          const answers = { ...CORRECT };
          tests.good.forEach(val => {
            answers[id] = val;
            assert.doesNotThrow(() => form.checkAnswers(answers));
          });
        });

        it('should throw error on bad answers', () => {
          const answers = { ...CORRECT };
          tests.bad.forEach(val => {
            answers[id] = val;
            assert.throws(
              () => form.checkAnswers(answers),
              // `Invalid answer to ${items[id].type} question #${index}`
            );
          });
        });
      });
    });
  });
});
