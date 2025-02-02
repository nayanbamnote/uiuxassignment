'use client'

import TaskManager from "@/component/TaskManager";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { columns } from "@/constants/Taskboard";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { MoreHorizontal, Eye, MessageSquare, Calendar, Plus } from "lucide-react";

import { useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <TaskManager />
    </div>
  );
}
