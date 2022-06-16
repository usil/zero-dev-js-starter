import axios from 'axios';
import titleTemplate from './title.component.html';
import { generateHTML } from '../../helpers/helpers';

class TitleComponent {
  constructor() {
    this.appName = '';
  }

  async onInit() {
    const access_key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoidVVkY0E3eVhnNTBTRUcwMlFrbWc6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU1MzI5NjA3LCJleHAiOjE2NTU0MTYwMDd9.D3B9_gyXvAntzIheFOmblSg1o8FIF3SvSc3fzD49ngM`;

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
