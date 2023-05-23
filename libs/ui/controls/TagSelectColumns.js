import { html } from '../../deps/htm-preact.js';

const Tag = ({
  id,
  label,
  hasChildren,
  isChecked,
  onCheck,
  onExpand,
}) => {
  return html`
    <div
      class="tagselect-item"
      key=${id}
      data-key=${id}
    >
      <input id=${id} type="checkbox" class="cb ${isChecked ? 'checked' : ''}" onClick=${onCheck} />
      <label class="label" for=${id}>${label?.replace('&amp;', '&')}</label>
      ${hasChildren ? html`<button class="has-children" onClick=${onExpand}></button>` : ''}
    </div>
  `;
};

export default Tag;
