import { compile, defaultConfig } from 'squirrelly';

export const generateHTML = (template, options) => {
  const htmlTemplate = compile(template);
  return htmlTemplate(options || {}, defaultConfig);
};
