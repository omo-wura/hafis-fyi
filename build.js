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
    output: path.join(__dirname, 'index.html')
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
        if (lines[i].startsWith('---') || lines[i].startsWith('##')) {
            bodyStartIndex = i;
            break;
        }
    }
    
    const bodyContent = lines.slice(bodyStartIndex).join('\n');
    const htmlContent = processCodeBlocks(marked.parse(bodyContent));
    
    return {
        title,
        company,
        role,
        scope,
        compliance,
        html: htmlContent
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
        if (lines[i].startsWith('---') || lines[i].startsWith('##')) {
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
    const aboutLead = `<p class="bio-lead">${profile.about.split('. ').slice(0, 2).join('. ') + '.'}</p>`;
    const aboutBody = `<p>${profile.about.split('. ').slice(2).join('. ')}</p>
    <p>Before my work in industry, I conducted research at the University of Manitoba's Renewable Energy Interface and Grid Automation Laboratory (RIGA Lab), focusing on single-stage solar micro-inverters, and served as Lead Avionics Developer for the IRIS CubeSat satellite mission.</p>`;
    
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
                ${proj.html}
            </div>
        </article>`;
    }
    
    // 4. Compile Writing Page
    let essaysHTML = '';
    let fullArticlesHTML = '';
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
    for (let seriesName in seriesGroups) {
        // Sort by seriesPart ascending to find order
        seriesGroups[seriesName].sort((a, b) => (a.seriesPart || 0) - (b.seriesPart || 0));
        
        // Featured essay is the latest in the series (highest part number)
        const featuredEssay = seriesGroups[seriesName][seriesGroups[seriesName].length - 1];
        const featuredSlug = featuredEssay.filename.replace(/\.md$/, '');
        const seriesId = `series-${seriesName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
        
        essaysHTML += `
        <div id="${seriesId}" class="series-container" style="margin-bottom: 3.5rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
                <span class="skill-tag" style="background: var(--accent-light); color: var(--accent); border-color: var(--accent); font-weight: 700; margin: 0; padding: 0.25rem 0.6rem; border-radius: 4px;">Series</span>
                <h3 style="font-family: var(--font-sans); font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0;">${seriesName}</h3>
            </div>
            
            <!-- Featured Latest Post -->
            <div class="essay-item" style="border-bottom: none; padding-bottom: 0; margin-bottom: 0; padding-left: 0.5rem;">
                <div style="font-family: var(--font-sans); font-size: 0.7rem; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Latest Entry &bull; Part ${featuredEssay.seriesPart}</div>
                <h4 style="font-family: var(--font-sans); font-size: 1.15rem; font-weight: 700; margin-bottom: 0.35rem;">
                    <a href="#writing/${featuredSlug}" class="sleek-link">${featuredEssay.title}</a>
                </h4>
                <div class="essay-meta" style="margin-bottom: 0.75rem; font-size: 0.75rem; font-family: var(--font-sans); font-weight: 600; color: var(--text-muted); display: flex; gap: 1rem;">
                    <span>Published: ${featuredEssay.date}</span>
                    <span>Category: ${featuredEssay.category}</span>
                </div>
                <p class="essay-excerpt" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    ${featuredEssay.excerpt}
                </p>
                <a href="#writing/${featuredSlug}" class="sleek-link" style="font-size: 0.825rem; font-family: var(--font-sans); font-weight: 700; color: var(--accent); display: inline-block;">Read Full Article &rarr;</a>
                
                <!-- Explore Series Accordion Toggle -->
                ${(() => {
                    const previousEssays = seriesGroups[seriesName].slice(0, -1);
                    if (previousEssays.length === 0) return '';
                    
                    let accordionHTML = `
                    <div style="margin-top: 1.25rem;">
                        <a href="javascript:void(0)" id="btn-explore-expand-${seriesId}" onclick="toggleSeriesExpansion('expand-${seriesId}')" class="explore-series-btn" style="font-family: var(--font-sans); font-size: 0.825rem; font-weight: 600; color: var(--text-muted); display: inline-flex; align-items: center; gap: 0.25rem; text-decoration: none;">
                            Explore Series (${previousEssays.length} More Article${previousEssays.length > 1 ? 's' : ''}) <span class="arrow" style="display: inline-block; font-size: 0.65rem; transition: transform 0.2s;">&#9662;</span>
                        </a>
                        
                        <div id="expand-${seriesId}" style="display: none; margin-top: 1rem; padding-left: 1.25rem; border-left: 2px solid var(--border); display: flex; flex-direction: column; gap: 1.25rem;">`;
                        
                    for (let essay of previousEssays) {
                        const essaySlug = essay.filename.replace(/\.md$/, '');
                        accordionHTML += `
                            <div style="font-size: 0.95rem;">
                                <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.15rem;">Part ${essay.seriesPart} &bull; ${essay.date}</div>
                                <h5 style="font-family: var(--font-sans); font-size: 0.975rem; font-weight: 700; margin-bottom: 0.15rem; line-height: 1.3;">
                                    <a href="#writing/${essaySlug}" class="sleek-link">${essay.title}</a>
                                </h5>
                                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0; line-height: 1.5;">${essay.excerpt}</p>
                            </div>`;
                    }
                    
                    accordionHTML += `
                        </div>
                    </div>`;
                    
                    return accordionHTML;
                })()}
            </div>
        </div>`;
    }

    // Generate HTML for Standalone Articles (Index Listing)
    if (standaloneArticles.length > 0) {
        standaloneArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        essaysHTML += `
        <div class="standalone-articles-container" style="margin-top: 3.5rem;">
            <h3 style="font-family: var(--font-sans); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem;">
                Standalone Articles
            </h3>
            <div style="display: flex; flex-direction: column; gap: 2.5rem;">`;
            
        for (let essay of standaloneArticles) {
            const essaySlug = essay.filename.replace(/\.md$/, '');
            essaysHTML += `
            <div class="essay-item" style="border-bottom: 1px solid var(--border); padding-bottom: 2.5rem; padding-left: 0.5rem;">
                <h3 style="font-family: var(--font-sans); font-size: 1.25rem; font-weight: 700; margin-bottom: 0.35rem;">
                    <a href="#writing/${essaySlug}" class="sleek-link">${essay.title}</a>
                </h3>
                <div class="essay-meta" style="margin-bottom: 0.75rem; font-size: 0.75rem; font-family: var(--font-sans); font-weight: 600; color: var(--text-muted); display: flex; gap: 1rem;">
                    <span>Published: ${essay.date}</span>
                    <span>Category: ${essay.category}</span>
                </div>
                <p class="essay-excerpt" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    ${essay.excerpt}
                </p>
                <a href="#writing/${essaySlug}" class="sleek-link" style="font-size: 0.825rem; font-family: var(--font-sans); font-weight: 700; color: var(--accent); display: inline-block;">Read Full Article &rarr;</a>
            </div>`;
        }
        
        essaysHTML += `
            </div>
        </div>`;
    }

    // Generate HTML for Full Article Pages (Loaded Hidden in SPA Reader)
    for (let essay of parsedEssays) {
        const slug = essay.filename.replace(/\.md$/, '');
        const articleId = `article-${slug}`;
        const seriesId = essay.series ? `series-${essay.series.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}` : '';
        
        let backLink = `<a href="#writing" class="sleek-link" style="color: var(--text-secondary);">&larr; Back to Writing</a>`;
        if (essay.series) {
            backLink += ` <span style="color: var(--border); margin: 0 0.5rem;">|</span> <a href="javascript:void(0)" onclick="goBackToSeries('${seriesId}')" class="sleek-link" style="color: var(--accent); font-weight: 600;">&larr; Back to Series</a>`;
        }
        
        fullArticlesHTML += `
        <div id="${articleId}" class="full-article-page" style="display: none;">
            <nav style="margin-bottom: 2.5rem; font-family: var(--font-sans); font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
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
            </article>
        </div>`;
    }
    
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
        .replace(/{{BIO_SHORT}}/g, () => profile.about.substring(0, 150) + '...')
        .replace(/{{ABOUT_LEAD}}/g, () => aboutLead)
        .replace(/{{ABOUT_BODY}}/g, () => aboutBody)
        .replace(/{{ACKNOWLEDGEMENTS}}/g, () => acknowledgementsHTML)
        .replace(/{{PILLARS}}/g, () => pillarsHTML)
        .replace(/{{PATENT_NOTICE}}/g, () => patentNoticeHTML)
        .replace(/{{PROJECTS}}/g, () => projectsHTML)
        .replace(/{{ESSAYS}}/g, () => essaysHTML)
        .replace(/{{FULL_ARTICLES}}/g, () => fullArticlesHTML)
        .replace(/{{PUBLICATIONS_LIST}}/g, () => pubListHTML)
        .replace(/{{CV_TIMELINE}}/g, () => cvTimelineHTML)
        .replace(/{{SIDEBAR}}/g, () => sidebarHTML)
        .replace(/{{STYLES}}/g, () => stylesContent)
        .replace(/{{LINKEDIN}}/g, () => profile.linkedin)
        .replace(/{{GITHUB}}/g, () => profile.github);
        
    // 7. Write to index.html
    fs.writeFileSync(paths.output, outputHTML, 'utf8');
    console.log('Site compiled successfully to index.html!');
}

main();
