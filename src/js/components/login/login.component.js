import entryTemplate from './login.component.html';
import { generateHTML } from '../../helpers/helpers';
import $ from 'jquery';

class LoginComponent {
  constructor() {}

  async onInit() {}

  async onRender() {
    return generateHTML(entryTemplate);
  }

  async afterRender() {
    $('#login-btn').on('click', () => {
      window.location.href = window.location + 'oauth2/login';
    });
  }
}

export default LoginComponent;
