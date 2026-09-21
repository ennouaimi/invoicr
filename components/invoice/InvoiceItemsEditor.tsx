import type { EditorItem } from "./types";

type InvoiceItemsEditorProps = {
  items: EditorItem[];
  onAdd: () => void;
  onUpdate: (id: number, patch: Partial<EditorItem>) => void;
  onRemove: (id: number) => void;
};

/** Editable invoice line items. Item mutation stays owned by the parent editor. */
export function InvoiceItemsEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: InvoiceItemsEditorProps) {
  return (
    <>
      <div className="section-heading compact">
        <div>
          <span>03</span>
          <h2>Items & services</h2>
        </div>
        <button className="text-action" onClick={onAdd}>
          + Add item
        </button>
      </div>

      <div className="items-editor">
        {items.map((item, index) => (
          <div className="item-row" key={item.id}>
            <div className="item-index">
              {String(index + 1).padStart(2, "0")}
            </div>
            <input
              className="item-name"
              value={item.description}
              onChange={(event) =>
                onUpdate(item.id, { description: event.target.value })
              }
            />
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(event) =>
                onUpdate(item.id, {
                  quantity: Number(event.target.value) || 0,
                })
              }
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.price}
              onChange={(event) =>
                onUpdate(item.id, { price: Number(event.target.value) || 0 })
              }
            />
            <button
              className="remove-button"
              onClick={() => onRemove(item.id)}
              aria-label="Remove item"
            >
              ×
            </button>
          </div>
        ))}

        <div className="item-labels">
          <span />
          <span>Description</span>
          <span>Qty</span>
          <span>Price</span>
          <span />
        </div>
      </div>
    </>
  );
}
