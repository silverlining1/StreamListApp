import React, { useState, useEffect } from 'react';

// INT499 Week 3 — Assignment 1, Part 1
// Adds: localStorage persistence (load on mount, save on every items change)
// Keeps Week 2 features: edit, delete, complete, Material Icon action buttons,
// console panel, input clear on submit, Enter-to-add

const STORAGE_KEY = 'streamlist.items.v1';

// Safe load: returns [] if storage empty, missing, or malformed
const loadItemsFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Reset any in-progress edits from a prior session
        return parsed.map(it => ({ ...it, isEditing: false }));
    } catch (err) {
        console.warn('[StreamList] Failed to read localStorage:', err);
        return [];
    }
};

function StreamListPage() {
    // ---- State ----
    // inputValue: text the user is currently typing in the main form
    const [inputValue, setInputValue] = useState('');

    // items: lazy initializer pulls from localStorage so the list survives refresh
    // Shape: { id, text, completed, isEditing }
    const [items, setItems] = useState(loadItemsFromStorage);

    // editText: temporary buffer for the row currently being edited
    const [editText, setEditText] = useState('');

    // consoleLogs: in-app console panel (Week 1 carry-over)
    const [consoleLogs, setConsoleLogs] = useState(() => {
        const restored = loadItemsFromStorage();
        return restored.length > 0
            ? [`// Restored ${restored.length} item${restored.length === 1 ? '' : 's'} from localStorage.`]
            : ['// Awaiting input...'];
    });

    // ---- Persistence: write items array to localStorage on every change ----
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (err) {
            console.warn('[StreamList] Failed to write localStorage:', err);
        }
    }, [items]);

    const logToConsole = (message) => {
        console.log('[StreamList]', message);
        setConsoleLogs(prev => {
            const updated = [...prev, '> ' + message];
            return updated.length > 6 ? updated.slice(updated.length - 6) : updated;
        });
    };

    // ---- Handlers ----
    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) {
            logToConsole('Error: input cannot be empty.');
            return;
        }
        const newItem = {
            id: Date.now(),
            text: trimmed,
            completed: false,
            isEditing: false,
        };
        setItems(prev => [...prev, newItem]);
        logToConsole(`Added to StreamList: "${trimmed}"`);
        setInputValue(''); // clear input after submit
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
        // Only one item in edit mode at a time
        setItems(prev => prev.map(it =>
            it.id === id ? { ...it, isEditing: true } : { ...it, isEditing: false }
        ));
    };

    const handleSaveEdit = (id) => {
        const trimmed = editText.trim();
        if (!trimmed) {
            logToConsole('Error: edit cannot be empty.');
            return;
        }
        setItems(prev => prev.map(it =>
            it.id === id ? { ...it, text: trimmed, isEditing: false } : it
        ));
        logToConsole(`Edited: "${trimmed}"`);
        setEditText('');
    };

    const handleCancelEdit = (id) => {
        setItems(prev => prev.map(it =>
            it.id === id ? { ...it, isEditing: false } : it
        ));
        setEditText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAdd();
    };

    const handleEditKeyDown = (e, id) => {
        if (e.key === 'Enter') handleSaveEdit(id);
        if (e.key === 'Escape') handleCancelEdit(id);
    };

    // ---- Render ----
    return (
        <div className="page-container">
            <h1 className="page-title">My StreamList</h1>
            <p className="page-subtitle">Add movies and shows you want to watch.</p>

            {/* Input row */}
            <div className="input-row">
                <input
                    type="text"
                    className="text-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a movie or show title..."
                />
                <button className="add-btn" onClick={handleAdd}>
                    <span className="material-icons add-btn-icon">add</span>
                    Add
                </button>
            </div>

            {/* List */}
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

                            {item.isEditing ? (
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
                                {item.isEditing ? (
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
                                            onClick={() => handleCancelEdit(item.id)}
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

            {/* Console panel */}
            <div className="console-box">
                <div className="console-header">
                    Console Output
                </div>
                <div className="console-body">
                    {consoleLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StreamListPage;