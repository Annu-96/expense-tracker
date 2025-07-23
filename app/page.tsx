"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Wallet, Plus, Edit, Trash2, AlertTriangle, DollarSign, TrendingUp, Calendar } from "lucide-react"

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

const categories = [
  "Food & Dining",
  "Transportation",
  "Books & Supplies",
  "Entertainment",
  "Clothing",
  "Health & Medical",
  "Utilities",
  "Other",
]

const categoryColors = {
  "Food & Dining": "#FF6B6B",
  Transportation: "#4ECDC4",
  "Books & Supplies": "#45B7D1",
  Entertainment: "#96CEB4",
  Clothing: "#FFEAA7",
  "Health & Medical": "#DDA0DD",
  Utilities: "#98D8C8",
  Other: "#F7DC6F",
}

export default function ExpenseTracker() {
  const [budget, setBudget] = useState<number>(0)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isBudgetSet, setIsBudgetSet] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedBudget = localStorage.getItem("studentBudget")
    const savedExpenses = localStorage.getItem("studentExpenses")

    if (savedBudget) {
      setBudget(Number.parseFloat(savedBudget))
      setIsBudgetSet(true)
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }
  }, [])

  // Save to localStorage whenever budget or expenses change
  useEffect(() => {
    if (budget > 0) {
      localStorage.setItem("studentBudget", budget.toString())
    }
  }, [budget])

  useEffect(() => {
    localStorage.setItem("studentExpenses", JSON.stringify(expenses))
  }, [expenses])

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remainingBalance = budget - totalSpent
  const spentPercentage = budget > 0 ? (totalSpent / budget) * 100 : 0

  const handleSetBudget = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const budgetAmount = Number.parseFloat(formData.get("budget") as string)

    if (budgetAmount > 0) {
      setBudget(budgetAmount)
      setIsBudgetSet(true)
    }
  }

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newExpense.description || !newExpense.amount || !newExpense.category) {
      return
    }

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: Number.parseFloat(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
    }

    setExpenses([...expenses, expense])
    setNewExpense({
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsEditDialogOpen(true)
  }

  const handleUpdateExpense = (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingExpense) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const updatedExpense: Expense = {
      ...editingExpense,
      description: formData.get("description") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      category: formData.get("category") as string,
      date: formData.get("date") as string,
    }

    setExpenses(expenses.map((exp) => (exp.id === editingExpense.id ? updatedExpense : exp)))

    setIsEditDialogOpen(false)
    setEditingExpense(null)
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  const getCategoryData = () => {
    const categoryTotals = expenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
      color: categoryColors[category as keyof typeof categoryColors],
    }))
  }

  const getAlertLevel = () => {
    if (spentPercentage >= 100) return "exceeded"
    if (spentPercentage >= 75) return "high"
    if (spentPercentage >= 50) return "medium"
    return "low"
  }

  const renderAlert = () => {
    const alertLevel = getAlertLevel()

    if (alertLevel === "low") return null

    const alertConfig = {
      exceeded: {
        variant: "destructive" as const,
        icon: <AlertTriangle className="h-4 w-4" />,
        title: "Hey there! 📢",
        message: `You've spent $${totalSpent.toFixed(2)} out of your $${budget.toFixed(2)} budget this month. No worries - it happens! Consider reviewing your expenses and maybe adjusting your budget for next month. You've got this! 💪`,
      },
      high: {
        variant: "destructive" as const,
        icon: <AlertTriangle className="h-4 w-4" />,
        title: "Heads up! ⚠️",
        message: `You've used 75% of your budget ($${totalSpent.toFixed(2)} out of $${budget.toFixed(2)}). You're doing great at tracking your expenses! Maybe consider slowing down on non-essential purchases for the rest of the month. 🎯`,
      },
      medium: {
        variant: "default" as const,
        icon: <AlertTriangle className="h-4 w-4" />,
        title: "Good progress! 👍",
        message: `You've spent half of your monthly budget ($${totalSpent.toFixed(2)} out of $${budget.toFixed(2)}). You're staying on track! Keep monitoring your spending to finish the month strong. 🌟`,
      },
    }

    const config = alertConfig[alertLevel]

    return (
      <Alert variant={config.variant} className="mb-6 border-l-4">
        <div className="flex items-start gap-3">
          {config.icon}
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{config.title}</h4>
            <AlertDescription className="text-sm leading-relaxed">{config.message}</AlertDescription>
          </div>
        </div>
      </Alert>
    )
  }

  if (!isBudgetSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Welcome to Your Expense Tracker</CardTitle>
              <CardDescription>Let's start by setting your monthly budget</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetBudget} className="space-y-4">
                <div>
                  <Label htmlFor="budget">Monthly Budget ($)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    step="0.01"
                    placeholder="Enter your monthly budget"
                    required
                    className="text-lg"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Set Budget & Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Expense Tracker</h1>
          <p className="text-gray-600">Manage your budget and track your spending</p>
        </div>

        {renderAlert()}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${budget.toFixed(2)}</div>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={() => setIsBudgetSet(false)}>
                Update Budget
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{spentPercentage.toFixed(1)}% of budget</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remainingBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${remainingBalance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {remainingBalance >= 0 ? "Available to spend" : "Over budget"}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Friendly Tips Section */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">💡</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-1">Student Money Tip</h3>
                <p className="text-sm text-blue-700">
                  {spentPercentage < 25
                    ? "Great start! You're being mindful with your spending. Keep tracking every expense to build good habits! 🎓"
                    : spentPercentage < 50
                      ? "You're doing well! Consider setting aside a small emergency fund from your remaining budget. 💰"
                      : spentPercentage < 75
                        ? "Halfway through your budget! Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. 📊"
                        : spentPercentage < 100
                          ? "Budget running low! Focus on essentials like food and transport. Skip the coffee shop for a few days! ☕"
                          : "Over budget? It's a learning experience! Review your expenses to see where you can cut back next month. 📚"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="add-expense">Add Expense</TabsTrigger>
            <TabsTrigger value="expenses">All Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Visual breakdown of your expenses</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  {getCategoryData().length > 0 ? (
                    <div className="w-full h-[350px] flex items-center justify-center">
                      <ChartContainer config={{}} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getCategoryData()}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              innerRadius={40}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {getCategoryData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                                      <p className="font-medium">{payload[0].name}</p>
                                      <p className="text-sm text-gray-600">Amount: ${payload[0].value?.toFixed(2)}</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  ) : (
                    <div className="h-[350px] flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <TrendingUp className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">No expenses to display</p>
                      <p className="text-sm">Add some expenses to see your spending breakdown</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Spending amounts by category</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  {getCategoryData().length > 0 ? (
                    <div className="w-full h-[350px]">
                      <ChartContainer config={{}} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getCategoryData()} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={11} interval={0} />
                            <YAxis fontSize={12} tickFormatter={(value) => `$${value}`} />
                            <ChartTooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                                      <p className="font-medium">{label}</p>
                                      <p className="text-sm text-gray-600">Amount: ${payload[0].value?.toFixed(2)}</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {getCategoryData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  ) : (
                    <div className="h-[350px] flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <BarChart className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">No expenses to display</p>
                      <p className="text-sm">Add some expenses to see your category breakdown</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{expenses.length}</div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600 mb-2">{getCategoryData().length}</div>
                  <p className="text-sm text-gray-600">Categories Used</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    ${expenses.length > 0 ? (totalSpent / expenses.length).toFixed(2) : "0.00"}
                  </div>
                  <p className="text-sm text-gray-600">Average per Transaction</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="add-expense">
            <Card>
              <CardHeader>
                <CardTitle>Add New Expense</CardTitle>
                <CardDescription>Record a new expense to track your spending</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="e.g., Lunch at cafeteria"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newExpense.category}
                        onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>All Expenses</CardTitle>
                <CardDescription>View, edit, and delete your recorded expenses</CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No expenses recorded yet</p>
                    <p className="text-sm">Add your first expense to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{expense.description}</h3>
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: categoryColors[expense.category as keyof typeof categoryColors] + "20",
                                color: categoryColors[expense.category as keyof typeof categoryColors],
                              }}
                            >
                              {expense.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-semibold text-lg text-red-600">${expense.amount.toFixed(2)}</span>
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditExpense(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
              <DialogDescription>Update the details of your expense</DialogDescription>
            </DialogHeader>
            {editingExpense && (
              <form onSubmit={handleUpdateExpense} className="space-y-4">
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Input id="edit-description" name="description" defaultValue={editingExpense.description} required />
                </div>
                <div>
                  <Label htmlFor="edit-amount">Amount ($)</Label>
                  <Input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={editingExpense.amount}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select name="category" defaultValue={editingExpense.category} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input id="edit-date" name="date" type="date" defaultValue={editingExpense.date} required />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Expense</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
