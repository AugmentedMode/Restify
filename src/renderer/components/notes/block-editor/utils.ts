import { v4 as uuidv4 } from 'uuid';
import { BlockData, BlockType } from './types';

/**
 * Parse markdown content into block data structure
 */
export const parseContentToBlocks = (markdown: string): BlockData[] => {
  if (!markdown.trim()) {
    return [
      {
        id: uuidv4(),
        type: BlockType.Paragraph,
        content: '',
        level: 0
      }
    ];
  }

  // Split by double newlines to find block boundaries, then process each block
  const rawBlocks = markdown.split(/\n\n+/);
  const blocks: BlockData[] = [];
  
  // Process each raw block
  for (let i = 0; i < rawBlocks.length; i++) {
    const blockContent = rawBlocks[i].trim();
    
    if (!blockContent) continue;
    
    // Process the block content - check first line
    const lines = blockContent.split('\n');
    const firstLine = lines[0].trim();
    
    // Heading 1
    if (firstLine.startsWith('# ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.Heading1,
        content: firstLine.substring(2).trim(),
        level: 1
      });
    }
    // Heading 2
    else if (firstLine.startsWith('## ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.Heading2,
        content: firstLine.substring(3).trim(),
        level: 2
      });
    }
    // Heading 3
    else if (firstLine.startsWith('### ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.Heading3,
        content: firstLine.substring(4).trim(),
        level: 3
      });
    }
    // Todo items (checked)
    else if (firstLine.startsWith('- [x]') || firstLine.startsWith('* [x]')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.ToDo,
        content: firstLine.substring(5).trim(),
        checked: true
      });
    }
    // Todo items (unchecked) - must check this before regular bullet list
    else if (firstLine.startsWith('- [ ]') || firstLine.startsWith('* [ ]')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.ToDo,
        content: firstLine.substring(5).trim(),
        checked: false
      });
    }
    // Bullet list
    else if (firstLine.startsWith('- ') || firstLine.startsWith('* ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.BulletList,
        content: firstLine.substring(2).trim(),
        level: 0
      });
    }
    // Numbered list
    else if (/^\d+\.\s/.test(firstLine)) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.NumberedList,
        content: firstLine.replace(/^\d+\.\s/, '').trim(),
        level: 0
      });
    }
    // Quote
    else if (firstLine.startsWith('> ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.Quote,
        content: firstLine.substring(2).trim()
      });
    }
    // Code block
    else if (firstLine.startsWith('```')) {
      const language = firstLine.substring(3).trim();
      
      // Join the rest of the lines except for the closing ```
      const codeLines = lines.slice(1);
      let codeContent = '';
      let foundClosing = false;
      
      for (let j = 0; j < codeLines.length; j++) {
        if (codeLines[j].trim() === '```') {
          foundClosing = true;
          break;
        }
        codeContent += codeLines[j] + (j < codeLines.length - 1 ? '\n' : '');
      }
      
      blocks.push({
        id: uuidv4(),
        type: BlockType.Code,
        content: codeContent,
        language: language || 'plaintext'
      });
    }
    // Divider
    else if (firstLine === '---' || firstLine === '***' || firstLine === '___') {
      blocks.push({
        id: uuidv4(),
        type: BlockType.Divider,
        content: ''
      });
    }
    // Default to paragraph
    else {
      // Process multiline paragraphs
      blocks.push({
        id: uuidv4(),
        type: BlockType.Paragraph,
        content: blockContent,
        level: 0
      });
    }
  }
  
  // If no blocks were created, add a default paragraph
  if (blocks.length === 0) {
    blocks.push({
      id: uuidv4(),
      type: BlockType.Paragraph,
      content: '',
      level: 0
    });
  }
  
  return blocks;
};

/**
 * Convert block data structure back to markdown
 */
export const serializeBlocksToContent = (blocks: BlockData[]): string => {
  return blocks.map(block => {
    switch (block.type) {
      case BlockType.Heading1:
        return `# ${block.content}`;
      case BlockType.Heading2:
        return `## ${block.content}`;
      case BlockType.Heading3:
        return `### ${block.content}`;
      case BlockType.BulletList:
        return `- ${block.content}`;
      case BlockType.NumberedList:
        return `1. ${block.content}`;
      case BlockType.ToDo:
        return block.checked 
          ? `- [x] ${block.content}`
          : `- [ ] ${block.content}`;
      case BlockType.Quote:
        return `> ${block.content}`;
      case BlockType.Code:
        // Ensure code block preserves line breaks
        const codeContent = block.content || '';
        // Only add trailing newline if the content doesn't already end with one
        const trailingNewline = codeContent.endsWith('\n') ? '' : '\n';
        return `\`\`\`${block.language || ''}\n${codeContent}${trailingNewline}\`\`\``;
      case BlockType.Divider:
        return '---';
      case BlockType.Callout:
        return `> **Note:** ${block.content}`;
      case BlockType.Toggle:
        return `<details>\n<summary>${block.content}</summary>\n\n</details>`;
      case BlockType.Image:
        return block.url ? `![${block.content}](${block.url})` : '';
      case BlockType.Paragraph:
      default:
        return block.content;
    }
  }).join('\n\n');
}; 