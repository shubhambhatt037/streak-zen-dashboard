
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateActivityDialogProps {
  onCreateActivity: (activity: {
    name: string;
    color: string;
    frequency: 'daily' | 'weekly' | 'custom';
    category: string;
    description: string;
  }) => void;
}

const CreateActivityDialog = ({ onCreateActivity }: CreateActivityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#8B5CF6',
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
    category: 'health_fitness',
    description: '',
  });

  const colors = [
    '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', 
    '#F97316', '#84CC16', '#EC4899', '#6366F1', '#14B8A6'
  ];

  const categories = [
    { value: 'health_fitness', label: 'Health & Fitness' },
    { value: 'personal_growth', label: 'Personal Growth' },
    { value: 'learning', label: 'Learning' },
    { value: 'work', label: 'Work' },
    { value: 'hobbies', label: 'Hobbies' },
    { value: 'social', label: 'Social' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onCreateActivity(formData);
      setFormData({
        name: '',
        color: '#8B5CF6',
        frequency: 'daily' as 'daily' | 'weekly' | 'custom',
        category: 'health_fitness',
        description: '',
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Create New Activity</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add a new habit to track. Choose a name, category, and how often you want to do it.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Activity Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Workout"
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your activity (optional)"
                className="min-h-[80px] px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white resize-none"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {categories.map((category) => (
                    <SelectItem 
                      key={category.value} 
                      value={category.value}
                      className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency" className="text-gray-700 dark:text-gray-300">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'custom') => 
                  setFormData({ ...formData, frequency: value })
                }
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="daily" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Daily</SelectItem>
                  <SelectItem value="weekly" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Weekly</SelectItem>
                  <SelectItem value="custom" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-700 dark:text-gray-300">Color</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === color 
                        ? 'border-gray-900 dark:border-white scale-110' 
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Activity</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateActivityDialog;
