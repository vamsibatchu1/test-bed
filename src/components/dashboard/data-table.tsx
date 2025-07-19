"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download } from "lucide-react"

interface Column {
  key: string
  header: string
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
}

interface DataTableProps {
  data: Record<string, unknown>[]
  columns: Column[]
  title?: string
  searchable?: boolean
  filterable?: boolean
  downloadable?: boolean
}

export function DataTable({
  data,
  columns,
  title = "Data Table",
  searchable = true,
  filterable = true,
  downloadable = true,
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredData, setFilteredData] = useState(data)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key]
        if (typeof value === "string") {
          return value.toLowerCase().includes(query.toLowerCase())
        }
        if (typeof value === "number") {
          return value.toString().includes(query)
        }
        return false
      })
    )
    setFilteredData(filtered)
  }

  const renderCell = (column: Column, row: Record<string, unknown>) => {
    const value = row[column.key]
    
    if (column.render) {
      return column.render(value, row)
    }

    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      )
    }

    if (typeof value === "string" && value.includes("status")) {
      const statusColors = {
        active: "bg-green-100 text-green-800",
        inactive: "bg-red-100 text-red-800",
        pending: "bg-yellow-100 text-yellow-800",
      }
      const status = value.toLowerCase()
      return (
        <Badge
          variant="secondary"
          className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
        >
          {value}
        </Badge>
      )
    }

    return String(value || "")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {downloadable && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            {filterable && (
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            )}
          </div>
        </div>
        {searchable && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {renderCell(column, row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 