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
    this.access_key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoidVVkY0E3eVhnNTBTRUcwMlFrbWc6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU1MzI5NjA3LCJleHAiOjE2NTU0MTYwMDd9.D3B9_gyXvAntzIheFOmblSg1o8FIF3SvSc3fzD49ngM`;

    const inputFieldsResult = await axios.post(
      `http://localhost:2111/api/zero-code/raw-query?access_token=${this.access_key}`,
      {
        dbQuery: `SELECT 
        field.id, field.entityId, field.name, field_input_visual_configuration.label, field_input_visual_configuration.disabled, 
        field_input_visual_configuration.visible, field_input_visual_configuration.tooltip, input_type.typeName, field.dataOriginId,
        field_input_visual_configuration.validatorsConfiguration as rules, field_input_visual_configuration.usePossibleValuesFromDatabase as useDatabase,
        field_input_visual_configuration.id as fieldInputVisualConfigurationId
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

    for (const input of this.inputFields) {
      if (!input.useDatabase && input.typeName === 'select') {
        const possibleValues = await axios.post(
          `http://localhost:2111/api/possible_value/query?access_token=${this.access_key}&pagination=false`,
          {
            filters: [
              {
                column: 'fieldInputVisualConfigurationId',
                value: input.fieldInputVisualConfigurationId,
                operation: '=',
                negate: false,
              },
            ],
          },
        );
        input['possibleData'] = possibleValues.data.content.map((pd) => {
          return { value: pd.value, displayValue: pd.displayValue };
        });
      } else if (input.useDatabase && input.typeName === 'select') {
        const dataBaseForeignRelationResult = await axios.post(
          `http://localhost:2111/api/zero-code/raw-query?access_token=${this.access_key}`,
          {
            dbQuery: `SELECT 
            foreign_relation.foreignTableName, 
            foreign_relation.foreignPrimaryKey, 
            foreign_relation.foreignFieldToShow 
            FROM data_base_origin
            JOIN foreign_relation
            ON data_base_origin.foreignRelationId = foreign_relation.id
            WHERE data_base_origin.dataOriginId = ${input.dataOriginId};`,
          },
        );

        const dataBaseForeignRelation =
          dataBaseForeignRelationResult.data.content[0][0];

        const possibleValuesFromDataBase = await axios.post(
          `http://localhost:2111/api/${dataBaseForeignRelation.foreignTableName}/query?access_token=${this.access_key}&pagination=false`,
          {},
        );

        input['possibleData'] = possibleValuesFromDataBase.data.content.map(
          (pd) => {
            return {
              value: pd[dataBaseForeignRelation.foreignPrimaryKey],
              displayValue: pd[dataBaseForeignRelation.foreignFieldToShow],
            };
          },
        );
      }
    }
  }

  async onRender() {
    return generateHTML(createNewEntityTemplate, {
      inputFields: this.inputFields,
      entity: this.entity,
    });
  }

  async manageSubmit(inputs) {
    $('#s-btn').prop('disabled', true);
    const dataToSend = {};
    for (const inputName in inputs) {
      const input = inputs[inputName];
      dataToSend[inputName] = input.val();
    }

    this.notifier.asyncBlock(
      axios.post(
        `http://localhost:2111/api/${this.entity.name}?access_token=${this.access_key}`,
        {
          inserts: [
            {
              ...dataToSend,
            },
          ],
        },
      ),
      () => {
        $('form')[0].reset();
        $('#s-btn').removeAttr('disabled');
        this.notifier.success(`${this.entity.name} added!!`);
      },
      (error) => {
        $('form')[0].reset();
        $('#s-btn').removeAttr('disabled');
        if (error.response) {
          const responseData = error.response.data;
          this.notifier.alert(
            `${responseData.code} - ${responseData.message} - Error Report Code: ${responseData.errorUUID}`,
          );
        } else {
          this.notifier.alert(error.message);
        }
      },
    );
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
  }

  async onDestroy() {}
}

export default CreateNewEntityComponent;
