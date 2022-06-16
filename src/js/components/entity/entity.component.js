import entityTemplate from './entity.component.html';
import { generateHTML, sendDefaultEvent } from '../../helpers/helpers';
import axios from 'axios';
import $ from 'jquery';

class EntityComponent {
  constructor(variables) {
    this.id = variables.id;
  }

  async onInit() {
    const access_key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoidVVkY0E3eVhnNTBTRUcwMlFrbWc6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU1MzI5NjA3LCJleHAiOjE2NTU0MTYwMDd9.D3B9_gyXvAntzIheFOmblSg1o8FIF3SvSc3fzD49ngM`;

    const entityResult = await axios.get(
      `http://localhost:2111/api/entity/${this.id}?access_token=${access_key}`,
    );

    this.entity = entityResult.data.content;
  }

  async onRender() {
    return generateHTML(entityTemplate, { id: this.id, entity: this.entity });
  }

  async afterRender() {
    $('#view-list').on('click', () => {
      sendDefaultEvent('entityDataList', 'entity-content', {
        entity: this.entity,
      });
    });

    $('#create-new-entity-btn').on('click', () => {
      sendDefaultEvent('createNewEntity', 'entity-content', {
        entity: this.entity,
      });
    });
  }

  async onDestroy() {}
}

export default EntityComponent;
