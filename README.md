# Next.js Dashboard with Shadcn UI

A modern, responsive dashboard built with Next.js 14, TypeScript, Tailwind CSS, and Shadcn UI components. This project demonstrates a comprehensive admin dashboard with various UI components and features.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Complete Shadcn UI component library
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Dashboard Layout**: Sidebar navigation with header and main content area
- **Multiple Pages**: Dashboard, Users, Analytics, Reports, Calendar, and Settings
- **Interactive Components**: Data tables, forms, cards, tabs, and more
- **Accessibility**: Built with accessibility best practices
- **Type Safety**: Full TypeScript support

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard page
│   │   ├── users/
│   │   │   └── page.tsx          # Users management page
│   │   ├── analytics/
│   │   │   └── page.tsx          # Analytics and charts page
│   │   ├── reports/
│   │   │   └── page.tsx          # Reports generation page
│   │   ├── calendar/
│   │   │   └── page.tsx          # Calendar and events page
│   │   └── settings/
│   │       └── page.tsx          # Settings and configuration page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (redirects to dashboard)
├── components/
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── ...                   # All other UI components
│   └── dashboard/                # Dashboard-specific components
│       ├── layout.tsx            # Dashboard layout wrapper
│       ├── sidebar.tsx           # Navigation sidebar
│       ├── header.tsx            # Top header with search and user menu
│       ├── stats-card.tsx        # Statistics card component
│       ├── recent-activity.tsx   # Recent activity feed
│       └── data-table.tsx        # Reusable data table component
├── lib/
│   └── utils.ts                  # Utility functions
└── hooks/
    └── use-mobile.ts             # Mobile detection hook
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test-bed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Dependencies

### Core Dependencies
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework

### UI Components
- **Shadcn UI**: High-quality React components
- **Radix UI**: Headless UI primitives
- **Lucide React**: Beautiful icons
- **date-fns**: Date utility library
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging utility

### Development Dependencies
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **@types/node**: Node.js type definitions
- **@types/react**: React type definitions

## 🎨 Components Overview

### Dashboard Components

#### Layout Components
- **DashboardLayout**: Main layout wrapper with sidebar and header
- **Sidebar**: Responsive navigation sidebar with mobile support
- **Header**: Top header with search, notifications, and user menu

#### Data Display Components
- **StatsCard**: Display key metrics with trends
- **DataTable**: Searchable, filterable data table
- **RecentActivity**: Activity feed with user actions

#### Page Components
- **Dashboard**: Overview with stats, activity, and quick actions
- **Users**: User management with data table
- **Analytics**: Charts and performance metrics
- **Reports**: Report generation and templates
- **Calendar**: Event management and scheduling
- **Settings**: User preferences and configuration

### Shadcn UI Components Used
- Button, Card, Input, Label, Select, Textarea
- Badge, Avatar, Dropdown Menu, Sheet
- Table, Tabs, Dialog, Form
- Switch, Separator, Navigation Menu
- And more...

## 🎯 Key Features

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive grid layouts
- Touch-friendly interactions

### Navigation
- Sidebar navigation with active states
- Breadcrumb navigation
- Mobile hamburger menu
- User dropdown menu

### Data Management
- Searchable data tables
- Filtering and sorting
- Export functionality
- Pagination support

### Forms and Inputs
- Form validation
- Input masking
- File uploads
- Multi-step forms

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management

## 🔧 Customization

### Theming
The project uses CSS variables for theming. You can customize colors in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... more variables */
}
```

### Adding New Components
1. Use Shadcn CLI to add new components:
   ```bash
   npx shadcn@latest add <component-name>
   ```

2. Create custom components in `src/components/`

### Styling
- Use Tailwind CSS classes for styling
- Follow the existing design patterns
- Use CSS variables for consistent theming

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
The project can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the amazing component library
- [Radix UI](https://www.radix-ui.com/) for the headless UI primitives
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the beautiful icons
