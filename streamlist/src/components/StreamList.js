import React, { useState } from 'react';

function StreamListPage() {
    const [inputValue, setInputValue] = useState('');
    const [items, setItems] = useState([]);
    const [consoleLogs, setConsoleLogs] = useState(['// Awaiting input...']);

    const logToConsole = (message) => {
        console.log('[StreamList]', message);
        setConsoleLogs(prev => {
            const updated = [...prev, '> ' + message];
            return updated.length > 6 ? updated.slice(updated.length - 6) : updated;
        });
    };

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) {
            logToConsole('Error: input cannot be empty.');
            return;
        }
        setItems(prev => [...prev, trimmed]);
        logToConsole(`Added to StreamList: "${trimmed}"`);
        setInputValue('');
    };

    const handleRemove = (index) => {
        const removed = items[index];
        setItems(prev => prev.filter((_, i) => i !== index));
        logToConsole(`Removed: "${removed}"`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAdd();
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
                <button className="add-btn" onClick={handleAdd}>+ Add</button>
            </div>

            <ul className="stream-list">
                {items.length === 0 ? (
                    <p className="empty-state">Your watchlist is empty. Add something above!</p>
                ) : (
                    items.map((item, index) => (
                        <li key={index} className="list-item">
                            <span className="item-num">{index + 1}</span>
                            <span className="item-text">{item}</span>
                            <button className="del-btn" onClick={() => handleRemove(index)} aria-label={`Remove ${item}`}>✕</button>
                        </li>
                    ))
                )}
            </ul>

            <div className="console-box">
                <div className="console-header">Console Output</div>
                <div className="console-body">
                    {consoleLogs.map((line, i) => <div key={i}>{line}</div>)}
                </div>
            </div>
        </div>
    );
}
export default StreamListPage;