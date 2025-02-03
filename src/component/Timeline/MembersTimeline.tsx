'use client'

import React, {Component} from 'react'
import moment from 'moment'
import Timeline, {TimelineMarkers, TodayMarker} from 'react-calendar-timeline'
import 'react-calendar-timeline/dist/style.css'
import './style.css'
import keys from './keys'
import AddItemsForm from './AddItemsForm'
import groups from './groups'
import items from './items'
import SundaysMarker from './SundaysMarker'
import { TimelineItem, TimelineGroup, FormData } from './types'
import itemRender from './itemRender'

interface State {
  keys: any;
  groups: TimelineGroup[];
  items: TimelineItem[];
  y19: Date;
}

export default class Calendar extends Component<{}, State> {
  state: State = {
    keys,
    groups,
    items,
    y19: new Date('2019/1/1'),
  }

  // addItemHandler = newItems => {
  //   console.log(newItems)
  //   this.setState(state => ({
  //     items: {...state.items, newItems}
  //   }))
  // }
  toTimestamp = (strDate: string): number => {
    const d = new Date(strDate)
    return d.getTime() / 1000
  }

  addItemHandler = (item: FormData): void => {
    const newItem: TimelineItem = {
      id: 1 + Math.max(...this.state.items.map(i => i.id)),
      group: parseInt(item.mentor),
      title: item.status,
      className: item.status.toLowerCase(),
      start: moment(new Date(item.start)),
      end: moment(new Date(item.end)),
    }

    this.setState(state => ({
      items: [...state.items, newItem]
    }))
  }
  handleItemMove = (itemId: number, dragTime: number, newGroupOrder: number): void => {
    const {items, groups} = this.state

    const group = groups[newGroupOrder]

    this.setState({
      items: items.map(item =>
        item.id === itemId
          ? Object.assign({}, item, {
            start: dragTime,
            end: dragTime + (item.end - item.start),
            group: group.id
          })
          : item
      )
    })

    console.log('Moved', itemId, dragTime, newGroupOrder)
  }

  handleItemResize = (itemId: number, time: number, edge: 'left' | 'right'): void => {
    const {items} = this.state

    this.setState({
      items: items.map(item =>
        item.id === itemId
          ? Object.assign({}, item, {
            start: edge === 'left' ? time : item.start,
            end: edge === 'left' ? item.end : time
          })
          : item
      )
    })

    console.log('Resized', itemId, time, edge)
  }

  render() {
    const {keys, groups, items, y19} = this.state
    return (
      <>
        <Timeline
          keys={keys}
          groups={groups}
          // onItemClick={() => alert(1)}
          items={items}
          rightSidebarWidth={200}
          rightSidebarContent="Skills"
          sidebarContent="Mentors"
          lineHeight={75}
          itemRenderer={itemRender}
          defaultTimeStart={moment(y19).add(-1, 'month')}
          defaultTimeEnd={moment(y19).add(1.5, 'month')}
          maxZoom={1.5 * 365.24 * 86400 * 1000}
          minZoom={1.24 * 86400 * 1000 * 7 * 3}
          fullUpdate
          itemTouchSendsClick={false}
          stackItems
          itemHeightRatio={0.75}
          showCursorLine
          canMove={true}
          canResize={'both'}
          onItemMove={this.handleItemMove}
          onItemResize={this.handleItemResize}
        >
          <TimelineMarkers>
            <TodayMarker>
              {({styles, date}) => <div style={{...styles, width: '0.5rem', backgroundColor: 'rgba(255,0,0,0.5)'}} />
              }
            </TodayMarker>
            <SundaysMarker />
          </TimelineMarkers>
        </Timeline>
        <AddItemsForm onAddItem={this.addItemHandler} />
      </>
    )
  }

}
