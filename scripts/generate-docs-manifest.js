#!/usr/bin/env node
/**
 * Documentation Manifest Generator
 * 
 * Scans markdown files in the docs folder and generates a manifest JSON file
 * that the frontend can use to dynamically build the documentation menu.
 * 
 * Usage: node scripts/generate-docs-manifest.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DOCS_FOLDER = path.join(__dirname, '..', 'docs');
const OUTPUT_FILE = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'docs', 'manifest.json');

// Menu configuration - defines order and grouping
const MENU_CONFIG = {
  groups: [
    {
      id: 'core',
      title: 'Core Documentation',
      icon: '📖',
      files: [
        { id: 'INDEX', label: 'Overview', icon: '📖' },
        { id: '00-GETTING_STARTED', label: 'Getting Started', icon: '🚀' },
        { id: '01-ARCHITECTURE', label: 'Architecture', icon: '🏗️' },
        { id: '01-CRUD-DEMOS', label: 'CRUD Demos', icon: '📋' },
        { id: '02-API_REFERENCE', label: 'API Reference', icon: '📚' },
        { id: '03-SECURITY', label: 'Security', icon: '🔒' },
        { id: '04-DEVELOPMENT', label: 'Development', icon: '🛠️' },
        { id: '05-DEPLOYMENT', label: 'Deployment', icon: '📦' }
      ]
    },
    {
      id: 'reports',
      title: 'Reports & Audits',
      icon: '📊',
      folder: 'reports',
      autoDiscover: true,
      defaultIcon: '📄'
    },
    {
      id: 'demos',
      title: 'Demos & Examples',
      icon: '🎯',
      folder: 'demos',
      autoDiscover: true,
      defaultIcon: '🎮'
    },
    {
      id: 'guides',
      title: 'Guides',
      icon: '📚',
      folder: 'setup',
      autoDiscover: true,
      defaultIcon: '📝'
    }
  ]
};

/**
 * Extract title from markdown file
 */
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Extract description from markdown file (first paragraph after title)
 */
function extractDescription(content) {
  const lines = content.split('\n');
  let foundTitle = false;
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      foundTitle = true;
      continue;
    }
    
    if (foundTitle && line.trim().length > 0 && !line.startsWith('---')) {
      return line.trim().substring(0, 150);
    }
  }
  
  return null;
}

/**
 * Scan a folder for markdown files
 */
function scanFolder(folderPath, relativePath = '') {
  const files = [];
  
  if (!fs.existsSync(folderPath)) {
    console.log(`  ⚠️  Folder not found: ${folderPath}`);
    return files;
  }
  
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Skip special folders
      if (['node_modules', '.git', 'archive', 'archive-old'].includes(entry.name)) {
        continue;
      }
      
      // Recursively scan subfolders
      const subFolder = path.join(folderPath, entry.name);
      const subRelative = path.join(relativePath, entry.name);
      files.push(...scanFolder(subFolder, subRelative));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Skip manifest file itself
      if (entry.name === 'manifest.json') {
        continue;
      }
      
      const filePath = path.join(folderPath, entry.name);
      const fileName = entry.name.replace('.md', '');
      
      // Read file to extract metadata
      const content = fs.readFileSync(filePath, 'utf-8');
      const title = extractTitle(content);
      const description = extractDescription(content);
      
      files.push({
        id: relativePath ? `${relativePath}/${fileName}` : fileName,
        fileName: fileName,
        label: title || fileName.replace(/[-_]/g, ' '),
        description: description || '',
        path: relativePath ? `${relativePath}/${fileName}` : fileName,
        folder: relativePath,
        createdAt: entry.birthtime,
        updatedAt: entry.mtime
      });
    }
  }
  
  return files;
}

/**
 * Generate manifest
 */
function generateManifest() {
  console.log('📚 Documentation Manifest Generator');
  console.log('====================================');
  console.log('');
  
  const manifest = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    docsFolder: DOCS_FOLDER,
    groups: []
  };
  
  // Process each group
  for (const groupConfig of MENU_CONFIG.groups) {
    console.log(`Processing group: ${groupConfig.title}`);
    
    const group = {
      id: groupConfig.id,
      title: groupConfig.title,
      icon: groupConfig.icon,
      items: []
    };
    
    if (groupConfig.autoDiscover) {
      // Auto-discover files in folder
      const folderPath = groupConfig.folder 
        ? path.join(DOCS_FOLDER, groupConfig.folder)
        : DOCS_FOLDER;
      
      const files = scanFolder(folderPath);
      
      for (const file of files) {
        group.items.push({
          id: file.id,
          label: file.label,
          icon: groupConfig.defaultIcon || '📄',
          path: groupConfig.folder ? `${groupConfig.folder}/${file.fileName}` : file.fileName,
          description: file.description,
          updatedAt: file.updatedAt
        });
      }
      
      console.log(`  ✓ Found ${files.length} file(s)`);
    } else if (groupConfig.files) {
      // Use configured files
      for (const fileConfig of groupConfig.files) {
        const filePath = path.join(DOCS_FOLDER, `${fileConfig.id}.md`);
        
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const description = extractDescription(content);
          
          group.items.push({
            id: fileConfig.id,
            label: fileConfig.label,
            icon: fileConfig.icon || '📄',
            path: `${fileConfig.id}.md`,
            description: description || '',
            updatedAt: fs.statSync(filePath).mtime
          });
        } else {
          console.log(`  ⚠️  File not found: ${fileConfig.id}.md`);
        }
      }
      
      console.log(`  ✓ Added ${group.items.length} configured file(s)`);
    }
    
    manifest.groups.push(group);
  }
  
  // Also add a flat list of all docs for easy access
  console.log('');
  console.log('Scanning all docs...');
  const allFiles = scanFolder(DOCS_FOLDER);
  manifest.allDocs = allFiles.map(file => ({
    id: file.id,
    label: file.label,
    path: `${file.folder ? file.folder + '/' : ''}${file.fileName}.md`,
    group: file.folder || 'core',
    description: file.description,
    updatedAt: file.updatedAt
  }));
  
  console.log(`  ✓ Total: ${allFiles.length} file(s)`);
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write manifest
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  
  console.log('');
  console.log(`✅ Manifest generated: ${OUTPUT_FILE}`);
  console.log(`📊 Total groups: ${manifest.groups.length}`);
  console.log(`📄 Total documents: ${manifest.allDocs.length}`);
  console.log('');
  
  return manifest;
}

// Run generator
generateManifest();
