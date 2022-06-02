import feather from 'feather-icons';
import initSideBar from '../modules/sidebar';
import { html, LitElement } from 'lit';

class SideBar extends LitElement {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    initSideBar();
    feather.replace();
    window.feather = feather;
  }

  render() {
    return html`<nav id="sidebar" class="sidebar js-sidebar">
      <div id="sidebar-inner" class="sidebar-content js-simplebar">
        <i class="align-middle" data-feather="sliders"></i>
        <a id="title-name" class="sidebar-brand" href="#"> </a>
        <ul id="entities-list" class="sidebar-nav">
          <li class="sidebar-header">Entities</li>
        </ul>
      </div>
    </nav>`;
  }
}

// customElements.define('side-bar', SideBar);

export default SideBar;
