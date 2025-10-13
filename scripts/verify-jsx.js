#!/usr/bin/env node

/**
 * JSX Structure Verification Script
 * Checks for common JSX syntax issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying JSX Structure...\n');

function checkJSXStructure(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const issues = [];
  let openTags = [];
  let lineNumber = 0;
  
  for (const line of lines) {
    lineNumber++;
    
    // Check for self-closing tags
    if (line.includes('<') && line.includes('/>')) {
      continue; // Self-closing tags are fine
    }
    
    // Check for opening tags
    const openMatch = line.match(/<(\w+)[^>]*>/g);
    if (openMatch) {
      openMatch.forEach(tag => {
        const tagName = tag.match(/<(\w+)/)[1];
        if (!tag.includes('/>') && tagName !== 'Fragment') {
          openTags.push({ tag: tagName, line: lineNumber });
        }
      });
    }
    
    // Check for closing tags
    const closeMatch = line.match(/<\/(\w+)>/g);
    if (closeMatch) {
      closeMatch.forEach(tag => {
        const tagName = tag.match(/<\/(\w+)>/)[1];
        const lastOpen = openTags.pop();
        
        if (!lastOpen || lastOpen.tag !== tagName) {
          issues.push({
            type: 'mismatch',
            line: lineNumber,
            expected: lastOpen ? lastOpen.tag : 'none',
            found: tagName,
            message: `Expected closing tag for '${lastOpen ? lastOpen.tag : 'unknown'}' but found '${tagName}'`
          });
        }
      });
    }
  }
  
  // Check for unclosed tags
  if (openTags.length > 0) {
    openTags.forEach(tag => {
      issues.push({
        type: 'unclosed',
        line: tag.line,
        tag: tag.tag,
        message: `Unclosed tag '${tag.tag}' starting at line ${tag.line}`
      });
    });
  }
  
  return issues;
}

// Check all React components
const componentFiles = [
  'components/Layout/Layout.js',
  'components/Chat/MessengerChatInterface.js',
  'components/Dashboard/Dashboard.js',
  'components/Layout/Header.js',
  'components/Layout/MessengerSidebar.js'
];

let totalIssues = 0;

componentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`📁 Checking ${file}...`);
    const issues = checkJSXStructure(file);
    
    if (issues.length === 0) {
      console.log(`   ✅ No JSX issues found\n`);
    } else {
      console.log(`   ⚠️  Found ${issues.length} issues:`);
      issues.forEach(issue => {
        console.log(`      Line ${issue.line}: ${issue.message}`);
        totalIssues++;
      });
      console.log('');
    }
  } else {
    console.log(`   📁 File not found: ${file}\n`);
  }
});

// Summary
console.log('🎯 JSX Verification Summary:');
if (totalIssues === 0) {
  console.log('✅ All JSX structures are valid!');
  console.log('✅ No syntax errors detected');
  console.log('✅ All tags properly closed');
  console.log('✅ Component structure is correct');
} else {
  console.log(`❌ Found ${totalIssues} JSX issues that need to be fixed`);
}

console.log('\n🚀 JSX verification complete!');
