const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configure marked
marked.setOptions({
    gfm: true,
    breaks: true
});

// Paths configuration
const paths = {
    profile: path.join(__dirname, 'content', 'profile.json'),
    acknowledgements: path.join(__dirname, 'content', 'acknowledgements.md'),
    experienceDir: path.join(__dirname, 'content', 'experience'),
    projectsDir: path.join(__dirname, 'content', 'projects'),
    essaysDir: path.join(__dirname, 'content', 'essays'),
    styles: path.join(__dirname, 'src', 'styles.css'),
    template: path.join(__dirname, 'src', 'template.html'),
    output: path.join(__dirname, 'index.html'),
    stylesOutput: path.join(__dirname, 'styles.css'),
    articlesDir: path.join(__dirname, 'articles'),
    swOutput: path.join(__dirname, 'sw.js'),
    manifestOutput: path.join(__dirname, 'manifest.json')
};

// Helper function to post-process code blocks for premium visual container
function processCodeBlocks(html) {
    return html.replace(
        /<pre><code class="language-([^"]+)">([\s\S]+?)<\/code><\/pre>/g,
        (match, lang, code) => {
            let filename = 'code_snippet';
            if (lang === 'c') filename = 'optimizer_isr.c';
            else if (lang === 'cpp') filename = 'main.cpp';
            else if (lang === 'assembly' || lang === 'asm') filename = 'control_clamp.asm';
            else if (lang === 'json') filename = 'data.json';
            
            return `
            <div class="code-container">
                <div class="code-header">
                    <div class="dots">
                        <div class="dot red"></div>
                        <div class="dot yellow"></div>
                        <div class="dot green"></div>
                    </div>
                    <div class="title">${filename}</div>
                </div>
                <pre><code class="language-${lang}">${code}</code></pre>
            </div>`;
        }
    );
}

// Helper to parse experience markdown file metadata
function parseExperienceFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    let title = '';
    let company = '';
    let fullTitle = '';
    let period = '';
    
    // Parse title from first header
    const titleMatch = lines[0].match(/^#\s+(.*)/);
    if (titleMatch) title = titleMatch[1].trim();
    
    // Parse metadata lines
    for (let line of lines) {
        if (line.includes('**Company:**')) {
            company = line.replace(/.*?\*\*Company:\*\*\s*/, '').trim();
        }
        if (line.includes('**Title:**')) {
            fullTitle = line.replace(/.*?\*\*Title:\*\*\s*/, '').trim();
        }
        if (line.includes('**Period:**')) {
            period = line.replace(/.*?\*\*Period:\*\*\s*/, '').trim();
        }
    }
    
    // Find body start index (skip headers and metadata)
    let bodyStartIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('##')) {
            bodyStartIndex = i;
            break;
        }
    }
    
    const bodyContent = lines.slice(bodyStartIndex).join('\n');
    const htmlContent = processCodeBlocks(marked.parse(bodyContent));
    
    return {
        title,
        company,
        fullTitle: fullTitle || title,
        period,
        html: htmlContent
    };
}

// Helper to parse project markdown file metadata
function parseProjectFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    let title = '';
    let company = '';
    let role = '';
    let scope = '';
    let compliance = '';
    
    const titleMatch = lines[0].match(/^#\s+(.*)/);
    if (titleMatch) title = titleMatch[1].trim();
    
    for (let line of lines) {
        if (line.includes('**Company:**')) {
            company = line.replace(/.*?\*\*Company:\*\*\s*/, '').trim();
        }
        if (line.includes('**Role:**')) {
            role = line.replace(/.*?\*\*Role:\*\*\s*/, '').trim();
        }
        if (line.includes('**Scope:**')) {
            scope = line.replace(/.*?\*\*Scope:\*\*\s*/, '').trim();
        }
        if (line.includes('**Compliance Standards:**')) {
            compliance = line.replace(/.*?\*\*Compliance Standards:\*\*\s*/, '').trim();
        }
    }
    
    let bodyStartIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('---')) {
            bodyStartIndex = i + 1;
            break;
        } else if (lines[i].startsWith('##')) {
            bodyStartIndex = i;
            break;
        }
    }
    
    // Find where Section 2 starts
    let sec2Index = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('## 2.')) {
            sec2Index = i;
            break;
        }
    }
    
    let introHTML = '';
    let detailsHTML = '';
    
    if (sec2Index !== -1) {
        let introLines = lines.slice(bodyStartIndex, sec2Index);
        // Trim trailing hr divider
        if (introLines.length > 0 && introLines[introLines.length - 1].trim() === '---') {
            introLines = introLines.slice(0, -1);
        }
        const introMarkdown = introLines.join('\n');
        const detailsMarkdown = lines.slice(sec2Index).join('\n');
        
        introHTML = processCodeBlocks(marked.parse(introMarkdown));
        detailsHTML = processCodeBlocks(marked.parse(detailsMarkdown));
    } else {
        const bodyContent = lines.slice(bodyStartIndex).join('\n');
        introHTML = processCodeBlocks(marked.parse(bodyContent));
    }
    
    return {
        title,
        company,
        role,
        scope,
        compliance,
        introHTML,
        detailsHTML
    };
}

// Helper to parse essay markdown file metadata
function parseEssayFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    let title = '';
    let date = '';
    let category = '';
    let tags = '';
    let series = '';
    let seriesPart = '';
    let excerpt = '';
    
    const titleMatch = lines[0].match(/^#\s+(.*)/);
    if (titleMatch) title = titleMatch[1].trim();
    
    for (let line of lines) {
        if (line.includes('**Date:**')) {
            date = line.replace(/.*?\*\*Date:\*\*\s*/, '').trim();
        }
        if (line.includes('**Category:**')) {
            category = line.replace(/.*?\*\*Category:\*\*\s*/, '').trim();
        }
        if (line.includes('**Tags:**')) {
            tags = line.replace(/.*?\*\*Tags:\*\*\s*/, '').trim();
        }
        if (line.includes('**Series:**')) {
            series = line.replace(/.*?\*\*Series:\*\*\s*/, '').trim();
        }
        if (line.includes('**Series Part:**')) {
            seriesPart = line.replace(/.*?\*\*Series Part:\*\*\s*/, '').trim();
        }
        if (line.includes('**Excerpt:**')) {
            excerpt = line.replace(/.*?\*\*Excerpt:\*\*\s*/, '').trim();
        }
    }
    
    let bodyStartIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('---')) {
            bodyStartIndex = i + 1;
            break;
        } else if (lines[i].startsWith('##')) {
            bodyStartIndex = i;
            break;
        }
    }
    
    const bodyContent = lines.slice(bodyStartIndex).join('\n');
    const htmlContent = processCodeBlocks(marked.parse(bodyContent));
    
    return {
        title,
        date,
        category,
        tags,
        series,
        seriesPart: seriesPart ? parseInt(seriesPart, 10) : null,
        excerpt,
        html: htmlContent
    };
}

function main() {
    console.log('Starting site build compilation...');
    
    // 1. Read configuration & resources
    const profileData = JSON.parse(fs.readFileSync(paths.profile, 'utf8'));
    const stylesContent = fs.readFileSync(paths.styles, 'utf8');
    let templateHTML = fs.readFileSync(paths.template, 'utf8');
    const acknowledgementsContent = fs.readFileSync(paths.acknowledgements, 'utf8');
    
    const profile = profileData.profile;
    
    // 2. Compile About Page Content
    const acknowledgementsHTML = marked.parse(acknowledgementsContent);
    const aboutParagraphs = profile.about.split('\n\n').filter(p => p.trim());
    const aboutLead = `<p class="bio-lead">${aboutParagraphs[0]}</p>`;
    const aboutBody = aboutParagraphs.slice(1).map(p => `<p>${p}</p>`).join('\n    ');
    
    let pillarsHTML = '';
    for (let pillar of profile.pillars) {
        pillarsHTML += `
        <div class="pillar-card">
            <h3>${pillar.title}</h3>
            <p>${pillar.description}</p>
        </div>`;
    }
    
    let patentNoticeHTML = '';
    if (profileData.patents && profileData.patents.length > 0) {
        const patent = profileData.patents[0];
        patentNoticeHTML = `
        <div class="patent-notice-box">
            <h4>Featured Patent</h4>
            <div class="patent-title">${patent.title}</div>
            <div class="patent-number">${patent.number}</div>
            <p class="patent-text">${patent.date}. ${patent.details}</p>
            <a href="#projects" class="sleek-link" style="font-size: 0.8rem; font-family: var(--font-sans); font-weight: 700; margin-top: 0.75rem; display: inline-block;">Read the design details &rarr;</a>
        </div>`;
    }
    
    // 3. Compile Projects
    let projectsHTML = '';
    const projectFiles = fs.readdirSync(paths.projectsDir).filter(f => f.endsWith('.md'));
    for (let file of projectFiles) {
        const projPath = path.join(paths.projectsDir, file);
        const proj = parseProjectFile(projPath);
        const slug = file.replace(/\.md$/, '');
        
        let detailsBlock = '';
        let toggleBtn = '';
        
        if (proj.detailsHTML) {
            detailsBlock = `
            <div id="project-details-${slug}" class="project-details-expansion" style="display: none; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed var(--border);">
                <div class="markdown-body">
                    ${proj.detailsHTML}
                </div>
            </div>`;
            
            toggleBtn = `
            <div style="margin-top: 1.5rem;">
                <a href="javascript:void(0)" id="btn-project-${slug}" onclick="toggleProjectExpansion('${slug}')" class="btn btn-outline">Read Full Case Study &rarr;</a>
            </div>`;
        }
        
        projectsHTML += `
        <article class="project-card">
            <div class="project-header">
                <h2>${proj.title}</h2>
                <div class="project-meta">
                    <span><strong>Role:</strong> ${proj.role}</span>
                    <span><strong>Org/Company:</strong> ${proj.company}</span>
                    <span><strong>Scope:</strong> ${proj.scope}</span>
                </div>
            </div>
            <div class="markdown-body">
                ${proj.introHTML}
            </div>
            ${detailsBlock}
            ${toggleBtn}
        </article>`;
    }
    
    // 4. Compile Writing Page
    let essaysHTML = '';
    const essayFiles = fs.readdirSync(paths.essaysDir).filter(f => f.endsWith('.md'));
    const parsedEssays = essayFiles.map(file => {
        const essayPath = path.join(paths.essaysDir, file);
        return {
            ...parseEssayFile(essayPath),
            filename: file
        };
    });

    const seriesGroups = {};
    const standaloneArticles = [];

    for (let essay of parsedEssays) {
        if (essay.series) {
            if (!seriesGroups[essay.series]) {
                seriesGroups[essay.series] = [];
            }
            seriesGroups[essay.series].push(essay);
        } else {
            standaloneArticles.push(essay);
        }
    }

    // Generate HTML for Series Groups (Index Listing with Accordion)
    let hasSeries = Object.keys(seriesGroups).length > 0;
    if (hasSeries) {
        essaysHTML += `
        <h2 class="section-title">Series & Deep Dives</h2>
        `;
    }

    for (let seriesName in seriesGroups) {
        // Sort by seriesPart ascending to find order
        seriesGroups[seriesName].sort((a, b) => (a.seriesPart || 0) - (b.seriesPart || 0));
        
        // Featured essay is the latest in the series (highest part number)
        const featuredEssay = seriesGroups[seriesName][seriesGroups[seriesName].length - 1];
        const featuredSlug = featuredEssay.filename.replace(/\.md$/, '');
        const seriesId = `series-${seriesName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
        
        essaysHTML += `
        <div id="${seriesId}" class="series-container" style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span class="skill-tag" style="background: var(--accent-light); color: var(--accent); border-color: var(--accent); font-weight: 700; margin: 0; padding: 0.25rem 0.6rem; border-radius: 4px;">Series</span>
                <h3 style="font-family: var(--font-sans); font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0;">${seriesName}</h3>
            </div>
            
            <div class="essay-item" style="border-bottom: none; padding-bottom: 0; margin-bottom: 0; padding-left: 0.5rem;">
                <p class="essay-excerpt" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    ${seriesGroups[seriesName][0].excerpt || 'Explore the complete series.'}
                </p>
                <a href="#writing/${seriesId}" class="sleek-link" style="font-size: 0.825rem; font-family: var(--font-sans); font-weight: 700; color: var(--accent); display: inline-block;">Explore Series (${seriesGroups[seriesName].length} Articles) &rarr;</a>
            </div>
        </div>`;
        
        // Generate the dedicated Series View page
        let seriesPageHTML = `
        <div class="article-header" style="margin-bottom: 2.5rem;">
            <a href="#writing" class="sleek-link" style="font-size: 0.85rem; font-family: var(--font-sans); font-weight: 700; color: var(--text-muted); display: inline-block; margin-bottom: 1.5rem;">&larr; Back to Writing</a>
            <div style="margin-bottom: 1rem;"><span class="skill-tag" style="background: var(--accent-light); color: var(--accent); border-color: var(--accent); font-weight: 700; margin: 0; padding: 0.25rem 0.6rem; border-radius: 4px;">Series</span></div>
            <h1 class="article-title" style="margin-bottom: 1rem; font-size: 2.2rem; font-weight: 800;">${seriesName}</h1>
            <p style="font-size: 1.15rem; color: var(--text-secondary); line-height: 1.7;">${seriesGroups[seriesName][0].excerpt}</p>
        </div>
        <div class="article-body">
            <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; font-family: var(--font-sans); font-weight: 700;">Articles in this Series</h3>
            <div style="display: flex; flex-direction: column; gap: 2rem;">
        `;
        
        for (let essay of seriesGroups[seriesName]) {
            const essaySlug = essay.filename.replace(/\.md$/, '');
            seriesPageHTML += `
                <div style="padding-left: 1rem; border-left: 3px solid var(--border);">
                    <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.35rem;">Part ${essay.seriesPart} &bull; ${essay.date}</div>
                    <h4 style="font-family: var(--font-sans); font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;"><a href="#writing/${essaySlug}" class="sleek-link">${essay.title}</a></h4>
                    <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0;">${essay.excerpt}</p>
                </div>
            `;
        }
        
        seriesPageHTML += `
            </div>
        </div>
        `;
        
        fs.writeFileSync(path.join(paths.articlesDir, `${seriesId}.html`), seriesPageHTML, 'utf8');
        console.log(`  → articles/${seriesId}.html (Series View)`);
    }

    // Generate HTML for Standalone Articles (Index Listing)
    if (standaloneArticles.length > 0) {
        standaloneArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        essaysHTML += `
        <h2 class="section-title" style="margin-top: 2rem;">Standalone Notes</h2>
        `;
        
        for (let essay of standaloneArticles) {
            const essaySlug = essay.filename.replace(/\.md$/, '');
            essaysHTML += `
        <div class="series-container" style="margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span class="skill-tag" style="background: var(--bg-offset); color: var(--text-secondary); border-color: var(--border); font-weight: 700; margin: 0; padding: 0.25rem 0.6rem; border-radius: 4px;">Note</span>
                <h3 style="font-family: var(--font-sans); font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0;">${essay.title}</h3>
            </div>
            
            <div class="essay-item" style="border-bottom: none; padding-bottom: 0; margin-bottom: 0; padding-left: 0.5rem;">
                <p class="essay-excerpt" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    ${essay.excerpt}
                </p>
                <a href="#writing/${essaySlug}" class="sleek-link" style="font-size: 0.825rem; font-family: var(--font-sans); font-weight: 700; color: var(--accent); display: inline-block;">Read Note &rarr;</a>
            </div>
        </div>`;
        }
    }

    // 4b. Write individual article fragments to articles/ directory (lazy-loaded by client)
    if (!fs.existsSync(paths.articlesDir)) {
        fs.mkdirSync(paths.articlesDir, { recursive: true });
    }
    
    const articleManifest = [];
    
    for (let essay of parsedEssays) {
        const slug = essay.filename.replace(/\.md$/, '');
        const seriesId = essay.series ? `series-${essay.series.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}` : '';
        
        let backLink = `<a href="#writing" class="sleek-link" style="color: var(--text-secondary);">&larr; Back to Writing</a>`;
        if (essay.series) {
            backLink += ` <span style="color: var(--border); margin: 0 0.5rem;">|</span> <a href="#writing/${seriesId}" class="sleek-link" style="color: var(--accent); font-weight: 600;">&larr; Back to Series</a>`;
        }
        
        const articleHTML = `<nav style="margin-bottom: 2.5rem; font-family: var(--font-sans); font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
    ${backLink}
</nav>
<article class="markdown-body">
    <h1 style="font-size: 2.25rem; font-family: var(--font-sans); font-weight: 800; line-height: 1.25; margin-bottom: 0.5rem; letter-spacing: -0.03em;">${essay.title}</h1>
    <div class="essay-meta" style="margin-bottom: 2.5rem; font-size: 0.8rem; font-family: var(--font-sans); font-weight: 600; color: var(--text-muted); display: flex; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
        ${essay.series ? `<span><strong>Series:</strong> ${essay.series} (Part ${essay.seriesPart})</span>` : ''}
        <span><strong>Published:</strong> ${essay.date}</span>
        <span><strong>Category:</strong> ${essay.category}</span>
    </div>
    ${essay.html}
</article>`;
        
        fs.writeFileSync(path.join(paths.articlesDir, `${slug}.html`), articleHTML, 'utf8');
        console.log(`  \u2192 articles/${slug}.html`);
        
        articleManifest.push({
            slug,
            title: essay.title,
            date: essay.date,
            category: essay.category,
            series: essay.series || null,
            seriesPart: essay.seriesPart
        });
    }
    
    // Write article manifest
    fs.writeFileSync(
        path.join(paths.articlesDir, 'manifest.json'),
        JSON.stringify(articleManifest, null, 2),
        'utf8'
    );
    console.log('  \u2192 articles/manifest.json');
    
    // Compile Publications & Patents List (Sidebar on Writing Page)
    let pubListHTML = '';
    // Show patent first
    if (profileData.patents) {
        for (let patent of profileData.patents) {
            pubListHTML += `
            <li class="sidebar-item" style="margin-bottom: 1.5rem;">
                <div class="sidebar-item-title">
                    <span class="patent-number">${patent.number}</span>
                </div>
                <p class="sidebar-item-desc">
                    <strong>${patent.title}</strong><br>
                    ${patent.details} (${patent.date})
                </p>
            </li>`;
        }
    }
    // Show other publications
    if (profileData.publications) {
        for (let pub of profileData.publications) {
            pubListHTML += `
            <li class="sidebar-item" style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1rem; margin-bottom: 1.5rem;">
                <div class="sidebar-item-title">${pub.title}</div>
                <p class="sidebar-item-desc">
                    <strong>${pub.type}</strong><br>
                    ${pub.publisher}, ${pub.date}
                </p>
            </li>`;
        }
    }
    
    // 5. Compile CV / Experience page
    let cvTimelineHTML = '';
    const expFiles = fs.readdirSync(paths.experienceDir).filter(f => f.endsWith('.md')).sort();
    
    for (let file of expFiles) {
        const expPath = path.join(paths.experienceDir, file);
        const exp = parseExperienceFile(expPath);
        
        cvTimelineHTML += `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-header">
                <h3 class="timeline-role">${exp.fullTitle}</h3>
                <span class="timeline-period">${exp.period}</span>
            </div>
            <div class="timeline-company">${exp.company}</div>
            <div class="timeline-body markdown-body">
                ${exp.html}
            </div>
        </div>`;
    }
    
    // Compile CV Sidebar (Skills & Stack, Education, Certifications, Languages)
    let sidebarHTML = '';
    
    // Skills Group
    let skillsHTML = '';
    if (profileData.skills) {
        skillsHTML += `<div class="sidebar-section"><h3>Skills & Stack</h3><div style="display: flex; flex-direction: column; gap: 1.5rem;">`;
        for (let group in profileData.skills) {
            skillsHTML += `
            <div>
                <h4 style="font-family: var(--font-sans); font-size: 0.8rem; text-transform: uppercase; color: var(--accent); margin-bottom: 0.5rem; letter-spacing: 0.05em;">${group}</h4>
                <div class="skills-tags">`;
            for (let skill of profileData.skills[group]) {
                skillsHTML += `<span class="skill-tag">${skill}</span>`;
            }
            skillsHTML += `</div></div>`;
        }
        skillsHTML += `</div></div>`;
    }
    
    // Education Group
    let eduHTML = '<div class="sidebar-section"><h3>Education</h3><ul class="sidebar-list">';
    for (let edu of profileData.education) {
        eduHTML += `
        <li class="sidebar-item">
            <div class="sidebar-item-title">${edu.degree}</div>
            <p class="sidebar-item-desc">
                ${edu.institution}, ${edu.period}<br>
                Focus: ${edu.focus}
            </p>
        </li>`;
    }
    eduHTML += '</ul></div>';
    
    // Certifications Group
    let certHTML = '<div class="sidebar-section"><h3>Certifications</h3><ul class="sidebar-list">';
    for (let cert of profileData.certifications) {
        let pdfLink = '';
        if (cert.pdf) {
            pdfLink = `<br><a href="${cert.pdf}" class="sleek-link" target="_blank" style="font-size: 0.8rem; font-family: var(--font-sans); display: inline-block; margin-top: 0.35rem; font-weight: 600; color: var(--accent);">View PDF Certificate &rarr;</a>`;
        }
        certHTML += `
        <li class="sidebar-item">
            <div class="sidebar-item-title">${cert.name}</div>
            <p class="sidebar-item-desc">
                ${cert.issuer} ${cert.issue_date ? `(${cert.issue_date})` : ''}<br>
                ${cert.details}${pdfLink}
            </p>
        </li>`;
    }
    certHTML += '</ul></div>';
    
    // Languages Group
    let langHTML = '<div class="sidebar-section"><h3>Languages</h3><ul class="sidebar-list">';
    for (let lang of profile.languages) {
        langHTML += `
        <li class="sidebar-item">
            <div class="sidebar-item-title">${lang.language}</div>
            <p class="sidebar-item-desc">${lang.proficiency}</p>
        </li>`;
    }
    langHTML += '</ul></div>';
    
    sidebarHTML = skillsHTML + eduHTML + certHTML + langHTML;
    
    // 6. Replace Placeholders in template HTML
    let outputHTML = templateHTML
        .replace(/{{NAME}}/g, () => profile.name)
        .replace(/{{TITLE}}/g, () => profile.title)
        .replace(/{{BIO_SHORT}}/g, () => profile.about.split('\n\n').filter(p => p.trim()).slice(0, 2).join(' '))
        .replace(/{{ABOUT_LEAD}}/g, () => aboutLead)
        .replace(/{{ABOUT_BODY}}/g, () => aboutBody)
        .replace(/{{CV_SUMMARY}}/g, () => profile.cv_summary || profile.about)
        .replace(/{{ACKNOWLEDGEMENTS}}/g, () => acknowledgementsHTML)
        .replace(/{{PILLARS}}/g, () => pillarsHTML)
        .replace(/{{PATENT_NOTICE}}/g, () => patentNoticeHTML)
        .replace(/{{PROJECTS}}/g, () => projectsHTML)
        .replace(/{{ESSAYS}}/g, () => essaysHTML)
        .replace(/{{PUBLICATIONS_LIST}}/g, () => pubListHTML)
        .replace(/{{CV_TIMELINE}}/g, () => cvTimelineHTML)
        .replace(/{{SIDEBAR}}/g, () => sidebarHTML)
        .replace(/{{LINKEDIN}}/g, () => profile.linkedin)
        .replace(/{{GITHUB}}/g, () => profile.github)
        .replace(/{{CONTACT_ENDPOINT}}/g, () => profile.contact_endpoint || '#');
        
    // 7. Write to index.html
    fs.writeFileSync(paths.output, outputHTML, 'utf8');
    console.log('  \u2192 index.html');
    
    // 8. Write externalized CSS
    fs.writeFileSync(paths.stylesOutput, stylesContent, 'utf8');
    console.log('  \u2192 styles.css');
    
    // 9. Write PWA manifest
    const pwaManifest = {
        name: `${profile.name} | Portfolio`,
        short_name: profile.name.split(' ')[0],
        description: profile.title,
        start_url: './',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#09090b',
        icons: []
    };
    fs.writeFileSync(paths.manifestOutput, JSON.stringify(pwaManifest, null, 2), 'utf8');
    console.log('  \u2192 manifest.json');
    
    // 10. Write service worker with cache-busting version
    const buildTimestamp = Date.now();
    const articleSlugs = articleManifest.map(a => `'./articles/${a.slug}.html'`).join(',\n        ');
    const swContent = `// Service Worker — Auto-generated by build.js
// Cache version: ${buildTimestamp}
const CACHE_VERSION = 'hafis-fyi-v${buildTimestamp}';

const CORE_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
];

// Article fragments — cached on first access (runtime caching)
const ARTICLE_ASSETS = [
    ${articleSlugs}
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then(cache => cache.addAll(CORE_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Skip non-GET requests (e.g. contact form POST)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request).then(response => {
                if (response.status === 200) {
                    const url = new URL(event.request.url);
                    const shouldCache = url.pathname.includes('/articles/') ||
                                        url.pathname.endsWith('.css') ||
                                        url.pathname.endsWith('.js') ||
                                        url.origin !== self.location.origin;

                    if (shouldCache) {
                        const clone = response.clone();
                        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
                    }
                }
                return response;
            });
        }).catch(() => {
            // Offline fallback: serve cached index for navigation requests
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});
`;
    fs.writeFileSync(paths.swOutput, swContent, 'utf8');
    console.log('  \u2192 sw.js');
    
    console.log('\nSite compiled successfully!');
}

main();
