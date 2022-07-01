import axios from 'axios';
import titleTemplate from './title.component.html';
import { generateHTML } from '../../helpers/helpers';

class TitleComponent {
  constructor() {
    this.appName = '';
  }

  async onInit() {
    const applicationId = window.variables.applicationId;

    const access_key =
      window.variables.extraSettings.signedUserDetails.accessToken;

    const applicationResult = await axios.get(
      `http://localhost:2111/api/application/${applicationId}?access_token=${access_key}`,
    );

    this.appName = applicationResult.data.content.name;
  }

  async onRender() {
    return generateHTML(titleTemplate, { applicationName: this.appName });
  }

  async afterRender() {}
}

export default TitleComponent;
