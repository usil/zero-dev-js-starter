import axios from 'axios';
import titleTemplate from './title.component.html';
import { generateHTML } from '../../helpers/helpers';

class TitleComponent {
  constructor() {
    this.appName = '';
  }

  async onInit() {
    const access_key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoidVVkY0E3eVhnNTBTRUcwMlFrbWc6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU0NzMyNTEwLCJleHAiOjE2NTQ4MTg5MTB9.ZYfpX-0wExAcXDqPwHF0xSzjotYn0ysPn7AT2L4BM_A`;

    const applicationResult = await axios.get(
      `http://localhost:2111/api/application/1?access_token=${access_key}`,
    );

    this.appName = applicationResult.data.content.name;
  }

  async onRender() {
    return generateHTML(titleTemplate, { applicationName: this.appName });
  }

  async afterRender() {}
}

export default TitleComponent;
