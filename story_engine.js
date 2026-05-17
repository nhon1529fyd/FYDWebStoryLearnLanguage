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

  async function loadStory() {
    try {
      if (!config.storyUrl) throw new Error('Missing storyUrl');
      const response = await fetch(config.storyUrl);
      if (!response.ok) throw new Error(`Cannot load ${config.storyUrl}`);
      storyData = await response.json();
    } catch (error) {
      storyData = config.fallbackStory || null;
    }

    if (!storyData) {
      sceneText.textContent = 'Không thể tải dữ liệu màn chơi.';
      responseBlock.hidden = true;
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
