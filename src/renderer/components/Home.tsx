import React, { useState, useEffect } from 'react';
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
  FaGithub,
  FaChartBar,
  FaBolt,
  FaArrowRight,
  FaExternalLinkAlt,
  FaCodeBranch,
  FaExchangeAlt,
  FaCheck,
  FaClipboardCheck,
  FaCode as FaCodeCommit
} from 'react-icons/fa';
import styled from 'styled-components';
import githubService from '../services/GitHubService';
import useRequestHistory from '../hooks/useRequestHistory';

interface HomeProps {
  onCreateCollection: () => void;
  onImportFromFile?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToSecrets?: () => void;
  onNavigateToKanban?: () => void;
  onNavigateToGitHub?: () => void;
}

// Styled components for the dashboard
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  background-color: #121212;
  color: #e0e0e0;
`;

const DashboardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

const AppLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: auto;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #222222;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #FF385C;
  }
  
  svg {
    font-size: 16px;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricsCard = styled.div`
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  height: auto;
  min-height: 220px;
  
  h3 {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 20px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
`;

const WideCard = styled(MetricsCard)`
  grid-column: 1 / span 3;
  
  @media (max-width: 1200px) {
    grid-column: 1 / span 2;
  }
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const MediumCard = styled(MetricsCard)`
  grid-column: span 2;
  
  @media (max-width: 1200px) {
    grid-column: span 1;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatItem = styled.div`
  background-color: #222222;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  
  .label {
    font-size: 14px;
    color: #999;
    margin-bottom: 8px;
  }
  
  .value {
    font-size: 28px;
    font-weight: bold;
    color: #fff;
  }
`;

const GitHubStatsItem = styled(StatItem)`
  position: relative;
  overflow: hidden;
  
  .badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background-color: #FF385C;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      font-size: 12px;
      color: white;
    }
  }
  
  .trend {
    position: absolute;
    right: 12px;
    bottom: 12px;
    font-size: 12px;
    color: #4CAF50;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &.down {
      color: #F44336;
    }
  }
`;

const CommitGraph = styled.div`
  height: 40px;
  margin-top: 12px;
  display: flex;
  align-items: flex-end;
  gap: 6px;
`;

const CommitBar = styled.div<{ height: number }>`
  flex: 1;
  height: ${props => props.height}%;
  background-color: #FF385C;
  min-height: 4px;
  border-radius: 2px;
  opacity: ${props => 0.5 + (props.height / 100) * 0.5};
`;

const RequestHistory = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
  max-height: 260px;
  overflow-y: auto;
`;

const HistoryItem = styled.div`
  background-color: #222222;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  margin-bottom: 6px;
  
  &:hover {
    transform: translateX(4px);
    background-color: #2a2a2a;
  }
  
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .method {
    font-size: 11px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 3px;
    min-width: 50px;
    text-align: center;
  }
  
  .get {
    background-color: #4CAF50;
    color: white;
  }
  
  .post {
    background-color: #2196F3;
    color: white;
  }
  
  .put {
    background-color: #FF9800;
    color: white;
  }
  
  .delete {
    background-color: #F44336;
    color: white;
  }
  
  .patch {
    background-color: #9C27B0;
    color: white;
  }

  .options {
    background-color: #607D8B;
    color: white;
  }
  
  .head {
    background-color: #795548;
    color: white;
  }
  
  .content-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .name {
    font-size: 14px;
    color: #fff;
    font-weight: 500;
    margin-right: 10px;
  }
  
  .time {
    font-size: 11px;
    color: #999;
    text-align: left;
    margin-top: 4px;
    width: 100%;
  }
  
  .status {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 500;
    
    &.success {
      background-color: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }
    
    &.error {
      background-color: rgba(244, 67, 54, 0.2);
      color: #F44336;
    }
  }
`;

const ViewMore = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 12px;
  color: #FF385C;
  cursor: pointer;
  font-size: 14px;
  gap: 6px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const KanbanBoard = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 16px;
`;

const KanbanColumn = styled.div`
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 16px;
  flex: 1;
  
  .column-header {
    font-size: 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    
    .count {
      background-color: #333333;
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 12px;
      color: #ccc;
    }
  }
`;

const QuickAccessItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #222222;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2a2a2a;
  }
  
  .content {
    display: flex;
    align-items: center;
    gap: 10px;
    
    svg {
      color: #FF385C;
    }
    
    span {
      color: #fff;
      font-size: 14px;
    }
  }
  
  .icon {
    color: #777;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const PRItem = styled.div`
  background-color: #222222;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  
  .title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #fff;
  }
  
  .meta {
    display: flex;
    justify-content: space-between;
    
    .repo {
      font-size: 12px;
      color: #999;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .time {
      font-size: 12px;
      color: #FF385C;
    }
  }
`;

interface GitHubStats {
  prs: {
    open: number;
    created: number;
    reviews: number;
  };
  commits: {
    lastDay: number;
    lastWeek: number;
    lastMonth: number;
    repositories: number;
  };
  recentPRs: any[];
  initialized: boolean;
}

const Home: React.FC<HomeProps> = ({
  onCreateCollection,
  onImportFromFile,
  onNavigateToSettings,
  onNavigateToSecrets,
  onNavigateToKanban,
  onNavigateToGitHub
}) => {
  // Data states for the dashboard
  const [requestCount, setRequestCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const { requestHistory, loading } = useRequestHistory();
  const [todoItems, setTodoItems] = useState({
    todo: 0,
    inProgress: 0,
    done: 0
  });
  
  // GitHub stats
  const [githubStats, setGithubStats] = useState<GitHubStats>({
    prs: { open: 0, created: 0, reviews: 0 },
    commits: { lastDay: 0, lastWeek: 0, lastMonth: 0, repositories: 0 },
    recentPRs: [],
    initialized: false
  });
  
  // Fetch data on component mount
  useEffect(() => {
    // Set request count from history
    setRequestCount(requestHistory.length);
    
    // Fetch GitHub stats if service is initialized
    const fetchGitHubStats = async () => {
      try {
        if (githubService.isInitialized()) {
          // Fetch PRs
          const myPRs = await githubService.getMyOpenPullRequests();
          const reviewPRs = await githubService.getPullRequestsForReview();
          
          // Fetch commit stats
          const commitStats = await githubService.getCommitStats();
          
          setGithubStats({
            prs: {
              open: myPRs.length,
              created: myPRs.length,
              reviews: reviewPRs.length
            },
            commits: commitStats,
            recentPRs: myPRs.slice(0, 3),
            initialized: true
          });
        }
      } catch (error) {
        console.error('Error fetching GitHub stats:', error);
      }
    };
    
    fetchGitHubStats();
  }, [requestHistory.length]);
  
  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    
    // If today, show time only
    if (date.toLocaleDateString() === today.toLocaleDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    
    // Otherwise show date and time
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Format relative time
  const formatRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };
  
  // Generate random commit data for visualization
  const getCommitGraph = () => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      data.push(Math.floor(Math.random() * 90) + 10); // Random value between 10-100
    }
    return data;
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <AppLogo>
          <FaCode size={24} color="#FF385C" />
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 500 }}>Restify</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Developer Dashboard</p>
          </div>
        </AppLogo>
        <QuickActions>
          <ActionButton onClick={onCreateCollection}>
            <FaPlus /> New Collection
          </ActionButton>
          {onImportFromFile && (
            <ActionButton onClick={onImportFromFile}>
              <FaFileImport /> Import
            </ActionButton>
          )}
          {onNavigateToSettings && (
            <ActionButton onClick={onNavigateToSettings}>
              <FaCog />
            </ActionButton>
          )}
        </QuickActions>
      </DashboardHeader>
      
      <DashboardGrid>
        {/* API Metrics */}
        <MetricsCard>
          <h3><FaChartBar /> API Metrics</h3>
          <StatsGrid>
            <StatItem>
              <div className="label">Collections</div>
              <div className="value">{collectionCount}</div>
            </StatItem>
            <StatItem>
              <div className="label">Requests</div>
              <div className="value">{requestCount}</div>
            </StatItem>
            <StatItem>
              <div className="label">Success Rate</div>
              <div className="value">92%</div>
            </StatItem>
            <StatItem>
              <div className="label">Avg Response</div>
              <div className="value">126ms</div>
            </StatItem>
          </StatsGrid>
        </MetricsCard>
        
        {/* GitHub Stats */}
        <MetricsCard>
          <CardHeader>
            <h3><FaGithub /> GitHub Activity</h3>
            {onNavigateToGitHub && (
              <ActionButton onClick={onNavigateToGitHub} style={{ padding: '4px 8px' }}>
                View All
              </ActionButton>
            )}
          </CardHeader>
          
          {!githubStats.initialized ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <FaGithub size={32} color="#777" />
              <p style={{ marginTop: '12px', color: '#999' }}>Connect to GitHub to see your activity</p>
              {onNavigateToGitHub && (
                <ActionButton onClick={onNavigateToGitHub} style={{ margin: '16px auto 0', display: 'inline-flex' }}>
                  Connect
                </ActionButton>
              )}
            </div>
          ) : (
            <>
              <StatsGrid>
                <GitHubStatsItem>
                  <div className="label">Pull Requests</div>
                  <div className="value">{githubStats.prs.open}</div>
                  <div className="badge">
                    <FaExchangeAlt />
                  </div>
                </GitHubStatsItem>
                <GitHubStatsItem>
                  <div className="label">Commits (7d)</div>
                  <div className="value">{githubStats.commits.lastWeek}</div>
                  <div className="badge">
                    <FaCodeCommit />
                  </div>
                </GitHubStatsItem>
              </StatsGrid>
              
              <CommitGraph>
                {getCommitGraph().map((value, idx) => (
                  <CommitBar key={idx} height={value} />
                ))}
              </CommitGraph>
            </>
          )}
        </MetricsCard>
        
        {/* Recent Activity */}
        <MetricsCard>
          <h3><FaHistory /> Recent Activity</h3>
          <RequestHistory>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                Loading history...
              </div>
            ) : requestHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                No request history yet
              </div>
            ) : (
              requestHistory.slice(0, 4).map(item => (
                <HistoryItem key={item.id}>
                  <div className="header">
                    <div className={`method ${item.request.method.toLowerCase()}`}>
                      {item.request.method}
                    </div>
                    <div className="content-row">
                      <div className="name">{item.name}</div>
                      <div className={`status ${item.response.status >= 200 && item.response.status < 300 ? 'success' : 'error'}`}>
                        {item.response.status}
                      </div>
                    </div>
                  </div>
                  <div className="time">{formatTimestamp(item.timestamp)}</div>
                </HistoryItem>
              ))
            )}
          </RequestHistory>
          <ViewMore>
            View all history <FaArrowRight size={12} />
          </ViewMore>
        </MetricsCard>
        
        {/* Pull Requests */}
        <MediumCard>
          <CardHeader>
            <h3><FaExchangeAlt /> Pull Requests</h3>
            {onNavigateToGitHub && (
              <ActionButton onClick={onNavigateToGitHub} style={{ padding: '4px 8px' }}>
                View All
              </ActionButton>
            )}
          </CardHeader>
          
          {!githubStats.initialized ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#999' }}>Connect to GitHub to see your pull requests</p>
            </div>
          ) : githubStats.recentPRs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#999' }}>No open pull requests</p>
            </div>
          ) : (
            <div>
              {githubStats.recentPRs.map((pr: any) => (
                <PRItem key={pr.id}>
                  <div className="title">{pr.title}</div>
                  <div className="meta">
                    <div className="repo">
                      <FaCodeBranch size={12} />
                      {pr.repository_url?.split('/').slice(-1)[0] || 'unknown'}
                    </div>
                    <div className="time">
                      {formatRelativeTime(pr.updated_at)}
                    </div>
                  </div>
                </PRItem>
              ))}
            </div>
          )}
        </MediumCard>
        
        {/* Quick Access */}
        <MetricsCard>
          <h3><FaBolt /> Quick Access</h3>
          <div>
            {onNavigateToSecrets && (
              <QuickAccessItem onClick={onNavigateToSecrets}>
                <div className="content">
                  <FaKey />
                  <span>Secrets Manager</span>
                </div>
                <div className="icon">
                  <FaExternalLinkAlt size={12} />
                </div>
              </QuickAccessItem>
            )}
            
            {onNavigateToGitHub && (
              <QuickAccessItem onClick={onNavigateToGitHub}>
                <div className="content">
                  <FaGithub />
                  <span>GitHub Integration</span>
                </div>
                <div className="icon">
                  <FaExternalLinkAlt size={12} />
                </div>
              </QuickAccessItem>
            )}
            
            <QuickAccessItem>
              <div className="content">
                <FaBookmark />
                <span>API Collections</span>
              </div>
              <div className="icon">
                <FaExternalLinkAlt size={12} />
              </div>
            </QuickAccessItem>
            
            <QuickAccessItem>
              <div className="content">
                <FaStickyNote />
                <span>API Documentation</span>
              </div>
              <div className="icon">
                <FaExternalLinkAlt size={12} />
              </div>
            </QuickAccessItem>
          </div>
        </MetricsCard>
        
        {/* Kanban Board Overview */}
        <WideCard>
          <CardHeader>
            <h3><FaColumns /> Kanban Board</h3>
            {onNavigateToKanban && (
              <ActionButton onClick={onNavigateToKanban}>
                Open Board
              </ActionButton>
            )}
          </CardHeader>
          
          <KanbanBoard>
            <KanbanColumn>
              <div className="column-header">
                To Do <span className="count">0</span>
              </div>
            </KanbanColumn>
            
            <KanbanColumn>
              <div className="column-header">
                In Progress <span className="count">0</span>
              </div>
            </KanbanColumn>
            
            <KanbanColumn>
              <div className="column-header">
                Done <span className="count">0</span>
              </div>
            </KanbanColumn>
          </KanbanBoard>
        </WideCard>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default Home; 