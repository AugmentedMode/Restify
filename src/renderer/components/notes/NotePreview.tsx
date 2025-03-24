import React from 'react';
import styled from 'styled-components';
// @ts-ignore - React Markdown types issue
import ReactMarkdown from 'react-markdown';

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
  return (
    <PreviewContainer>
      <Header>
        Preview
        {title && <PreviewTitle>{title}</PreviewTitle>}
      </Header>
      <Content>
        <ReactMarkdown>{content}</ReactMarkdown>
      </Content>
    </PreviewContainer>
  );
};

export default NotePreview; 