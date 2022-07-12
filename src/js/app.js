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
  console.log(window.variables.extraSettings);

  let event;

  if (
    window.variables.extraSettings &&
    window.variables.extraSettings.signedUserDetails
  ) {
    event = new CustomEvent('default', {
      detail: { componentName: 'entry', renderOnId: 'root' },
    });
  } else {
    event = new CustomEvent('default', {
      detail: { componentName: 'login', renderOnId: 'root' },
    });
  }

  document.dispatchEvent(event);
});
