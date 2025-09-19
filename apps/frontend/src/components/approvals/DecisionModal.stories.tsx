import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DecisionModal } from './DecisionModal';
import { Button } from '../Button';

// Wrapper component to handle modal state
const ModalWrapper = ({ 
  action, 
  itemCount, 
  isLoading = false, 
  title 
}: { 
  action: 'approve' | 'reject';
  itemCount: number;
  isLoading?: boolean;
  title?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = (action: 'approve' | 'reject', comments?: string, reason?: string) => {
    console.log('Action:', action);
    console.log('Comments:', comments);
    console.log('Reason:', reason);
    
    // Simulate API call
    setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  return (
    <div className="p-6">
      <Button onClick={() => setIsOpen(true)}>
        Open {action === 'approve' ? 'Approval' : 'Rejection'} Modal
      </Button>
      
      <DecisionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        action={action}
        itemCount={itemCount}
        isLoading={isLoading}
        title={title}
      />
    </div>
  );
};

const meta: Meta<typeof DecisionModal> = {
  title: 'Components/Approvals/DecisionModal',
  component: DecisionModal,
  parameters: {
    docs: {
      description: {
        component: 'A modal dialog for confirming approval or rejection of time entries with comments and reasons.'
      }
    }
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open'
    },
    action: {
      control: 'select',
      options: ['approve', 'reject'],
      description: 'The action being performed'
    },
    itemCount: {
      control: 'number',
      description: 'Number of items being acted upon'
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the action is in progress'
    },
    title: {
      control: 'text',
      description: 'Custom title for the modal'
    },
    onClose: {
      action: 'close',
      description: 'Callback when modal is closed'
    },
    onConfirm: {
      action: 'confirm',
      description: 'Callback when action is confirmed'
    }
  }
};

export default meta;
type Story = StoryObj<typeof DecisionModal>;

export const ApprovalSingle: Story = {
  render: () => <ModalWrapper action="approve" itemCount={1} />,
  parameters: {
    docs: {
      description: {
        story: 'Modal for approving a single time entry.'
      }
    }
  }
};

export const ApprovalBulk: Story = {
  render: () => <ModalWrapper action="approve" itemCount={5} />,
  parameters: {
    docs: {
      description: {
        story: 'Modal for approving multiple time entries at once.'
      }
    }
  }
};

export const RejectionSingle: Story = {
  render: () => <ModalWrapper action="reject" itemCount={1} />,
  parameters: {
    docs: {
      description: {
        story: 'Modal for rejecting a single time entry with reason selection.'
      }
    }
  }
};

export const RejectionBulk: Story = {
  render: () => <ModalWrapper action="reject" itemCount={8} />,
  parameters: {
    docs: {
      description: {
        story: 'Modal for rejecting multiple time entries with reason selection.'
      }
    }
  }
};

export const LoadingState: Story = {
  render: () => <ModalWrapper action="approve" itemCount={3} isLoading={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Modal in loading state while processing the action.'
      }
    }
  }
};

export const CustomTitle: Story = {
  render: () => (
    <ModalWrapper 
      action="reject" 
      itemCount={2} 
      title="Reject Overtime Entries" 
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Modal with custom title for specific use cases.'
      }
    }
  }
};

// Static stories for direct modal display
export const DirectApproval: Story = {
  args: {
    isOpen: true,
    action: 'approve',
    itemCount: 1,
    isLoading: false,
    onClose: () => {},
    onConfirm: (action, comments, reason) => {
      console.log('Direct approval:', { action, comments, reason });
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Direct display of approval modal (always open for demonstration).'
      }
    }
  }
};

export const DirectRejection: Story = {
  args: {
    isOpen: true,
    action: 'reject',
    itemCount: 1,
    isLoading: false,
    onClose: () => {},
    onConfirm: (action, comments, reason) => {
      console.log('Direct rejection:', { action, comments, reason });
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Direct display of rejection modal with reason selection (always open for demonstration).'
      }
    }
  }
};

export const DirectBulkApproval: Story = {
  args: {
    isOpen: true,
    action: 'approve',
    itemCount: 12,
    isLoading: false,
    onClose: () => {},
    onConfirm: (action, comments, reason) => {
      console.log('Direct bulk approval:', { action, comments, reason });
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Direct display of bulk approval modal (always open for demonstration).'
      }
    }
  }
};

export const DirectBulkRejection: Story = {
  args: {
    isOpen: true,
    action: 'reject',
    itemCount: 7,
    isLoading: false,
    onClose: () => {},
    onConfirm: (action, comments, reason) => {
      console.log('Direct bulk rejection:', { action, comments, reason });
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Direct display of bulk rejection modal with reason selection (always open for demonstration).'
      }
    }
  }
};

export const DirectLoading: Story = {
  args: {
    isOpen: true,
    action: 'approve',
    itemCount: 3,
    isLoading: true,
    onClose: () => {},
    onConfirm: (action, comments, reason) => {
      console.log('Direct loading:', { action, comments, reason });
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Direct display of modal in loading state (always open for demonstration).'
      }
    }
  }
};

