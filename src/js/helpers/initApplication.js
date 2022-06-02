import feather from 'feather-icons';

const indexModule = {
  components: ['side-bar'],
};

// const renderTag = async (tagName) => {
//   const tagElement = document.getElementsByTagName(tagName)[0];

//   const { default: defaultFunc } = await import(`../component/${tagName}`);

//   const component = defaultFunc();

//   const contentToRender = html`${component.htmlCode}`;

//   render(contentToRender, tagElement);

//   component.init();
// };

const initApplication = async () => {
  initNavigationControl();

  for (const componentName of indexModule.components) {
    const Component = await import(`../component/${componentName}`);
    customElements.define(`side-bar`, Component.default);
    feather.replace();
    window.feather = feather;
  }
};

//TODO ad lazy loading
const initNavigationControl = () => {
  window.onpopstate = (e) => {
    if (e.state) {
      document.getElementById('content').innerHTML = e.state.html;
      document.title = e.state.pageTitle;
    }
  };
  document.addEventListener('navigationEvent', () => {
    console.log('navigaton');
  });
};

export default initApplication;
