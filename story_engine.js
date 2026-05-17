(function () {
  const config = window.STORY_CONFIG || {};

  const sceneText = document.getElementById('sceneText');
  const speechBlock = document.getElementById('speechBlock');
  const speakerText = document.getElementById('speakerText');
  const lineText = document.getElementById('lineText');
  const responseBlock = document.getElementById('responseBlock');
  const questionText = document.getElementById('questionText');
  const choicesList = document.getElementById('choicesList');
  const instructionText = document.getElementById('instructionText');
  const resultModal = document.getElementById('resultModal');
  const resultLabel = document.getElementById('resultLabel');
  const resultText = document.getElementById('resultText');
  const okButton = document.getElementById('okButton');
  const dynamicStats = document.getElementById('dynamicStats');

  let storyData = null;
  let currentNode = null;
  let pendingChoice = null;
  let playerState = {};

  function showLoadError(message) {
    sceneText.textContent = message;
    responseBlock.hidden = true;
    speechBlock.hidden = true;
  }

  function validateStory(story) {
    if (!story || typeof story !== 'object') {
      throw new Error('Story data must be an object.');
    }

    if (!story.startNodeId || typeof story.startNodeId !== 'string') {
      throw new Error('Missing startNodeId.');
    }

    if (!Array.isArray(story.nodes) || story.nodes.length === 0) {
      throw new Error('Story must include at least one node.');
    }

    const nodeIds = new Set();
    story.nodes.forEach((node, index) => {
      if (!node || typeof node !== 'object') {
        throw new Error(`Node at index ${index} is invalid.`);
      }

      if (!node.id || typeof node.id !== 'string') {
        throw new Error(`Node at index ${index} is missing an id.`);
      }

      if (nodeIds.has(node.id)) {
        throw new Error(`Duplicate node id: ${node.id}`);
      }

      nodeIds.add(node.id);

      if (!Array.isArray(node.choices)) {
        throw new Error(`Node "${node.id}" must include a choices array.`);
      }

      node.choices.forEach((choice, choiceIndex) => {
        if (!choice || typeof choice !== 'object') {
          throw new Error(`Choice ${choiceIndex + 1} in node "${node.id}" is invalid.`);
        }

        if (!choice.text || typeof choice.text !== 'string') {
          throw new Error(`Choice ${choiceIndex + 1} in node "${node.id}" is missing text.`);
        }
      });
    });

    if (!nodeIds.has(story.startNodeId)) {
      throw new Error(`startNodeId "${story.startNodeId}" does not exist.`);
    }

    story.nodes.forEach(node => {
      node.choices.forEach((choice, choiceIndex) => {
        if (choice.nextNodeId && !nodeIds.has(choice.nextNodeId)) {
          throw new Error(
            `Choice ${choiceIndex + 1} in node "${node.id}" points to missing node "${choice.nextNodeId}".`
          );
        }
      });
    });

    return story;
  }
  async function loadStory() {
    try {
      if (!config.storyUrl) throw new Error('Missing storyUrl');
      const response = await fetch(config.storyUrl);
      if (!response.ok) throw new Error(`Cannot load ${config.storyUrl}`);
      storyData = validateStory(await response.json());
    } catch (error) {
      showLoadError(`Không thể tải dữ liệu màn chơi. ${error.message}`);
      return;
    }

    playerState = structuredClone(storyData.stateDefaults || {});
    renderStats();
    currentNode = getNode(storyData.startNodeId);
    renderNode(currentNode);
  }

  function getNode(id) {
    return storyData.nodes.find(node => node.id === id);
  }

  function renderNode(node) {
    if (!node) return;

    currentNode = node;
    sceneText.textContent = node.scene || '';
    questionText.textContent = node.question || '';
    instructionText.textContent = node.instruction || '';
    choicesList.innerHTML = '';
    responseBlock.hidden = false;

    if (node.type === 'dialogue' && node.speaker && node.line) {
      speakerText.textContent = node.speaker;
      lineText.textContent = `"${node.line}"`;
      speechBlock.hidden = false;
    } else {
      speechBlock.hidden = true;
    }

    (node.choices || []).forEach(choice => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.textContent = choice.text;
      button.addEventListener('click', () => openResult(choice));
      choicesList.appendChild(button);
    });
  }

  function applyEffects(effects = []) {
    effects.forEach(effect => {
      if (effect.type === 'stat') {
        const currentValue = Number(playerState[effect.key] || 0);
        if (effect.op === 'set') {
          playerState[effect.key] = Number(effect.value || 0);
        } else {
          playerState[effect.key] = currentValue + Number(effect.value || 0);
        }
      }

      if (effect.type === 'flag') {
        playerState[effect.key] = typeof effect.value === 'string'
          ? effect.value.toLowerCase() === 'true'
          : Boolean(effect.value);
      }
    });

    renderStats();
  }

  function renderStats() {
    if (!dynamicStats) return;

    dynamicStats.innerHTML = '';
    (storyData.visibleStats || []).forEach(stat => {
      const row = document.createElement('div');
      row.className = 'status-row dynamic';
      row.innerHTML = `<strong>${stat.label}</strong>${playerState[stat.key] ?? 0}`;
      dynamicStats.appendChild(row);
    });
  }

  function openResult(choice) {
    pendingChoice = choice;
    [...choicesList.children].forEach(item => item.classList.remove('correct', 'wrong'));

    const clickedButton = [...choicesList.children].find(item => item.textContent === choice.text);
    if (clickedButton) {
      clickedButton.classList.add(choice.result === 'correct' ? 'correct' : 'wrong');
    }

    resultLabel.textContent = choice.result === 'correct' ? 'Lựa chọn phù hợp' : 'Chưa hợp ngữ cảnh';
    resultText.textContent = choice.feedback || '';
    resultModal.hidden = false;
  }

  okButton.addEventListener('click', () => {
    if (!pendingChoice) return;

    applyEffects(pendingChoice.effects);
    sceneText.textContent = pendingChoice.afterScene || currentNode.scene || '';
    resultModal.hidden = true;

    if (pendingChoice.nextNodeId) {
      renderNode(getNode(pendingChoice.nextNodeId));
    } else {
      responseBlock.hidden = true;
    }
  });

  window.StoryEngine = {
    getState: () => structuredClone(playerState),
    loadStory
  };

  loadStory();
})();
