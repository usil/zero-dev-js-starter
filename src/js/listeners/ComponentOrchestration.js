import EntryComponent from '../components/entryComponent/entry.component';
import EntitiesListComponent from '../components/entitiesList/entities-list.component';
import $ from 'jquery';
import TitleComponent from '../components/title/title.component';
import EntityComponent from '../components/entity/entity.component';
import EntityDataListComponent from '../components/entityDataList/entity-data-list.component';
import CreateNewEntityComponent from '../components/createNewEntity/create-new-entity.component';
import EditEntityComponent from '../components/editEntity/edit-entity.component';
import LoginComponent from '../components/login/login.component';

const components = {
  entry: EntryComponent,
  entitiesList: EntitiesListComponent,
  title: TitleComponent,
  entity: EntityComponent,
  entityDataList: EntityDataListComponent,
  createNewEntity: CreateNewEntityComponent,
  editEntity: EditEntityComponent,
  login: LoginComponent,
};

class ComponentOrchestration {
  constructor() {
    this.onRenderIdElements = {};
  }

  init = () => {
    document.addEventListener('default', async (e) => {
      const eventData = e.detail;

      const component = new components[eventData.componentName](
        eventData.variables,
      );

      await component.onInit();

      if (component.onRender) {
        const onRenderIdElement = this.onRenderIdElements[eventData.renderOnId];

        if (onRenderIdElement) {
          $(`#${eventData.renderOnId}`).empty();
          if (onRenderIdElement.instance.onDestroy) {
            await this.onRenderIdElements[
              eventData.renderOnId
            ].instance.onDestroy();
          }
          delete this.onRenderIdElements[eventData.renderOnId];
        }

        this.onRenderIdElements[eventData.renderOnId] = {
          instance: component,
        };

        const htmlCode = await component.onRender();

        $(`#${eventData.renderOnId}`).append(htmlCode);

        await component.afterRender();
      }
    });
  };
}

export default new ComponentOrchestration();
