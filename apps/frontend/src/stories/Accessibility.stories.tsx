import type { Meta, StoryObj } from '@storybook/react';
import { AxeAnnouncer, useAxeAnnouncer } from '../components/a11y/AxeAnnouncer';
import { FocusTrap } from '../components/a11y/FocusTrap';
import { SkipLink, CommonSkipLinks } from '../components/a11y/SkipLink';
import { AccessibilityAudit } from '../components/a11y/AccessibilityAudit';
import { AccessibilityTest } from '../components/a11y/AccessibilityTest';
import { KeyboardNavigation, KeyboardNavigationInstructions } from '../components/a11y/KeyboardNavigation';
import { Button } from '../components/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { useState } from 'react';

const meta: Meta<typeof AxeAnnouncer> = {
  title: 'Accessibility/AxeAnnouncer',
  component: AxeAnnouncer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Accessibility announcer for screen reader announcements.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
    },
    priority: {
      control: 'select',
      options: ['polite', 'assertive'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AxeAnnouncer>;

export const Default: Story = {
  args: {
    message: 'This is a polite announcement for screen readers',
    priority: 'polite',
  },
};

export const Assertive: Story = {
  args: {
    message: 'This is an assertive announcement for urgent information',
    priority: 'assertive',
  },
};

// Interactive example with hook
export const Interactive: Story = {
  render: () => {
    const { announce, message } = useAxeAnnouncer();
    
    return (
      <div className="space-y-4">
        <AxeAnnouncer message={message} />
        <div className="space-x-2">
          <Button onClick={() => announce('Button clicked!')}>
            Announce Click
          </Button>
          <Button onClick={() => announce('Form submitted successfully!', 'assertive')}>
            Announce Success
          </Button>
        </div>
        <p className="text-sm text-text-secondary">
          Use a screen reader to hear the announcements when buttons are clicked.
        </p>
      </div>
    );
  },
};

// FocusTrap Stories
const FocusTrapMeta: Meta<typeof FocusTrap> = {
  title: 'Accessibility/FocusTrap',
  component: FocusTrap,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Focus trap component for modal and dialog accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    active: {
      control: 'boolean',
    },
  },
};

export const FocusTrapStory: StoryObj<typeof FocusTrap> = {
  args: {
    active: true,
  },
  render: (args) => (
    <FocusTrap {...args}>
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Focus Trap Demo</h3>
        <p className="text-text-secondary">
          Tab through these elements. Focus will be trapped within this card.
        </p>
        <div className="space-x-2">
          <Button>First Button</Button>
          <Button>Second Button</Button>
          <Button>Third Button</Button>
        </div>
        <input 
          type="text" 
          placeholder="Type here..."
          className="w-full p-2 border rounded"
        />
        <Button variant="outline">Last Button</Button>
      </Card>
    </FocusTrap>
  ),
};

export const FocusTrapInactive: StoryObj<typeof FocusTrap> = {
  args: {
    active: false,
  },
  render: (args) => (
    <FocusTrap {...args}>
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">No Focus Trap</h3>
        <p className="text-text-secondary">
          Focus is not trapped. You can tab out of this card.
        </p>
        <div className="space-x-2">
          <Button>First Button</Button>
          <Button>Second Button</Button>
        </div>
      </Card>
    </FocusTrap>
  ),
};

// SkipLink Stories
const SkipLinkMeta: Meta<typeof SkipLink> = {
  title: 'Accessibility/SkipLink',
  component: SkipLink,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Skip links for keyboard navigation accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
    },
  },
};

export const SkipLinkStory: StoryObj<typeof SkipLink> = {
  args: {
    href: '#main-content',
    children: 'Skip to main content',
  },
  render: (args) => (
    <div className="min-h-screen">
      <SkipLink {...args} />
      <header className="p-4 bg-surface-card border-b">
        <h1>Page Header</h1>
        <nav className="space-x-4">
          <a href="#nav1">Navigation 1</a>
          <a href="#nav2">Navigation 2</a>
          <a href="#nav3">Navigation 3</a>
        </nav>
      </header>
      <main id="main-content" className="p-6">
        <h2>Main Content</h2>
        <p>This is the main content area. Press Tab to see the skip link.</p>
      </main>
    </div>
  ),
};

export const CommonSkipLinksStory: StoryObj = {
  render: () => (
    <div className="min-h-screen">
      <CommonSkipLinks />
      <header className="p-4 bg-surface-card border-b">
        <h1>Page Header</h1>
        <nav className="space-x-4">
          <a href="#nav1">Navigation 1</a>
          <a href="#nav2">Navigation 2</a>
          <a href="#nav3">Navigation 3</a>
        </nav>
      </header>
      <main id="main-content" className="p-6">
        <h2>Main Content</h2>
        <p>This page includes common skip links. Press Tab to see them.</p>
      </main>
    </div>
  ),
};

// AccessibilityAudit Stories
const AccessibilityAuditMeta: Meta<typeof AccessibilityAudit> = {
  title: 'Accessibility/AccessibilityAudit',
  component: AccessibilityAudit,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Accessibility audit component for testing and validation.',
      },
    },
  },
  tags: ['autodocs'],
};

export const AccessibilityAuditStory: StoryObj<typeof AccessibilityAudit> = {
  render: () => (
    <div className="space-y-4">
      <AccessibilityAudit />
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sample Content for Audit</h3>
        <div className="space-y-3">
          <Button>Accessible Button</Button>
          <input 
            type="text" 
            placeholder="Accessible input"
            className="w-full p-2 border rounded"
            aria-label="Sample input field"
          />
          <div role="alert" aria-live="polite">
            This is an accessible alert message.
          </div>
        </div>
      </Card>
    </div>
  ),
};

// Modal with Focus Trap Example
export const ModalWithFocusTrap: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>
          Open Modal
        </Button>
        
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <FocusTrap active={isOpen} onEscape={() => setIsOpen(false)}>
              <Card className="p-6 max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4">Modal Dialog</h2>
                <p className="text-text-secondary mb-6">
                  This modal uses FocusTrap to ensure proper keyboard navigation.
                </p>
                <div className="space-x-2">
                  <Button onClick={() => setIsOpen(false)}>
                    Close
                  </Button>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            </FocusTrap>
          </Dialog>
        )}
      </div>
    );
  },
};

// AccessibilityAudit Stories
const AccessibilityAuditMeta: Meta<typeof AccessibilityAudit> = {
  title: 'Accessibility/AccessibilityAudit',
  component: AccessibilityAudit,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive accessibility audit tool using axe-core for WCAG 2.1 AA compliance testing.',
      },
    },
  },
  tags: ['autodocs'],
};

export const AccessibilityAuditDefault: StoryObj = {
  render: () => <AccessibilityAudit />,
};

export const AccessibilityAuditWithCallback: StoryObj = {
  render: () => (
    <AccessibilityAudit 
      onAuditComplete={(results) => {
        console.log('Audit completed:', results);
      }}
    />
  ),
};

// AccessibilityTest Stories
const AccessibilityTestMeta: Meta<typeof AccessibilityTest> = {
  title: 'Accessibility/AccessibilityTest',
  component: AccessibilityTest,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Automated accessibility testing component for WCAG 2.1 AA compliance validation.',
      },
    },
  },
  tags: ['autodocs'],
};

export const AccessibilityTestDefault: StoryObj = {
  render: () => <AccessibilityTest />,
};

export const AccessibilityTestWithCallback: StoryObj = {
  render: () => (
    <AccessibilityTest 
      onTestComplete={(results) => {
        console.log('Tests completed:', results);
      }}
    />
  ),
};

// KeyboardNavigation Stories
const KeyboardNavigationMeta: Meta<typeof KeyboardNavigation> = {
  title: 'Accessibility/KeyboardNavigation',
  component: KeyboardNavigation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Keyboard navigation wrapper component with arrow key support and focus management.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    trapFocus: {
      control: 'boolean',
    },
    initialFocus: {
      control: 'boolean',
    },
  },
};

export const KeyboardNavigationDefault: StoryObj = {
  args: {
    trapFocus: false,
    initialFocus: false,
  },
  render: (args) => (
    <KeyboardNavigation {...args}>
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Keyboard Navigation Demo</h2>
        <p className="text-text-secondary">
          Use arrow keys to navigate between elements. Press Tab to move focus.
        </p>
        <div className="space-x-2">
          <Button>First Button</Button>
          <Button variant="outline">Second Button</Button>
          <Button variant="ghost">Third Button</Button>
        </div>
        <input 
          type="text" 
          placeholder="Type here..."
          className="w-full p-2 border rounded"
          aria-label="Test input field"
        />
      </div>
    </KeyboardNavigation>
  ),
};

export const KeyboardNavigationWithTrap: StoryObj = {
  args: {
    trapFocus: true,
    initialFocus: true,
  },
  render: (args) => (
    <KeyboardNavigation {...args}>
      <div className="p-6 space-y-4 bg-surface-card border rounded">
        <h2 className="text-xl font-semibold">Focus Trap Demo</h2>
        <p className="text-text-secondary">
          Focus is trapped within this container. Tab will cycle through elements.
        </p>
        <div className="space-x-2">
          <Button>Button 1</Button>
          <Button variant="outline">Button 2</Button>
          <Button variant="ghost">Button 3</Button>
        </div>
        <input 
          type="text" 
          placeholder="Input field"
          className="w-full p-2 border rounded"
          aria-label="Test input field"
        />
        <Button variant="outline">Last Button</Button>
      </div>
    </KeyboardNavigation>
  ),
};

// KeyboardNavigationInstructions Stories
const KeyboardNavigationInstructionsMeta: Meta<typeof KeyboardNavigationInstructions> = {
  title: 'Accessibility/KeyboardNavigationInstructions',
  component: KeyboardNavigationInstructions,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Keyboard navigation instructions modal. Press F1 to toggle.',
      },
    },
  },
  tags: ['autodocs'],
};

export const KeyboardNavigationInstructionsDefault: StoryObj = {
  render: () => (
    <div>
      <KeyboardNavigationInstructions />
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Keyboard Instructions Demo</h2>
        <p className="text-text-secondary mb-4">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">F1</kbd> to show/hide keyboard navigation instructions.
        </p>
        <Button>Test Button</Button>
      </div>
    </div>
  ),
};