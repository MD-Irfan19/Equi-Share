import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  CalendarIcon, 
  Users, 
  Tag,
  Calculator,
  ArrowLeft 
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { useGroups } from "@/hooks/useGroups";
import { useCreateExpense } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/use-toast";

const NewExpense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const createExpenseMutation = useCreateExpense();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [notes, setNotes] = useState("");

  // Set initial group from URL params if available
  useEffect(() => {
    const groupId = searchParams.get('group');
    if (groupId) {
      setSelectedGroup(groupId);
    }
  }, [searchParams]);

  const categories = [
    { value: "food", label: "Food & Dining", icon: "🍽️" },
    { value: "transport", label: "Transportation", icon: "🚗" },
    { value: "accommodation", label: "Accommodation", icon: "🏨" },
    { value: "entertainment", label: "Entertainment", icon: "🎬" },
    { value: "shopping", label: "Shopping", icon: "🛍️" },
    { value: "utilities", label: "Utilities", icon: "💡" },
    { value: "other", label: "Other", icon: "📦" }
  ];

  const selectedGroupData = groups.find(g => g.id === selectedGroup);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroup || !amount || !description || !selectedCategory || !date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Validate amount is a valid number
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createExpenseMutation.mutateAsync({
        group_id: selectedGroup,
        amount: amountValue,
        description,
        category: selectedCategory,
        expense_date: date,
        split_type: splitType as 'equal' | 'custom',
        // We're only implementing equal splits for now
      });
      
      toast({
        title: "Expense added",
        description: "Your expense has been recorded successfully"
      });
      
      // Navigate back to the group dashboard or expenses list
      navigate(`/dashboard/groups/${selectedGroup}`);
      
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message || "Failed to add expense",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Expense</h1>
          <p className="text-muted-foreground">Record a group expense and split it fairly</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Form */}
        <Card className="lg:col-span-2 shadow-medium border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Expense Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-4 top-2 h-4 w-4 text-muted-foreground">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 text-lg font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="What was this expense for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Group Selection */}
              <div className="space-y-2">
                <Label>Group *</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupsLoading ? (
                      <SelectItem value="loading" disabled>Loading groups...</SelectItem>
                    ) : groups.length === 0 ? (
                      <SelectItem value="none" disabled>No groups found</SelectItem>
                    ) : (
                      groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {group.name}
                            <Badge variant="secondary" className="ml-auto">
                              {group.member_count} members
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Split Type */}
              <div className="space-y-2">
                <Label>How to split?</Label>
                <Select value={splitType} onValueChange={setSplitType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Split equally
                      </div>
                    </SelectItem>
                    <SelectItem value="custom" disabled>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Custom split (coming soon)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional details..."
                  className="min-h-[80px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full gradient-hero text-white border-0 hover:opacity-90"
                disabled={!amount || !description || !selectedGroup || !selectedCategory || createExpenseMutation.isPending}
              >
                {createExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Split Preview */}
        <Card className="shadow-medium border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-accent" />
              Split Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGroupData && amount ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(parseFloat(amount))}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Split between {selectedGroupData.member_count} members:</p>
                  {selectedGroupData && selectedGroupData.member_count > 0 && (
                    <div className="flex justify-between items-center p-2 bg-background/30 rounded">
                      <span className="text-sm">Per person</span>
                      <span className="font-semibold">
                        {formatCurrency(splitType === "equal" && amount ? (parseFloat(amount) / selectedGroupData.member_count) : 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Fill in the amount and select a group to see the split preview
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewExpense;