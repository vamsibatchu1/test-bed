import { DashboardLayout } from "@/components/dashboard/layout"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Download, Filter } from "lucide-react"

const usersData = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2024-01-15",
    department: "Engineering",
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "active",
    lastLogin: "2024-01-14",
    department: "Marketing",
    joinDate: "2023-03-20",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Editor",
    status: "inactive",
    lastLogin: "2024-01-10",
    department: "Sales",
    joinDate: "2023-02-10",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    role: "User",
    status: "pending",
    lastLogin: "2024-01-12",
    department: "HR",
    joinDate: "2024-01-01",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2024-01-15",
    department: "Engineering",
    joinDate: "2023-06-15",
  },
  {
    id: "6",
    name: "Diana Prince",
    email: "diana@example.com",
    role: "Manager",
    status: "active",
    lastLogin: "2024-01-13",
    department: "Operations",
    joinDate: "2023-04-01",
  },
  {
    id: "7",
    name: "Eve Adams",
    email: "eve@example.com",
    role: "User",
    status: "inactive",
    lastLogin: "2024-01-05",
    department: "Marketing",
    joinDate: "2023-08-15",
  },
]

const userColumns = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
  { key: "department", header: "Department" },
  { key: "status", header: "Status" },
  { key: "lastLogin", header: "Last Login" },
  { key: "joinDate", header: "Join Date" },
]

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage your team members and their permissions.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Users table */}
        <DataTable
          data={usersData}
          columns={userColumns}
          title="All Users"
          searchable
          filterable
          downloadable
        />
      </div>
    </DashboardLayout>
  )
} 