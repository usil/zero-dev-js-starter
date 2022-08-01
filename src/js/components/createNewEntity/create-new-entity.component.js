import createNewEntityTemplate from './create-new-entity.component.html';
import parseDefaultString from '../../helpers/parseDefaultString';
import { generateHTML } from '../../helpers/helpers';
import axios from 'axios';
import $ from 'jquery';
import AWN from 'awesome-notifications';
import 'jquery-validation';
import AirDatepicker from 'air-datepicker';
import es from 'air-datepicker/locale/es';
import 'air-datepicker/air-datepicker.css';
import moment from 'moment-timezone';
class CreateNewEntityComponent {
  constructor(variables) {
    this.notifier = new AWN({ icons: { enabled: false } });
    this.currentDraw = 0;
    this.entity = variables.entity;
  }

  async onInit() {
    this.zeroCodeBaseApi = window.variables.zeroCodeBaseApi;

    const signedUserDetails = window.variables.extraSettings.signedUserDetails;

    this.access_key = signedUserDetails.accessToken;

    const businessUnits = signedUserDetails.businessUnits;

    const radBusinessUnite = businessUnits.find(
      (bu) => bu.identifier === 'radUnit',
    );

    const radProfile = radBusinessUnite.profiles.find(
      (rbu) => rbu.identifier === 'radProfile',
    );

    const fieldCrudConfig = [];

    for (const role of radProfile.roles) {
      for (const option of role.options) {
        if (option.type === 'INTERNAL_RULE') {
          const optionValueArray = option.value.split('::');
          if (
            optionValueArray.length === 3 &&
            optionValueArray[0] === this.entity.name
          ) {
            fieldCrudConfig.push({
              field: optionValueArray[1],
              crudValue: optionValueArray[2],
            });
          }
        }
      }
    }

    const fields = await axios.post(
      `${this.zeroCodeBaseApi}/api/field/query?access_token=${this.access_key}&pagination=false`,
      {
        filters: [
          {
            column: 'entityId',
            value: this.entity.id,
            operation: '=',
            negate: false,
          },
        ],
      },
    );

    const preFields = fields.data.content;

    this.fields = [];

    for (const preField of preFields) {
      const indexOfField = fieldCrudConfig.findIndex(
        (fc) => fc.field === preField.name,
      );
      if (
        (indexOfField > -1 &&
          fieldCrudConfig[indexOfField].crudValue.includes('C')) ||
        indexOfField === -1
      ) {
        const fullFieldQuery = await axios.post(
          `${this.zeroCodeBaseApi}/api/field_visual_configuration/query?access_token=${this.access_key}&pagination=false`,
          {
            filters: [
              {
                column: 'fieldId',
                value: preField.id,
                operation: '=',
                negate: false,
              },
            ],
          },
        );

        const fieldViewConfiguration = fullFieldQuery.data.content[0];

        this.fields.push({
          ...preField,
          fieldViewConfiguration,
        });
      }
    }

    this.inputFields = this.fields.filter(
      (inputField) => inputField.fieldViewConfiguration.onCreate,
    );

    for (const input of this.inputFields) {
      if (
        !input.fieldViewConfiguration.usePossibleValuesFromDatabase &&
        input.fieldViewConfiguration.type === 'select'
      ) {
        const possibleValues = await axios.post(
          `${this.zeroCodeBaseApi}/api/possible_value/query?access_token=${this.access_key}&pagination=false`,
          {
            filters: [
              {
                column: 'fieldInputlConfigurationId',
                value: input.fieldViewConfiguration.id,
                operation: '=',
                negate: false,
              },
            ],
          },
        );
        input['possibleData'] = possibleValues.data.content.map((pd) => {
          return { value: pd.value, displayValue: pd.displayValue };
        });
      } else if (
        input.fieldViewConfiguration.usePossibleValuesFromDatabase &&
        input.fieldViewConfiguration.type === 'select'
      ) {
        const dataBaseForeignRelationResult = await axios.post(
          `${this.zeroCodeBaseApi}/api/zero-code/raw-query?access_token=${this.access_key}`,
          {
            dbQuery: `SELECT 
            foreign_relation.foreignTableName, 
            foreign_relation.foreignPrimaryKey, 
            foreign_relation.foreignFieldToShow 
            FROM data_base_origin
            JOIN foreign_relation
            ON data_base_origin.foreignRelationId = foreign_relation.id
            WHERE data_base_origin.id = ${input.dataBaseOriginId};`,
          },
        );

        const dataBaseForeignRelation =
          dataBaseForeignRelationResult.data.content[0][0];

        const possibleValuesFromDataBase = await axios.post(
          `${this.zeroCodeBaseApi}/api/${dataBaseForeignRelation.foreignTableName}/query?access_token=${this.access_key}&pagination=false`,
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

    console.log(this.inputFields);
  }

  async onRender() {
    return generateHTML(createNewEntityTemplate, {
      inputFields: this.inputFields,
      entity: this.entity,
      parseDefaultString,
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
        `${this.zeroCodeBaseApi}/api/${this.entity.name}?access_token=${this.access_key}`,
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
      if (inputField.fieldViewConfiguration.type === 'datepicker') {
        const advancedSettings = {
          ...(inputField.fieldViewConfiguration.advancedConfiguration
            ? JSON.parse(
                inputField.fieldViewConfiguration.advancedConfiguration || '{}',
              ) || {}
            : {}),
        };

        if (
          (advancedSettings.datePickerConfig &&
            advancedSettings.datePickerConfig.view !== 'months') ||
          advancedSettings === {} ||
          advancedSettings.datePickerConfig === undefined
        ) {
          new AirDatepicker(`#inp-${inputField.name}`, {
            locale: es,
            ...(advancedSettings.datePickerConfig || {}),
            dateFormat: (date) => {
              const mDate = moment(date);
              mDate.tz(window.variables.timeZone);
              return mDate.format('Y-M-D');
            },
          });
        } else {
          new AirDatepicker(`#inp-${inputField.name}`, {
            locale: es,
            ...(advancedSettings.datePickerConfig || {}),
          });
        }
      }
      rules[inputField.name] =
        inputField.fieldViewConfiguration.validatorsConfiguration || {};
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
