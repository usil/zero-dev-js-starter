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
    const applicationId = window.variables.applicationId;
    const access_key =
      window.variables.extraSettings.signedUserDetails.accessToken;

    const businessUnits =
      window.variables.extraSettings.signedUserDetails.businessUnits;

    const radBusinessUnite = businessUnits.find(
      (bu) => bu.identifier === 'radUnit',
    );

    console.log(radBusinessUnite);

    const radProfile = radBusinessUnite.profiles.find(
      (rbu) => rbu.identifier === 'radProfile',
    );

    const rolesWebOptions = [];

    for (const role of radProfile.roles) {
      for (const option of role.options) {
        if (option.type === 'WEB_OPTION') {
          rolesWebOptions.push({
            column: 'name',
            value: option.value,
            operation: '=',
            negate: false,
            operator: 'or',
          });
        }
      }
    }

    const entitiesResult = await axios.post(
      `http://localhost:2111/api/entity/query?access_token=${access_key}`,
      {
        filters: [
          ...rolesWebOptions,
          {
            column: 'applicationId',
            value: applicationId,
            operation: '=',
            negate: false,
            operator: 'and',
          },
        ],
      },
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
