import createNewEntityTemplate from './create-new-entity.component.html';
import { generateHTML } from '../../helpers/helpers';
import axios from 'axios';
import $ from 'jquery';

class CreateNewEntityComponent {
  constructor(variables) {
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
        field_input_visual_configuration.visible, field_input_visual_configuration.tooltip, input_type.typeName
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

    console.log(this.inputFields);
  }

  async onRender() {
    return generateHTML(createNewEntityTemplate, {
      inputFields: this.inputFields,
    });
  }

  async afterRender() {
    const inputs = this.inputFields;
    $('form').on('submit', (e) => {
      console.log(e);
      e.preventDefault();
    });
  }

  async onDestroy() {}
}

export default CreateNewEntityComponent;
