# PDF Certificates Folder

Place your PDF certificate files in this folder with the following exact filenames to enable the "View PDF Certificate" links on your website:

1. **TÜV SÜD Functional Safety Engineer Certificate:**
   - Filename: `tuv-sud-fusa.pdf`
   - Path: `assets/certificates/tuv-sud-fusa.pdf`

2. **Biricha Digital Power EMC Filter Design Certificate:**
   - Filename: `biricha-emc-filter-design.pdf`
   - Path: `assets/certificates/biricha-emc-filter-design.pdf`

3. **HF magic Lab S.L Design for EMI/EMC Certificate:**
   - Filename: `hf-magic-lab-emi-emc.pdf`
   - Path: `assets/certificates/hf-magic-lab-emi-emc.pdf`

If you have other certificates you'd like to add in the future:
1. Copy the PDF to this folder.
2. Update the corresponding certification object in `content/profile.json` to include:
   `"pdf": "assets/certificates/your-certificate-name.pdf"`
3. Run `npm run build` to compile the website.
