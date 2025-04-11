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
import { motion, AnimatePresence } from 'framer-motion';
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
const DashboardContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
  color: #f5f5f5;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: radial-gradient(circle at top right, rgba(115, 103, 240, 0.05), transparent 60%);
    pointer-events: none;
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
`;

const DashboardHeader = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const AppLogo = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: auto;
  
  svg {
    filter: drop-shadow(0 0 8px rgba(115, 103, 240, 0.5));
    color: #7367f0;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(40, 40, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 16px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: rgba(50, 50, 60, 0.7);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    border-color: rgba(115, 103, 240, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    font-size: 16px;
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.2));
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricsCard = styled(motion.div)`
  background: rgba(30, 30, 35, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  height: auto;
  min-height: 220px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.12);
  }
  
  h3 {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 20px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    
    svg {
      color: #7367f0;
      filter: drop-shadow(0 0 5px rgba(115, 103, 240, 0.5));
    }
  }
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 60%;
    background: linear-gradient(to bottom, #7367f0, #ce9ffc);
    border-radius: 0 0 3px 3px;
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

const StatItem = styled(motion.div)`
  background: rgba(25, 25, 30, 0.5);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  &:hover {
    background: rgba(35, 35, 40, 0.6);
    border-color: rgba(115, 103, 240, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  .label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 8px;
  }
  
  .value {
    font-size: 28px;
    font-weight: bold;
    color: #fff;
    background: linear-gradient(90deg, #fff, #ce9ffc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const GitHubStatsItem = styled(StatItem)`
  position: relative;
  overflow: hidden;
  
  .badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #7367f0, #ce9ffc);
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

const ContributionContainer = styled.div`
  margin-top: 16px;
`;

const DayHeaders = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  margin-bottom: 4px;
`;

const DayHeader = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
`;

const ContributionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 1fr;
  gap: 3px;
  margin-top: 4px;
`;

const ContributionCell = styled.div<{ intensity: number }>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 3px;
  background-color: ${props => {
    const base = 0.1;
    const intensity = base + (props.intensity * 0.18);
    return `rgba(115, 103, 240, ${intensity})`;
  }};
  min-height: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.2);
    box-shadow: 0 0 8px rgba(115, 103, 240, 0.5);
  }
`;

const ContributionLegend = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
  gap: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
`;

const LegendCells = styled.div`
  display: flex;
  gap: 2px;
`;

const LegendCell = styled.div<{ intensity: number }>`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background-color: ${props => {
    const base = 0.1;
    const intensity = base + (props.intensity * 0.18);
    return `rgba(115, 103, 240, ${intensity})`;
  }};
`;

const CommitStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 12px;
`;

const CommitStatItem = styled.div`
  text-align: center;
  
  .count {
    font-size: 22px;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 0 10px rgba(115, 103, 240, 0.5);
  }
  
  .label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 4px;
  }
`;

const RequestHistory = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  max-height: 260px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
`;

const HistoryItem = styled(motion.div)`
  background: rgba(25, 25, 30, 0.5);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-bottom: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #7367f0, #ce9ffc);
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover {
    transform: translateX(4px);
    background: rgba(35, 35, 40, 0.6);
    border-color: rgba(115, 103, 240, 0.2);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    
    &::before {
      opacity: 1;
    }
  }
  
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .method {
    font-size: 11px;
    font-weight: bold;
    padding: 3px 8px;
    border-radius: 6px;
    min-width: 50px;
    text-align: center;
    letter-spacing: 0.5px;
  }
  
  .get {
    background-color: rgba(115, 103, 240, 0.15);
    color: #7367f0;
  }
  
  .post {
    background-color: rgba(0, 166, 153, 0.15);
    color: #00A699;
  }
  
  .put {
    background-color: rgba(255, 149, 0, 0.15);
    color: #FF9500;
  }
  
  .delete {
    background-color: rgba(255, 56, 92, 0.15);
    color: #FF385C;
  }
  
  .patch {
    background-color: rgba(175, 82, 222, 0.15);
    color: #AF52DE;
  }

  .options {
    background-color: rgba(96, 125, 139, 0.15);
    color: #607D8B;
  }
  
  .head {
    background-color: rgba(121, 85, 72, 0.15);
    color: #795548;
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
    color: rgba(255, 255, 255, 0.6);
    text-align: left;
    margin-top: 4px;
    width: 100%;
  }
  
  .status {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 6px;
    font-weight: 500;
    
    &.success {
      background-color: rgba(76, 175, 80, 0.15);
      color: #4CAF50;
    }
    
    &.error {
      background-color: rgba(244, 67, 54, 0.15);
      color: #F44336;
    }
  }
`;

const ViewMore = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
  color: #7367f0;
  cursor: pointer;
  font-size: 14px;
  gap: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    color: #ce9ffc;
    transform: translateX(4px);
    
    svg {
      transform: translateX(4px);
    }
  }
  
  svg {
    transition: transform 0.3s ease;
  }
`;

const KanbanBoard = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const KanbanColumn = styled.div`
  background: rgba(25, 25, 30, 0.5);
  border-radius: 10px;
  padding: 12px;
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  .column-header {
    font-size: 14px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    
    .count {
      background: rgba(40, 40, 50, 0.6);
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
`;

const KanbanTask = styled(motion.div)<{ priority: 'high' | 'medium' | 'low' }>`
  background: rgba(35, 35, 40, 0.6);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
    background: ${props => 
      props.priority === 'high' ? 'linear-gradient(to bottom, #F44336, #FF7676)' : 
      props.priority === 'medium' ? 'linear-gradient(to bottom, #FF9800, #FFBD45)' : 
      'linear-gradient(to bottom, #4CAF50, #7ED47E)'
    };
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    border-color: ${props => 
      props.priority === 'high' ? 'rgba(244, 67, 54, 0.3)' : 
      props.priority === 'medium' ? 'rgba(255, 152, 0, 0.3)' : 
      'rgba(76, 175, 80, 0.3)'
    };
  }
  
  .task-title {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 500;
  }
  
  .task-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .task-priority {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 10px;
    letter-spacing: 0.5px;
    font-weight: 600;
    background-color: ${props => 
      props.priority === 'high' ? 'rgba(244, 67, 54, 0.15)' : 
      props.priority === 'medium' ? 'rgba(255, 152, 0, 0.15)' : 
      'rgba(76, 175, 80, 0.15)'
    };
    color: ${props => 
      props.priority === 'high' ? '#F44336' : 
      props.priority === 'medium' ? '#FF9800' : 
      '#4CAF50'
    };
  }
`;

const QuickAccessItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(25, 25, 30, 0.5);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  &:hover {
    background: rgba(35, 35, 40, 0.6);
    transform: translateX(5px);
    border-color: rgba(115, 103, 240, 0.2);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  .content {
    display: flex;
    align-items: center;
    gap: 12px;
    
    svg {
      color: #7367f0;
      filter: drop-shadow(0 0 5px rgba(115, 103, 240, 0.3));
    }
    
    span {
      color: #fff;
      font-size: 15px;
      font-weight: 500;
    }
  }
  
  .icon {
    color: rgba(255, 255, 255, 0.4);
    transition: transform 0.3s ease;
  }
  
  &:hover .icon {
    color: rgba(255, 255, 255, 0.7);
    transform: translateX(5px);
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
    gap: 10px;
  }
`;

const PRItem = styled(motion.div)`
  background: rgba(25, 25, 30, 0.5);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #7367f0, #ce9ffc);
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover {
    transform: translateY(-3px);
    background: rgba(35, 35, 40, 0.6);
    border-color: rgba(115, 103, 240, 0.2);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    
    &::before {
      opacity: 1;
    }
  }
  
  .title {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 10px;
    color: #fff;
  }
  
  .meta {
    display: flex;
    justify-content: space-between;
    
    .repo {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      gap: 6px;
      
      svg {
        color: #7367f0;
      }
    }
    
    .time {
      font-size: 12px;
      color: #ce9ffc;
      font-weight: 500;
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
  contributions: number[];
  initialized: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 25 
    }
  }
};

const listItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 25 
    }
  }
};

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
    contributions: Array(28).fill(0),
    initialized: false
  });
  
  // Sample in-progress tasks sorted by priority
  const inProgressTasks = [
    { id: 1, title: 'Optimize API response time', priority: 'high', assignee: 'Jane', dueDate: '1 day' },
    { id: 2, title: 'Fix auth token refresh', priority: 'high', assignee: 'Mike', dueDate: '2 days' },
    { id: 3, title: 'Add pagination to results', priority: 'medium', assignee: 'Alex', dueDate: '3 days' },
    { id: 4, title: 'Update documentation', priority: 'low', assignee: 'Sam', dueDate: '5 days' }
  ];
  
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
          
          // Fetch commit data for the last 28 days for visualization
          const recentCommits = await githubService.getRecentCommits(28);
          
          // Process commits into daily contributions
          const contributions = processCommitData(recentCommits);
          
          // Sort PRs by updated_at (most recent first)
          const sortedPRs = [...myPRs].sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
          
          setGithubStats({
            prs: {
              open: myPRs.length,
              created: myPRs.length,
              reviews: reviewPRs.length
            },
            commits: commitStats,
            recentPRs: sortedPRs.slice(0, 3),
            contributions,
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
  
  // Process commits into daily contributions
  const processCommitData = (commits: any[]): number[] => {
    const today = new Date();
    const contributions = Array(28).fill(0);
    
    // Process each commit to count contributions by day
    commits.forEach(commit => {
      // Extract commit date
      const commitDate = new Date(commit.commit?.author?.date || commit.commit?.committer?.date);
      
      // Calculate days ago (0 = today, 1 = yesterday, etc.)
      const daysAgo = Math.floor((today.getTime() - commitDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If within our 28-day window, increment the counter
      if (daysAgo >= 0 && daysAgo < 28) {
        contributions[daysAgo]++;
      }
    });
    
    // Normalize the contributions to a 0-4 scale for visualization
    return normalizeContributions(contributions);
  };
  
  // Normalize contributions to a 0-4 scale
  const normalizeContributions = (contributions: number[]): number[] => {
    // Find the maximum number of contributions in a day
    const max = Math.max(...contributions, 1); // Avoid division by zero
    
    // Return normalized values (0-4)
    return contributions.map(count => {
      if (count === 0) return 0;
      return Math.min(Math.ceil((count / max) * 4), 4);
    });
  };
  
  // Get contribution data for visualization
  const getContributionData = () => {
    return githubStats.contributions;
  };

  return (
    <DashboardContainer
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <DashboardHeader variants={itemVariants}>
        <AppLogo>
          <FaCode size={24} />
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ margin: 0, fontSize: '22px', fontWeight: 600 }}
            >
              Restify
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}
            >
              Developer Dashboard
            </motion.p>
          </div>
        </AppLogo>
        <QuickActions>
          <ActionButton 
            onClick={onCreateCollection}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus /> New Collection
          </ActionButton>
          {onImportFromFile && (
            <ActionButton 
              onClick={onImportFromFile}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFileImport /> Import
            </ActionButton>
          )}
          {onNavigateToSettings && (
            <ActionButton 
              onClick={onNavigateToSettings}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCog />
            </ActionButton>
          )}
        </QuickActions>
      </DashboardHeader>
      
      <DashboardGrid>
         {/* Recent Activity */}
         <MetricsCard variants={cardVariants}>
          <h3><FaHistory /> Recent Activity</h3>
          <RequestHistory>
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px 0', 
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Loading history...
              </div>
            ) : requestHistory.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px 0', 
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                No request history yet
              </div>
            ) : (
              <AnimatePresence>
                {requestHistory.slice(0, 4).map((item, index) => (
                  <HistoryItem 
                    key={item.id}
                    custom={index}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
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
                ))}
              </AnimatePresence>
            )}
          </RequestHistory>
          <ViewMore
            whileHover={{ x: 5 }}
          >
            View all history <FaArrowRight size={12} />
          </ViewMore>
        </MetricsCard>

        
        {/* GitHub Stats */}
        <MetricsCard variants={cardVariants}>
          <CardHeader>
            <h3><FaGithub /> GitHub Activity</h3>
            {onNavigateToGitHub && (
              <ActionButton 
                onClick={onNavigateToGitHub} 
                style={{ padding: '8px 12px' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All
              </ActionButton>
            )}
          </CardHeader>
          
          {!githubStats.initialized ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ 
                textAlign: 'center', 
                padding: '20px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '70%'
              }}
            >
              <FaGithub size={32} style={{ opacity: 0.4, marginBottom: 16 }} />
              <p style={{ 
                marginTop: '12px', 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px'
              }}>
                Connect to GitHub to see your activity
              </p>
              {onNavigateToGitHub && (
                <ActionButton 
                  onClick={onNavigateToGitHub} 
                  style={{ margin: '16px auto 0', display: 'inline-flex' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Connect
                </ActionButton>
              )}
            </motion.div>
          ) : (
            <>
              <CommitStats>
                <CommitStatItem>
                  <div className="count">{githubStats.commits.lastDay}</div>
                  <div className="label">Today</div>
                </CommitStatItem>
                <CommitStatItem>
                  <div className="count">{githubStats.commits.lastWeek}</div>
                  <div className="label">This Week</div>
                </CommitStatItem>
                <CommitStatItem>
                  <div className="count">{githubStats.commits.lastMonth}</div>
                  <div className="label">This Month</div>
                </CommitStatItem>
              </CommitStats>
              
              <div style={{ 
                marginBottom: '12px', 
                fontSize: '13px', 
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 500
              }}>
                Last 28 Days
              </div>
              
              <ContributionContainer>
                <DayHeaders>
                  <DayHeader>M</DayHeader>
                  <DayHeader>T</DayHeader>
                  <DayHeader>W</DayHeader>
                  <DayHeader>T</DayHeader>
                  <DayHeader>F</DayHeader>
                  <DayHeader>S</DayHeader>
                  <DayHeader>S</DayHeader>
                </DayHeaders>
                <ContributionGrid>
                  {getContributionData().map((intensity, idx) => (
                    <ContributionCell 
                      key={idx} 
                      intensity={intensity}
                    />
                  ))}
                </ContributionGrid>
              </ContributionContainer>
              <ContributionLegend>
                <span>Less</span>
                <LegendCells>
                  <LegendCell intensity={0} />
                  <LegendCell intensity={1} />
                  <LegendCell intensity={2} />
                  <LegendCell intensity={3} />
                  <LegendCell intensity={4} />
                </LegendCells>
                <span>More</span>
              </ContributionLegend>
            </>
          )}
        </MetricsCard>
        
       
         
        {/* Quick Access */}
        <MetricsCard variants={cardVariants}>
          <h3><FaBolt /> Quick Access</h3>
          <div>
            <QuickAccessItem
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="content">
                <FaBookmark />
                <span>API Collections</span>
              </div>
              <div className="icon">
                <FaExternalLinkAlt size={12} />
              </div>
            </QuickAccessItem>

            {onNavigateToGitHub && (
              <QuickAccessItem 
                onClick={onNavigateToGitHub}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="content">
                  <FaGithub />
                  <span>Pull Requests</span>
                </div>
                <div className="icon">
                  <FaExternalLinkAlt size={12} />
                </div>
              </QuickAccessItem>
            )}


            {onNavigateToSecrets && (
              <QuickAccessItem 
                onClick={onNavigateToSecrets}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="content">
                  <FaKey />
                  <span>Secrets Manager</span>
                </div>
                <div className="icon">
                  <FaExternalLinkAlt size={12} />
                </div>
              </QuickAccessItem>
            )}

            {/* kanban board */}
            {onNavigateToKanban && (
              <QuickAccessItem 
                onClick={onNavigateToKanban}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="content">
                  <FaColumns />
                  <span>Kanban Board</span>
                </div>
                <div className="icon">
                  <FaExternalLinkAlt size={12} />
                </div>
              </QuickAccessItem>
            )}
            {/* notes */}
            <QuickAccessItem
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="content">
                <FaStickyNote />
                <span>Notes</span>
              </div>
              <div className="icon">
                <FaExternalLinkAlt size={12} />
              </div>
            </QuickAccessItem>            
          </div>
        </MetricsCard>
        

        {/* Pull Requests */}
        <MediumCard variants={cardVariants}>
          <CardHeader>
            <h3><FaExchangeAlt /> Pull Requests</h3>
            {onNavigateToGitHub && (
              <ActionButton 
                onClick={onNavigateToGitHub} 
                style={{ padding: '8px 12px' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All
              </ActionButton>
            )}
          </CardHeader>
          
          {!githubStats.initialized ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px 0',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px'
            }}>
              <p>Connect to GitHub to see your pull requests</p>
            </div>
          ) : githubStats.recentPRs.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px 0',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px'
            }}>
              <p>No open pull requests</p>
            </div>
          ) : (
            <AnimatePresence>
              {githubStats.recentPRs.map((pr: any, index) => (
                <PRItem 
                  key={pr.id}
                  custom={index}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
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
            </AnimatePresence>
          )}
        </MediumCard>
       
        
        {/* Kanban Board Overview */}
        <MetricsCard variants={cardVariants}>
          <CardHeader>
            <h3><FaColumns /> Todo</h3>
            {onNavigateToKanban && (
              <ActionButton 
                onClick={onNavigateToKanban}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Open Board
              </ActionButton>
            )}
          </CardHeader>
          
          <div style={{ 
            marginBottom: '16px', 
            fontSize: '13px', 
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: 500
          }}>
            In Progress • Sorted by Urgency
          </div>
          
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            <AnimatePresence>
              {inProgressTasks.map((task, index) => (
                <KanbanTask 
                  key={task.id} 
                  priority={task.priority as 'high' | 'medium' | 'low'}
                  custom={index}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="task-title">
                    {task.title}
                    <span className={`task-priority`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="task-meta">
                    <span>Assigned to: {task.assignee}</span>
                    <span>Due: {task.dueDate}</span>
                  </div>
                </KanbanTask>
              ))}
            </AnimatePresence>
          </div>
        </MetricsCard>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default Home; 