import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Eye } from "lucide-react"

// Sample analytics data
const overviewData = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    isPositive: true,
    icon: DollarSign,
  },
  {
    title: "Active Users",
    value: "2,350",
    change: "+180.1%",
    isPositive: true,
    icon: Users,
  },
  {
    title: "Sales",
    value: "12,234",
    change: "+19%",
    isPositive: true,
    icon: ShoppingCart,
  },
  {
    title: "Page Views",
    value: "573,000",
    change: "-12%",
    isPositive: false,
    icon: Eye,
  },
]

const topProducts = [
  { name: "Product A", sales: 1234, revenue: "$12,345", growth: "+12%" },
  { name: "Product B", sales: 987, revenue: "$9,876", growth: "+8%" },
  { name: "Product C", sales: 756, revenue: "$7,654", growth: "+15%" },
  { name: "Product D", sales: 543, revenue: "$5,432", growth: "+5%" },
  { name: "Product E", sales: 432, revenue: "$4,321", growth: "+3%" },
]

const recentTransactions = [
  {
    id: "1",
    customer: "John Doe",
    amount: "$299.00",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "2",
    customer: "Jane Smith",
    amount: "$199.00",
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "3",
    customer: "Bob Johnson",
    amount: "$399.00",
    status: "completed",
    date: "2024-01-13",
  },
  {
    id: "4",
    customer: "Alice Brown",
    amount: "$149.00",
    status: "failed",
    date: "2024-01-12",
  },
  {
    id: "5",
    customer: "Charlie Wilson",
    amount: "$599.00",
    status: "completed",
    date: "2024-01-11",
  },
]

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your business performance and key metrics.
          </p>
        </div>

        {/* Overview cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {overviewData.map((item) => (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="flex items-center text-xs">
                  {item.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span
                    className={
                      item.isPositive ? "text-green-600" : "text-red-600"
                    }
                  >
                    {item.change}
                  </span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for different analytics views */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Chart placeholder - Revenue over time
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>User Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Chart placeholder - User demographics
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.sales} sales
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.revenue}</p>
                        <p className="text-sm text-green-600">{product.growth}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{transaction.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.date}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{transaction.amount}</p>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : transaction.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 