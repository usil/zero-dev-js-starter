import '../scss/app.scss';

// AdminKit (required)
import './modules/bootstrap';
import './modules/theme';
import './modules/feather';

import componentOrchestration from './listeners/ComponentOrchestration';

document.addEventListener('DOMContentLoaded', () => {
  componentOrchestration.init();
  const event = new CustomEvent('default', {
    detail: { componentName: 'entry', renderOnId: 'root' },
  });
  document.dispatchEvent(event);
});
