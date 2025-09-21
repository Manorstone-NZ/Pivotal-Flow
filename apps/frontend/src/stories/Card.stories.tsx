import type { Meta, StoryObj } from '@storybook/react-vite';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription 
} from '../../components/ui/card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/ui/badge';
import { useState } from 'react';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A card component for displaying content in a structured container.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outlined', 'elevated', 'flat'],
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
    },
    hover: {
      control: { type: 'boolean' },
    },
    clickable: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          This is a description of the card content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>Standard card with border</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is a default card variant.</p>
        </CardContent>
      </Card>
      
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Outlined Card</CardTitle>
          <CardDescription>Card with outlined border</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is an outlined card variant.</p>
        </CardContent>
      </Card>
      
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>Card with elevated shadow</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is an elevated card variant.</p>
        </CardContent>
      </Card>
      
      <Card variant="flat">
        <CardHeader>
          <CardTitle>Flat Card</CardTitle>
          <CardDescription>Card with flat background</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is a flat card variant.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const PaddingSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Card padding="none">
        <div className="p-4 bg-gray-100 rounded">
          <CardTitle>No Padding</CardTitle>
          <CardDescription>Card with no internal padding</CardDescription>
        </div>
      </Card>
      
      <Card padding="sm">
        <CardTitle>Small Padding</CardTitle>
        <CardDescription>Card with small padding</CardDescription>
      </Card>
      
      <Card padding="md">
        <CardTitle>Medium Padding</CardTitle>
        <CardDescription>Card with medium padding (default)</CardDescription>
      </Card>
      
      <Card padding="lg">
        <CardTitle>Large Padding</CardTitle>
        <CardDescription>Card with large padding</CardDescription>
      </Card>
    </div>
  ),
};

export const HoverEffects: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card hover>
        <CardHeader>
          <CardTitle>Hover Card</CardTitle>
          <CardDescription>Hover over this card to see the effect</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card has a hover effect.</p>
        </CardContent>
      </Card>
      
      <Card clickable onClick={() => alert('Card clicked!')}>
        <CardHeader>
          <CardTitle>Clickable Card</CardTitle>
          <CardDescription>Click this card to see the interaction</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card is clickable and has hover effects.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const WithBadges: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Current project information</CardDescription>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Progress</span>
            <Badge variant="primary">75%</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Issues</span>
            <Badge variant="warning">3</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Team Size</span>
            <Badge variant="info">8</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <Button size="sm">View Details</Button>
          <Button size="sm" variant="outline">Edit</Button>
        </div>
      </CardFooter>
    </Card>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-semibold">JD</span>
          </div>
          <div>
            <CardTitle>John Doe</CardTitle>
            <CardDescription>Software Engineer</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge dot variant="success" />
            <span className="text-sm">Online</span>
          </div>
          <p className="text-sm text-gray-600">
            Working on the new dashboard feature. Available for collaboration.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Button size="sm" className="flex-1">Message</Button>
          <Button size="sm" variant="outline" className="flex-1">Profile</Button>
        </div>
      </CardFooter>
    </Card>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <Card clickable onClick={() => alert('Product clicked!')} className="max-w-sm">
      <CardHeader>
        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
          <span className="text-gray-500">Product Image</span>
        </div>
        <div className="p-4">
          <CardTitle>Premium Headphones</CardTitle>
          <CardDescription>Wireless noise-canceling headphones</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">$299</span>
          <Badge variant="success">In Stock</Badge>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-yellow-400">★</span>
          ))}
          <span className="text-sm text-gray-600 ml-1">(4.8)</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    
    const cards = [
      { id: 'card1', title: 'Option 1', description: 'First option' },
      { id: 'card2', title: 'Option 2', description: 'Second option' },
      { id: 'card3', title: 'Option 3', description: 'Third option' },
    ];
    
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Selected: <strong>{selectedCard || 'None'}</strong>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Card
              key={card.id}
              clickable
              onClick={() => setSelectedCard(card.id)}
              className={selectedCard === card.id ? 'ring-2 ring-brand-primary' : ''}
            >
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Click to select this option.</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setSelectedCard(null)} variant="outline">
            Clear Selection
          </Button>
          <Button onClick={() => alert(`Selected: ${selectedCard}`)}>
            Confirm Selection
          </Button>
        </div>
      </div>
    );
  },
};
