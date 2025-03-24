import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Note } from '../../types';
import { FaSave, FaEye, FaEdit, FaTags, FaClock, FaFont, FaHeading, FaListUl, FaListOl, FaCode, FaQuoteLeft, FaLink, FaImage, FaFileAlt } from 'react-icons/fa';
// @ts-ignore - React Markdown types issue
import ReactMarkdown from 'react-markdown';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #121212;
  overflow: hidden;
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #252526;
  border-bottom: 1px solid #333;
`;

const Title = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 4px;
  font-size: 0.8rem;
  color: #888;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px;
  
  svg {
    margin-right: 4px;
    font-size: 0.9rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: #ccc;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  font-weight: 500;

  &:hover {
    background-color: #444;
  }

  &.primary {
    background-color: #FF385C;
    color: white;
    border: none;

    &:hover {
      background-color: #e63054;
    }
  }

  svg {
    margin-right: 6px;
    font-size: 0.9rem;
  }
`;

const EditorContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #252526;
  border-bottom: 1px solid #333;
  overflow-x: auto;
  gap: 4px;
  
  &::-webkit-scrollbar {
    height: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #444;
    border-radius: 10px;
  }
`;

const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  color: #ccc;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #333;
    color: #fff;
  }
  
  &.active {
    background-color: rgba(255, 56, 92, 0.2);
    color: #FF385C;
  }
`;

const ToolbarDivider = styled.div`
  width: 1px;
  height: 20px;
  background-color: #444;
  margin: 0 6px;
`;

const TextEditor = styled.textarea`
  flex: 1;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  border: none;
  resize: none;
  overflow-y: auto;
  background-color: #121212;
  color: #eee;

  &:focus {
    outline: none;
  }
  
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
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  text-align: center;
  padding: 20px;
  
  svg {
    font-size: 48px;
    color: #FF385C;
    opacity: 0.7;
    margin-bottom: 16px;
  }
  
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: #ddd;
  }
  
  p {
    max-width: 400px;
    line-height: 1.5;
  }
`;

interface NoteEditorProps {
  note: Note | null;
  onSave: (updatedNote: Note) => void;
  hideHeader?: boolean;
  autoSave?: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, hideHeader = false, autoSave = false }) => {
  const [content, setContent] = useState('');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (note) {
      setContent(note.content);
    } else {
      setContent('');
    }
  }, [note]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (autoSave && note) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        onSave({
          ...note,
          content: newContent,
          updatedAt: Date.now(),
        });
      }, 300);
    }
  };

  const handleSave = () => {
    if (note) {
      onSave({
        ...note,
        content,
        updatedAt: Date.now(),
      });
    }
  };
  
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  const insertMarkdown = (markdownSymbol: string, placeholder: string = '') => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    if (selectedText) {
      newText = content.substring(0, start) + markdownSymbol + selectedText + markdownSymbol + content.substring(end);
    } else {
      newText = content.substring(0, start) + markdownSymbol + placeholder + markdownSymbol + content.substring(end);
    }
    
    setContent(newText);
    
    setTimeout(() => {
      if (!editorRef.current) return;
      
      if (selectedText) {
        editorRef.current.selectionStart = start + markdownSymbol.length;
        editorRef.current.selectionEnd = end + markdownSymbol.length;
      } else {
        const cursorPos = start + markdownSymbol.length;
        editorRef.current.selectionStart = cursorPos;
        editorRef.current.selectionEnd = cursorPos + placeholder.length;
      }
      editorRef.current.focus();
    }, 0);
  };
  
  const insertHeading = (level: number) => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    const prefix = '#'.repeat(level) + ' ';
    
    let lineStart = start;
    while (lineStart > 0 && content[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    const currentLinePrefix = content.substring(lineStart, start);
    const hasHeadingPrefix = /^#+\s/.test(currentLinePrefix);
    
    let newText = '';
    if (hasHeadingPrefix) {
      newText = content.substring(0, lineStart) + prefix + content.substring(lineStart + currentLinePrefix.length);
    } else {
      newText = content.substring(0, lineStart) + prefix + content.substring(lineStart);
    }
    
    setContent(newText);
    
    setTimeout(() => {
      if (!editorRef.current) return;
      const newCursorPos = lineStart + prefix.length + (hasHeadingPrefix ? 0 : (end - start));
      editorRef.current.selectionStart = newCursorPos;
      editorRef.current.selectionEnd = newCursorPos;
      editorRef.current.focus();
    }, 0);
  };
  
  const insertList = (ordered: boolean) => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    const prefix = ordered ? '1. ' : '- ';
    
    let lineStart = start;
    while (lineStart > 0 && content[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    const newText = content.substring(0, lineStart) + prefix + content.substring(lineStart);
    setContent(newText);
    
    setTimeout(() => {
      if (!editorRef.current) return;
      const newCursorPos = lineStart + prefix.length;
      editorRef.current.selectionStart = newCursorPos;
      editorRef.current.selectionEnd = newCursorPos;
      editorRef.current.focus();
    }, 0);
  };
  
  const insertCodeBlock = () => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const codeBlock = "```\n" + (selectedText || "code goes here") + "\n```";
    const newText = content.substring(0, start) + codeBlock + content.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
      if (!editorRef.current) return;
      const newCursorPos = start + 4;
      editorRef.current.selectionStart = newCursorPos;
      editorRef.current.selectionEnd = newCursorPos + (selectedText ? selectedText.length : 12);
      editorRef.current.focus();
    }, 0);
  };
  
  const insertBlockquote = () => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    
    let lineStart = start;
    while (lineStart > 0 && content[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    const newText = content.substring(0, lineStart) + '> ' + content.substring(lineStart);
    setContent(newText);
    
    setTimeout(() => {
      if (!editorRef.current) return;
      const newCursorPos = lineStart + 2;
      editorRef.current.selectionStart = newCursorPos;
      editorRef.current.selectionEnd = newCursorPos;
      editorRef.current.focus();
    }, 0);
  };
  
  const insertLink = () => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const linkText = selectedText || 'link text';
    const linkUrl = 'https://example.com';
    
    const markdownLink = `[${linkText}](${linkUrl})`;
    const newText = content.substring(0, start) + markdownLink + content.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
      if (!editorRef.current) return;
      const urlStart = start + linkText.length + 3;
      editorRef.current.selectionStart = urlStart;
      editorRef.current.selectionEnd = urlStart + linkUrl.length;
      editorRef.current.focus();
    }, 0);
  };
  
  const insertImage = () => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const altText = selectedText || 'alt text';
    const imageUrl = 'https://example.com/image.jpg';
    
    const markdownImage = `![${altText}](${imageUrl})`;
    const newText = content.substring(0, start) + markdownImage + content.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
      if (!editorRef.current) return;
      const urlStart = start + altText.length + 4;
      editorRef.current.selectionStart = urlStart;
      editorRef.current.selectionEnd = urlStart + imageUrl.length;
      editorRef.current.focus();
    }, 0);
  };

  if (!note) {
    return (
      <EditorContainer>
        <EmptyState>
          <FaFileAlt />
          <h3>No Note Selected</h3>
          <p>Select a note from the sidebar or create a new one to get started with your markdown notes.</p>
        </EmptyState>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      {!hideHeader && (
        <EditorHeader>
          <div>
            <Title>{note.title}</Title>
            <MetaInfo>
              <MetaItem>
                <FaClock />
                <span>Updated {formatDate(note.updatedAt)}</span>
              </MetaItem>
              {note.tags && note.tags.length > 0 && (
                <MetaItem>
                  <FaTags />
                  <span>{note.tags.join(', ')}</span>
                </MetaItem>
              )}
            </MetaInfo>
          </div>
          <Actions>
            <ActionButton 
              className="primary" 
              onClick={handleSave}
              title="Save"
            >
              <FaSave />
              Save
            </ActionButton>
          </Actions>
        </EditorHeader>
      )}
      <EditorContent>
        <Toolbar>
          <ToolbarButton title="Bold" onClick={() => insertMarkdown('**', 'bold')}>
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton title="Italic" onClick={() => insertMarkdown('*', 'italic')}>
            <em>I</em>
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton title="Heading 1" onClick={() => insertHeading(1)}>
            <FaHeading />
          </ToolbarButton>
          <ToolbarButton title="Heading 2" onClick={() => insertHeading(2)}>
            <FaHeading style={{ fontSize: '0.85em' }} />
          </ToolbarButton>
          <ToolbarButton title="Heading 3" onClick={() => insertHeading(3)}>
            <FaHeading style={{ fontSize: '0.7em' }} />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton title="Bulleted List" onClick={() => insertList(false)}>
            <FaListUl />
          </ToolbarButton>
          <ToolbarButton title="Numbered List" onClick={() => insertList(true)}>
            <FaListOl />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton title="Code Block" onClick={insertCodeBlock}>
            <FaCode />
          </ToolbarButton>
          <ToolbarButton title="Blockquote" onClick={insertBlockquote}>
            <FaQuoteLeft />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton title="Link" onClick={insertLink}>
            <FaLink />
          </ToolbarButton>
          <ToolbarButton title="Image" onClick={insertImage}>
            <FaImage />
          </ToolbarButton>
        </Toolbar>
        <TextEditor
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Write your markdown notes here..."
        />
      </EditorContent>
    </EditorContainer>
  );
};

export default NoteEditor; 