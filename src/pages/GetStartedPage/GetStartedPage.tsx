import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import ModelSetupStep from './steps/ModelSetupStep';
import MajorSelectionStep from './steps/MajorSelectionStep';
import FinishStep from './steps/FinishStep';
import { TabPanel, TabView } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { ProfileSetup } from './steps/ProfileStep';
import { SupportedModels, type User } from '../../classes/AguDatabase';

export interface StepComponentProps {
  description: string;
  onComplete: (data: Partial<User>) => void;
  data: Partial<User>;
};

interface Step {
  label: string;
  description: string;
  RenderComponent: (props: StepComponentProps) => JSX.Element;
  onComplete?: (data: Partial<User>) => void;
};

function GetStartedPage() {
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(2);
  const [newUser, setNewUser] = useState<User>({
    id: "",
    apiKey: "",
    firstName: "",
    lastName: "",
    major: "",
    model: Object.values(SupportedModels)[0],
  });
  console.log(newUser);

  const updateUser = (data: Partial<User>) => {
    setNewUser({ ...newUser, ...data });
  };
  const finishSetup = () => {
    navigate("/");
  };
  const checklist = [
    {
      label: "Profile",
      description: "Let's start by setting up your profile. This will help us personalize your AGU experience.",
      RenderComponent: ProfileSetup,
      onComplete: updateUser,
    },
    {
      label: "Model Selection & API Key",
      description: "Before getting started, please provide your preferable Model as well as an API key to power the application",
      RenderComponent: ModelSetupStep,
      onComplete: updateUser,
    },
    {
      label: "Major Selection",
      description: "Select your major from the list or enter a custom major.",
      RenderComponent: MajorSelectionStep,
      onComplete: updateUser
    },
    {
      label: "Get Started",
      description: "You're all set! Click \"Get Started\" to start your AGU journey.",
      RenderComponent: FinishStep,
      onComplete: finishSetup
    },
  ];
  
  return (
    <div>
      <h1 className="mb-3">Welcome to AGU!</h1>
      <TabView activeIndex={activeIndex} onTabChange={(e: { index: any; }) => setActiveIndex(e.index as any)} >
        {checklist.map((step: Step, index: number) => (
          <TabPanel key={index} header={step.label} disabled={index !== activeIndex}>
            <div className="flex flex-col gap-4 items-start">
              {index > 0 ? (
                <Button
                  label="Back"
                  onClick={() => setActiveIndex(activeIndex - 1)}
                  severity="secondary"
                  icon="pi pi-arrow-left"
                />
              ) : (<></>)}
              {step.description && <h2>{step.description}</h2>}
              <step.RenderComponent
                data={newUser}
                description={step.description}
                onComplete={(data: Partial<User>) => { setActiveIndex(activeIndex + 1); step.onComplete?.(data); }}
              />
            </div>
          </TabPanel>
        ))}
      </TabView>
    </div>
  )
}

export default GetStartedPage
