import React from 'react';
import { 
  FaCode, 
  FaPlus, 
  FaFileImport, 
  FaBookmark, 
  FaHistory, 
  FaStickyNote, 
  FaColumns, 
  FaCog,
  FaKey,
  FaGithub
} from 'react-icons/fa';
import { EmptyStateContainer, FeatureCard } from '../styles/StyledComponents';

interface HomeProps {
  onCreateCollection: () => void;
  onImportFromFile?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToSecrets?: () => void;
  onNavigateToKanban?: () => void;
  onNavigateToGitHub?: () => void;
}

const Home: React.FC<HomeProps> = ({
  onCreateCollection,
  onImportFromFile,
  onNavigateToSettings,
  onNavigateToSecrets,
  onNavigateToKanban,
  onNavigateToGitHub
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      padding: '20px'
    }}>
      <FaCode size={64} color="#FF385C" />
      <h1 style={{ marginTop: '10px', fontSize: '2.5rem' }}>Restify</h1>
      <p style={{ 
        marginTop: '0px', 
        fontSize: '1.2rem', 
        color: '#666',
        marginBottom: '40px' 
      }}>
        A chill API client for chill people.
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '20px',
        width: '80%',
        maxWidth: '800px'
      }}>
        {/* API Testing Section */}
        <FeatureCard>
          <h3><FaBookmark style={{ marginRight: '10px' }} /> API Collections</h3>
          <p>Organize and manage your API requests in collections.</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="button" onClick={onCreateCollection} className="primary-button">
              <FaPlus /> New Collection
            </button>
            {onImportFromFile && (
              <button type="button" onClick={onImportFromFile} className="secondary-button">
                <FaFileImport /> Import
              </button>
            )}
          </div>
        </FeatureCard>

        {/* Kanban Board Section */}
        <FeatureCard>
          <h3><FaColumns style={{ marginRight: '10px' }} /> Kanban Board</h3>
          <p>Track your API development tasks with a visual board.</p>
          {onNavigateToKanban && (
            <button type="button" onClick={onNavigateToKanban} className="secondary-button">
              Open Kanban
            </button>
          )}
        </FeatureCard>

        {/* Secrets Manager Section */}
        <FeatureCard>
          <h3><FaKey style={{ marginRight: '10px' }} /> Secrets Manager</h3>
          <p>Securely store and manage API keys and environment variables.</p>
          {onNavigateToSecrets && (
            <button type="button" onClick={onNavigateToSecrets} className="secondary-button">
              Manage Secrets
            </button>
          )}
        </FeatureCard>

        {/* GitHub Integration Section */}
        <FeatureCard>
          <h3><FaGithub style={{ marginRight: '10px' }} /> GitHub Integration</h3>
          <p>Connect to GitHub to manage repositories and PRs.</p>
          {onNavigateToGitHub && (
            <button type="button" onClick={onNavigateToGitHub} className="secondary-button">
              Connect GitHub
            </button>
          )}
        </FeatureCard>
      </div>

      {/* Settings Link */}
      {onNavigateToSettings && (
        <div style={{ marginTop: '30px' }}>
          <button 
            type="button" 
            onClick={onNavigateToSettings} 
            className="text-button"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <FaCog style={{ marginRight: '8px' }} /> Configure Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default Home; 