import React from 'react'
import './ripple.css'
import { TimelineItem } from './types'

interface ItemRendererProps {
  item: TimelineItem;
  itemContext: {
    selected: boolean;
    dragging: boolean;
    resizing: boolean;
    dimensions: { height: number };
    useResizeHandle: boolean;
    title: string;
  };
  getItemProps: (props: any) => any;
  getResizeProps: () => { left: any; right: any };
}

const itemRender: React.FC<ItemRendererProps> = ({item, itemContext, getItemProps, getResizeProps}) => {
  const {left: leftResizeProps, right: rightResizeProps} = getResizeProps()
  const itemProps = getItemProps({
    style: {
      backgroundColor: itemContext.selected
        ? (itemContext.dragging ? '#ff0000' : item.selectedBgColor)
        : (item.bgColor || '#2196F3'),
      color: item.color || '#ffffff',
      borderColor: itemContext.resizing ? '#ff0000' : (item.color || '#1A6FB3'),
      borderStyle: itemContext.selected ? 'dashed' : 'solid',
      borderWidth: itemContext.selected ? '1px' : '1px',
      borderRadius: '4px',
      boxShadow: '0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12)'
    },
    onMouseDown: () => {
      console.log('on item click', item)
    }
  })

  // Remove the key from itemProps
  const { key, ...itemPropsWithoutKey } = itemProps

  return (
    <div key={item.id} {...itemPropsWithoutKey}>
      {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : null}

      <div
        className="ripple"
        style={{
          height: itemContext.dimensions.height,
          overflow: 'hidden',
          paddingLeft: 3,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '1rem',
          marginLeft: '1rem'
        }}
      >
        {itemContext.title}
      </div>

      {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : null}
    </div>
  )
}

export default itemRender