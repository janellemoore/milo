import { html, render, useState, useEffect } from '../../deps/htm-preact.js';
import Picker from '../../ui/controls/TagSelectPicker.js';
import { createOptionMap } from '../../ui/controls/TagSelector.js';
import { loadCaasTags } from '../caas/utils.js';

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

function TagSelector({
  selectedTags = [],
}) {
  const [tags, setTags] = useState([]);
  const [options, setOptions] = useState({});
  // const [selectedTags, setSelectedTags] = useState([]);
  // const [lastSelected, setLastSelected] = useState();

  // From caas-config.js
  const getTagTree = (root) => {
    const options = Object.entries(root).reduce((opts, [, tag]) => {
      opts[tag.tagID] = {};
  
      if (Object.keys(tag.tags).length) {
        opts[tag.tagID].children = getTagTree(tag.tags);
      }
  
      opts[tag.tagID].label = tag.title;
      opts[tag.tagID].path = tag.path.replace('/content/cq:tags/caas/', '');
  
      return opts;
    }, {});
    return options;
  };

  useEffect(async () => {
    // async function fetchCaasData() {
      const tagUrl = 'https://www.adobe.com/chimera-api/tags';
    //   const tagResp = await fetch(tagUrl);
    //   if (!tagResp.ok) return {};
    //   const json = await tagResp.json();
    //   return json;
    // }
    // const data = await fetchCaasData();
    // // console.log('data', data);
    // // const allTags = processTags(data.namespaces.caas.tags);
    // const caasTags = data.namespaces.caas.tags;
    // console.log('caasTags', caasTags);
    const { tags: caasTags, errorMsg } = await loadCaasTags(tagUrl);
    if (errorMsg) console.log(`Error fetching caas tags: ${errorMsg}`);
    setTags(caasTags);
    setOptions(getTagTree(caasTags));
  }, []);

  const [optionMap, setOptionMap] = useState({});

  useEffect(() => {
    const hasNestedData = Object.values(options).some((val) => typeof val !== 'string');

    if (hasNestedData) {
      setOptionMap(createOptionMap(options));
    } else {
      setOptionMap(options);
    }

    if (!Array.isArray(selectedTags)) {
      onChange([]);
    }
  }, [options]);

  const addOption = (val) => {
    if (!selectedTags.includes(val)) {
      selectedTags.push(val);
    }
    onChange(singleSelect ? [val] : [...selectedTags]);
  };

  const removeOption = (val) => {
    const optionIndex = selectedTags.indexOf(val);
    if (optionIndex === -1) return;
    selectedTags.splice(optionIndex, 1);
    onChange([...selectedTags]);
  };

  const toggleTag = (val) => {
    if (selectedTags.includes(val)) {
      removeOption(val);
    } else {
      addOption(val);
    }
  };

  // <${TagPreview} selectedTags=${selectedTags} />

  return html`
    <${Picker}
      toggleTag=${toggleTag}
      options=${options}
      optionMap=${optionMap}
      selectedTags=${selectedTags}
    />
  `;
}

export default async function init(el) {
  render(html`<${TagSelector} />`, el);
}
