import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { 
  FaGithub, 
  FaSync, 
  FaExternalLinkAlt, 
  FaLock, 
  FaExclamationTriangle,
  FaArrowLeft,
  FaClock,
  FaCodeBranch,
  FaCheck,
  FaTimes,
  FaCog,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaQuestionCircle,
  FaLink,
  FaShieldAlt,
  FaUserSecret,
  FaCommentDots,
  FaUserEdit,
  FaFilter,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTimesCircle,
  FaThumbsUp,
  FaThumbsDown,
  FaComment,
  FaCircle,
  FaPlus,
  FaDatabase,
  FaCodepen,
  FaLayerGroup,
  FaBook,
  FaBuilding,
  FaUsers
} from 'react-icons/fa';
import githubService from '../../services/GitHubService';
import { useSettings } from '../../utils/SettingsContext';
import { useGitHubProfile } from '../../hooks/useGitHubProfile';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #121212;
  color: #e0e0e0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #1a1a1a;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  font-size: 18px;
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 4px;
  margin-right: 10px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: #FF385C;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
  }
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  font-size: 16px;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: #FF385C;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  text-align: center;
  
  svg {
    font-size: 64px;
    margin-bottom: 16px;
    color: #555;
  }
  
  h3 {
    margin: 0 0 8px;
    font-weight: 500;
  }
  
  p {
    max-width: 400px;
    margin: 0 0 24px;
  }
`;

const TokenContainer = styled.div`
  max-width: 550px;
  margin: 40px auto;
  padding: 28px;
  background-color: #1a1a1a;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
`;

const TokenInput = styled.input`
  width: 100%;
  padding: 12px;
  background-color: #222222;
  border: 1px solid #444;
  color: white;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const SaveButton = styled.button`
  background-color: #FF385C;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background-color: #E0314F;
  }
`;

const SecureBadge = styled.div`
  background-color: #222222;
  color: #29a745;
  font-size: 0.8rem;
  padding: 6px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  width: fit-content;
`;

const ErrorMessage = styled.div`
  color: #ff3860;
  font-size: 0.9rem;
  margin: 12px 0;
  padding: 12px;
  background-color: rgba(255, 56, 96, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const ResetButton = styled.button`
  background-color: transparent;
  color: #ff3860;
  border: 1px solid #ff3860;
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    background-color: rgba(255, 56, 96, 0.1);
  }
`;

const PRList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PRItem = styled.div`
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const PRHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const PRTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
`;

const PRLink = styled.a`
  color: #FF385C;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PRMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #aaa;
  margin-top: 12px;
`;

const PRMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  svg {
    animation: spin 1s linear infinite;
    color: #FF385C;
    font-size: 24px;
  }
`;

// Add token management styled components
const ManagementContainer = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background-color: #1a1a1a;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ManagementHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  svg {
    margin-right: 10px;
    color: #FF385C;
  }
`;

const TokenField = styled.div`
  display: flex;
  align-items: center;
  background-color: #222222;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px 12px;
  margin: 12px 0;
`;

const TokenDisplay = styled.div`
  flex: 1;
  font-family: monospace;
  font-size: 14px;
  color: #ddd;
  user-select: none;
`;

const TokenActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    color: #FF385C;
    background-color: rgba(255, 56, 92, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const OutlineButton = styled.button`
  background-color: transparent;
  color: #FF385C;
  border: 1px solid #FF385C;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: rgba(255, 56, 92, 0.1);
  }
`;

// Add these new styled components after the other style definitions
const ContainerHeader = styled.h3`
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: #FF385C;
  }
`;

const TokenHelp = styled.div`
  background-color: rgba(34, 34, 34, 0.6);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  font-size: 14px;
  color: #bbb;
  
  p {
    margin: 0 0 8px 0;
    line-height: 1.5;
  }
  
  ul {
    margin: 8px 0;
    padding-left: 20px;
  }
  
  li {
    margin: 4px 0;
  }
`;

const PrimaryButton = styled(SaveButton)`
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(255, 56, 92, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(255, 56, 92, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(255, 56, 92, 0.2);
  }
`;

const EnhancedTokenInput = styled.div`
  position: relative;
  margin: 16px 0;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #bbb;
`;

const TokenInputField = styled(TokenInput)`
  padding: 14px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:focus {
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }
  
  &::placeholder {
    color: #666;
  }
`;

const InputHint = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #888;
  margin-top: 6px;
`;

const EnhancedErrorMessage = styled(ErrorMessage)`
  margin: 16px 0;
  padding: 16px;
  border-radius: 6px;
  gap: 12px;
  border-left: 4px solid #ff3860;
  
  svg {
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

const ErrorContent = styled.div`
  flex: 1;
  
  p {
    margin: 0 0 8px 0;
    line-height: 1.5;
  }
`;

const LinkButton = styled.a`
  color: #FF385C;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EnhancedSpinner = styled(LoadingSpinner)`
  flex-direction: column;
  height: 200px;
  gap: 16px;
  
  svg {
    font-size: 32px;
  }
  
  p {
    color: #aaa;
    font-size: 14px;
  }
`;

// Add a content separator to visually divide sections
const ContentSeparator = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 24px 0;
`;

// Add tab navigation styled components
const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  color: ${props => props.active ? '#FF385C' : '#aaa'};
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#FF385C' : 'transparent'};
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: ${props => props.active ? '#FF385C' : '#ddd'};
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const ReviewBadge = styled.span`
  background-color: rgba(255, 56, 92, 0.1);
  color: #FF385C;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
`;

const EmptyReview = styled(EmptyState)`
  svg {
    color: #555;
  }
`;

// Add these new styled components after the existing style definitions
const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
  background-color: #1a1a1a;
  padding: 12px;
  border-radius: 8px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 13px;
  color: #aaa;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background-color: #222222;
  border-radius: 6px;
  border: 1px solid #444;
`;

const FilterSelect = styled.select`
  background-color: #222222;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  min-width: 140px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const SearchInput = styled.div`
  position: relative;
  flex-grow: 1;
  min-width: 200px;
  
  input {
    width: 100%;
    background-color: #222222;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 6px 10px 6px 32px;
    font-size: 13px;
    
    &:focus {
      outline: none;
      border-color: #FF385C;
    }
    
    &::placeholder {
      color: #777;
    }
  }
  
  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #777;
    font-size: 14px;
  }
`;

const ClearSearch = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #FF385C;
  }
`;

const FilterBadge = styled.div`
  background-color: #FF385C;
  color: white;
  font-size: 11px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SortButton = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? 'rgba(255, 56, 92, 0.1)' : 'transparent'};
  color: ${props => props.active ? '#FF385C' : '#aaa'};
  border: 1px solid ${props => props.active ? '#FF385C' : '#444'};
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 56, 92, 0.1);
    color: #FF385C;
  }
`;

const ClearFilters = styled.button`
  background-color: transparent;
  color: #aaa;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: #FF385C;
    border-color: #FF385C;
  }
`;

// Add these new styled components for review status
const ReviewStatusContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
`;

const ReviewBadgeStyled = styled.div<{ badgeType: 'approved' | 'changes' | 'comment' | 'pending' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${props => {
    switch (props.badgeType) {
      case 'approved': return 'rgba(45, 164, 78, 0.1)';
      case 'changes': return 'rgba(255, 56, 92, 0.1)';
      case 'comment': return 'rgba(88, 166, 255, 0.1)';
      case 'pending': return 'rgba(209, 213, 219, 0.1)';
      default: return 'transparent';
    }
  }};
  color: ${props => {
    switch (props.badgeType) {
      case 'approved': return '#2da44e';
      case 'changes': return '#ff385c';
      case 'comment': return '#58a6ff';
      case 'pending': return '#d1d5db';
      default: return '#aaa';
    }
  }};
`;

const ReviewStatus = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// New styled components for dashboard layout
const DashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  width: 100%;
`;

const DashboardColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DashboardCard = styled.div`
  background-color: #1a1a1a;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
`;

const CardContent = styled.div`
  padding: 0;
`;

const ViewAllLink = styled.a`
  color: #aaa;
  font-size: 14px;
  text-decoration: none;
  
  &:hover {
    color: #FF385C;
    text-decoration: underline;
  }
`;

const RepoList = styled.div`
  display: flex;
  flex-direction: column;
`;

const RepoItem = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
`;

const RepoName = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #aaa;
  }
`;

const RepoMeta = styled.div`
  font-size: 12px;
  color: #aaa;
`;

const OrgList = styled.div`
  display: flex;
  flex-direction: column;
`;

const OrgItem = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
`;

const OrgAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: #2a2a2a;
`;

const OrgInfo = styled.div`
  flex: 1;
`;

const OrgName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
`;

const OrgMeta = styled.div`
  font-size: 12px;
  color: #aaa;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    font-size: 10px;
  }
`;

const NewButton = styled.button`
  background-color: #2da44e;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: #2c974b;
  }
`;

interface GitHubPanelProps {
  onReturn: () => void;
}

// Define types for filter and sort options
type SortOption = 'newest' | 'oldest' | 'updated' | 'title';
type AgeFilter = 'all' | 'today' | 'week' | 'month';
type StatusFilter = 'all' | 'draft' | 'ready';

// Add a type for review status filtering
type ReviewFilter = 'all' | 'approved' | 'changes_requested' | 'commented' | 'none';

const GitHubPanel: React.FC<GitHubPanelProps> = ({ onReturn }) => {
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [reviewRequests, setReviewRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mine' | 'reviews'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showTokenManagement, setShowTokenManagement] = useState(false);
  const [showFullToken, setShowFullToken] = useState(false);
  const [editingToken, setEditingToken] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [recentRepos, setRecentRepos] = useState<any[]>([]);
  const [userOrgs, setUserOrgs] = useState<any[]>([]);
  
  // Use our GitHub profile hook
  const { profile, isConnected: profileIsConnected } = useGitHubProfile();
  
  // Create separate filter states for each tab
  // My PRs filters
  const [myPrSearchTerm, setMyPrSearchTerm] = useState('');
  const [myPrRepoFilter, setMyPrRepoFilter] = useState<string>('all');
  const [myPrStatusFilter, setMyPrStatusFilter] = useState<StatusFilter>('all');
  const [myPrAgeFilter, setMyPrAgeFilter] = useState<AgeFilter>('all');
  const [myPrSortOption, setMyPrSortOption] = useState<SortOption>('newest');
  const [myPrSortDirection, setMyPrSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Review requests filters
  const [reviewPrSearchTerm, setReviewPrSearchTerm] = useState('');
  const [reviewPrRepoFilter, setReviewPrRepoFilter] = useState<string>('all');
  const [reviewPrStatusFilter, setReviewPrStatusFilter] = useState<StatusFilter>('all');
  const [reviewPrAgeFilter, setReviewPrAgeFilter] = useState<AgeFilter>('all');
  const [reviewPrSortOption, setReviewPrSortOption] = useState<SortOption>('newest');
  const [reviewPrSortDirection, setReviewPrSortDirection] = useState<'asc' | 'desc'>('desc');

  // Add review filter state for each tab
  const [myPrReviewFilter, setMyPrReviewFilter] = useState<ReviewFilter>('all');
  const [reviewPrReviewFilter, setReviewPrReviewFilter] = useState<ReviewFilter>('all');
  
  // Get settings from context including GitHub token management functions
  const { settings, setGitHubToken, clearGitHubToken } = useSettings();
  
  // Function to get current filter state based on active tab
  const getFilterState = () => {
    if (activeTab === 'mine') {
      return {
        searchTerm: myPrSearchTerm,
        setSearchTerm: setMyPrSearchTerm,
        repoFilter: myPrRepoFilter,
        setRepoFilter: setMyPrRepoFilter,
        statusFilter: myPrStatusFilter,
        setStatusFilter: setMyPrStatusFilter,
        ageFilter: myPrAgeFilter,
        setAgeFilter: setMyPrAgeFilter,
        sortOption: myPrSortOption,
        setSortOption: setMyPrSortOption,
        sortDirection: myPrSortDirection,
        setSortDirection: setMyPrSortDirection,
        reviewFilter: myPrReviewFilter,
        setReviewFilter: setMyPrReviewFilter
      };
    } else {
      return {
        searchTerm: reviewPrSearchTerm,
        setSearchTerm: setReviewPrSearchTerm,
        repoFilter: reviewPrRepoFilter,
        setRepoFilter: setReviewPrRepoFilter,
        statusFilter: reviewPrStatusFilter,
        setStatusFilter: setReviewPrStatusFilter,
        ageFilter: reviewPrAgeFilter,
        setAgeFilter: setReviewPrAgeFilter,
        sortOption: reviewPrSortOption,
        setSortOption: setReviewPrSortOption,
        sortDirection: reviewPrSortDirection,
        setSortDirection: setReviewPrSortDirection,
        reviewFilter: reviewPrReviewFilter,
        setReviewFilter: setReviewPrReviewFilter
      };
    }
  };
  
  // Reset token (modified to use settings)
  const resetToken = async () => {
    console.log('[GitHub] Resetting token due to user request');
    try {
      await clearGitHubToken();
      setError(null);
      setShowTokenManagement(false);
    } catch (error) {
      console.error('[GitHub] Error clearing GitHub token:', error);
      setError('Failed to reset GitHub token');
    }
  };
  
  // Load PR and dashboard data
  useEffect(() => {
    const loadGitHubData = async () => {
      try {
        setError(null);
        
        // Check connection status from settings
        if (settings.github.isConnected && githubService.isInitialized()) {
          setLoading(true);
          
          // Load dashboard data
          if (activeTab === 'dashboard') {
            try {
              const orgs = await githubService.getUserOrganizations();
              setUserOrgs(orgs);
              
              // We should implement a method to get recent repos
              // For now, we'll extract repos from PRs as a workaround
              const myPRs = await githubService.getMyOpenPullRequests();
              
              // Extract unique repositories from PRs
              const uniqueRepos = new Map();
              myPRs.forEach(pr => {
                const repoUrl = pr.repository_url || '';
                const urlParts = repoUrl.split('/');
                const owner = urlParts[urlParts.length - 2] || '';
                const repo = urlParts[urlParts.length - 1] || '';
                
                if (owner && repo && !uniqueRepos.has(repo)) {
                  uniqueRepos.set(repo, {
                    name: repo,
                    owner: owner,
                    full_name: `${owner}/${repo}`,
                    updated_at: pr.updated_at,
                    html_url: pr.html_url.split('/pull/')[0]
                  });
                }
              });
              
              // Convert Map to array and sort by updated date
              const recentRepoArray = Array.from(uniqueRepos.values())
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 5); // Take the 5 most recent
              
              setRecentRepos(recentRepoArray);
            } catch (error) {
              console.error('[GitHub] Error fetching dashboard data:', error);
            }
          }
          
          await fetchAllPullRequests();
        }
      } catch (error) {
        console.error('[GitHub] Failed to load GitHub data:', error);
        setError('Failed to load GitHub data');
      } finally {
        setLoading(false);
      }
    };
    
    loadGitHubData();
  }, [settings.github.isConnected, activeTab]);
  
  const fetchAllPullRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[GitHub] Fetching pull requests...');
      
      // Run these requests in parallel for better performance
      const [myPRs, reviewPRs] = await Promise.all([
        githubService.getMyOpenPullRequests(), // This now uses cache by default
        githubService.getPullRequestsForReview() // This now uses cache by default
      ]);
      
      console.log(`[GitHub] Found ${myPRs.length} created PRs and ${reviewPRs.length} review requests`);
      
      setPullRequests(myPRs);
      setReviewRequests(reviewPRs);
    } catch (error) {
      console.error('[GitHub] Error fetching PRs:', error);
      setError('Failed to fetch pull requests. Please check your token and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const refreshAllPullRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[GitHub] Force refreshing pull requests...');
      
      // Force refresh by passing false to useCache parameter
      await githubService.refreshAllPRs();
      
      // After refresh, load the latest data
      const [myPRs, reviewPRs] = await Promise.all([
        githubService.getMyOpenPullRequests(), 
        githubService.getPullRequestsForReview()
      ]);
      
      console.log(`[GitHub] Refreshed ${myPRs.length} created PRs and ${reviewPRs.length} review requests`);
      
      setPullRequests(myPRs);
      setReviewRequests(reviewPRs);
    } catch (error) {
      console.error('[GitHub] Error refreshing PRs:', error);
      setError('Failed to refresh pull requests. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle token save (modified to use settings)
  const handleSaveToken = async () => {
    if (!token) {
      setError('Please enter a GitHub token');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      await setGitHubToken(token);
      setToken(''); // Clear the input after successful save
    } catch (error: any) {
      setError(`Failed to save token: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Format the relative time for PR creation/update
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  };
  
  // Add a function to mask the token for display
  const maskToken = (token: string) => {
    if (!token) return '';
    if (showFullToken) return token;
    
    if (token.length <= 10) {
      return '••••••••••';
    }
    
    return token.substring(0, 4) + '••••••••••••••••••••' + token.substring(token.length - 4);
  };
  
  // Add a function to toggle token visibility
  const toggleTokenVisibility = () => {
    setShowFullToken(!showFullToken);
  };
  
  // Add a function to start editing token
  const startEditingToken = () => {
    setEditingToken(true);
    setNewToken(token);
  };
  
  // Add a function to save the updated token
  const saveUpdatedToken = async () => {
    if (!newToken) {
      setError('Please enter a token');
      return;
    }
    
    try {
      setError(null);
      await setGitHubToken(newToken);
      setEditingToken(false);
    } catch (error: any) {
      setError(`Failed to save token: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Add a function to extract unique repositories from PRs
  const getUniqueRepositories = (prs: any[]): string[] => {
    const repos = prs.map(pr => {
      const repoUrl = pr.repository_url || '';
      return repoUrl.split('/').slice(-1)[0];
    }).filter(Boolean);
    
    return ['all', ...Array.from(new Set(repos))];
  };
  
  // Add a render function for review status
  const renderReviewStatus = (pr: any) => {
    if (!pr.review_data) return null;
    
    const { approvals, changes_requested, comments, total_reviews } = pr.review_data;
    
    if (total_reviews === 0) {
      return (
        <ReviewStatus>
          <ReviewBadgeStyled badgeType="pending">
            <FaCircle size={10} />
            <span>No reviews yet</span>
          </ReviewBadgeStyled>
        </ReviewStatus>
      );
    }
    
    return (
      <ReviewStatus>
        {approvals > 0 && (
          <ReviewBadgeStyled badgeType="approved">
            <FaThumbsUp size={12} />
            <span>{approvals} {approvals === 1 ? 'approval' : 'approvals'}</span>
          </ReviewBadgeStyled>
        )}
        {changes_requested > 0 && (
          <ReviewBadgeStyled badgeType="changes">
            <FaThumbsDown size={12} />
            <span>{changes_requested} {changes_requested === 1 ? 'change requested' : 'changes requested'}</span>
          </ReviewBadgeStyled>
        )}
        {comments > 0 && (
          <ReviewBadgeStyled badgeType="comment">
            <FaCommentDots size={12} />
            <span>{comments} {comments === 1 ? 'comment' : 'comments'}</span>
          </ReviewBadgeStyled>
        )}
      </ReviewStatus>
    );
  };
  
  // Apply filters and sorting to PRs using useMemo
  const filteredPullRequests = useMemo(() => {
    // Get the right list based on active tab
    const sourceList = activeTab === 'mine' ? pullRequests : reviewRequests;
    const filters = getFilterState();
    
    return sourceList
      .filter(pr => {
        // Search term filter
        if (filters.searchTerm && !pr.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
          return false;
        }
        
        // Repository filter
        if (filters.repoFilter !== 'all') {
          const prRepo = (pr.repository_url || '').split('/').slice(-1)[0];
          if (prRepo !== filters.repoFilter) {
            return false;
          }
        }
        
        // Status filter
        if (filters.statusFilter !== 'all') {
          if (filters.statusFilter === 'draft' && !pr.draft) {
            return false;
          }
          if (filters.statusFilter === 'ready' && pr.draft) {
            return false;
          }
        }
        
        // Age filter
        if (filters.ageFilter !== 'all') {
          const prDate = new Date(pr.created_at);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - prDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (filters.ageFilter === 'today' && diffDays > 1) {
            return false;
          }
          if (filters.ageFilter === 'week' && diffDays > 7) {
            return false;
          }
          if (filters.ageFilter === 'month' && diffDays > 30) {
            return false;
          }
        }
        
        // Review status filter
        if (filters.reviewFilter !== 'all' && pr.review_data) {
          const { approvals, changes_requested, comments, total_reviews } = pr.review_data;
          
          if (filters.reviewFilter === 'approved' && approvals === 0) {
            return false;
          }
          if (filters.reviewFilter === 'changes_requested' && changes_requested === 0) {
            return false;
          }
          if (filters.reviewFilter === 'commented' && comments === 0) {
            return false;
          }
          if (filters.reviewFilter === 'none' && total_reviews > 0) {
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        let comparison = 0;
        
        switch (filters.sortOption) {
          case 'newest':
            comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            break;
          case 'oldest':
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
          case 'updated':
            comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
        }
        
        // Apply sort direction
        return filters.sortDirection === 'desc' ? comparison : -comparison;
      });
  }, [
    activeTab, pullRequests, reviewRequests, 
    myPrSearchTerm, myPrRepoFilter, myPrStatusFilter, myPrAgeFilter, myPrSortOption, myPrSortDirection, myPrReviewFilter,
    reviewPrSearchTerm, reviewPrRepoFilter, reviewPrStatusFilter, reviewPrAgeFilter, reviewPrSortOption, reviewPrSortDirection, reviewPrReviewFilter
  ]);
  
  // Get unique repositories for the filter dropdown
  const uniqueRepositories = useMemo(() => {
    return getUniqueRepositories(activeTab === 'mine' ? pullRequests : reviewRequests);
  }, [activeTab, pullRequests, reviewRequests]);
  
  // Count active filters to show indicator
  const activeFilterCount = useMemo(() => {
    const filters = getFilterState();
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.repoFilter !== 'all') count++;
    if (filters.statusFilter !== 'all') count++;
    if (filters.ageFilter !== 'all') count++;
    if (filters.reviewFilter !== 'all') count++;
    return count;
  }, [
    activeTab,
    myPrSearchTerm, myPrRepoFilter, myPrStatusFilter, myPrAgeFilter, myPrReviewFilter,
    reviewPrSearchTerm, reviewPrRepoFilter, reviewPrStatusFilter, reviewPrAgeFilter, reviewPrReviewFilter
  ]);
  
  // Function to clear all filters
  const clearAllFilters = () => {
    const filters = getFilterState();
    filters.setSearchTerm('');
    filters.setRepoFilter('all');
    filters.setStatusFilter('all');
    filters.setAgeFilter('all');
    filters.setSortOption('newest');
    filters.setSortDirection('desc');
    filters.setReviewFilter('all');
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    const filters = getFilterState();
    filters.setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Ensure connection state is consistent
  const isConnected = settings.github.isConnected && profileIsConnected;

  // Render dashboard content
  const renderDashboard = () => {
    return (
      <DashboardLayout>
        <DashboardColumn>
          <DashboardCard>
            <CardHeader>
              <CardTitle>Active Pull Requests</CardTitle>
              <ViewAllLink onClick={() => setActiveTab('mine')}>View all</ViewAllLink>
            </CardHeader>
            <CardContent>
              {pullRequests.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  No active pull requests
                </div>
              ) : (
                <PRList style={{ padding: '0' }}>
                  {pullRequests.slice(0, 3).map((pr: any) => (
                    <PRItem key={pr.id} style={{ borderRadius: '0' }}>
                      <PRHeader>
                        <PRTitle>{pr.title}</PRTitle>
                        <PRLink href={pr.html_url} target="_blank" rel="noopener noreferrer">
                          <FaExternalLinkAlt size={12} />
                        </PRLink>
                      </PRHeader>
                      <div style={{ color: '#aaa', fontSize: '14px', marginTop: '6px' }}>
                        {pr.repository_url?.split('/').slice(-2).join('/')} • {pr.draft ? 'Draft' : `${pr.comments} comments`}
                      </div>
                      <PRMeta>
                        <PRMetaItem>
                          <FaClock size={12} />
                          <span>Updated {formatRelativeTime(pr.updated_at)}</span>
                        </PRMetaItem>
                      </PRMeta>
                    </PRItem>
                  ))}
                </PRList>
              )}
            </CardContent>
          </DashboardCard>
          
          <DashboardCard>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <ViewAllLink onClick={() => setActiveTab('reviews')}>View all</ViewAllLink>
            </CardHeader>
            <CardContent>
              {reviewRequests.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  No pending reviews
                </div>
              ) : (
                <PRList style={{ padding: '0' }}>
                  {reviewRequests.slice(0, 3).map((pr: any) => (
                    <PRItem key={pr.id} style={{ borderRadius: '0' }}>
                      <PRHeader>
                        <PRTitle>{pr.title}</PRTitle>
                        <PRLink href={pr.html_url} target="_blank" rel="noopener noreferrer">
                          <FaExternalLinkAlt size={12} />
                        </PRLink>
                      </PRHeader>
                      <div style={{ color: '#aaa', fontSize: '14px', marginTop: '6px' }}>
                        {pr.repository_url?.split('/').slice(-2).join('/')} • Requested {formatRelativeTime(pr.updated_at)}
                      </div>
                      <PRMeta>
                        <PRMetaItem style={{ color: '#FF385C' }}>
                          <FaUserEdit size={12} />
                          <span>Review requested</span>
                        </PRMetaItem>
                      </PRMeta>
                    </PRItem>
                  ))}
                </PRList>
              )}
            </CardContent>
          </DashboardCard>
        </DashboardColumn>
        
        <DashboardColumn>
          <DashboardCard>
            <CardHeader>
              <CardTitle>Recent Repositories</CardTitle>
              <NewButton>
                <FaPlus size={10} /> New
              </NewButton>
            </CardHeader>
            <CardContent>
              {recentRepos.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  No recent repositories
                </div>
              ) : (
                <RepoList>
                  {recentRepos.map((repo: any) => (
                    <RepoItem key={repo.name}>
                      <RepoName>
                        <FaCodepen />
                        {repo.full_name}
                      </RepoName>
                      <RepoMeta>
                        Updated {formatRelativeTime(repo.updated_at)}
                      </RepoMeta>
                    </RepoItem>
                  ))}
                </RepoList>
              )}
            </CardContent>
          </DashboardCard>
          
          <DashboardCard>
            <CardHeader>
              <CardTitle>Your Organizations</CardTitle>
              <ViewAllLink href="https://github.com/settings/organizations" target="_blank" rel="noopener noreferrer">
                View all
              </ViewAllLink>
            </CardHeader>
            <CardContent>
              {userOrgs.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  No organizations found
                </div>
              ) : (
                <OrgList>
                  {userOrgs.map((org: any) => (
                    <OrgItem key={org.id}>
                      <OrgAvatar src={org.avatar_url} alt={org.login} />
                      <OrgInfo>
                        <OrgName>{org.name}</OrgName>
                        <OrgMeta>
                          <FaBuilding size={10} />
                          <span>{org.login}</span>
                        </OrgMeta>
                      </OrgInfo>
                    </OrgItem>
                  ))}
                </OrgList>
              )}
            </CardContent>
          </DashboardCard>
        </DashboardColumn>
      </DashboardLayout>
    );
  };
  
  // Replace the renderContent method
  const renderContent = () => {
    if (!isConnected) {
      return (
        <TokenContainer>
          <ContainerHeader>
            <FaKey />
            GitHub Personal Access Token
          </ContainerHeader>
          
          <p>Enter your GitHub token to view your open pull requests.</p>
          
          <TokenHelp>
            <p><strong>What is a Personal Access Token?</strong></p>
            <p>A token is required to securely access your GitHub data. To create one:</p>
            <ul>
              <li>Go to your GitHub settings → Developer settings → Personal access tokens</li>
              <li>Click "Generate new token" and confirm your password</li>
              <li>Give it a descriptive name (like "Restify App")</li>
              <li>Select these scopes: <code>repo</code> (to access repository data)</li>
              <li>Click "Generate token" and copy it immediately</li>
            </ul>
            <p>
              <LinkButton 
                href="https://github.com/settings/tokens/new" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLink size={12} /> Create a token on GitHub
              </LinkButton>
            </p>
          </TokenHelp>
          
          <EnhancedTokenInput>
            <InputLabel htmlFor="github-token">Personal Access Token</InputLabel>
            <TokenInputField
              id="github-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              autoComplete="off"
            />
            <InputHint>
              <FaShieldAlt size={12} />
              <span>Your token will never be shared with anyone</span>
            </InputHint>
          </EnhancedTokenInput>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <PrimaryButton onClick={handleSaveToken}>
              <FaGithub /> Connect GitHub Account
            </PrimaryButton>
            
            {settings.security.storeGitHubToken && (
              <SecureBadge>
                <FaLock size={12} />
                <span>Encrypted at rest</span>
              </SecureBadge>
            )}
          </div>
          
          {error && (
            <EnhancedErrorMessage>
              <FaExclamationTriangle />
              <ErrorContent>
                <p><strong>{error}</strong></p>
                {error.includes('Invalid') && (
                  <p>Check that your token has the correct permissions and hasn't expired.</p>
                )}
                {error.includes('corrupted') && (
                  <p>Your stored token may be corrupted or invalid.</p>
                )}
                {(error.includes('corrupted') || error.includes('Invalid')) && (
                  <ResetButton onClick={resetToken}>
                    Reset All Tokens
                  </ResetButton>
                )}
              </ErrorContent>
            </EnhancedErrorMessage>
          )}
        </TokenContainer>
      );
    }
    
    if (loading) {
      return (
        <EnhancedSpinner>
          <FaSync />
          <p>Loading GitHub data...</p>
        </EnhancedSpinner>
      );
    }
    
    if (error) {
      return (
        <EnhancedErrorMessage>
          <FaExclamationTriangle />
          <ErrorContent>
            <p><strong>{error}</strong></p>
            {error.includes('Invalid') && (
              <>
                <p>Your token may have expired or doesn't have the required permissions.</p>
                <p>Try resetting your token and creating a new one with the proper scopes.</p>
              </>
            )}
            {error.includes('Invalid') && (
              <div style={{ marginTop: '12px' }}>
                <ResetButton onClick={resetToken}>
                  Reset All Tokens
                </ResetButton>
                <LinkButton 
                  href="https://github.com/settings/tokens/new" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: '12px' }}
                >
                  <FaLink size={12} /> Create a new token
                </LinkButton>
              </div>
            )}
          </ErrorContent>
        </EnhancedErrorMessage>
      );
    }
    
    // Add tab navigation
    return (
      <>
        <TabsContainer>
          <Tab 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          >
            <FaGithub /> Dashboard
          </Tab>
          <Tab 
            active={activeTab === 'mine'} 
            onClick={() => setActiveTab('mine')}
          >
            <FaCodeBranch /> My PRs {pullRequests.length > 0 && <ReviewBadge>{pullRequests.length}</ReviewBadge>}
          </Tab>
          <Tab 
            active={activeTab === 'reviews'} 
            onClick={() => setActiveTab('reviews')}
          >
            <FaCommentDots /> Review Requests {reviewRequests.length > 0 && <ReviewBadge>{reviewRequests.length}</ReviewBadge>}
          </Tab>
        </TabsContainer>
        
        {activeTab === 'dashboard' ? (
          renderDashboard()
        ) : activeTab === 'mine' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Your Open Pull Requests</h3>
              <div style={{ color: '#888', fontSize: '14px' }}>
                {filteredPullRequests.length} of {pullRequests.length} {pullRequests.length === 1 ? 'pull request' : 'pull requests'}
              </div>
            </div>
            
            <FilterContainer>
              <FilterGroup>
                <FilterLabel>
                  <FaFilter /> 
                  Filters
                  {activeFilterCount > 0 && <FilterBadge>{activeFilterCount}</FilterBadge>}
                </FilterLabel>
              </FilterGroup>
              
              <SearchInput>
                <FaSearch />
                <input 
                  type="text" 
                  placeholder="Search PR titles..." 
                  value={myPrSearchTerm}
                  onChange={(e) => setMyPrSearchTerm(e.target.value)}
                />
                {myPrSearchTerm && (
                  <ClearSearch onClick={() => setMyPrSearchTerm('')}>
                    <FaTimesCircle />
                  </ClearSearch>
                )}
              </SearchInput>
              
              <FilterGroup>
                <FilterSelect 
                  value={myPrRepoFilter} 
                  onChange={(e) => setMyPrRepoFilter(e.target.value)}
                >
                  {uniqueRepositories.map(repo => (
                    <option key={repo} value={repo}>
                      {repo === 'all' ? 'All repositories' : repo}
                    </option>
                  ))}
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterSelect 
                  value={myPrStatusFilter} 
                  onChange={(e) => setMyPrStatusFilter(e.target.value as StatusFilter)}
                >
                  <option value="all">All statuses</option>
                  <option value="draft">Draft only</option>
                  <option value="ready">Ready only</option>
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterSelect 
                  value={myPrAgeFilter} 
                  onChange={(e) => setMyPrAgeFilter(e.target.value as AgeFilter)}
                >
                  <option value="all">Any time</option>
                  <option value="today">Last 24 hours</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterSelect 
                  value={myPrSortOption} 
                  onChange={(e) => setMyPrSortOption(e.target.value as SortOption)}
                >
                  <option value="newest">Created (newest)</option>
                  <option value="oldest">Created (oldest)</option>
                  <option value="updated">Recently updated</option>
                  <option value="title">Title (A-Z)</option>
                </FilterSelect>
                
                <SortButton 
                  active={true} 
                  onClick={toggleSortDirection}
                >
                  {myPrSortDirection === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                </SortButton>
              </FilterGroup>
              
              <FilterGroup>
                <FilterSelect 
                  value={myPrReviewFilter} 
                  onChange={(e) => setMyPrReviewFilter(e.target.value as ReviewFilter)}
                >
                  <option value="all">All reviews</option>
                  <option value="approved">Has approvals</option>
                  <option value="changes_requested">Has changes requested</option>
                  <option value="commented">Has comments</option>
                  <option value="none">No reviews yet</option>
                </FilterSelect>
              </FilterGroup>
              
              {activeFilterCount > 0 && (
                <ClearFilters onClick={clearAllFilters}>
                  Clear all
                </ClearFilters>
              )}
            </FilterContainer>
            
            {filteredPullRequests.length === 0 ? (
              <EmptyState>
                <FaFilter />
                <h3>No matching pull requests</h3>
                <p>No pull requests match the current filters. Try adjusting or clearing your filters.</p>
                <ClearFilters onClick={clearAllFilters} style={{ margin: '10px auto' }}>
                  Clear all filters
                </ClearFilters>
              </EmptyState>
            ) : (
              <PRList>
                {filteredPullRequests.map((pr: any) => (
                  <PRItem key={pr.id}>
                    <PRHeader>
                      <PRTitle>{pr.title}</PRTitle>
                      <PRLink href={pr.html_url} target="_blank" rel="noopener noreferrer">
                        Open in GitHub <FaExternalLinkAlt size={12} />
                      </PRLink>
                    </PRHeader>
                    <div style={{ color: '#aaa', fontSize: '14px', marginTop: '6px' }}>
                      {pr.repository_url?.split('/').slice(-1)[0]}
                    </div>
                    <PRMeta>
                      <PRMetaItem>
                        <FaClock size={12} />
                        <span>Updated {formatRelativeTime(pr.updated_at)}</span>
                      </PRMetaItem>
                      <PRMetaItem>
                        <FaCodeBranch size={12} />
                        <span>{pr.head?.ref}</span>
                      </PRMetaItem>
                      <PRMetaItem>
                        {pr.draft ? (
                          <>
                            <FaTimes size={12} color="#888" />
                            <span>Draft</span>
                          </>
                        ) : (
                          <>
                            <FaCheck size={12} color="#29a745" />
                            <span>Ready</span>
                          </>
                        )}
                      </PRMetaItem>
                    </PRMeta>
                    <ReviewStatusContainer>
                      {renderReviewStatus(pr)}
                    </ReviewStatusContainer>
                  </PRItem>
                ))}
              </PRList>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Pull Requests to Review</h3>
              <div style={{ color: '#888', fontSize: '14px' }}>
                {filteredPullRequests.length} of {reviewRequests.length} {reviewRequests.length === 1 ? 'pull request' : 'pull requests'} need your review
              </div>
            </div>
            
            <FilterContainer>
              <FilterGroup>
                <FilterLabel>
                  <FaFilter /> 
                  Filters
                  {activeFilterCount > 0 && <FilterBadge>{activeFilterCount}</FilterBadge>}
                </FilterLabel>
              </FilterGroup>
              
              <SearchInput>
                <FaSearch />
                <input 
                  type="text" 
                  placeholder="Search PR titles..." 
                  value={reviewPrSearchTerm}
                  onChange={(e) => setReviewPrSearchTerm(e.target.value)}
                />
                {reviewPrSearchTerm && (
                  <ClearSearch onClick={() => setReviewPrSearchTerm('')}>
                    <FaTimesCircle />
                  </ClearSearch>
                )}
              </SearchInput>
              
              <FilterGroup>
                <FilterSelect 
                  value={reviewPrRepoFilter} 
                  onChange={(e) => setReviewPrRepoFilter(e.target.value)}
                >
                  {uniqueRepositories.map(repo => (
                    <option key={repo} value={repo}>
                      {repo === 'all' ? 'All repositories' : repo}
                    </option>
                  ))}
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterSelect 
                  value={reviewPrStatusFilter} 
                  onChange={(e) => setReviewPrStatusFilter(e.target.value as StatusFilter)}
                >
                  <option value="all">All statuses</option>
                  <option value="draft">Draft only</option>
                  <option value="ready">Ready only</option>
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterSelect 
                  value={reviewPrAgeFilter} 
                  onChange={(e) => setReviewPrAgeFilter(e.target.value as AgeFilter)}
                >
                  <option value="all">Any time</option>
                  <option value="today">Last 24 hours</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterSelect 
                  value={reviewPrSortOption} 
                  onChange={(e) => setReviewPrSortOption(e.target.value as SortOption)}
                >
                  <option value="newest">Created (newest)</option>
                  <option value="oldest">Created (oldest)</option>
                  <option value="updated">Recently updated</option>
                  <option value="title">Title (A-Z)</option>
                </FilterSelect>
                
                <SortButton 
                  active={true} 
                  onClick={() => setReviewPrSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                >
                  {reviewPrSortDirection === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                </SortButton>
              </FilterGroup>
              
              <FilterGroup>
                <FilterSelect 
                  value={reviewPrReviewFilter} 
                  onChange={(e) => setReviewPrReviewFilter(e.target.value as ReviewFilter)}
                >
                  <option value="all">All reviews</option>
                  <option value="approved">Has approvals</option>
                  <option value="changes_requested">Has changes requested</option>
                  <option value="commented">Has comments</option>
                  <option value="none">No reviews yet</option>
                </FilterSelect>
              </FilterGroup>
              
              {activeFilterCount > 0 && (
                <ClearFilters onClick={clearAllFilters}>
                  Clear all
                </ClearFilters>
              )}
            </FilterContainer>
            
            {filteredPullRequests.length === 0 ? (
              <EmptyState>
                <FaFilter />
                <h3>No matching review requests</h3>
                <p>No review requests match the current filters. Try adjusting or clearing your filters.</p>
                <ClearFilters onClick={clearAllFilters} style={{ margin: '10px auto' }}>
                  Clear all filters
                </ClearFilters>
              </EmptyState>
            ) : (
              <PRList>
                {filteredPullRequests.map((pr: any) => (
                  <PRItem key={pr.id}>
                    <PRHeader>
                      <PRTitle>{pr.title}</PRTitle>
                      <PRLink href={pr.html_url} target="_blank" rel="noopener noreferrer">
                        Review on GitHub <FaExternalLinkAlt size={12} />
                      </PRLink>
                    </PRHeader>
                    <div style={{ color: '#aaa', fontSize: '14px', marginTop: '6px' }}>
                      {pr.repository_url?.split('/').slice(-1)[0]} • Opened by {pr.user?.login}
                    </div>
                    <PRMeta>
                      <PRMetaItem>
                        <FaClock size={12} />
                        <span>Updated {formatRelativeTime(pr.updated_at)}</span>
                      </PRMetaItem>
                      <PRMetaItem>
                        <FaCodeBranch size={12} />
                        <span>{pr.head?.ref}</span>
                      </PRMetaItem>
                      <PRMetaItem style={{ color: '#FF385C' }}>
                        <FaUserEdit size={12} />
                        <span>Review requested</span>
                      </PRMetaItem>
                    </PRMeta>
                    <ReviewStatusContainer>
                      {renderReviewStatus(pr)}
                    </ReviewStatusContainer>
                  </PRItem>
                ))}
              </PRList>
            )}
          </>
        )}
      </>
    );
  };
  
  // The renderTokenManagement function using profile from hook
  const renderTokenManagement = () => {
    if (!isConnected) return null;
    
    return (
      <>
        <ManagementContainer>
          <ManagementHeader>
            <FaUserSecret />
            <h3>Token Management</h3>
          </ManagementHeader>
          
          <p>Your GitHub personal access token is used to securely connect with GitHub API.</p>
          
          {editingToken ? (
            <>
              <EnhancedTokenInput>
                <InputLabel htmlFor="new-github-token">New Personal Access Token</InputLabel>
                <TokenInputField
                  id="new-github-token"
                  type="password"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  placeholder="Enter new GitHub token"
                  autoComplete="off"
                />
                <InputHint>
                  <FaQuestionCircle size={12} />
                  <span>Need a new token? <LinkButton href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer">Create one on GitHub</LinkButton></span>
                </InputHint>
              </EnhancedTokenInput>
              
              <ButtonGroup>
                <PrimaryButton onClick={saveUpdatedToken}>
                  <FaKey /> Save New Token
                </PrimaryButton>
                <OutlineButton onClick={() => setEditingToken(false)}>Cancel</OutlineButton>
              </ButtonGroup>
            </>
          ) : (
            <>
              <div style={{ margin: '16px 0' }}>
                <InputLabel>Current Token</InputLabel>
                <TokenField>
                  <TokenDisplay>{maskToken(token)}</TokenDisplay>
                  <TokenActions>
                    <IconButton onClick={toggleTokenVisibility} title={showFullToken ? "Hide token" : "Show token"}>
                      {showFullToken ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                    <IconButton onClick={startEditingToken} title="Edit token">
                      <FaCog />
                    </IconButton>
                    <IconButton onClick={resetToken} title="Reset token">
                      <FaTrash />
                    </IconButton>
                  </TokenActions>
                </TokenField>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#aaa' }}>Token Security</p>
                  <SecureBadge>
                    <FaLock size={12} />
                    <span>Encrypted at rest</span>
                  </SecureBadge>
                </div>
                
                <OutlineButton onClick={startEditingToken}>
                  <FaKey /> Update Token
                </OutlineButton>
              </div>
              
              <div style={{ marginTop: '24px', padding: '12px', backgroundColor: 'rgba(255, 56, 92, 0.05)', borderRadius: '6px', fontSize: '13px' }}>
                <p style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaQuestionCircle /> <strong>When to update your token:</strong>
                </p>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                  <li>Your current token has expired</li>
                  <li>You need different permissions</li>
                  <li>You suspect your token has been compromised</li>
                  <li>GitHub security alerts recommend rotation</li>
                </ul>
              </div>
            </>
          )}
        </ManagementContainer>
        <ContentSeparator />
      </>
    );
  };
  
  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={onReturn}>
            <FaArrowLeft />
          </BackButton>
          <Title>
            <FaGithub />
            GitHub Dashboard
          </Title>
        </HeaderLeft>
        {isConnected && (
          <RefreshButton 
            onClick={refreshAllPullRequests} 
            title="Refresh GitHub data"
            disabled={loading}
          >
            <FaSync />
          </RefreshButton>
        )}
      </Header>
      <Content>
        {showTokenManagement && isConnected && renderTokenManagement()}
        {renderContent()}
      </Content>
    </Container>
  );
};

export default GitHubPanel; 