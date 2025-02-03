'use client'
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormData } from './types';

const mentorsList = [
  {
    value: '1',
    label: 'Mia Michelle',
  },
  {
    value: '2',
    label: 'Joe Johnson',
  },
  {
    value: '3',
    label: 'Kim Karlsen',
  },
];

interface AddItemsFormProps {
  onAddItem: (data: FormData) => void;
}

const AddItemsForm: React.FC<AddItemsFormProps> = ({ onAddItem }) => {
  const [formData, setFormData] = useState<FormData>({
    mentor: '',
    status: '',
    start: '2019-01-01',
    end: '2019-01-01',
  });
  const [open, setOpen] = useState(false);

  const handleChange = (prop: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [prop]: value }));
  };

  const handleInputChange = (prop: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [prop]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem(formData);
    setOpen(false);
  };

  return (
    <>
      <Button 
        variant="default" 
        size="icon" 
        className="fixed right-8 bottom-8 rounded-full h-14 w-14 z-50"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex-grow m-4 sm:m-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                value={formData.mentor}
                onValueChange={handleChange('mentor')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose mentor" />
                </SelectTrigger>
                <SelectContent>
                  {mentorsList.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Status"
                value={formData.status}
                onChange={handleInputChange('status')}
                className="w-full"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="date"
                    value={formData.start}
                    onChange={handleInputChange('start')}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={formData.end}
                    onChange={handleInputChange('end')}
                    className="w-full"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full mt-4"
              >
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddItemsForm;