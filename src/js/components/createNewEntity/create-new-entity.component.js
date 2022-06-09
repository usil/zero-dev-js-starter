import createNewEntityTemplate from './create-new-entity.component.html';
import { generateHTML } from '../../helpers/helpers';
import axios from 'axios';
import $ from 'jquery';
import AWN from 'awesome-notifications';
import 'jquery-validation';

class CreateNewEntityComponent {
  constructor(variables) {
    this.notifier = new AWN({ icons: { enabled: false } });
    this.currentDraw = 0;
    this.entity = variables.entity;
  }

  async onInit() {
    this.access_key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoidVVkY0E3eVhnNTBTRUcwMlFrbWc6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU0NzMyNTEwLCJleHAiOjE2NTQ4MTg5MTB9.ZYfpX-0wExAcXDqPwHF0xSzjotYn0ysPn7AT2L4BM_A`;

    const inputFieldsResult = await axios.post(
      `http://localhost:2111/api/zero-code/raw-query?access_token=${this.access_key}&pagination=false`,
      {
        dbQuery: `SELECT 
        field.id, field.entityId, field.name, field_input_visual_configuration.label, field_input_visual_configuration.disabled, 
        field_input_visual_configuration.visible, field_input_visual_configuration.tooltip, input_type.typeName, field_input_visual_configuration.validatorsConfiguration as rules
        FROM field
        JOIN field_input_visual_configuration
        ON field_input_visual_configuration.fieldId = field.id
        JOIN input_type
        ON field_input_visual_configuration.inputTypeId = input_type.id
        WHERE field.entityId = ${this.entity.id};`,
      },
    );

    this.inputFields = inputFieldsResult.data.content[0].filter(
      (inputField) => inputField.visible,
    );
  }

  async onRender() {
    return generateHTML(createNewEntityTemplate, {
      inputFields: this.inputFields,
      entity: this.entity,
    });
  }

  async manageSubmit(inputs) {
    try {
      $('#s-btn').prop('disabled', true);
      const dataToSend = {};
      for (const inputName in inputs) {
        const input = inputs[inputName];
        dataToSend[inputName] = input.val();
      }
      console.log(dataToSend);
      const result = await axios.post(
        `http://localhost:2111/api/${this.entity.name}?access_token=${this.access_key}`,
        {
          inserts: [
            {
              ...dataToSend,
            },
          ],
        },
      );
      if (result.data.content && result.data.content.length === 1) {
        this.notifier.success(`${this.entity.name} added!!`);
      } else {
        this.notifier.alert(
          `Unknown error, could not add the ${this.entity.name}`,
        );
      }
      $('#s-btn').removeAttr('disabled');
    } catch (error) {
      $('#s-btn').removeAttr('disabled');
      if (error.response) {
        const responseData = error.response.data;
        this.notifier.alert(
          `${responseData.code} - ${responseData.message} - Error Report Code: ${responseData.errorUUID}`,
        );
      } else {
        this.notifier.alert(error.message);
      }
    }
  }

  async afterRender() {
    const inputs = {};
    const rules = {};

    this.inputFields.map((inputField) => {
      rules[inputField.name] = inputField.rules || {};
      inputs[inputField.name] = $(`#inp-${inputField.name}`);
    });

    const form = $('form');

    form.validate({
      submitHandler: () => {
        this.manageSubmit(inputs);
      },
      rules,
    });

    // form.on('submit', (e) => this.manageSubmit(e, inputs));
  }

  async onDestroy() {}
}

export default CreateNewEntityComponent;
