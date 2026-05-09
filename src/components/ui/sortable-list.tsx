"use client"

import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────────

type SortStrategy = "vertical" | "horizontal"

interface SortableItemProps {
  id: string
  children: React.ReactNode
  className?: string
  /** Show drag handle. Default: true */
  showHandle?: boolean
  /** Custom handle content. If provided, showHandle is ignored */
  handle?: React.ReactNode
  /** Use horizontal layout strategy */
  strategy?: SortStrategy
  /** Render a custom drag overlay */
  overlayContent?: React.ReactNode
  disabled?: boolean
}

// ─── Single Sortable Item ──────────────────────────────────────────────────────

export function SortableItem({
  id,
  children,
  className,
  showHandle = true,
  handle,
  strategy = "vertical",
  overlayContent,
  disabled = false,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
    strategy: strategy === "vertical" ? verticalListSortingStrategy : horizontalListSortingStrategy,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
  }

  return (
    <>
      <div ref={setNodeRef} style={style} className={cn("group/sortable", className)}>
        {handle ? (
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            {handle}
          </div>
        ) : showHandle ? (
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing shrink-0 touch-none"
          >
            <GripVertical className="size-4 text-muted-foreground/40 group-hover/sortable:text-muted-foreground/70 transition-colors" />
          </div>
        ) : null}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      {/* Drag overlay */}
      {isDragging && overlayContent && (
        <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-[100]">
          <div className="bg-background border-2 border-primary/30 rounded-lg shadow-xl p-1 opacity-90 max-w-[95vw] overflow-hidden">
            {overlayContent}
          </div>
        </div>
      )}
    </>
  )
}

// ─── Sortable List Container ───────────────────────────────────────────────────

interface SortableListProps {
  items: { id: string }[]
  children: React.ReactNode
  /** Called when items are reordered. Receives the new items array. */
  onReorder: (newItems: { id: string }[]) => void
  /** Strategy: "vertical" (default) or "horizontal" */
  strategy?: SortStrategy
  /** Gap between items */
  gap?: string
  className?: string
}

export function SortableList({
  items,
  children,
  onReorder,
  strategy = "vertical",
  gap = "gap-1",
  className,
}: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const itemIds = React.useMemo(() => items.map((item) => item.id), [items])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = itemIds.indexOf(String(active.id))
    const newIndex = itemIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(items, oldIndex, newIndex)
    onReorder(reordered)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={itemIds}
        strategy={
          strategy === "vertical"
            ? verticalListSortingStrategy
            : horizontalListSortingStrategy
        }
      >
        <div className={cn(gap, className)}>
          {children}
        </div>
      </SortableContext>
    </DndContext>
  )
}

// ─── Convenience: Sortable Card Wrapper ────────────────────────────────────────
// Wraps a card with drag handle + content. Simple drop-in replacement.

interface SortableCardProps {
  id: string
  children: React.ReactNode
  className?: string
  /** Position of handle: "left" (default) or "right" */
  handlePosition?: "left" | "right"
  overlayContent?: React.ReactNode
  disabled?: boolean
}

export function SortableCard({
  id,
  children,
  className,
  handlePosition = "left",
  overlayContent,
  disabled = false,
}: SortableCardProps) {
  const isLeft = handlePosition === "left"
  return (
    <SortableItem id={id} overlayContent={overlayContent} disabled={disabled}>
      <div className={cn("flex items-stretch gap-2", isLeft ? "flex-row" : "flex-row-reverse", className)}>
        {children}
      </div>
    </SortableItem>
  )
}
