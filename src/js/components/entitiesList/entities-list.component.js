import axios from 'axios';
import entitiesListTemplate from './entities-list.component.html';
import feather from 'feather-icons';
import { generateHTML } from '../../helpers/helpers';

class EntitiesListComponent {
  constructor() {
    this.entities = [];
  }

  async onInit() {
    const access_key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiUjlRa1YzS1ZJT0E1UHBvSDBLa0s6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU0NTQzNzc3LCJleHAiOjE2NTQ2MzAxNzd9.fNu97ehQiO4VE1UE817TZOa0yI5DNNn1e0gDqgbG7Ds`;

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
  }
}

export default EntitiesListComponent;
