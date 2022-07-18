import entityDataListTemplate from './entity-data-list.component.html';
import { generateHTML, sendDefaultEvent } from '../../helpers/helpers';
import parseDefaultString from '../../helpers/parseDefaultString';
import axios from 'axios';
import $ from 'jquery';
import 'pdfmake';
import pdfFontsfrom from 'pdfmake/build/vfs_fonts';
import 'datatables.net-bs5';
import 'datatables.net-buttons-bs5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons/js/buttons.colVis';
import jsZip from 'jszip';
import 'datatables.net-buttons/js/buttons.html5';
import AWN from 'awesome-notifications';
import 'material-icons/iconfont/material-icons.css';
class EntityDataListComponent {
  constructor(variables) {
    window.pdfMake.vfs = pdfFontsfrom.pdfMake.vfs;
    window.JSZip = jsZip;
    this.notifier = new AWN({ icons: { enabled: false } });
    this.currentDraw = 0;
    this.entity = variables.entity;
    this.entityCrudString = variables.entityCrudString;
  }

  async onInit() {
    this.zeroCodeBaseApi = window.variables.zeroCodeBaseApi;

    const signedUserDetails = window.variables.extraSettings.signedUserDetails;

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
          if (optionValueArray[0] === this.entity.name) {
            fieldCrudConfig.push({
              field: optionValueArray[1],
              crudValue: optionValueArray[2],
            });
          }
        }
      }
    }

    this.access_key = signedUserDetails.accessToken;

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
          fieldCrudConfig[indexOfField].crudValue.includes('R')) ||
        indexOfField === -1
      ) {
        const fullFieldQuery = await axios.post(
          `${this.zeroCodeBaseApi}/api/fields_list_configuration/query?access_token=${this.access_key}&pagination=false`,
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

        const fieldListConfiguration = fullFieldQuery.data.content[0];

        const fieldFilterConfiguration = await axios.post(
          `${this.zeroCodeBaseApi}/api/filter_configuration/query?access_token=${this.access_key}&pagination=false`,
          {
            filters: [
              {
                column: 'fieldsListConfigurationId',
                value: fieldListConfiguration.id,
                operation: '=',
                negate: false,
              },
            ],
          },
        );

        this.fields.push({
          ...preField,
          fieldListConfiguration: {
            ...fieldListConfiguration,
            filter: fieldFilterConfiguration.data.content[0] || null,
          },
        });
      }
    }

    const entityDataResult = await axios.get(
      `${this.zeroCodeBaseApi}/api/${this.entity.name}?access_token=${this.access_key}&orderByColumn=${this.fields[0].name}`,
    );

    this.entityData = entityDataResult.data.content;
  }

  async onRender() {
    return generateHTML(entityDataListTemplate, {
      entityData: this.entityData,
      fields: this.fields,
      entityCrudString: this.entityCrudString,
    });
  }

  parsePageIndex = (start, length) => {
    if (start === length) return 1;
    if (start > length) {
      return start / length;
    }
    return 0;
  };

  onOkDelete = (identifier, row) => {
    this.notifier.asyncBlock(
      axios.delete(
        `${this.zeroCodeBaseApi}/api/${this.entity.name}/${identifier}?access_token=${this.access_key}&identifierColumn=${this.fields[0].name}`,
      ),
      () => {
        this.notifier.success(`${this.entity.name} deleted`);
        row.remove();
        this.table.draw();
      },
      (error) => {
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
  };

  processDelete(data, row) {
    this.notifier.confirm(
      `Do you want to delete the ${this.entity.name} with identifier ${data}?`,
      () => this.onOkDelete(data, row),
      null,
      {
        labels: {
          confirm: 'Delete notification',
        },
      },
    );
  }

  async afterRender() {
    this.url = `${this.zeroCodeBaseApi}/api/${this.entity.name}/query?access_token=${this.access_key}`;

    const actionColumns = [];

    if (this.entityCrudString.includes('U')) {
      actionColumns.push({
        data: null,
        className: 'dt-center editor-edit',
        orderable: false,
        defaultContent: `<span class="material-icons">edit</span>`,
      });
    }

    if (this.entityCrudString.includes('D')) {
      actionColumns.push({
        data: null,
        className: 'dt-center editor-delete',
        orderable: false,
        defaultContent: `<span class="material-icons">delete</span>`,
      });
    }

    this.table = $('#entity-data-table').DataTable({
      dom: 'Blfrtip',
      buttons: [
        {
          extend: 'print',
          exportOptions: {
            columns: ':visible',
          },
        },
        {
          extend: 'pdfHtml5',
          download: 'open',
          orientation: 'landscape',
          exportOptions: {
            columns: ':visible',
          },
        },
        {
          extend: 'excelHtml5',
          exportOptions: {
            columns: ':visible',
          },
        },
        'colvis',
      ],
      ordering: false,
      info: false,
      searching: true,
      processing: true,
      serverSide: true,
      retrieve: true,
      lengthMenu: [
        [5, 10, 25, 50, -1],
        [5, 10, 25, 50, 'All'],
      ],
      initComplete: function () {
        const that = this;

        const eventHandler = (ev) => {
          if (ev.key === 'Enter' || ev.type === 'change') {
            $('.search-inputs').each((i, searchInput) => {
              const parent = $(searchInput);
              const inputs = parent.children();
              const searchObject = {
                operation: inputs[1].value,
                value: inputs[0].value,
              };
              const columnIndex = parseInt(parent.attr('dtc'));
              that
                .api()
                .columns(columnIndex)
                .search(
                  inputs[0].value === '' ? '' : JSON.stringify(searchObject),
                );
            });

            that.api().draw();
          }
        };

        $('.search-inputs input').on('keydown', eventHandler);

        $('.search-inputs select').on('change', eventHandler);
      },
      ajax: {
        url: this.url,
        type: 'POST',
        dataSrc: 'content.items',
        data: (d) => {
          this.currentDraw = d.draw;
          const fieldToFind = this.fields.map((f) => f.name);
          let filters = [];

          if (this.currentDraw === 1) {
            for (const field of this.fields) {
              const filter = field.fieldListConfiguration.filter;
              if (filter) {
                filters.push({
                  column: field.name,
                  value: filter.defaultValue,
                  operation:
                    filter.operations === 'all'
                      ? '='
                      : filter.operations.split('::')[0],
                  negate: false,
                  operator: 'and',
                });
              }
            }
          } else {
            for (const column of d.columns) {
              if (column.search.value !== '') {
                const search = JSON.parse(column.search.value);
                filters.push({
                  column: column.data,
                  value: search.value,
                  operation: search.operation,
                  negate: false,
                  operator: 'and',
                });
              }
            }
          }

          return {
            pagination: {
              pagination: true,
              itemsPerPage: d.length,
              pageIndex: this.parsePageIndex(d.start, d.length),
            },
            fields: fieldToFind,
            filters,
          };
        },
        dataFilter: (data) => {
          const json = JSON.parse(data);
          json.recordsTotal = json.content.totalItems;
          json.recordsFiltered = json.content.totalItems;
          json.draw = this.currentDraw;
          return JSON.stringify(json);
        },
      },
      columns: [
        ...this.fields.map((f) => {
          console.log(f);
          return {
            data: f.name,
          };
        }),
        ...actionColumns,
      ],
    });

    $('#entity-data-table tbody').on('click', '.editor-delete span', (e) => {
      const row = $(e.target).closest('tr');
      const data = this.table.row(row).data()[this.fields[0].name];
      this.processDelete(data, row);
    });

    $('#entity-data-table tbody').on('click', '.editor-edit span', (e) => {
      const row = $(e.target).closest('tr');
      const data = this.table.row(row).data()[this.fields[0].name];
      sendDefaultEvent('editEntity', 'entity-content', {
        entity: this.entity,
        identifier: data,
        columnIdentifier: this.fields[0].name,
      });
    });

    const searchOperations = ['=', '>', '<', 'like'];

    $('#entity-data-table thead tr:eq(0) th').each((i, h) => {
      const filterData = this.fields[i].fieldListConfiguration.filter;

      const title = $(h).text();
      $(h).html(
        `<div class="search-inputs" dtc="${i}">` +
          `<input value="${
            filterData ? parseDefaultString(filterData.defaultValue || '') : ''
          }" ${
            filterData && (!filterData.editable || filterData.disabled)
              ? 'disabled'
              : ''
          } class="form-control" type="text" placeholder="Search ` +
          title +
          '" />' +
          `<select ${
            filterData && (!filterData.editable || filterData.disabled)
              ? 'disabled'
              : ''
          } class="form-control"placeholder="Filter">
            ${
              filterData === null || filterData.operations === 'all'
                ? searchOperations.map(
                    (so) => `<option value="${so}">${so}</option>`,
                  )
                : filterData.operations
                    .split('::')
                    .map((so) => `<option value="${so}">${so}</option>`)
            }
           
          </select>` +
          '</div>',
      );
    });
  }

  async onDestroy() {}
}

export default EntityDataListComponent;
