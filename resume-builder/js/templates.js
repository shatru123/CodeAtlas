// Template Generators for Resume Builder

const Templates = {
  // 1. MODERN TECH EXECUTIVE TEMPLATE
  modern: function(data, settings) {
    const p = data.personalInfo;
    return `
      <div class="resume-paper template-modern" style="--accent-color: ${settings.primaryColor}; font-size: ${settings.fontSize}pt; line-height: ${settings.lineHeight};">
        <header class="modern-header">
          <div class="modern-header-main">
            <h1 class="resume-name">${p.fullName}</h1>
            <h2 class="resume-title">${p.title}</h2>
          </div>
          <div class="modern-contact">
            <div><i class="ph ph-envelope"></i> ${p.email}</div>
            <div><i class="ph ph-phone"></i> ${p.phone}</div>
            <div><i class="ph ph-map-pin"></i> ${p.location}</div>
            ${p.linkedin ? `<div><i class="ph ph-linkedin-logo"></i> ${p.linkedin}</div>` : ''}
            ${p.github ? `<div><i class="ph ph-github-logo"></i> ${p.github}</div>` : ''}
          </div>
        </header>

        <section class="resume-section">
          <h3 class="section-heading"><i class="ph ph-user"></i> Professional Summary</h3>
          <p class="summary-text">${p.summary}</p>
        </section>

        <section class="resume-section">
          <h3 class="section-heading"><i class="ph ph-cpu"></i> Core Technical Skills</h3>
          <div class="skills-grid">
            ${data.skills.map(s => `
              <div class="skill-category">
                <span class="skill-cat-name">${s.category}:</span>
                <div class="skill-tags">
                  ${s.items.map(item => `<span class="skill-pill">${item}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="resume-section">
          <h3 class="section-heading"><i class="ph ph-briefcase"></i> Professional Experience</h3>
          ${data.experience.map(exp => `
            <div class="experience-item">
              <div class="exp-header">
                <div>
                  <strong class="company-name">${exp.company}</strong> — <span class="job-title">${exp.role}</span>
                </div>
                <div class="exp-date">${exp.startDate} – ${exp.endDate} | ${exp.location}</div>
              </div>
              ${exp.domains ? `<div class="exp-domains"><strong>Domains:</strong> ${exp.domains}</div>` : ''}
              <ul class="bullet-list">
                ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </section>

        <section class="resume-section">
          <h3 class="section-heading"><i class="ph ph-code"></i> AI & Engineering Projects</h3>
          ${data.projects.map(proj => `
            <div class="project-item">
              <div class="proj-header">
                <strong class="proj-name">${proj.name}</strong>
                <span class="proj-tech">${proj.tech}</span>
              </div>
              <p class="proj-desc">${proj.description}</p>
            </div>
          `).join('')}
        </section>

        <div class="resume-dual-row">
          <section class="resume-section">
            <h3 class="section-heading"><i class="ph ph-graduation-cap"></i> Education</h3>
            ${data.education.map(edu => `
              <div class="edu-item">
                <strong>${edu.degree}</strong>
                <div>${edu.institution} (${edu.year})</div>
              </div>
            `).join('')}
          </section>

          <section class="resume-section">
            <h3 class="section-heading"><i class="ph ph-info"></i> Details</h3>
            <div class="meta-details">
              <div><strong>Target Roles:</strong> ${p.targetRoles}</div>
              <div><strong>Notice Period:</strong> ${p.noticePeriod} | <strong>Preference:</strong> ${p.workPreference}</div>
            </div>
          </section>
        </div>
      </div>
    `;
  },

  // 2. CLASSIC ATS STANDARD TEMPLATE (Maximum Compatibility)
  ats: function(data, settings) {
    const p = data.personalInfo;
    return `
      <div class="resume-paper template-ats" style="--accent-color: #111827; font-size: ${settings.fontSize}pt; line-height: ${settings.lineHeight}; font-family: Arial, Helvetica, sans-serif;">
        <div class="ats-header" style="text-align: center; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 12px;">
          <h1 style="font-size: 1.8em; margin: 0; text-transform: uppercase; letter-spacing: 1px;">${p.fullName}</h1>
          <div style="font-weight: bold; margin-top: 4px; font-size: 0.95em;">${p.title}</div>
          <div style="font-size: 0.85em; margin-top: 4px;">
            ${p.location} | ${p.email} | ${p.phone} | ${p.linkedin}
          </div>
        </div>

        <div class="ats-section" style="margin-bottom: 12px;">
          <h3 style="font-size: 1.05em; text-transform: uppercase; border-bottom: 1px solid #333; margin: 0 0 6px 0; padding-bottom: 2px;">Professional Summary</h3>
          <p style="margin: 0; font-size: 0.9em; text-align: justify;">${p.summary}</p>
        </div>

        <div class="ats-section" style="margin-bottom: 12px;">
          <h3 style="font-size: 1.05em; text-transform: uppercase; border-bottom: 1px solid #333; margin: 0 0 6px 0; padding-bottom: 2px;">Core Technical Skills</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.88em;">
            ${data.skills.map(s => `
              <tr>
                <td style="font-weight: bold; width: 25%; padding: 2px 0; vertical-align: top;">${s.category}:</td>
                <td style="padding: 2px 0;">${s.items.join(', ')}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div class="ats-section" style="margin-bottom: 12px;">
          <h3 style="font-size: 1.05em; text-transform: uppercase; border-bottom: 1px solid #333; margin: 0 0 6px 0; padding-bottom: 2px;">Professional Experience</h3>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.95em;">
                <span>${exp.company} — ${exp.role}</span>
                <span>${exp.startDate} – ${exp.endDate}</span>
              </div>
              ${exp.domains ? `<div style="font-size: 0.82em; font-style: italic; color: #444; margin-bottom: 3px;">Domains: ${exp.domains} | Location: ${exp.location}</div>` : ''}
              <ul style="margin: 3px 0 0 16px; padding: 0; font-size: 0.88em;">
                ${exp.highlights.map(h => `<li style="margin-bottom: 3px;">${h}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="ats-section" style="margin-bottom: 12px;">
          <h3 style="font-size: 1.05em; text-transform: uppercase; border-bottom: 1px solid #333; margin: 0 0 6px 0; padding-bottom: 2px;">Projects & AI Engineering</h3>
          ${data.projects.map(proj => `
            <div style="margin-bottom: 6px; font-size: 0.88em;">
              <strong>${proj.name}</strong> (${proj.tech}): ${proj.description}
            </div>
          `).join('')}
        </div>

        <div class="ats-section">
          <h3 style="font-size: 1.05em; text-transform: uppercase; border-bottom: 1px solid #333; margin: 0 0 6px 0; padding-bottom: 2px;">Education & Target Roles</h3>
          <div style="font-size: 0.88em;">
            ${data.education.map(edu => `<div><strong>${edu.degree}</strong> — ${edu.institution}</div>`).join('')}
            <div style="margin-top: 4px;"><strong>Target Roles:</strong> ${p.targetRoles} | <strong>Notice Period:</strong> ${p.noticePeriod}</div>
          </div>
        </div>
      </div>
    `;
  },

  // 3. SILICON VALLEY MINIMALIST
  minimal: function(data, settings) {
    const p = data.personalInfo;
    return `
      <div class="resume-paper template-minimal" style="--accent-color: ${settings.primaryColor}; font-size: ${settings.fontSize}pt; line-height: ${settings.lineHeight};">
        <header class="min-header">
          <h1 class="min-name">${p.fullName}</h1>
          <div class="min-sub">${p.title}</div>
          <div class="min-meta">
            <span>${p.email}</span> • <span>${p.phone}</span> • <span>${p.location}</span> • <span>${p.linkedin}</span>
          </div>
        </header>

        <div class="min-divider"></div>

        <section class="min-sec">
          <div class="min-sec-title">ABOUT</div>
          <div class="min-sec-body">${p.summary}</div>
        </section>

        <section class="min-sec">
          <div class="min-sec-title">SKILLS</div>
          <div class="min-sec-body">
            ${data.skills.map(s => `
              <div class="min-skill-row">
                <span class="min-skill-label">${s.category}:</span>
                <span>${s.items.join(' • ')}</span>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="min-sec">
          <div class="min-sec-title">EXPERIENCE</div>
          <div class="min-sec-body">
            ${data.experience.map(exp => `
              <div class="min-exp-block">
                <div class="min-exp-head">
                  <span class="min-exp-title"><strong>${exp.company}</strong> / ${exp.role}</span>
                  <span class="min-exp-dates">${exp.startDate} – ${exp.endDate}</span>
                </div>
                <ul class="min-bullets">
                  ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="min-sec">
          <div class="min-sec-title">PROJECTS</div>
          <div class="min-sec-body">
            ${data.projects.map(proj => `
              <div class="min-proj-block">
                <strong>${proj.name}</strong> <span class="min-tech">[${proj.tech}]</span>
                <p>${proj.description}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="min-sec">
          <div class="min-sec-title">EDUCATION</div>
          <div class="min-sec-body">
            ${data.education.map(edu => `<div><strong>${edu.degree}</strong>, ${edu.institution}</div>`).join('')}
          </div>
        </section>
      </div>
    `;
  },

  // 4. CREATIVE DEVELOPER (Stat Highlights)
  creative: function(data, settings) {
    const p = data.personalInfo;
    return `
      <div class="resume-paper template-creative" style="--accent-color: ${settings.primaryColor}; font-size: ${settings.fontSize}pt; line-height: ${settings.lineHeight};">
        <header class="creative-header">
          <div class="creative-title-group">
            <h1>${p.fullName}</h1>
            <div class="creative-badge-title">${p.title}</div>
          </div>
          <div class="creative-contacts">
            <div><i class="ph ph-envelope"></i> ${p.email}</div>
            <div><i class="ph ph-phone"></i> ${p.phone}</div>
            <div><i class="ph ph-map-pin"></i> ${p.location}</div>
          </div>
        </header>

        <div class="creative-stats-banner">
          <div class="stat-box">
            <div class="stat-num">8+</div>
            <div class="stat-lbl">Years Experience</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">.NET 10</div>
            <div class="stat-lbl">Modern Stack</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">1M+</div>
            <div class="stat-lbl">Price Bands Load</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">Claude MCP</div>
            <div class="stat-lbl">AI Operational Tool</div>
          </div>
        </div>

        <section class="creative-sec">
          <h3>Summary</h3>
          <p>${p.summary}</p>
        </section>

        <section class="creative-sec">
          <h3>Technical Expertise</h3>
          <div class="creative-skills-list">
            ${data.skills.map(s => `
              <div class="c-skill-item">
                <strong>${s.category}:</strong> ${s.items.map(i => `<span class="c-pill">${i}</span>`).join(' ')}
              </div>
            `).join('')}
          </div>
        </section>

        <section class="creative-sec">
          <h3>Work History</h3>
          ${data.experience.map(exp => `
            <div class="c-exp-card">
              <div class="c-exp-top">
                <span class="c-comp">${exp.company}</span>
                <span class="c-role">${exp.role}</span>
                <span class="c-date">${exp.startDate} – ${exp.endDate}</span>
              </div>
              <ul class="c-bullets">
                ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </section>

        <section class="creative-sec">
          <h3>AI & Open Source</h3>
          ${data.projects.map(proj => `
            <div class="c-proj-card">
              <strong>${proj.name}</strong> <em>(${proj.tech})</em>
              <div>${proj.description}</div>
            </div>
          `).join('')}
        </section>
      </div>
    `;
  }
};
