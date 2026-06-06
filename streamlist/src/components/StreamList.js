import React, { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'streamlist.items.v1';

const loadItemsFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Strip any isEditing flags left over from the old data shape
        return parsed.map(({ isEditing: _, ...rest }) => rest);
    } catch (err) {
        console.warn('[StreamList] Failed to read localStorage:', err);
        return [];
    }
};

function StreamListPage() {
    const [inputValue, setInputValue] = useState('');

    // items: lazy initializer pulls from localStorage so the list survives refresh
    // Shape: { id, text, completed }
    const [items, setItems] = useState(loadItemsFromStorage);

    // editingId: which item row is currently in edit mode (null = none)
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    // consoleLogs: derive initial message from items already loaded above — single localStorage read
    const [consoleLogs, setConsoleLogs] = useState(() =>
        items.length > 0
            ? [{ id: 0, text: `// Restored ${items.length} item${items.length === 1 ? '' : 's'} from localStorage.` }]
            : [{ id: 0, text: '// Awaiting input...' }]
    );
    const logCounterRef = useRef(1);

    // Persist items to localStorage on every change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (err) {
            console.warn('[StreamList] Failed to write localStorage:', err);
        }
    }, [items]);

    const logToConsole = (message) => {
        console.log('[StreamList]', message);
        const nextId = logCounterRef.current++;
        setConsoleLogs(prev => {
            const updated = [...prev, { id: nextId, text: '> ' + message }];
            return updated.length > 6 ? updated.slice(updated.length - 6) : updated;
        });
    };

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) {
            logToConsole('Error: input cannot be empty.');
            return;
        }
        const newItem = {
            id: crypto.randomUUID(),
            text: trimmed,
            completed: false,
        };
        setItems(prev => [...prev, newItem]);
        logToConsole(`Added to StreamList: "${trimmed}"`);
        setInputValue('');
    };

    const handleDelete = (id) => {
        const removed = items.find(it => it.id === id);
        setItems(prev => prev.filter(it => it.id !== id));
        if (removed) logToConsole(`Removed: "${removed.text}"`);
    };

    const handleToggleComplete = (id) => {
        const target = items.find(it => it.id === id);
        setItems(prev => prev.map(it =>
            it.id === id ? { ...it, completed: !it.completed } : it
        ));
        if (target) {
            logToConsole(
                `${target.completed ? 'Uncompleted' : 'Completed'}: "${target.text}"`
            );
        }
    };

    const handleEdit = (id) => {
        const target = items.find(it => it.id === id);
        if (!target) return;
        setEditText(target.text);
        setEditingId(id);
    };

    const handleSaveEdit = (id) => {
        const trimmed = editText.trim();
        if (!trimmed) {
            logToConsole('Error: edit cannot be empty.');
            return;
        }
        setItems(prev => prev.map(it =>
            it.id === id ? { ...it, text: trimmed } : it
        ));
        logToConsole(`Edited: "${trimmed}"`);
        setEditText('');
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAdd();
    };

    const handleEditKeyDown = (e, id) => {
        if (e.key === 'Enter') handleSaveEdit(id);
        if (e.key === 'Escape') handleCancelEdit();
    };

    return (
        <div className="page-container">
            <h1 className="page-title">My StreamList</h1>
            <p className="page-subtitle">Add movies and shows you want to watch.</p>

            <div className="input-row">
                <input
                    type="text"
                    className="text-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a movie or show title..."
                />
                <button
                    className="add-btn"
                    onClick={handleAdd}
                    disabled={!inputValue.trim()}
                >
                    <span className="material-icons add-btn-icon">add</span>
                    Add
                </button>
            </div>

            {items.length === 0 ? (
                <p className="empty-state">Your watchlist is empty. Add something above!</p>
            ) : (
                <ul className="stream-list">
                    {items.map((item, index) => (
                        <li
                            key={item.id}
                            className={
                                'list-item' + (item.completed ? ' list-item-completed' : '')
                            }
                        >
                            <span className="item-num">{index + 1}</span>

                            {item.id === editingId ? (
                                <input
                                    type="text"
                                    className="edit-input"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                                    autoFocus
                                    aria-label="Edit item"
                                />
                            ) : (
                                <span className="item-text">{item.text}</span>
                            )}

                            <div className="item-actions">
                                {item.id === editingId ? (
                                    <>
                                        <button
                                            className="icon-btn icon-btn-save"
                                            onClick={() => handleSaveEdit(item.id)}
                                            aria-label="Save changes"
                                            title="Save"
                                        >
                                            <span className="material-icons">save</span>
                                        </button>
                                        <button
                                            className="icon-btn icon-btn-cancel"
                                            onClick={handleCancelEdit}
                                            aria-label="Cancel edit"
                                            title="Cancel"
                                        >
                                            <span className="material-icons">close</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="icon-btn icon-btn-complete"
                                            onClick={() => handleToggleComplete(item.id)}
                                            aria-label={item.completed ? 'Mark as not watched' : 'Mark as watched'}
                                            title={item.completed ? 'Mark as not watched' : 'Mark as watched'}
                                        >
                                            <span className="material-icons">
                                                {item.completed ? 'check_circle' : 'radio_button_unchecked'}
                                            </span>
                                        </button>
                                        <button
                                            className="icon-btn icon-btn-edit"
                                            onClick={() => handleEdit(item.id)}
                                            aria-label={`Edit ${item.text}`}
                                            title="Edit"
                                        >
                                            <span className="material-icons">edit</span>
                                        </button>
                                        <button
                                            className="icon-btn icon-btn-delete"
                                            onClick={() => handleDelete(item.id)}
                                            aria-label={`Delete ${item.text}`}
                                            title="Delete"
                                        >
                                            <span className="material-icons">delete</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div className="console-box">
                <div className="console-header">
                    Console Output
                </div>
                <div className="console-body">
                    {consoleLogs.map((log) => (
                        <div key={log.id}>{log.text}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StreamListPage;
