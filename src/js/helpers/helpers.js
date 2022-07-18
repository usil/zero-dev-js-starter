import axios from 'axios';
import { compile, defaultConfig } from 'squirrelly';

export const generateHTML = (template, options) => {
  const htmlTemplate = compile(template);
  return htmlTemplate(options || {}, defaultConfig);
};

export const sendDefaultEvent = (componentName, renderOnId, variables = {}) => {
  const event = new CustomEvent('default', {
    detail: {
      componentName,
      renderOnId,
      variables: { ...variables, parentRenderId: renderOnId },
    },
  });

  document.dispatchEvent(event);
};

export const setVariableEnvironmentVariables = async () => {
  const result = await axios.get('/settings.json');
  window.variables = {
    ...result.data,
  };
};
