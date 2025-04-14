import React from 'react';
import { 
  FaCode, 
  FaPlus, 
  FaFileImport, 
  FaBookmark, 
  FaCog,
  FaKey,
  FaStickyNote,
  FaColumns,
  FaRocket,
  FaLightbulb,
  FaRegCompass
} from 'react-icons/fa';
import styled from 'styled-components';

interface HomeProps {
  onCreateCollection: () => void;
  onImportFromFile?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToSecrets?: () => void;
  onNavigateToKanban?: () => void;
}

// Styled components
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: #121212;
  color: #e0e0e0;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const AppLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.div`
  background: linear-gradient(135deg, #FF385C 0%, #FF5F85 100%);
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 56, 92, 0.3);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-left: auto;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 56, 92, 0.1);
    border-color: #FF385C;
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 16px;
    color: #FF385C;
  }
`;

const PrimaryButton = styled(ActionButton)`
  background-color: #FF385C;
  border: none;
  
  svg {
    color: white;
  }
  
  &:hover {
    background-color: #FF5F85;
    box-shadow: 0 4px 12px rgba(255, 56, 92, 0.3);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 40px;
  overflow-y: auto;
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const WelcomeTitle = styled.h1`
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #FF385C 0%, #FF5F85 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const WelcomeSubtitle = styled.p`
  font-size: 18px;
  color: #BBBBBB;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
`;

const QuickLinksSection = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #FF385C;
  }
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const QuickLinkCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const QuickLinkIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: rgba(255, 56, 92, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  
  svg {
    font-size: 24px;
    color: #FF385C;
  }
`;

const QuickLinkTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const QuickLinkDescription = styled.p`
  font-size: 14px;
  color: #BBBBBB;
  line-height: 1.5;
`;

const FeaturedSection = styled.div`
  margin-top: 60px;
`;

const FeaturedBox = styled.div`
  background: linear-gradient(135deg, rgba(255, 56, 92, 0.15) 0%, rgba(255, 95, 133, 0.05) 100%);
  border-radius: 16px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 40px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 56, 92, 0.2) 0%, rgba(18, 18, 18, 0) 70%);
    z-index: 0;
  }
`;

const FeaturedContent = styled.div`
  flex: 1;
  z-index: 1;
`;

const FeaturedTitle = styled.h2`
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const FeaturedDescription = styled.p`
  font-size: 16px;
  color: #BBBBBB;
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 80%;
`;

const FeaturedIcon = styled.div`
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  flex-shrink: 0;
  
  svg {
    font-size: 64px;
    background: linear-gradient(135deg, #FF385C 0%, #FF5F85 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Home: React.FC<HomeProps> = ({
  onCreateCollection,
  onImportFromFile,
  onNavigateToSettings,
  onNavigateToSecrets,
  onNavigateToKanban
}) => {
  return (
    <HomeContainer>
      <Header>
        <AppLogo>
          <LogoIcon>
            <FaCode size={22} color="#FFF" />
          </LogoIcon>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 500 }}>Hapi</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Dev Tools</p>
          </div>
        </AppLogo>
        
        <ActionButtons>
          {onImportFromFile && (
            <ActionButton onClick={onImportFromFile}>
              <FaFileImport /> Import
            </ActionButton>
          )}
          {onNavigateToSettings && (
            <ActionButton onClick={onNavigateToSettings}>
              <FaCog /> Settings
            </ActionButton>
          )}
          <PrimaryButton onClick={onCreateCollection}>
            <FaPlus /> New Collection
          </PrimaryButton>
        </ActionButtons>
      </Header>
      
      <Content>
        <WelcomeSection>
          <WelcomeTitle>Welcome to Hapi Dev Tools</WelcomeTitle>
          <WelcomeSubtitle>
            Your modern API testing and development platform. Build, test, and debug API requests with ease.
          </WelcomeSubtitle>
        </WelcomeSection>
        
        <QuickLinksSection>
          <SectionTitle>
            <FaRegCompass /> Quick Links
          </SectionTitle>
          
          <QuickLinksGrid>
            <QuickLinkCard onClick={onCreateCollection}>
              <QuickLinkIcon>
                <FaPlus />
              </QuickLinkIcon>
              <QuickLinkTitle>Create Collection</QuickLinkTitle>
              <QuickLinkDescription>
                Create a new API collection to organize your requests and workflows.
              </QuickLinkDescription>
            </QuickLinkCard>
            
            {onImportFromFile && (
              <QuickLinkCard onClick={onImportFromFile}>
                <QuickLinkIcon>
                  <FaFileImport />
                </QuickLinkIcon>
                <QuickLinkTitle>Import Collection</QuickLinkTitle>
                <QuickLinkDescription>
                  Import existing collections from Postman, Insomnia, or other tools.
                </QuickLinkDescription>
              </QuickLinkCard>
            )}
            
            <QuickLinkCard>
              <QuickLinkIcon>
                <FaBookmark />
              </QuickLinkIcon>
              <QuickLinkTitle>Saved Collections</QuickLinkTitle>
              <QuickLinkDescription>
                Access your previously saved API collections and environments.
              </QuickLinkDescription>
            </QuickLinkCard>
            
            {onNavigateToSecrets && (
              <QuickLinkCard onClick={onNavigateToSecrets}>
                <QuickLinkIcon>
                  <FaKey />
                </QuickLinkIcon>
                <QuickLinkTitle>Secrets Manager</QuickLinkTitle>
                <QuickLinkDescription>
                  Securely store and manage API keys, tokens, and credentials.
                </QuickLinkDescription>
              </QuickLinkCard>
            )}
            
            {onNavigateToKanban && (
              <QuickLinkCard onClick={onNavigateToKanban}>
                <QuickLinkIcon>
                  <FaColumns />
                </QuickLinkIcon>
                <QuickLinkTitle>Project Board</QuickLinkTitle>
                <QuickLinkDescription>
                  Track your API development tasks and manage your workflow.
                </QuickLinkDescription>
              </QuickLinkCard>
            )}
            
            <QuickLinkCard>
              <QuickLinkIcon>
                <FaStickyNote />
              </QuickLinkIcon>
              <QuickLinkTitle>Notes</QuickLinkTitle>
              <QuickLinkDescription>
                Create and organize notes related to your API projects.
              </QuickLinkDescription>
            </QuickLinkCard>
          </QuickLinksGrid>
        </QuickLinksSection>
        
        <FeaturedSection>
          <FeaturedBox>
            <FeaturedContent>
              <FeaturedTitle>Build and Test APIs with Confidence</FeaturedTitle>
              <FeaturedDescription>
                Create API requests, organize them into collections, and set up automated tests to ensure your endpoints work as expected.
              </FeaturedDescription>
              <PrimaryButton onClick={onCreateCollection}>
                <FaRocket /> Get Started
              </PrimaryButton>
            </FeaturedContent>
            <FeaturedIcon>
              <FaLightbulb />
            </FeaturedIcon>
          </FeaturedBox>
        </FeaturedSection>
      </Content>
    </HomeContainer>
  );
};

export default Home; 