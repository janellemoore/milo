import { html, render, useState, useEffect } from '../../deps/htm-preact.js';
import Picker from '../../ui/controls/TagSelectPicker.js';
import { createOptionMap } from '../../ui/controls/TagSelector.js';
import { loadCaasTags } from '../caas/utils.js';

const TagPreview = ({ selectedTags }) => {
  const [tagString, setTagString] = useState('');
  const [copyText, setCopyText] = useState('Copy');

  useEffect(() => {
    const getTagString = selectedTags.reduce((rdx, tag, i, arr) => {
      if (i === arr.length - 1) {
        rdx += tag;
      } else {
        rdx += `${tag},`;
      }
      return rdx;
    }, '');
    setTagString(getTagString);
  }, [selectedTags]);

  const handleClick = () => {
    if (tagString.length) {
      navigator.clipboard.writeText(tagString);
      setCopyText('Copied!');
    } else {
      setCopyText('Nothing to copy');
    }

    setTimeout(() => {
      setCopyText('Copy');
    }, 2000);
  };

  return html`
    <section class='tag-preview-container'>
      <button onClick=${handleClick}>${copyText}</button>
      <div class='tag-preview'>${tagString}</div>
    </section>
  `;
}

const TagSelector = () => {
  const [options, setOptions] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [optionMap, setOptionMap] = useState({});
  const tagUrl = 'https://www.adobe.com/chimera-api/tags';

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

  // useEffect(async () => {
  //   const { tags: caasTags, errorMsg } = await loadCaasTags(tagUrl);
  //   if (errorMsg) console.log(`Error fetching caas tags: ${errorMsg}`);
  //   setOptions(getTagTree(caasTags));
  // }, []);

  useEffect(() => {
    const hasNestedData = Object.values(options).some((value) => typeof value !== 'string');

    if (hasNestedData) {
      setOptionMap(createOptionMap(options));
    } else {
      setOptionMap(options);
    }
  }, [options]);

  const toggleTag = (value) => {
    setSelectedTags((tags) => {
      if (tags.includes(value)) {
        return tags.filter((tag) => tag !== value);
      } else {
        return [...tags, value];
      }
    });
  };

  const getCaasTags = async () => {
    const { tags: caasTags, errorMsg } = await loadCaasTags(tagUrl);
    if (errorMsg) console.log(`Error fetching caas tags: ${errorMsg}`);
    setOptions(getTagTree(caasTags));
  };

  return html`
    <${TagPreview} selectedTags=${selectedTags} />
    <section class="tag-selector-sources">
      <button onClick=${getCaasTags}>CaaS Tags</button>
    </section>
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
