// Application Logic & State Sync

let currentResumeData = JSON.parse(JSON.stringify(initialResumeData));
let currentSettings = {
  template: 'modern',
  primaryColor: '#6366f1',
  fontSize: 10,
  lineHeight: 1.45
};

document.addEventListener('DOMContentLoaded', () => {
  initFormValues();
  setupEventListeners();
  renderPreview();
  updateATSAnalysis();
});

// Populate Form with State Data
function initFormValues() {
  const p = currentResumeData.personalInfo;
  document.getElementById('input-fullName').value = p.fullName || '';
  document.getElementById('input-title').value = p.title || '';
  document.getElementById('input-email').value = p.email || '';
  document.getElementById('input-phone').value = p.phone || '';
  document.getElementById('input-location').value = p.location || '';
  document.getElementById('input-linkedin').value = p.linkedin || '';
  document.getElementById('input-github').value = p.github || '';
  document.getElementById('input-summary').value = p.summary || '';
  document.getElementById('input-targetRoles').value = p.targetRoles || '';
  document.getElementById('input-noticePeriod').value = p.noticePeriod || '';

  renderExperienceList();
  renderSkillsList();
  renderProjectsList();
}

// Setup Form and Control Listeners
function setupEventListeners() {
  // Tab Switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(`tab-${targetTab}`).classList.add('active');

      if (targetTab === 'ats') {
        updateATSAnalysis();
      }
    });
  });

  // Personal Info Input Binds
  ['fullName', 'title', 'email', 'phone', 'location', 'linkedin', 'github', 'summary', 'targetRoles', 'noticePeriod'].forEach(field => {
    const el = document.getElementById(`input-${field}`);
    if (el) {
      el.addEventListener('input', (e) => {
        currentResumeData.personalInfo[field] = e.target.value;
        renderPreview();
      });
    }
  });

  // Settings & Customization Binds
  document.getElementById('select-template').addEventListener('change', (e) => {
    currentSettings.template = e.target.value;
    renderPreview();
  });

  document.getElementById('range-fontSize').addEventListener('input', (e) => {
    currentSettings.fontSize = parseFloat(e.target.value);
    document.getElementById('val-fontSize').textContent = `${e.target.value}pt`;
    renderPreview();
  });

  document.getElementById('range-lineHeight').addEventListener('input', (e) => {
    currentSettings.lineHeight = parseFloat(e.target.value);
    document.getElementById('val-lineHeight').textContent = e.target.value;
    renderPreview();
  });

  // Color Swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      currentSettings.primaryColor = swatch.getAttribute('data-color');
      renderPreview();
    });
  });

  // Action Buttons
  document.getElementById('btn-export-pdf').addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-export-json').addEventListener('click', exportJSON);
  document.getElementById('btn-import-json').addEventListener('click', () => {
    document.getElementById('file-input-json').click();
  });

  document.getElementById('file-input-json').addEventListener('change', importJSON);
  document.getElementById('btn-export-md').addEventListener('click', exportMarkdown);

  // Add Item Buttons
  document.getElementById('btn-add-experience').addEventListener('click', addExperienceItem);
  document.getElementById('btn-add-skill').addEventListener('click', addSkillCategory);
}

// Render Experience Items in Editor
function renderExperienceList() {
  const container = document.getElementById('experience-list');
  container.innerHTML = '';

  currentResumeData.experience.forEach((exp, index) => {
    const card = document.createElement('div');
    card.className = 'repeater-card';
    card.innerHTML = `
      <div class="repeater-card-header">
        <span class="card-title">${exp.company || 'New Position'} — ${exp.role || ''}</span>
        <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="removeExperienceItem(${index})"><i class="ph ph-trash"></i></button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Company</label>
          <input type="text" value="${exp.company || ''}" oninput="updateExpField(${index}, 'company', this.value)">
        </div>
        <div class="form-group">
          <label>Role</label>
          <input type="text" value="${exp.role || ''}" oninput="updateExpField(${index}, 'role', this.value)">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Dates</label>
          <input type="text" value="${exp.startDate} – ${exp.endDate}" oninput="updateExpDates(${index}, this.value)">
        </div>
        <div class="form-group">
          <label>Location / Mode</label>
          <input type="text" value="${exp.location || ''}" oninput="updateExpField(${index}, 'location', this.value)">
        </div>
      </div>
      <div class="form-group">
        <label>Domains & Context</label>
        <input type="text" value="${exp.domains || ''}" oninput="updateExpField(${index}, 'domains', this.value)">
      </div>
      <div class="form-group">
        <label>Bullet Points (One per line)</label>
        <textarea style="min-height: 120px;" oninput="updateExpBullets(${index}, this.value)">${exp.highlights.join('\n')}</textarea>
      </div>
    `;
    container.appendChild(card);
  });
}

function updateExpField(index, field, value) {
  currentResumeData.experience[index][field] = value;
  renderPreview();
}

function updateExpDates(index, value) {
  const parts = value.split('–');
  currentResumeData.experience[index].startDate = parts[0] ? parts[0].trim() : '';
  currentResumeData.experience[index].endDate = parts[1] ? parts[1].trim() : '';
  renderPreview();
}

function updateExpBullets(index, text) {
  currentResumeData.experience[index].highlights = text.split('\n').filter(line => line.trim().length > 0);
  renderPreview();
}

function addExperienceItem() {
  currentResumeData.experience.unshift({
    id: `exp-${Date.now()}`,
    company: "Company Name",
    role: "Senior Software Engineer",
    location: "Remote",
    startDate: "2024",
    endDate: "Present",
    domains: "Backend Systems",
    highlights: ["Engineered scalable backend microservices, improving throughput by 30%."]
  });
  renderExperienceList();
  renderPreview();
}

function removeExperienceItem(index) {
  currentResumeData.experience.splice(index, 1);
  renderExperienceList();
  renderPreview();
}

// Render Skills in Editor
function renderSkillsList() {
  const container = document.getElementById('skills-list');
  container.innerHTML = '';

  currentResumeData.skills.forEach((cat, index) => {
    const card = document.createElement('div');
    card.className = 'repeater-card';
    card.innerHTML = `
      <div class="repeater-card-header">
        <span class="card-title">${cat.category}</span>
        <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="removeSkillCategory(${index})"><i class="ph ph-trash"></i></button>
      </div>
      <div class="form-group">
        <label>Category Title</label>
        <input type="text" value="${cat.category}" oninput="updateSkillCategory(${index}, this.value)">
      </div>
      <div class="form-group">
        <label>Skills (Comma-separated)</label>
        <input type="text" value="${cat.items.join(', ')}" oninput="updateSkillItems(${index}, this.value)">
      </div>
    `;
    container.appendChild(card);
  });
}

function updateSkillCategory(index, val) {
  currentResumeData.skills[index].category = val;
  renderPreview();
}

function updateSkillItems(index, val) {
  currentResumeData.skills[index].items = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
  renderPreview();
}

function addSkillCategory() {
  currentResumeData.skills.push({
    category: "Cloud & DevOps",
    items: ["Docker", "Kubernetes", "AWS", "CI/CD"]
  });
  renderSkillsList();
  renderPreview();
}

function removeSkillCategory(index) {
  currentResumeData.skills.splice(index, 1);
  renderSkillsList();
  renderPreview();
}

// Render Projects List
function renderProjectsList() {
  const container = document.getElementById('projects-list');
  container.innerHTML = '';

  currentResumeData.projects.forEach((proj, index) => {
    const card = document.createElement('div');
    card.className = 'repeater-card';
    card.innerHTML = `
      <div class="form-group">
        <label>Project Name</label>
        <input type="text" value="${proj.name}" oninput="updateProjField(${index}, 'name', this.value)">
      </div>
      <div class="form-group">
        <label>Tech Stack</label>
        <input type="text" value="${proj.tech}" oninput="updateProjField(${index}, 'tech', this.value)">
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea oninput="updateProjField(${index}, 'description', this.value)">${proj.description}</textarea>
      </div>
    `;
    container.appendChild(card);
  });
}

function updateProjField(index, field, val) {
  currentResumeData.projects[index][field] = val;
  renderPreview();
}

// Render Live Resume Canvas Preview
function renderPreview() {
  const canvas = document.getElementById('resume-canvas');
  const templateFn = Templates[currentSettings.template] || Templates.modern;
  canvas.innerHTML = templateFn(currentResumeData, currentSettings);
  updateATSAnalysis();
}

// Update ATS Score Card
function updateATSAnalysis() {
  const result = ATSChecker.analyze(currentResumeData);
  document.getElementById('ats-score-value').textContent = `${result.score}%`;
  
  const checksContainer = document.getElementById('ats-checks-list');
  if (checksContainer) {
    checksContainer.innerHTML = result.checks.map(c => `
      <div class="ats-check-item">
        <span class="ats-check-icon"><i class="ph ph-${c.passed ? 'check-circle' : 'warning-circle'}" style="color: ${c.passed ? '#10b981' : '#f59e0b'};"></i></span>
        <div>
          <strong>${c.name}</strong>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${c.detail}</div>
        </div>
      </div>
    `).join('');
  }

  const suggContainer = document.getElementById('ats-suggestions-list');
  if (suggContainer) {
    suggContainer.innerHTML = result.suggestions.length > 0 
      ? result.suggestions.map(s => `<div class="suggestion-box"><i class="ph ph-lightbulb"></i> ${s}</div>`).join('')
      : '<div style="color: #10b981; font-size: 0.9rem;"><i class="ph ph-check"></i> Excellent! Your resume passes all primary ATS & metric optimization checks.</div>';
  }
}

// Export / Import JSON & Markdown
function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentResumeData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `${currentResumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      currentResumeData = JSON.parse(evt.target.result);
      initFormValues();
      renderPreview();
      alert('Resume loaded successfully!');
    } catch (err) {
      alert('Failed to parse JSON file.');
    }
  };
  reader.readAsText(file);
}

function exportMarkdown() {
  const p = currentResumeData.personalInfo;
  let md = `# ${p.fullName}\n`;
  md += `**${p.title}**\n\n`;
  md += `${p.location} | ${p.email} | ${p.phone} | ${p.linkedin}\n\n`;
  md += `## Professional Summary\n${p.summary}\n\n`;
  
  md += `## Technical Skills\n`;
  currentResumeData.skills.forEach(s => {
    md += `- **${s.category}**: ${s.items.join(', ')}\n`;
  });

  md += `\n## Experience\n`;
  currentResumeData.experience.forEach(exp => {
    md += `### ${exp.company} — ${exp.role}\n`;
    md += `*${exp.startDate} – ${exp.endDate} | ${exp.location}*\n\n`;
    exp.highlights.forEach(h => {
      md += `- ${h}\n`;
    });
    md += `\n`;
  });

  md += `## Projects\n`;
  currentResumeData.projects.forEach(proj => {
    md += `- **${proj.name}** (${proj.tech}): ${proj.description}\n`;
  });

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${p.fullName.replace(/\s+/g, '_')}_Resume.md`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
