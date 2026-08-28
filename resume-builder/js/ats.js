// Real-time ATS Parser & Optimization Engine

const ATSChecker = {
  // Action Verbs List
  actionVerbs: [
    "architected", "engineered", "spearheaded", "orchestrated", "modernized",
    "optimized", "implemented", "provisioned", "migrated", "built",
    "designed", "developed", "benchmarked", "streamlined", "automated",
    "pioneered", "scaled", "reduced", "improved", "led", "created"
  ],

  // Essential Tech Keywords for Senior .NET / Backend Engineers
  techKeywords: [
    "c#", ".net", "asp.net core", "microservices", "opentelemetry",
    "rest apis", "grafana", "splunk", "kibana", "k6", "gatling",
    "sql server", "aws", "docker", "terraform", "claude", "mcp",
    "distributed systems", "p95 latency", "ci/cd", "cqrs", "entity framework"
  ],

  analyze: function(data) {
    let score = 0;
    const checks = [];
    const suggestions = [];

    // 1. Personal Info Completeness (20 points)
    const p = data.personalInfo;
    let personalScore = 0;
    if (p.fullName && p.title) personalScore += 5;
    if (p.email && p.phone) personalScore += 5;
    if (p.location) personalScore += 5;
    if (p.summary && p.summary.length > 50) personalScore += 5;

    score += personalScore;
    checks.push({
      name: "Contact & Profile Details",
      passed: personalScore === 20,
      detail: `${personalScore}/20 points — Email, phone, location & summary verified.`
    });

    // 2. Quantifiable STAR Metrics (25 points)
    let metricCount = 0;
    let bulletCount = 0;
    const metricRegex = /(\d+%\b|\d+k\b|\d+m\b|\d+\+|\b\d+\b\s*(ms|seconds|minutes|hours|events|rps|users|price bands))/gi;

    data.experience.forEach(exp => {
      exp.highlights.forEach(h => {
        bulletCount++;
        if (metricRegex.test(h)) {
          metricCount++;
        }
      });
    });

    const metricRatio = bulletCount > 0 ? (metricCount / bulletCount) : 0;
    let metricScore = Math.min(25, Math.round(metricRatio * 40));
    score += metricScore;

    if (metricRatio < 0.4) {
      suggestions.push("Add more quantifiable numbers (e.g. '% reduction', 'p95 ms', 'RPS', 'users') to at least 40% of bullet points.");
    }

    checks.push({
      name: "Quantifiable Impact (Metrics)",
      passed: metricScore >= 18,
      detail: `${metricCount} out of ${bulletCount} bullet points contain numbers/metrics.`
    });

    // 3. Action Verbs (20 points)
    let verbCount = 0;
    const foundVerbs = new Set();

    data.experience.forEach(exp => {
      exp.highlights.forEach(h => {
        const firstWord = h.trim().split(" ")[0].toLowerCase();
        if (this.actionVerbs.includes(firstWord)) {
          verbCount++;
          foundVerbs.add(firstWord);
        }
      });
    });

    let verbScore = Math.min(20, verbCount * 3);
    score += verbScore;

    checks.push({
      name: "Strong Engineering Action Verbs",
      passed: verbScore >= 15,
      detail: `${foundVerbs.size} distinct strong action verbs used (e.g., ${Array.from(foundVerbs).slice(0, 3).join(', ')}).`
    });

    if (verbScore < 15) {
      suggestions.push("Begin bullets with active verbs like Architected, Spearheaded, Engineered, Orchestrated instead of 'Worked on' or 'Responsible for'.");
    }

    // 4. Keyword Density (20 points)
    const fullText = JSON.stringify(data).toLowerCase();
    let keywordsFound = 0;
    this.techKeywords.forEach(kw => {
      if (fullText.includes(kw)) {
        keywordsFound++;
      }
    });

    let kwScore = Math.min(20, Math.round((keywordsFound / this.techKeywords.length) * 20));
    score += kwScore;

    checks.push({
      name: "Core Tech Keyword Coverage",
      passed: kwScore >= 16,
      detail: `${keywordsFound}/${this.techKeywords.length} essential tech keywords present.`
    });

    // 5. Sections Presence (15 points)
    let secScore = 0;
    if (data.experience.length >= 2) secScore += 5;
    if (data.skills.length >= 3) secScore += 5;
    if (data.education.length >= 1) secScore += 5;
    score += secScore;

    checks.push({
      name: "Required Resume Sections",
      passed: secScore === 15,
      detail: "Summary, Experience, Skills, and Education sections verified."
    });

    return {
      score: Math.min(100, score),
      checks,
      suggestions
    };
  }
};
