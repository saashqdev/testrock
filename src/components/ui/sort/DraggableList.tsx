"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Props<T> {
  items: T[];
  actionName?: string;
  render: (item: T, idx: number) => ReactNode;
  className?: string;
}

export default function DraggableList<T extends { id: string; order: number }>({ items, actionName, render, className }: Props<T>) {
  const router = useRouter();
  const [draggedItems, setDraggedItems] = useState<T[]>(items);

  useEffect(() => {
    setDraggedItems(items);
  }, [items]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    const updatedItems = Array.from(draggedItems);
    const [removed] = updatedItems.splice(startIndex, 1);
    updatedItems.splice(endIndex, 0, removed);

    setDraggedItems(updatedItems);

    const updatedOrders = updatedItems.map((item, index) => ({
      id: item.id,
      order: index + 1,
    }));

    const form = new FormData();
    form.append("action", actionName ?? "set-orders");
    updatedOrders.forEach((item) => {
      form.append(
        "orders[]",
        JSON.stringify({
          id: item.id,
          order: item.order.toString(),
        })
      );
    });
    
    // Submit form using Next.js approach
    fetch(window.location.pathname, {
      method: "POST",
      body: form,
    })
      .then((response) => {
        if (response.ok) {
          router.refresh(); // Refresh the page to reflect changes
        } else {
          console.error("Failed to update order");
        }
      })
      .catch((error) => {
        console.error("Error updating order:", error);
      });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="articles">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className={className}>
            {draggedItems.map((item, idx) => (
              <Draggable key={item.id} draggableId={item.id} index={idx}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    {render(item, idx)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
