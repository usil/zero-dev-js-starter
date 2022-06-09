import entityDataListTemplate from './entity-data-list.component.html';
import { generateHTML } from '../../helpers/helpers';
import axios from 'axios';
import $ from 'jquery';
import 'datatables.net-bs5';
import 'datatables.net-buttons-bs5';
import 'material-icons/iconfont/material-icons.css';
class EntityDataListComponent {
  constructor(variables) {
    this.currentDraw = 0;
    this.entity = variables.entity;
  }

  async onInit() {
    this.access_key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoidVVkY0E3eVhnNTBTRUcwMlFrbWc6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU0NzMyNTEwLCJleHAiOjE2NTQ4MTg5MTB9.ZYfpX-0wExAcXDqPwHF0xSzjotYn0ysPn7AT2L4BM_A`;

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

  async afterRender() {
    this.url = `http://localhost:2111/api/${this.entity.name}?access_token=${this.access_key}&orderByColumn=${this.fields[0].name}`;
    $('#entity-data-table').DataTable({
      ordering: false,
      info: false,
      searching: true,
      processing: true,
      serverSide: true,
      retrieve: true,
      lengthMenu: [
        [5, 10, 25, 50],
        [5, 10, 25, 50],
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
          defaultContent: `<span class="material-icons">pie_chart</span>`,
        },
      ],
    });
  }

  async onDestroy() {}
}

export default EntityDataListComponent;
