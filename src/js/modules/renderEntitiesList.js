import axios from 'axios';
import { html, render } from 'lit-html';
import feather from 'feather-icons';

const renderList = async () => {
  const entitiesList = (entities = []) => {
    return html`
      ${entities.map(
        (e) => html`<li class="sidebar-item active">
          <div class="sidebar-link" id="${e.name}-side">
            <i class="align-middle" data-feather="sliders"></i>
            <span class="align-middle">${e.name}</span>
          </div>
        </li>`,
      )}
    `;
  };

  const access_key =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiUjlRa1YzS1ZJT0E1UHBvSDBLa0s6OnVzaWwuemMuYXBwIiwic3ViamVjdFR5cGUiOiJjbGllbnQiLCJpZGVudGlmaWVyIjoiYWRtaW4ifSwiaWF0IjoxNjU0MDI2NjkxLCJleHAiOjE2NTQxMTMwOTF9.RnLlo8v6FIkZqHRaITcVg1SSqC3KLwochc8PdJe2Fis';

  const entitiesResult = await axios.get(
    `http://localhost:2111/api/entity?access_token=${access_key}`,
  );

  const applicationResult = await axios.get(
    `http://localhost:2111/api/application/1?access_token=${access_key}`,
  );

  render(
    html`<span class="align-middle"
      >${applicationResult.data.content.name}</span
    >`,
    document.getElementById('title-name'),
  );

  render(
    entitiesList(entitiesResult.data.content.items),
    document.getElementById('entities-list'),
  );

  feather.replace();

  window.feather = feather;

  for (const entity of entitiesResult.data.content.items) {
    const elementToClick = document.querySelector(`#${entity.name}-side`);
    elementToClick.addEventListener('click', () => {
      if (window.location.pathname !== `/entity/${entity.id}`) {
        const navigationEvent = new Event('navigationEvent');
        document.dispatchEvent(navigationEvent);
        history.pushState('', '', `/entity/${entity.id}`);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', renderList);
