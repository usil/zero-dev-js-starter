import initialize from '../../modules/sidebar';
import entryTemplate from './entry.component.html';
import { generateHTML, sendDefaultEvent } from '../../helpers/helpers';

class EntryComponent {
  constructor() {}

  async onInit() {}

  async onRender() {
    return generateHTML(entryTemplate);
  }

  async afterRender() {
    initialize();
    sendDefaultEvent('entitiesList', 'entities-list');
    sendDefaultEvent('title', 'title-name');
  }
}

export default EntryComponent;
