import React from 'react';
import styled from 'styled-components';
// @ts-ignore - React Markdown types issue
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #121212;
  color: #f1f1f1;
  
  @media (max-width: 1200px) {
    border-top: 1px solid #333;
  }
`;

const Header = styled.div`
  padding: 8px 16px;
  background-color: #252526;
  border-bottom: 1px solid #333;
  font-size: 0.9rem;
  font-weight: 500;
  color: #ccc;
  display: flex;
  align-items: center;
`;

const PreviewTitle = styled.div`
  margin-left: 12px;
  font-size: 0.95rem;
  color: #bbb;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  line-height: 1.6;
  background-color: #121212;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #444;
    border-radius: 10px;
    border: 2px solid #121212;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.75em;
    color: #fff;
    font-weight: 600;
    line-height: 1.2;
  }
  
  h1 {
    font-size: 2em;
    border-bottom: 1px solid #333;
    padding-bottom: 0.3em;
  }
  
  h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #333;
    padding-bottom: 0.3em;
  }
  
  h3 {
    font-size: 1.25em;
  }

  p {
    margin-bottom: 1.2em;
    color: #ddd;
  }

  ul, ol {
    margin-bottom: 1.2em;
    padding-left: 2em;
    color: #ddd;
  }
  
  li {
    margin-bottom: 0.5em;
  }
  
  /* Style for task list items */
  input[type="checkbox"] {
    margin-right: 8px;
    position: relative;
    top: 2px;
  }
  
  /* Add a class for task list items to style them properly */
  .task-list-item {
    display: flex;
    align-items: flex-start;
    list-style-type: none;
    margin-left: -20px;
  }
  
  .task-list-item-checkbox {
    margin-right: 8px;
    appearance: none;
    width: 16px;
    height: 16px;
    border: 1px solid #555;
    border-radius: 3px;
    background-color: #252525;
    position: relative;
    top: 3px;
    cursor: pointer;
  }
  
  .task-list-item-checkbox:checked {
    background-color: #FF385C;
    border-color: #FF385C;
  }
  
  .task-list-item-checkbox:checked::after {
    content: '✓';
    position: absolute;
    color: white;
    font-size: 10px;
    left: 2px;
    top: -1px;
  }

  code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    background-color: #2b2b2b;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
    color: #FF385C;
  }

  pre {
    background-color: #2b2b2b;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 1.2em;
    border: 1px solid #333;
    
    code {
      background-color: transparent;
      padding: 0;
      color: #ccc;
    }
  }

  blockquote {
    border-left: 4px solid #FF385C;
    padding: 0.5em 1em;
    margin-left: 0;
    margin-bottom: 1.2em;
    background-color: rgba(255, 56, 92, 0.1);
    border-radius: 0 4px 4px 0;
    color: #ccc;
    
    p {
      margin-bottom: 0;
    }
  }

  a {
    color: #FF385C;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 1em 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1.2em;
    
    th, td {
      border: 1px solid #333;
      padding: 10px 14px;
    }
    
    th {
      background-color: #2b2b2b;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background-color: #252525;
    }
    
    tr:hover {
      background-color: #2d2d2d;
    }
  }
  
  hr {
    border: none;
    border-top: 1px solid #333;
    margin: 2em 0;
  }
`;

interface NotePreviewProps {
  content: string;
  title?: string;
}

const NotePreview: React.FC<NotePreviewProps> = ({ content, title }) => {
  // Function to process the markdown and handle task lists
  const processTaskLists = (markdown: string): string => {
    // Use a more comprehensive regex to match task list items
    // This pattern looks for:
    // - beginning of a line or after a newline
    // - optional whitespace
    // - a hyphen or asterisk
    // - whitespace
    // - square brackets with optional space or 'x' inside
    // - whitespace
    // - the rest of the line = the task text
    const taskListItemPattern = /^(\s*)[-*]\s*\[([ x])\]\s*(.+)$/gm;
    
    return markdown.replace(
      taskListItemPattern, 
      (match, indent, checked, text) => {
        const checkedAttr = checked === 'x' ? ' checked' : '';
        return `${indent}- <div class="task-list-item"><input type="checkbox"${checkedAttr} class="task-list-item-checkbox" disabled />${text}</div>`;
      }
    );
  };

  return (
    <PreviewContainer>
      <Header>
        Preview
        {title && <PreviewTitle>{title}</PreviewTitle>}
      </Header>
      <Content>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {processTaskLists(content)}
        </ReactMarkdown>
      </Content>
    </PreviewContainer>
  );
};

export default NotePreview; 