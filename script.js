// Улучшенный прелоадер
let pageLoaded = false;

function hidePreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }
}

window.addEventListener('load', function() {
  pageLoaded = true;
  setTimeout(hidePreloader, 500);
  
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    setTimeout(() => {
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }, 100 * index);
  });
});

setTimeout(() => {
  if (!pageLoaded) hidePreloader();
}, 3000);

function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Sound play prevented:", e));
  }
}

let chatVisible = false;
let terminalVisible = false;
let currentLang = 'ru';
let terminalUnlocked = false;
const TERMINAL_PASSWORD = "humo2025";

function toggleChat() {
  const chatBox = document.getElementById('chatBox');
  chatVisible = !chatVisible;
  
  if (chatVisible) {
    chatBox.classList.add('visible');
    document.getElementById('userInput').focus();
    playSound('sound-chat');
  } else {
    chatBox.classList.remove('visible');
  }
}

const multilingualContent = {
  // ... (содержимое из вашего оригинального кода)
};

function switchLanguage(lang) {
  currentLang = lang;
  
  document.querySelectorAll('.language-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  for (const [key, value] of Object.entries(multilingualContent[lang])) {
    const elements = document.querySelectorAll(`[id="${key}"]`);
    elements.forEach(el => {
      if (el) el.innerHTML = value;
    });
  }
  
  updateAIGreeting();
  
  const terminalInput = document.getElementById('terminalCommand');
  if (terminalInput) {
    if (terminalUnlocked) {
      terminalInput.placeholder = {
        ru: 'Введите команду...',
        en: 'Enter command...',
        zh: '输入命令...',
        ja: 'コマンドを入力...'
      }[currentLang];
    } else {
      terminalInput.placeholder = {
        ru: 'Введите код доступа...',
        en: 'Enter access code...',
        zh: '输入访问代码...',
        ja: 'アクセスコードを入力...'
      }[currentLang];
    }
  }
}

function updateAIGreeting() {
  const chatGreeting = document.getElementById('chat-greeting');
  if (chatGreeting) {
    chatGreeting.textContent = multilingualContent[currentLang]["chat-greeting"];
  }
}

const RedQueenAI = {
  // ... (содержимое из вашего оригинального кода)
};

function speakAsRedQueen(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.lang = currentLang;
    window.speechSynthesis.speak(utterance);
  }
}

function handleChat() {
  const input = document.getElementById('userInput');
  const log = document.getElementById('chatLog');
  const question = input.value.trim();
  
  if (!question) return;
  
  playSound('sound-chat');
  
  log.innerHTML += `<p><strong>You:</strong> ${escapeHtml(question)}</p>`;
  
  const loadingMsg = document.createElement('p');
  loadingMsg.innerHTML = '<strong>Red Queen:</strong> <span class="ai-response-loading">Сканирование...</span>';
  log.appendChild(loadingMsg);
  log.scrollTop = log.scrollHeight;
  
  setTimeout(() => {
    log.removeChild(loadingMsg);
    const analysis = RedQueenAI.analyzeQuestion(question);
    let response = analysis.response;
    
    if (analysis.alert) {
      document.getElementById('chatBox').style.borderColor = "red";
      setTimeout(() => {
        document.getElementById('chatBox').style.borderColor = "#ff0033";
      }, 3000);
    }
    
    log.innerHTML += `<p><strong>Red Queen:</strong> ${response}</p>`;
    log.scrollTop = log.scrollHeight;
    speakAsRedQueen(response.replace(/<[^>]*>/g, ''));
    
    localStorage.setItem('chatHistory', log.innerHTML);
  }, 1500);
  
  input.value = '';
}

const Terminal = {
  // ... (содержимое из вашего оригинального кода)
};

function toggleTerminal() {
  const terminal = document.getElementById('humoTerminal');
  terminalVisible = !terminalVisible;
  
  if (terminalVisible) {
    terminal.classList.add('visible');
    document.getElementById('terminalCommand').focus();
    playSound('sound-terminal');
    
    if (!terminalUnlocked) {
      document.getElementById('terminalCommand').type = 'password';
      document.getElementById('terminalCommand').placeholder = {
        ru: 'Введите код доступа...',
        en: 'Enter access code...',
        zh: '输入访问代码...',
        ja: 'アクセスコードを入力...'
      }[currentLang];
    } else {
      document.getElementById('terminalCommand').type = 'text';
      document.getElementById('terminalCommand').placeholder = {
        ru: 'Введите команду...',
        en: 'Enter command...',
        zh: '输入命令...',
        ja: 'コマンドを入力...'
      }[currentLang];
    }
  } else {
    terminal.classList.remove('visible');
  }
}

document.getElementById('terminalCommand').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    const cmd = this.value;
    const output = document.getElementById('terminalOutput');
    
    if (!terminalUnlocked) {
      if (cmd === TERMINAL_PASSWORD) {
        terminalUnlocked = true;
        this.type = 'text';
        this.placeholder = {
          ru: 'Введите команду...',
          en: 'Enter command...',
          zh: '输入命令...',
          ja: 'コマンドを入力...'
        }[currentLang];
        output.innerHTML += `<p>> Access granted. Welcome, authorized user.</p>`;
        output.innerHTML += `<p>> Type 'help' for commands list</p>`;
      } else {
        output.innerHTML += `<p>> ACCESS DENIED. INITIATING COUNTERMEASURES...</p>`;
        setTimeout(() => {
          output.innerHTML += `<p class="alert-text">> WARNING: MALICIOUS CODE DETECTED</p>`;
          document.getElementById('humoTerminal').style.borderColor = "red";
          playSound('sound-glitch');
        }, 1000);
      }
    } else {
      output.innerHTML += `<p>> ${escapeHtml(cmd)}</p>`;
      const result = Terminal.execute(cmd);
      if (result) output.innerHTML += `<p>${result.replace(/\n/g, '<br>')}</p>`;
    }
    
    this.value = '';
    output.scrollTop = output.scrollHeight;
    playSound('sound-terminal');
  }
});

document.getElementById('userInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') handleChat();
});

document.querySelectorAll('.language-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    switchLanguage(this.dataset.lang);
  });
});

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', function() {
  switchLanguage('ru');
  
  const savedChat = localStorage.getItem('chatHistory');
  if (savedChat) {
    document.getElementById('chatLog').innerHTML = savedChat;
  }
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    });
  });
});