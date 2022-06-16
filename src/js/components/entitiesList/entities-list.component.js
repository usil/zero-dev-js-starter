import axios from 'axios';
import entitiesListTemplate from './entities-list.component.html';
import feather from 'feather-icons';
import { generateHTML, sendDefaultEvent } from '../../helpers/helpers';
import $ from 'jquery';

class EntitiesListComponent {
  constructor() {
    this.entities = [];
  }

  async onInit() {
    const access_key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoidVVkY0E3eVhnNTBTRUcwMlFrbWc6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU1MzI5NjA3LCJleHAiOjE2NTU0MTYwMDd9.D3B9_gyXvAntzIheFOmblSg1o8FIF3SvSc3fzD49ngM`;

    const entitiesResult = await axios.get(
      `http://localhost:2111/api/entity?access_token=${access_key}`,
    );

    this.entities = entitiesResult.data.content.items;
  }

  async onRender() {
    return generateHTML(entitiesListTemplate, { entities: this.entities });
  }

  async afterRender() {
    feather.replace();
    window.feather = feather;

    for (const entity of this.entities) {
      $(`#side-nav-${entity.id}`).on('click', () => {
        sendDefaultEvent('entity', 'main-container', { id: entity.id });
      });
    }
  }
}

export default EntitiesListComponent;
