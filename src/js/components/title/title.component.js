import axios from 'axios';
import titleTemplate from './title.component.html';
import { generateHTML } from '../../helpers/helpers';

class TitleComponent {
  constructor() {
    this.appName = '';
  }

  async onInit() {
    try {
      this.zeroCodeBaseApi = window.variables.zeroCodeBaseApi;

      const applicationId = window.variables.applicationId;

      const access_key =
        window.variables.extraSettings.signedUserDetails.accessToken;

      const applicationResult = await axios.get(
        `${this.zeroCodeBaseApi}/api/application/${applicationId}?access_token=${access_key}`,
      );

      this.appName = applicationResult.data.content.name;
    } catch (error) {
      if (error.response && error.response.message === 'jwt expired') {
        axios.post('/oauth2/token/refresh').then((res) => {
          console.log(res);
        });
      }
    }
  }

  async onRender() {
    return generateHTML(titleTemplate, { applicationName: this.appName });
  }

  async afterRender() {}
}

export default TitleComponent;
