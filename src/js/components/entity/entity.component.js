import entityTemplate from './entity.component.html';
import { generateHTML, sendDefaultEvent } from '../../helpers/helpers';
import axios from 'axios';
import $ from 'jquery';

class EntityComponent {
  constructor(variables) {
    this.id = variables.id;
  }

  async onInit() {
    const access_key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoidVVkY0E3eVhnNTBTRUcwMlFrbWc6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU0ODczNTkzLCJleHAiOjE2NTQ5NTk5OTN9.2WysKWyaOmgcxveWgvbDgxF0zY3H5eo0ptuyGQdf6KI`;

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
