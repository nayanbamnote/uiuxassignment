'use client'

import React, { useMemo } from 'react'
import moment from 'moment'
import Timeline, { TimelineMarkers, TodayMarker } from 'react-calendar-timeline'
import 'react-calendar-timeline/dist/style.css'
import './style.css'
import { useTaskStore } from '@/lib/store'
import SundaysMarker from './SundaysMarker'
import itemRender from './itemRender'

// Define timeline groups (can be moved to a separate file if needed)
const TIMELINE_GROUPS = [
  {
    id: 'backlog',
    title: 'Backlog',
    rightTitle: 'Planning Phase'
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    rightTitle: 'Active Development'
  },
  {
    id: 'paused',
    title: 'Paused',
    rightTitle: 'On Hold'
  },
  {
    id: 'completed',
    title: 'Completed',
    rightTitle: 'Done'
  },
  {
    id: 'general-info',
    title: 'General Info',
    rightTitle: 'Information'
  }
]

export default function MembersTimeline() {
  const tasks = useTaskStore((state) => state.tasks)
  const updateTask = useTaskStore((state) => state.updateTask)

  // Convert tasks to timeline items
  const timelineItems = useMemo(() => {
    return tasks.map(task => ({
      id: task.id,
      group: task.status,
      title: task.title,
      start: moment(task.startDate || new Date()),
      end: moment(task.endDate || moment().add(1, 'day')),
      className: task.status,
      bgColor: getColorForStatus(task.status),
      selectedBgColor: getColorForStatus(task.status),
      canMove: true,
      canResize: true,
      canChangeGroup: true
    }))
  }, [tasks])

  const handleItemMove = (itemId: string, dragTime: number, newGroupOrder: number) => {
    const task = tasks.find(t => t.id === itemId)
    if (!task) return

    const newStatus = TIMELINE_GROUPS[newGroupOrder].id
    const timeDiff = moment(task.endDate).diff(moment(task.startDate))
    
    updateTask(itemId, {
      ...task,
      status: newStatus,
      startDate: moment(dragTime).format('YYYY-MM-DD'),
      endDate: moment(dragTime).add(timeDiff, 'milliseconds').format('YYYY-MM-DD')
    })
  }

  const handleItemResize = (itemId: string, time: number, edge: string) => {
    const task = tasks.find(t => t.id === itemId)
    if (!task) return

    updateTask(itemId, {
      ...task,
      startDate: edge === 'left' ? moment(time).format('YYYY-MM-DD') : task.startDate,
      endDate: edge === 'left' ? task.endDate : moment(time).format('YYYY-MM-DD')
    })
  }

  return (
    <div className="h-screen bg-white">
      <Timeline
        groups={TIMELINE_GROUPS}
        items={timelineItems}
        keys={{
          groupIdKey: 'id',
          groupTitleKey: 'title',
          groupRightTitleKey: 'rightTitle',
          itemIdKey: 'id',
          itemTitleKey: 'title',
          itemDivTitleKey: 'title',
          itemGroupKey: 'group',
          itemTimeStartKey: 'start',
          itemTimeEndKey: 'end'
        }}
        defaultTimeStart={moment().add(-15, 'day')}
        defaultTimeEnd={moment().add(45, 'day')}
        rightSidebarWidth={150}
        rightSidebarContent="Status"
        sidebarContent="Categories"
        lineHeight={50}
        itemRenderer={itemRender}
        canMove={true}
        canResize={'both'}
        onItemMove={handleItemMove}
        onItemResize={handleItemResize}
        stackItems
        itemHeightRatio={0.75}
        showCursorLine
      >
        <TimelineMarkers>
          <TodayMarker>
            {({styles}) => (
              <div style={{...styles, width: '2px', backgroundColor: 'red'}} />
            )}
          </TodayMarker>
          <SundaysMarker />
        </TimelineMarkers>
      </Timeline>
    </div>
  )
}

// Update color function to use more opaque colors
function getColorForStatus(status: string): string {
  const colors: Record<string, string> = {
    'backlog': '#4897D8',
    'in-progress': '#D88948',
    'paused': '#FA6E59',
    'completed': '#429970',
    'general-info': '#59E5FA'
  }
  return colors[status] || '#2196F3'
}
