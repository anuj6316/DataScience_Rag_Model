import React, { useState, useEffect } from 'react';
import { FunctionalityItem, BugFix, QuickNote, ProjectInfo } from '../types';
import {
    Plus,
    Trash2,
    CheckCircle,
    Circle,
    AlertCircle,
    Clock,
    Lightbulb,
    Bug,
    FileText,
    Info,
    Edit2,
    Save,
    X,
    LayoutDashboard,
    TrendingUp,
    Activity
} from 'lucide-react';

export const ProjectManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'functionality' | 'bugs' | 'notes' | 'info'>('dashboard');

    // State for functionality items
    const [functionalities, setFunctionalities] = useState<FunctionalityItem[]>([]);
    const [newFunc, setNewFunc] = useState({ title: '', description: '', priority: 'medium' as const });

    // State for bug fixes
    const [bugs, setBugs] = useState<BugFix[]>([]);
    const [newBug, setNewBug] = useState({ title: '', description: '', severity: 'medium' as const });

    // State for notes
    const [notes, setNotes] = useState<QuickNote[]>([]);
    const [newNote, setNewNote] = useState({ content: '', category: 'other' as const });

    // State for project info
    const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
        name: 'BeeBot RAG Chatbot',
        version: '1.0.0',
        description: 'AI-powered chatbot with RAG capabilities for data science queries',
        lastUpdated: new Date().toISOString()
    });
    const [editingInfo, setEditingInfo] = useState(false);
    const [tempInfo, setTempInfo] = useState(projectInfo);

    // Load data from localStorage
    useEffect(() => {
        const storedFunc = localStorage.getItem('beebot_functionalities');
        const storedBugs = localStorage.getItem('beebot_bugs');
        const storedNotes = localStorage.getItem('beebot_notes');
        const storedInfo = localStorage.getItem('beebot_project_info');

        if (storedFunc) setFunctionalities(JSON.parse(storedFunc));
        if (storedBugs) setBugs(JSON.parse(storedBugs));
        if (storedNotes) setNotes(JSON.parse(storedNotes));
        if (storedInfo) {
            const info = JSON.parse(storedInfo);
            setProjectInfo(info);
            setTempInfo(info);
        }
    }, []);

    // Save data to localStorage
    useEffect(() => {
        localStorage.setItem('beebot_functionalities', JSON.stringify(functionalities));
    }, [functionalities]);

    useEffect(() => {
        localStorage.setItem('beebot_bugs', JSON.stringify(bugs));
    }, [bugs]);

    useEffect(() => {
        localStorage.setItem('beebot_notes', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('beebot_project_info', JSON.stringify(projectInfo));
    }, [projectInfo]);

    // Functionality handlers
    const addFunctionality = () => {
        if (!newFunc.title.trim()) return;

        const func: FunctionalityItem = {
            id: Date.now().toString(),
            title: newFunc.title,
            description: newFunc.description,
            status: 'planned',
            priority: newFunc.priority,
            createdAt: new Date().toISOString()
        };

        setFunctionalities([func, ...functionalities]);
        setNewFunc({ title: '', description: '', priority: 'medium' });
    };

    const toggleFuncStatus = (id: string) => {
        setFunctionalities(functionalities.map(f => {
            if (f.id === id) {
                const newStatus = f.status === 'completed' ? 'planned' :
                    f.status === 'planned' ? 'in-progress' : 'completed';
                return {
                    ...f,
                    status: newStatus,
                    completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
                };
            }
            return f;
        }));
    };

    const deleteFunctionality = (id: string) => {
        setFunctionalities(functionalities.filter(f => f.id !== id));
    };

    // Bug handlers
    const addBug = () => {
        if (!newBug.title.trim()) return;

        const bug: BugFix = {
            id: Date.now().toString(),
            title: newBug.title,
            description: newBug.description,
            status: 'open',
            severity: newBug.severity,
            createdAt: new Date().toISOString()
        };

        setBugs([bug, ...bugs]);
        setNewBug({ title: '', description: '', severity: 'medium' });
    };

    const toggleBugStatus = (id: string) => {
        setBugs(bugs.map(b => {
            if (b.id === id) {
                const statusCycle = ['open', 'in-progress', 'fixed', 'verified'] as const;
                const currentIndex = statusCycle.indexOf(b.status);
                const newStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
                return {
                    ...b,
                    status: newStatus,
                    fixedAt: newStatus === 'fixed' || newStatus === 'verified' ? new Date().toISOString() : undefined
                };
            }
            return b;
        }));
    };

    const deleteBug = (id: string) => {
        setBugs(bugs.filter(b => b.id !== id));
    };

    // Note handlers
    const addNote = () => {
        if (!newNote.content.trim()) return;

        const note: QuickNote = {
            id: Date.now().toString(),
            content: newNote.content,
            category: newNote.category,
            createdAt: new Date().toISOString()
        };

        setNotes([note, ...notes]);
        setNewNote({ content: '', category: 'other' });
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    // Project info handlers
    const saveProjectInfo = () => {
        setProjectInfo({ ...tempInfo, lastUpdated: new Date().toISOString() });
        setEditingInfo(false);
    };

    const cancelEditInfo = () => {
        setTempInfo(projectInfo);
        setEditingInfo(false);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-400 bg-red-900/20 border-red-700';
            case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
            case 'low': return 'text-green-400 bg-green-900/20 border-green-700';
            default: return 'text-gray-400 bg-gray-900/20 border-gray-700';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-500 bg-red-900/30 border-red-600';
            case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-700';
            case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
            case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-700';
            default: return 'text-gray-400 bg-gray-900/20 border-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
            case 'verified':
            case 'fixed':
                return <CheckCircle className="text-green-400" size={18} />;
            case 'in-progress':
                return <Clock className="text-yellow-400" size={18} />;
            default:
                return <Circle className="text-gray-500" size={18} />;
        }
    };

    return (
        <div className="h-screen bg-gray-950 text-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <h1 className="text-2xl font-bold text-bee-400 flex items-center gap-2">
                    <FileText size={28} />
                    Project Management
                </h1>
                <p className="text-sm text-gray-400 mt-1">Track functionality, bugs, and notes for BeeBot</p>
            </div>

            {/* Tabs */}
            <div className="bg-gray-900/50 border-b border-gray-800 px-6">
                <div className="flex gap-1">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'functionality', label: 'Functionality', icon: Lightbulb },
                        { id: 'bugs', label: 'Bug Fixes', icon: Bug },
                        { id: 'notes', label: 'Quick Notes', icon: FileText },
                        { id: 'info', label: 'Project Info', icon: Info }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                ? 'text-bee-400 border-bee-400'
                                : 'text-gray-400 border-transparent hover:text-gray-200'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="max-w-6xl mx-auto">

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Overview Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-bee-500/20 to-bee-600/10 border border-bee-500/30 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Lightbulb className="text-bee-400" size={24} />
                                        <TrendingUp className="text-bee-400/50" size={16} />
                                    </div>
                                    <div className="text-3xl font-bold text-bee-400">{functionalities.length}</div>
                                    <div className="text-sm text-gray-400 mt-1">Total Features</div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        {functionalities.filter(f => f.status === 'completed').length} completed
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <CheckCircle className="text-green-400" size={24} />
                                        <Activity className="text-green-400/50" size={16} />
                                    </div>
                                    <div className="text-3xl font-bold text-green-400">
                                        {functionalities.filter(f => f.status === 'in-progress').length}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">In Progress</div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        {functionalities.filter(f => f.status === 'planned').length} planned
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Bug className="text-red-400" size={24} />
                                        <AlertCircle className="text-red-400/50" size={16} />
                                    </div>
                                    <div className="text-3xl font-bold text-red-400">
                                        {bugs.filter(b => b.status === 'open' || b.status === 'in-progress').length}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">Active Bugs</div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        {bugs.filter(b => b.severity === 'critical' || b.severity === 'high').length} high priority
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <FileText className="text-blue-400" size={24} />
                                        <Info className="text-blue-400/50" size={16} />
                                    </div>
                                    <div className="text-3xl font-bold text-blue-400">{notes.length}</div>
                                    <div className="text-sm text-gray-400 mt-1">Quick Notes</div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        {notes.filter(n => n.category === 'todo').length} todos
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setActiveTab('functionality')}
                                    className="bg-gray-900 border border-gray-800 hover:border-bee-500/50 rounded-lg p-4 text-left transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-bee-500/20 p-2 rounded group-hover:bg-bee-500/30 transition-colors">
                                            <Plus className="text-bee-400" size={20} />
                                        </div>
                                        <h3 className="font-semibold text-gray-100">Add Feature</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">Track new functionality</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab('bugs')}
                                    className="bg-gray-900 border border-gray-800 hover:border-red-500/50 rounded-lg p-4 text-left transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-red-500/20 p-2 rounded group-hover:bg-red-500/30 transition-colors">
                                            <Bug className="text-red-400" size={20} />
                                        </div>
                                        <h3 className="font-semibold text-gray-100">Report Bug</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">Log a new issue</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className="bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-lg p-4 text-left transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-blue-500/20 p-2 rounded group-hover:bg-blue-500/30 transition-colors">
                                            <FileText className="text-blue-400" size={20} />
                                        </div>
                                        <h3 className="font-semibold text-gray-100">Add Note</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">Jot down an idea</p>
                                </button>
                            </div>

                            {/* Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent Features */}
                                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Lightbulb className="text-bee-400" size={20} />
                                        Recent Features
                                    </h3>
                                    <div className="space-y-2">
                                        {functionalities.slice(0, 3).length > 0 ? (
                                            functionalities.slice(0, 3).map(func => (
                                                <div key={func.id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-800/50 transition-colors">
                                                    {getStatusIcon(func.status)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-200 truncate">{func.title}</p>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className={`text - xs px - 1.5 py - 0.5 rounded ${getPriorityColor(func.priority)} `}>
                                                                {func.priority}
                                                            </span>
                                                            <span className="text-xs text-gray-500">{func.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">No features yet</p>
                                        )}
                                    </div>
                                    {functionalities.length > 3 && (
                                        <button
                                            onClick={() => setActiveTab('functionality')}
                                            className="text-xs text-bee-400 hover:text-bee-300 mt-3 w-full text-center"
                                        >
                                            View all {functionalities.length} features →
                                        </button>
                                    )}
                                </div>

                                {/* Recent Bugs */}
                                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Bug className="text-red-400" size={20} />
                                        Recent Bugs
                                    </h3>
                                    <div className="space-y-2">
                                        {bugs.slice(0, 3).length > 0 ? (
                                            bugs.slice(0, 3).map(bug => (
                                                <div key={bug.id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-800/50 transition-colors">
                                                    {getStatusIcon(bug.status)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-200 truncate">{bug.title}</p>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className={`text - xs px - 1.5 py - 0.5 rounded ${getSeverityColor(bug.severity)} `}>
                                                                {bug.severity}
                                                            </span>
                                                            <span className="text-xs text-gray-500">{bug.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">No bugs reported</p>
                                        )}
                                    </div>
                                    {bugs.length > 3 && (
                                        <button
                                            onClick={() => setActiveTab('bugs')}
                                            className="text-xs text-bee-400 hover:text-bee-300 mt-3 w-full text-center"
                                        >
                                            View all {bugs.length} bugs →
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Recent Notes */}
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="text-blue-400" size={20} />
                                    Recent Notes
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {notes.slice(0, 3).length > 0 ? (
                                        notes.slice(0, 3).map(note => (
                                            <div key={note.id} className="bg-gray-800/50 rounded p-3 hover:bg-gray-800 transition-colors">
                                                <p className="text-sm text-gray-200 line-clamp-2">{note.content}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs px-1.5 py-0.5 rounded border border-gray-700 text-gray-400">
                                                        {note.category}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(note.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4 col-span-3">No notes yet</p>
                                    )}
                                </div>
                                {notes.length > 3 && (
                                    <button
                                        onClick={() => setActiveTab('notes')}
                                        className="text-xs text-bee-400 hover:text-bee-300 mt-3 w-full text-center"
                                    >
                                        View all {notes.length} notes →
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Functionality Tab */}
                    {activeTab === 'functionality' && (
                        <div className="space-y-6">
                            {/* Add New */}
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Plus size={20} className="text-bee-400" />
                                    Add New Functionality
                                </h3>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={newFunc.title}
                                        onChange={(e) => setNewFunc({ ...newFunc, title: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-bee-500"
                                    />
                                    <textarea
                                        placeholder="Description"
                                        value={newFunc.description}
                                        onChange={(e) => setNewFunc({ ...newFunc, description: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-bee-500 resize-none"
                                        rows={2}
                                    />
                                    <div className="flex gap-3">
                                        <select
                                            value={newFunc.priority}
                                            onChange={(e) => setNewFunc({ ...newFunc, priority: e.target.value as any })}
                                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-bee-500"
                                        >
                                            <option value="low">Low Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="high">High Priority</option>
                                        </select>
                                        <button
                                            onClick={addFunctionality}
                                            className="bg-bee-500 hover:bg-bee-600 text-gray-900 px-4 py-2 rounded font-medium text-sm transition-colors"
                                        >
                                            Add Functionality
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-3">
                                {functionalities.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Lightbulb size={48} className="mx-auto mb-3 opacity-30" />
                                        <p>No functionality items yet. Add one above!</p>
                                    </div>
                                ) : (
                                    functionalities.map(func => (
                                        <div
                                            key={func.id}
                                            className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <button
                                                        onClick={() => toggleFuncStatus(func.id)}
                                                        className="mt-1 hover:scale-110 transition-transform"
                                                    >
                                                        {getStatusIcon(func.status)}
                                                    </button>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-100">{func.title}</h4>
                                                        {func.description && (
                                                            <p className="text-sm text-gray-400 mt-1">{func.description}</p>
                                                        )}
                                                        <div className="flex gap-2 mt-2">
                                                            <span className={`text - xs px - 2 py - 1 rounded border ${getPriorityColor(func.priority)} `}>
                                                                {func.priority}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400">
                                                                {func.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteFunctionality(func.id)}
                                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bugs Tab */}
                    {activeTab === 'bugs' && (
                        <div className="space-y-6">
                            {/* Add New */}
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Plus size={20} className="text-bee-400" />
                                    Report New Bug
                                </h3>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Bug Title"
                                        value={newBug.title}
                                        onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-bee-500"
                                    />
                                    <textarea
                                        placeholder="Bug Description"
                                        value={newBug.description}
                                        onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-bee-500 resize-none"
                                        rows={2}
                                    />
                                    <div className="flex gap-3">
                                        <select
                                            value={newBug.severity}
                                            onChange={(e) => setNewBug({ ...newBug, severity: e.target.value as any })}
                                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-bee-500"
                                        >
                                            <option value="low">Low Severity</option>
                                            <option value="medium">Medium Severity</option>
                                            <option value="high">High Severity</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                        <button
                                            onClick={addBug}
                                            className="bg-bee-500 hover:bg-bee-600 text-gray-900 px-4 py-2 rounded font-medium text-sm transition-colors"
                                        >
                                            Add Bug
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-3">
                                {bugs.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Bug size={48} className="mx-auto mb-3 opacity-30" />
                                        <p>No bugs reported yet. Hopefully it stays that way!</p>
                                    </div>
                                ) : (
                                    bugs.map(bug => (
                                        <div
                                            key={bug.id}
                                            className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <button
                                                        onClick={() => toggleBugStatus(bug.id)}
                                                        className="mt-1 hover:scale-110 transition-transform"
                                                    >
                                                        {getStatusIcon(bug.status)}
                                                    </button>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-100">{bug.title}</h4>
                                                        {bug.description && (
                                                            <p className="text-sm text-gray-400 mt-1">{bug.description}</p>
                                                        )}
                                                        <div className="flex gap-2 mt-2">
                                                            <span className={`text - xs px - 2 py - 1 rounded border ${getSeverityColor(bug.severity)} `}>
                                                                {bug.severity}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400">
                                                                {bug.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteBug(bug.id)}
                                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <div className="space-y-6">
                            {/* Add New */}
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Plus size={20} className="text-bee-400" />
                                    Add Quick Note
                                </h3>
                                <div className="space-y-3">
                                    <textarea
                                        placeholder="Note content..."
                                        value={newNote.content}
                                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-bee-500 resize-none"
                                        rows={3}
                                    />
                                    <div className="flex gap-3">
                                        <select
                                            value={newNote.category}
                                            onChange={(e) => setNewNote({ ...newNote, category: e.target.value as any })}
                                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-bee-500"
                                        >
                                            <option value="idea">💡 Idea</option>
                                            <option value="todo">✅ To-Do</option>
                                            <option value="reminder">⏰ Reminder</option>
                                            <option value="other">📝 Other</option>
                                        </select>
                                        <button
                                            onClick={addNote}
                                            className="bg-bee-500 hover:bg-bee-600 text-gray-900 px-4 py-2 rounded font-medium text-sm transition-colors"
                                        >
                                            Add Note
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* List */}
                            <div className="grid gap-3 md:grid-cols-2">
                                {notes.length === 0 ? (
                                    <div className="col-span-2 text-center py-12 text-gray-500">
                                        <FileText size={48} className="mx-auto mb-3 opacity-30" />
                                        <p>No notes yet. Jot down your thoughts above!</p>
                                    </div>
                                ) : (
                                    notes.map(note => (
                                        <div
                                            key={note.id}
                                            className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-200 whitespace-pre-wrap">{note.content}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400">
                                                            {note.category}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(note.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteNote(note.id)}
                                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Project Info Tab */}
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Info size={20} className="text-bee-400" />
                                        Project Information
                                    </h3>
                                    {!editingInfo ? (
                                        <button
                                            onClick={() => setEditingInfo(true)}
                                            className="flex items-center gap-2 text-bee-400 hover:text-bee-300 text-sm"
                                        >
                                            <Edit2 size={16} />
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={saveProjectInfo}
                                                className="flex items-center gap-1 bg-bee-500 hover:bg-bee-600 text-gray-900 px-3 py-1 rounded text-sm"
                                            >
                                                <Save size={14} />
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEditInfo}
                                                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded text-sm"
                                            >
                                                <X size={14} />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
                                        {editingInfo ? (
                                            <input
                                                type="text"
                                                value={tempInfo.name}
                                                onChange={(e) => setTempInfo({ ...tempInfo, name: e.target.value })}
                                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-bee-500"
                                            />
                                        ) : (
                                            <p className="text-gray-100">{projectInfo.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Version</label>
                                        {editingInfo ? (
                                            <input
                                                type="text"
                                                value={tempInfo.version}
                                                onChange={(e) => setTempInfo({ ...tempInfo, version: e.target.value })}
                                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-bee-500"
                                            />
                                        ) : (
                                            <p className="text-gray-100">{projectInfo.version}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                        {editingInfo ? (
                                            <textarea
                                                value={tempInfo.description}
                                                onChange={(e) => setTempInfo({ ...tempInfo, description: e.target.value })}
                                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-bee-500 resize-none"
                                                rows={3}
                                            />
                                        ) : (
                                            <p className="text-gray-100">{projectInfo.description}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Last Updated</label>
                                        <p className="text-gray-100">{new Date(projectInfo.lastUpdated).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div className="mt-8 pt-6 border-t border-gray-800">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-4">Project Statistics</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                                            <div className="text-2xl font-bold text-bee-400">{functionalities.length}</div>
                                            <div className="text-xs text-gray-400 mt-1">Features</div>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                                            <div className="text-2xl font-bold text-green-400">
                                                {functionalities.filter(f => f.status === 'completed').length}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">Completed</div>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                                            <div className="text-2xl font-bold text-red-400">{bugs.filter(b => b.status === 'open').length}</div>
                                            <div className="text-xs text-gray-400 mt-1">Open Bugs</div>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                                            <div className="text-2xl font-bold text-blue-400">{notes.length}</div>
                                            <div className="text-xs text-gray-400 mt-1">Notes</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
