import { html, render, useState, useEffect } from '../../deps/htm-preact.js';

function processTags(tagData, tagArr = []) {
  let tagA = tagArr.length > 0 ? tagArr : [];

  Object.entries(tagData).forEach((k) => {
    tagA.push(k[1].tagID);
    if (k[1].tags && Object.keys(k[1].tags).length > 0) {
      processTags(k[1].tags, tagA);
    }
  });

  return tagA;
}

function TagPreview({ selectedTags }) {
  function handleClick() {
    const tagString = selectedTags.reduce((rdx, tag, i, arr) => {
      if (i === arr.length - 1) {
        rdx += tag;
      } else {
        rdx += `${tag},`;
      }
      return rdx;
    }, '');
    navigator.clipboard.writeText(tagString);
  }

  return html`
    <div class='tag-preview-container'>
      <p class='tag-preview'>
        ${selectedTags.map((tag) => html`<span>${tag},</span>`)}
      </p>
      <button onClick=${() => handleClick()}>Copy to clipboard</button>
    </div>
  `;
}

function AddTag({ currentTags, setTag }) {
  function handleAddTag() {
    const selected = document.querySelector('.tag-options').value;
    setTag([...currentTags, selected]);
  }

  return html`<button onClick=${() => handleAddTag()}>Add this tag</button>`;
}

// ToDo: Build search functionality
function Search() {
  return html`<input value="" placeholder="Search..." />`;
}

function Tag({ id, label, children }) {
  function showChildren(tagId) {
    console.log('showChildren', tagId);
  }

  return html`
    <div class="tag">
      ${id ? html`<input id="${id}" type="checkbox" />` : ''}
      <label>${label}</label>
      ${children ? html`<button onClick=${() => showChildren(id)}> > </button>` : ''}
    </div>
  `;
}

function Columns({ tags, lastSelected = 'audience', setLastSelected }) {
  const tagKeys = Object.keys(tags);
  console.log('tagKeys', tagKeys);

  const hasLastSelected = tagKeys.includes(lastSelected);
  console.log(hasLastSelected);
  // ToDo: Show one row after last selected and no more

  tagKeys.forEach((key) => {
    return html`<section></section>`;
  });
}

function TagSelector() {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [lastSelected, setLastSelected] = useState();

  useEffect(async () => {
    async function fetchCaasData() {
      const tagUrl = 'https://www.adobe.com/chimera-api/tags';
      const tagResp = await fetch(tagUrl);
      if (!tagResp.ok) return {};
      const json = await tagResp.json();
      return json;
    }
    const data = await fetchCaasData();
    // console.log('data', data);
    // const allTags = processTags(data.namespaces.caas.tags);
    const caasTags = data.namespaces.caas.tags;
    console.log('caasTags', caasTags);
    setTags(caasTags);
  }, []);

  return html`
    <article class="tag-selector">
      <aside>
        <${Search}/>
        <${TagPreview} selectedTags=${selectedTags} />
      </aside>
      <main>
        <section class="tag-source">
          <${Tag} label="CaaS Tags" children=${tags} />
          <!-- Add Consumer Tags Here -->
        </section>
        <div class="tag-columns">
          <${Columns} tags=${tags} lastSelected=${lastSelected} setLastSelected=${setLastSelected} />
        </div>
        <${AddTag} currentTags=${selectedTags} setTag=${setSelectedTags} />
      </main>
    </article>
  `;
}

export default async function init(el) {
  render(html`<${TagSelector} />`, el);
}
