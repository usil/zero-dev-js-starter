import '../scss/app.scss';

// AdminKit (required)
import './modules/bootstrap';

import './modules/theme';
import './modules/feather';
import { setVariableEnvironmentVariables } from './helpers/helpers';

import componentOrchestration from './listeners/ComponentOrchestration';

document.addEventListener('DOMContentLoaded', async () => {
  await setVariableEnvironmentVariables();
  componentOrchestration.init();
  // const event = new CustomEvent('default', {
  //   detail: { componentName: 'entry', renderOnId: 'root' },
  // });
  const event = new CustomEvent('default', {
    detail: { componentName: 'login', renderOnId: 'root' },
  });
  document.dispatchEvent(event);
});
