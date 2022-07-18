import jp from 'jsonpath';
import cryptoRandomString from 'crypto-random-string';

const parseDefaultString = (defaultString = '') => {
  const startOccurrence = defaultString.indexOf('{{');

  if (startOccurrence === -1) {
    return defaultString;
  }

  const finishOccurrence = defaultString.indexOf('}}', startOccurrence + 2);

  if (finishOccurrence === -1 || finishOccurrence - startOccurrence === 1) {
    return defaultString;
  }

  const exp = defaultString.substring(startOccurrence + 2, finishOccurrence);

  let parsedString = '';

  if (exp === 'randstring') {
    parsedString = cryptoRandomString({ length: 10 });
  } else if (exp.startsWith('$.')) {
    const variables = window.variables;
    const jpQueryResult = jp.query(variables, exp)[0];
    if (typeof jpQueryResult !== 'string') {
      parsedString = JSON.stringify(jpQueryResult, null, 3);
    } else {
      parsedString = jpQueryResult;
    }
  }

  const newValue = defaultString.replace(`{{${exp}}}`, parsedString);

  return parseDefaultString(newValue);
};

export default parseDefaultString;
