import '../scss/app.scss';

// AdminKit (required)
import './modules/bootstrap';
import './modules/sidebar';
import './modules/theme';
import './modules/feather';

// Charts
import './modules/chartjs';

// Forms
import './modules/flatpickr';

// Maps
import './modules/vector-maps';

import './modules/renderEntitiesList';

document.addEventListener('navigationEvent', () => {
  console.log('navigaton');
});

document.addEventListener('DOMContentLoaded', () => {
  window.onpopstate = (e) => {
    if (e.state) {
      document.getElementById('content').innerHTML = e.state.html;
      document.title = e.state.pageTitle;
    }
  };
  console.log(document.getElementById('sidebar-inner'));
});
