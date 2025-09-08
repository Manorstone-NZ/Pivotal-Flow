import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from '../components/ui/DataTable';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const sampleData: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2024-01-14',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    status: 'inactive',
    lastLogin: '2024-01-10',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'Moderator',
    status: 'active',
    lastLogin: '2024-01-13',
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2024-01-12',
  },
];

const columnHelper = createColumnHelper<User>();

const columns: ColumnDef<User>[] = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    cell: (info) => (
      <span className="px-2 py-1 text-xs font-medium bg-brand-primary text-text-inverse rounded-full">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        info.getValue() === 'active'
          ? 'bg-semantic-success text-white'
          : 'bg-semantic-error text-white'
      }`}>
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('lastLogin', {
    header: 'Last Login',
    cell: (info) => info.getValue(),
  }),
];

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A powerful data table component built with TanStack Table, featuring sorting, filtering, pagination, and CSV export.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    searchable: {
      control: 'boolean',
    },
    sortable: {
      control: 'boolean',
    },
    pagination: {
      control: 'boolean',
    },
    density: {
      control: 'select',
      options: ['compact', 'normal', 'comfortable'],
    },
    striped: {
      control: 'boolean',
    },
    hoverable: {
      control: 'boolean',
    },
    exportable: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

export const Default: Story = {
  args: {
    data: sampleData,
    columns: columns,
  },
};

export const Compact: Story = {
  args: {
    data: sampleData,
    columns: columns,
    density: 'compact',
  },
};

export const Comfortable: Story = {
  args: {
    data: sampleData,
    columns: columns,
    density: 'comfortable',
  },
};

export const NoSearch: Story = {
  args: {
    data: sampleData,
    columns: columns,
    searchable: false,
  },
};

export const NoSorting: Story = {
  args: {
    data: sampleData,
    columns: columns,
    sortable: false,
  },
};

export const NoPagination: Story = {
  args: {
    data: sampleData,
    columns: columns,
    pagination: false,
  },
};

export const NoExport: Story = {
  args: {
    data: sampleData,
    columns: columns,
    exportable: false,
  },
};

export const WithRowClick: Story = {
  args: {
    data: sampleData,
    columns: columns,
    onRowClick: (row: User) => alert(`Clicked on ${row.name}`),
  },
};

export const LargeDataset: Story = {
  args: {
    data: Array.from({ length: 100 }, (_, i) => ({
      id: (i + 1).toString(),
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: ['Admin', 'User', 'Moderator'][i % 3],
      status: ['active', 'inactive'][i % 2] as 'active' | 'inactive',
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })),
    columns: columns,
    pageSize: 5,
  },
};
