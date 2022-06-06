import EntryComponent from '../components/entryComponent/entry.component';
import $ from 'jquery';

const components = {
  entry: EntryComponent,
};

class ComponentOrchestration {
  constructor() {}

  init = () => {
    document.addEventListener('default', async (e) => {
      const eventData = e.detail;

      const component = new components[eventData.componentName]();

      await component.onInit();

      if (component.onRender) {
        const htmlCode = await component.onRender();

        $(`#${eventData.renderOnId}`).append(htmlCode);

        await component.afterRender();
      }
    });
  };
}

export default new ComponentOrchestration();
