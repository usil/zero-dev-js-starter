import { compile, defaultConfig } from 'squirrelly';
import axios from 'axios';
import initialize from '../../modules/sidebar';
import entryTemplate from './entry.component.html';

class EntryComponent {
  constructor() {
    this.appName = '';
    this.entities = [];
  }

  async onInit() {
    const access_key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiUjlRa1YzS1ZJT0E1UHBvSDBLa0s6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU0NTQzNzc3LCJleHAiOjE2NTQ2MzAxNzd9.fNu97ehQiO4VE1UE817TZOa0yI5DNNn1e0gDqgbG7Ds`;

    const applicationResult = await axios.get(
      `http://localhost:2111/api/application/1?access_token=${access_key}`,
    );

    const entitiesResult = await axios.get(
      `http://localhost:2111/api/entity?access_token=${access_key}`,
    );

    this.appName = applicationResult.data.content.name;
    this.entities = entitiesResult.data.content.items;
  }

  async onRender() {
    const htmlTemplate = compile(entryTemplate);
    return htmlTemplate(
      { applicationName: this.appName, entities: this.entities },
      defaultConfig,
    );
  }

  async afterRender() {
    feather.replace();
    window.feather = feather;
    initialize();
  }
}

export default EntryComponent;
