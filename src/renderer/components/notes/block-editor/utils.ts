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

  const lines = markdown.split('\n');
  const blocks: BlockData[] = [];
  
  // Simple parsing logic - can be enhanced for more complex markdown
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines between blocks
    if (!line.trim() && i > 0 && i < lines.length - 1) {
      continue;
    }
    
    // Heading 1
    if (line.startsWith('# ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.Heading1,
        content: line.substring(2).trim(),
        level: 1
      });
    }
    // Heading 2
    else if (line.startsWith('## ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.Heading2,
        content: line.substring(3).trim(),
        level: 2
      });
    }
    // Heading 3
    else if (line.startsWith('### ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.Heading3,
        content: line.substring(4).trim(),
        level: 3
      });
    }
    // Bullet list
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.BulletList,
        content: line.substring(2).trim(),
        level: 0
      });
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.NumberedList,
        content: line.replace(/^\d+\.\s/, '').trim(),
        level: 0
      });
    }
    // To-do list
    else if (line.startsWith('- [ ] ') || line.startsWith('* [ ] ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.ToDo,
        content: line.substring(6).trim(),
        checked: false
      });
    }
    else if (line.startsWith('- [x] ') || line.startsWith('* [x] ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.ToDo,
        content: line.substring(6).trim(),
        checked: true
      });
    }
    // Quote
    else if (line.startsWith('> ')) {
      blocks.push({
        id: uuidv4(),
        type: BlockType.Quote,
        content: line.substring(2).trim()
      });
    }
    // Code block
    else if (line.startsWith('```')) {
      const language = line.substring(3).trim();
      let codeContent = '';
      let j = i + 1;
      
      // Collect all lines until the end of the code block
      while (j < lines.length && !lines[j].startsWith('```')) {
        codeContent += lines[j] + '\n';
        j++;
      }
      
      blocks.push({
        id: uuidv4(),
        type: BlockType.Code,
        content: codeContent.trim(),
        language: language || 'plaintext'
      });
      
      // Skip to the end of the code block
      i = j;
    }
    // Divider
    else if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      blocks.push({
        id: uuidv4(),
        type: BlockType.Divider,
        content: ''
      });
    }
    // Default to paragraph
    else {
      blocks.push({
        id: uuidv4(),
        type: BlockType.Paragraph,
        content: line.trim(),
        level: 0
      });
    }
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
        return `\`\`\`${block.language || ''}\n${block.content}\n\`\`\``;
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