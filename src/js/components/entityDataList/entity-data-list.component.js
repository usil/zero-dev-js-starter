import entityDataListTemplate from './entity-data-list.component.html';
import { generateHTML, sendDefaultEvent } from '../../helpers/helpers';
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
  }

  async onInit() {
    this.access_key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoidVVkY0E3eVhnNTBTRUcwMlFrbWc6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU1MTI5MzMzLCJleHAiOjE2NTUyMTU3MzN9.N1Vvk1thu2X4tVJL35sPW95Ee0CFjrNeHHuUkvw1e2g`;

    const fields = await axios.post(
      `http://localhost:2111/api/field/query?access_token=${this.access_key}&pagination=false`,
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

    this.fields = fields.data.content.filter((f) => f.visibleOnList);

    const entityDataResult = await axios.get(
      `http://localhost:2111/api/${this.entity.name}?access_token=${this.access_key}&orderByColumn=${this.fields[0].name}`,
    );

    this.entityData = entityDataResult.data.content;
  }

  async onRender() {
    return generateHTML(entityDataListTemplate, {
      entityData: this.entityData,
      fields: this.fields,
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
        `http://localhost:2111/api/${this.entity.name}/${identifier}?access_token=${this.access_key}&identifierColumn=${this.fields[0].name}`,
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
    this.url = `http://localhost:2111/api/${this.entity.name}?access_token=${this.access_key}&orderByColumn=${this.fields[0].name}`;

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
      searching: false,
      processing: true,
      serverSide: true,
      retrieve: true,
      lengthMenu: [
        [5, 10, 25, 50, -1],
        [5, 10, 25, 50, 'All'],
      ],
      ajax: {
        url: this.url,
        dataSrc: 'content.items',
        data: (d) => {
          this.currentDraw = d.draw;
          d.itemsPerPage = d.length;
          d.pageIndex = this.parsePageIndex(d.start, d.length);
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
          return {
            data: f.name,
          };
        }),
        {
          data: null,
          className: 'dt-center editor-edit',
          orderable: false,
          defaultContent: `<span class="material-icons">edit</span>`,
        },
        {
          data: null,
          className: 'dt-center editor-delete',
          orderable: false,
          defaultContent: `<span class="material-icons">delete</span>`,
        },
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
  }

  async onDestroy() {}
}

export default EntityDataListComponent;
