import initialize from '../../modules/sidebar';
import entryTemplate from './entry.component.html';
import { generateHTML, sendDefaultEvent } from '../../helpers/helpers';
import axios from 'axios';

class EntryComponent {
  constructor() {
    this.nowTime = 0;
  }

  async onInit() {}

  async onRender() {
    return generateHTML(entryTemplate);
  }

  async afterRender() {
    initialize();
    sendDefaultEvent('entitiesList', 'entities-list');
    sendDefaultEvent('title', 'title-name');
    document.addEventListener('click', async () => {
      const newNowTime = Date.now();
      if (this.nowTime === 0 || newNowTime > this.nowTime + 5000) {
        await axios.get('/oauth2/ping');
      }
      this.nowTime = Date.now();
    });
  }

  async onDestroy() {
    document.removeEventListener('click');
  }
}

export default EntryComponent;
