import entityTemplate from './entity.component.html';
import { generateHTML, sendDefaultEvent } from '../../helpers/helpers';
import axios from 'axios';
import $ from 'jquery';

class EntityComponent {
  constructor(variables) {
    this.id = variables.id;
    this.entityCrudString = '';
  }

  async onInit() {
    this.zeroCodeBaseApi = window.variables.zeroCodeBaseApi;

    const access_key =
      window.variables.extraSettings.signedUserDetails.accessToken;

    const signedUserDetails = window.variables.extraSettings.signedUserDetails;

    this.access_key = signedUserDetails.accessToken;

    const businessUnits = signedUserDetails.businessUnits;

    const radBusinessUnite = businessUnits.find(
      (bu) => bu.identifier === 'radUnit',
    );

    const radProfile = radBusinessUnite.profiles.find(
      (rbu) => rbu.identifier === 'radProfile',
    );

    const entityResult = await axios.get(
      `${this.zeroCodeBaseApi}/api/entity/${this.id}?access_token=${access_key}`,
    );

    this.entity = entityResult.data.content;

    for (const role of radProfile.roles) {
      for (const option of role.options) {
        if (option.type === 'INTERNAL_RULE') {
          const optionValueArray = option.value.split('::');
          if (
            optionValueArray.length === 2 &&
            optionValueArray[0] === this.entity.name &&
            this.entityCrudString.length < optionValueArray[1].length
          ) {
            this.entityCrudString = optionValueArray[1];
          }
        }
      }
    }
  }

  async onRender() {
    return generateHTML(entityTemplate, {
      id: this.id,
      entity: this.entity,
      entityCrudString: this.entityCrudString,
    });
  }

  async afterRender() {
    if (this.entityCrudString.includes('R')) {
      $('#view-list').on('click', () => {
        sendDefaultEvent('entityDataList', 'entity-content', {
          entity: this.entity,
          entityCrudString: this.entityCrudString,
        });
      });
    }

    if (this.entityCrudString.includes('C')) {
      $('#create-new-entity-btn').on('click', () => {
        sendDefaultEvent('createNewEntity', 'entity-content', {
          entity: this.entity,
          entityCrudString: this.entityCrudString,
        });
      });
    }
  }

  async onDestroy() {}
}

export default EntityComponent;
